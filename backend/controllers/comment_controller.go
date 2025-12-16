<<<<<<< HEAD:backend/controllers/comment_controller.go
package controllers

import (
	"encoding/json"
	"time"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/Semkufu95/confessions/Backend/redis"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// PostComment allows a user to comment on a confession
func PostComment(c *fiber.Ctx) error {
	confessionID := c.Params("id")
	var input struct {
		Content string `json:"content"`
	}

	if err := c.BodyParser(&input); err != nil || input.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	claims := c.Locals("user").(jwt.MapClaims)
	userID := uuid.MustParse(claims["user_id"].(string))

	comment := models.Comment{
		UserID:       userID,
		ConfessionID: uuid.MustParse(confessionID),
		Content:      input.Content,
		CreatedAt:    time.Now(),
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not post comment"})
	}

	// Preload author before returning
	if err := config.DB.Preload("Author").First(&comment, "id = ?", comment.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load comment author"})
	}

	data, _ := json.Marshal(fiber.Map{"event": "comment_posted", "data": comment})
	redis.Client.Publish(redis.Ctx, "comments:posted", data)

	return c.JSON(comment)
}

// GetCommentsByConfession returns comments for a given confession, including author data
func GetCommentsByConfession(c *fiber.Ctx) error {
	confessionID := c.Params("id")

	var comments []models.Comment
	if err := config.DB.
		Preload("Author").
		Where("confession_id = ?", confessionID).
		Order("created_at asc").
		Find(&comments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load comments"})
	}

	return c.JSON(comments)
}

// DeleteComment allows a user to delete their own comment
func DeleteComment(c *fiber.Ctx) error {
	id := c.Params("id")
	claims := c.Locals("user").(jwt.MapClaims)
	userID := claims["user_id"].(string)

	var comment models.Comment
	if err := config.DB.First(&comment, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Comment not found"})
	}

	if comment.UserID.String() != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You cannot delete this comment"})
	}

	if err := config.DB.Delete(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete comment"})
	}

	data, _ := json.Marshal(fiber.Map{"event": "comment_deleted", "id": id})
	redis.Client.Publish(redis.Ctx, "comments:deleted", data)

	return c.JSON(fiber.Map{"message": "Comment deleted"})
}

// UpdateComment allows a user to edit their comment
func UpdateComment(c *fiber.Ctx) error {
	id := c.Params("id")
	var input struct {
		Content string `json:"content"`
	}
	if err := c.BodyParser(&input); err != nil || input.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var comment models.Comment
	if err := config.DB.First(&comment, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Comment not found"})
	}

	comment.Content = input.Content

	if err := config.DB.Save(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update comment"})
	}

	// Reload with author after update
	if err := config.DB.Preload("Author").First(&comment, "id = ?", comment.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load updated comment author"})
	}

	data, _ := json.Marshal(fiber.Map{"event": "comment_updated", "data": comment})
	redis.Client.Publish(redis.Ctx, "confessions:comment:updated", data)

	return c.JSON(comment)
}
=======
package controllers

import (
	"encoding/json"
	"time"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/Semkufu95/confessions/Backend/redis"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
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

	claims := c.Locals("user").(jwt.MapClaims)
	userID := claims["user_id"].(string)

	comment := models.Comment{
		UserID:       uuid.MustParse(userID),
		ConfessionID: uuid.MustParse(confessionID),
		Content:      input.Content,
		CreatedAt:    time.Now(),
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not post comment"})
	}

	// 🔹 Publish to Redis
	data, _ := json.Marshal(fiber.Map{"event": "comment_posted", "data": comment})
	redis.Client.Publish(redis.Ctx, "comments:posted", data)

	return c.JSON(comment)
}

// GetCommentsByConfession returns comments for a given confession
func GetCommentsByConfession(c *fiber.Ctx) error {
	confessionID := c.Params("id")

	var comments []models.Comment
	if err := config.DB.Where("confession_id = ?", confessionID).Order("created_at asc").Find(&comments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load comments"})
	}

	return c.JSON(comments)
}

// DeleteComment allows a user to delete their comment
func DeleteComment(c *fiber.Ctx) error {
	id := c.Params("id")
	claims := c.Locals("user").(jwt.MapClaims)
	userID := claims["user_id"].(string)

	var comment models.Comment
	if err := config.DB.First(&comment, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Comment not found"})
	}

	if comment.UserID.String() != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You cannot delete this comment"})
	}

	if err := config.DB.Delete(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete comment"})
	}

	// 🔹 Publish event
	data, _ := json.Marshal(fiber.Map{"event": "comment_deleted", "id": id})
	redis.Client.Publish(redis.Ctx, "comments:deleted", data)

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

	var comment models.Comment
	if err := config.DB.First(&comment, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Comment not found"})
	}

	comment.Content = input.Content
	if err := config.DB.Save(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update comment"})
	}

	// publish update event
	data, _ := json.Marshal(comment)
	redis.Client.Publish(redis.Ctx, "confessions:comment:updated", data)

	return c.JSON(comment)
}
>>>>>>> 8a7c502 (Added ConfessionService in front, modified the front):Backend/controllers/comment_controller.go
