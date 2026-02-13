package controllers

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/Semkufu95/confessions/Backend/redis"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReactionInput struct {
	Type string `json:"type"` // "like" or "boo"
}

// ReactToConfession allows a user to like/boo a confession
func ReactToConfession(c *fiber.Ctx) error {
	confessionID := c.Params("id")
	var input ReactionInput

	if err := c.BodyParser(&input); err != nil || (input.Type != "like" && input.Type != "boo") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid reaction type"})
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

	var reaction models.Reaction
	err = config.DB.Where("user_id = ? AND confession_id = ?", userID, parsedConfessionID).First(&reaction).Error

	if err == nil {
		// Update existing reaction
		reaction.Type = input.Type
		reaction.UpdatedAt = time.Now()
		if err := config.DB.Save(&reaction).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update reaction"})
		}
	} else {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to query reaction"})
		}
		// Create new reaction
		newReaction := models.Reaction{
			UserID:       userID,
			ConfessionID: uuidPtr(parsedConfessionID),
			Type:         input.Type,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
		if err := config.DB.Create(&newReaction).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create reaction"})
		}
		reaction = newReaction
	}

	// Recalculate aggregate likes and boos for this confession
	var likesCount int64
	var boosCount int64

	if err := config.DB.Model(&models.Reaction{}).
		Where("confession_id = ? AND type = ?", confessionID, "like").
		Count(&likesCount).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to count reactions"})
	}

	if err := config.DB.Model(&models.Reaction{}).
		Where("confession_id = ? AND type = ?", confessionID, "boo").
		Count(&boosCount).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to count reactions"})
	}

	// Update confession's likes and boos count
	if err := config.DB.Model(&models.Confession{}).
		Where("id = ?", confessionID).
		Updates(map[string]interface{}{"likes": likesCount, "boos": boosCount}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update confession totals"})
	}

	// Fetch updated confession to return
	var updatedConfession models.Confession
	if err := config.DB.Where("id = ?", confessionID).First(&updatedConfession).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load confession"})
	}

	// Publish to Redis
	data, _ := json.Marshal(fiber.Map{"confession_id": confessionID})
	redis.Client.Publish(redis.Ctx, "confessions:reaction:updated", data)

	return c.JSON(updatedConfession)
}

// ReactToComment allows a user to like/boo a comment
func ReactToComment(c *fiber.Ctx) error {
	commentID := c.Params("id")
	var input ReactionInput

	if err := c.BodyParser(&input); err != nil || (input.Type != "like" && input.Type != "boo") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid reaction type"})
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

	var reaction models.Reaction
	err = config.DB.Where("user_id = ? AND comment_id = ?", userID, parsedCommentID).First(&reaction).Error

	if err == nil {
		// Update existing reaction
		reaction.Type = input.Type
		reaction.UpdatedAt = time.Now()
		if err := config.DB.Save(&reaction).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update reaction"})
		}
	} else {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to query reaction"})
		}
		// Create new reaction
		newReaction := models.Reaction{
			UserID:    userID,
			CommentID: uuidPtr(parsedCommentID),
			Type:      input.Type,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		if err := config.DB.Create(&newReaction).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create reaction"})
		}
		reaction = newReaction
	}

	// Recalculate aggregate likes and boos for this comment
	var likesCount int64
	var boosCount int64

	if err := config.DB.Model(&models.Reaction{}).
		Where("comment_id = ? AND type = ?", commentID, "like").
		Count(&likesCount).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to count reactions"})
	}

	if err := config.DB.Model(&models.Reaction{}).
		Where("comment_id = ? AND type = ?", commentID, "boo").
		Count(&boosCount).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to count reactions"})
	}

	// Update comment's likes and boos count
	if err := config.DB.Model(&models.Comment{}).
		Where("id = ?", commentID).
		Updates(map[string]interface{}{"likes": likesCount, "boos": boosCount}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update comment totals"})
	}

	// Fetch updated comment to return
	var updatedComment models.Comment
	if err := config.DB.Where("id = ?", commentID).First(&updatedComment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load comment"})
	}

	// Publish to Redis
	data, _ := json.Marshal(fiber.Map{"comment_id": commentID})
	redis.Client.Publish(redis.Ctx, "confessions:reaction:updated", data)

	return c.JSON(updatedComment)
}

// RemoveReaction allows user to remove their reaction (confession or comment)
func RemoveReaction(c *fiber.Ctx) error {
	id := c.Params("id") // reaction ID
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	var reaction models.Reaction
	if err := config.DB.First(&reaction, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Reaction not found"})
	}

	if reaction.UserID.String() != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You cannot remove this reaction"})
	}

	if err := config.DB.Delete(&reaction).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to remove reaction"})
	}

	// After removal, recalc counts if this reaction was on confession or comment

	if reaction.ConfessionID != nil {
		confessionID := reaction.ConfessionID.String()
		var likesCount int64
		var boosCount int64

		config.DB.Model(&models.Reaction{}).
			Where("confession_id = ? AND type = ?", confessionID, "like").
			Count(&likesCount)

		config.DB.Model(&models.Reaction{}).
			Where("confession_id = ? AND type = ?", confessionID, "boo").
			Count(&boosCount)

		if err := config.DB.Model(&models.Confession{}).
			Where("id = ?", confessionID).
			Updates(map[string]interface{}{"likes": likesCount, "boos": boosCount}).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update confession totals"})
		}
	}

	if reaction.CommentID != nil {
		commentID := reaction.CommentID.String()
		var likesCount int64
		var boosCount int64

		config.DB.Model(&models.Reaction{}).
			Where("comment_id = ? AND type = ?", commentID, "like").
			Count(&likesCount)

		config.DB.Model(&models.Reaction{}).
			Where("comment_id = ? AND type = ?", commentID, "boo").
			Count(&boosCount)

		if err := config.DB.Model(&models.Comment{}).
			Where("id = ?", commentID).
			Updates(map[string]interface{}{"likes": likesCount, "boos": boosCount}).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update comment totals"})
		}
	}

	data, _ := json.Marshal(fiber.Map{
		"id":            id,
		"confession_id": reaction.ConfessionID,
		"comment_id":    reaction.CommentID,
	})
	redis.Client.Publish(redis.Ctx, "confessions:reaction:removed", data)

	return c.JSON(fiber.Map{"message": "Reaction removed"})
}

func uuidPtr(id uuid.UUID) *uuid.UUID {
	return &id
}
