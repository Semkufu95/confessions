package controllers

import (
	"errors"
	"strings"
	"time"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/Semkufu95/confessions/Backend/redis"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PostComment allows a user to comment on a confession
func PostComment(c *fiber.Ctx) error {
	confessionID := c.Params("id")
	var input struct {
		Content string `json:"content"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	input.Content = strings.TrimSpace(input.Content)
	if input.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Comment content is required"})
	}
	if len(input.Content) > 1000 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Comment content must be 1000 characters or less"})
	}

	userIDStr, ok := c.Locals("user_id").(string)
	if !ok || userIDStr == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}
	parsedConfessionID, err := uuid.Parse(confessionID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid confession id"})
	}
	exists, err := confessionExists(parsedConfessionID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to verify confession"})
	}
	if !exists {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Confession not found"})
	}

	comment := models.Comment{
		UserID:       userID,
		ConfessionID: parsedConfessionID,
		Content:      input.Content,
		CreatedAt:    time.Now(),
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not post comment"})
	}
	_ = syncConfessionCommentCount(comment.ConfessionID)

	// Preload author before returning
	if err := config.DB.
		Preload("Author").
		Preload("Replies", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at asc")
		}).
		Preload("Replies.Author").
		First(&comment, "id = ?", comment.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load comment author"})
	}

	redis.PublishJSON("confessions:comment:created", fiber.Map{
		"id":            comment.ID.String(),
		"confession_id": comment.ConfessionID.String(),
		"content":       comment.Content,
		"author":        mapPublicUser(comment.Author),
	})

	return c.JSON(mapPublicComment(comment))
}

// GetCommentsByConfession returns comments for a given confession, including author data
func GetCommentsByConfession(c *fiber.Ctx) error {
	confessionID := c.Params("id")

	var comments []models.Comment
	if err := config.DB.
		Preload("Author").
		Preload("Replies", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at asc")
		}).
		Preload("Replies.Author").
		Where("confession_id = ?", confessionID).
		Order("created_at asc").
		Find(&comments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load comments"})
	}

	return c.JSON(mapPublicComments(comments))
}

func PostReply(c *fiber.Ctx) error {
	commentID := c.Params("id")
	var input struct {
		Content string `json:"content"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	input.Content = strings.TrimSpace(input.Content)
	if input.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Reply content is required"})
	}
	if len(input.Content) > 1000 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Reply content must be 1000 characters or less"})
	}

	userIDStr, ok := c.Locals("user_id").(string)
	if !ok || userIDStr == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}
	parsedCommentID, err := uuid.Parse(commentID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid comment id"})
	}

	exists, err := commentExists(parsedCommentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to verify comment"})
	}
	if !exists {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Comment not found"})
	}

	reply := models.Reply{
		CommentID: parsedCommentID,
		UserID:    userID,
		Content:   input.Content,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := config.DB.Create(&reply).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not post reply"})
	}

	if err := config.DB.Preload("Author").First(&reply, "id = ?", reply.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load reply author"})
	}

	var comment models.Comment
	if err := config.DB.First(&comment, "id = ?", parsedCommentID).Error; err == nil {
		redis.PublishJSON("confessions:comment:created", fiber.Map{
			"id":            reply.ID.String(),
			"comment_id":    reply.CommentID.String(),
			"confession_id": comment.ConfessionID.String(),
			"content":       reply.Content,
			"author":        mapPublicUser(reply.Author),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(mapPublicReply(reply))
}

// DeleteComment allows a user to delete their own comment
func DeleteComment(c *fiber.Ctx) error {
	id := c.Params("id")
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	var comment models.Comment
	if err := config.DB.First(&comment, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Comment not found"})
	}

	if comment.UserID.String() != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You cannot delete this comment"})
	}

	confessionID, err := deleteCommentTree(comment.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Comment not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete comment"})
	}
	_ = syncConfessionCommentCount(confessionID)

	redis.PublishJSON("confessions:comment:deleted", fiber.Map{
		"id":            id,
		"confession_id": confessionID.String(),
	})

	return c.JSON(fiber.Map{"message": "Comment deleted"})
}

// UpdateComment allows a user to edit their comment
func UpdateComment(c *fiber.Ctx) error {
	id := c.Params("id")
	var input struct {
		Content string `json:"content"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	input.Content = strings.TrimSpace(input.Content)
	if input.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Comment content is required"})
	}
	if len(input.Content) > 1000 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Comment content must be 1000 characters or less"})
	}

	var comment models.Comment
	if err := config.DB.First(&comment, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Comment not found"})
	}

	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}
	if comment.UserID.String() != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You cannot update this comment"})
	}

	comment.Content = input.Content

	if err := config.DB.Save(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update comment"})
	}

	// Reload with author after update
	if err := config.DB.
		Preload("Author").
		Preload("Replies", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at asc")
		}).
		Preload("Replies.Author").
		First(&comment, "id = ?", comment.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load updated comment author"})
	}

	redis.PublishJSON("confessions:comment:updated", fiber.Map{
		"id":            comment.ID.String(),
		"confession_id": comment.ConfessionID.String(),
		"content":       comment.Content,
		"author":        mapPublicUser(comment.Author),
	})

	return c.JSON(mapPublicComment(comment))
}

func syncConfessionCommentCount(confessionID uuid.UUID) error {
	var total int64
	if err := config.DB.Model(&models.Comment{}).
		Where("confession_id = ?", confessionID).
		Count(&total).Error; err != nil {
		return err
	}

	return config.DB.Model(&models.Confession{}).
		Where("id = ?", confessionID).
		Update("comments", total).Error
}
