<<<<<<< HEAD:backend/controllers/reaction_controller.go
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

	claims := c.Locals("user").(jwt.MapClaims)
	userID := uuid.MustParse(claims["user_id"].(string))

	var reaction models.Reaction
	err := config.DB.Where("user_id = ? AND confession_id = ?", userID, confessionID).First(&reaction).Error

	if err == nil {
		// Update existing reaction
		reaction.Type = input.Type
		reaction.UpdatedAt = time.Now()
		config.DB.Save(&reaction)
	} else {
		// Create new reaction
		newReaction := models.Reaction{
			UserID:       userID,
			ConfessionID: uuidPtr(uuid.MustParse(confessionID)),
			Type:         input.Type,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
		config.DB.Create(&newReaction)
		reaction = newReaction
	}

	// Recalculate aggregate likes and boos for this confession
	var likesCount int64
	var boosCount int64

	config.DB.Model(&models.Reaction{}).
		Where("confession_id = ? AND type = ?", confessionID, "like").
		Count(&likesCount)

	config.DB.Model(&models.Reaction{}).
		Where("confession_id = ? AND type = ?", confessionID, "boo").
		Count(&boosCount)

	// Update confession's likes and boos count
	config.DB.Model(&models.Confession{}).
		Where("id = ?", confessionID).
		Updates(map[string]interface{}{"likes": likesCount, "boos": boosCount})

	// Fetch updated confession to return
	var updatedConfession models.Confession
	config.DB.Where("id = ?", confessionID).First(&updatedConfession)

	// Publish to Redis
	data, _ := json.Marshal(fiber.Map{"event": "confession_reacted", "data": reaction})
	redis.Client.Publish(redis.Ctx, "confessions:reactions", data)

	return c.JSON(updatedConfession)
}

// ReactToComment allows a user to like/boo a comment
func ReactToComment(c *fiber.Ctx) error {
	commentID := c.Params("id")
	var input ReactionInput

	if err := c.BodyParser(&input); err != nil || (input.Type != "like" && input.Type != "boo") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid reaction type"})
	}

	claims := c.Locals("user").(jwt.MapClaims)
	userID := uuid.MustParse(claims["user_id"].(string))

	var reaction models.Reaction
	err := config.DB.Where("user_id = ? AND comment_id = ?", userID, commentID).First(&reaction).Error

	if err == nil {
		// Update existing reaction
		reaction.Type = input.Type
		reaction.UpdatedAt = time.Now()
		config.DB.Save(&reaction)
	} else {
		// Create new reaction
		newReaction := models.Reaction{
			UserID:    userID,
			CommentID: uuidPtr(uuid.MustParse(commentID)),
			Type:      input.Type,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		config.DB.Create(&newReaction)
		reaction = newReaction
	}

	// Recalculate aggregate likes and boos for this comment
	var likesCount int64
	var boosCount int64

	config.DB.Model(&models.Reaction{}).
		Where("comment_id = ? AND type = ?", commentID, "like").
		Count(&likesCount)

	config.DB.Model(&models.Reaction{}).
		Where("comment_id = ? AND type = ?", commentID, "boo").
		Count(&boosCount)

	// Update comment's likes and boos count
	config.DB.Model(&models.Comment{}).
		Where("id = ?", commentID).
		Updates(map[string]interface{}{"likes": likesCount, "boos": boosCount})

	// Fetch updated comment to return
	var updatedComment models.Comment
	config.DB.Where("id = ?", commentID).First(&updatedComment)

	// Publish to Redis
	data, _ := json.Marshal(fiber.Map{"event": "comment_reacted", "data": reaction})
	redis.Client.Publish(redis.Ctx, "comments:reactions", data)

	return c.JSON(updatedComment)
}

// RemoveReaction allows user to remove their reaction (confession or comment)
func RemoveReaction(c *fiber.Ctx) error {
	id := c.Params("id") // reaction ID
	claims := c.Locals("user").(jwt.MapClaims)
	userID := claims["user_id"].(string)

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

		config.DB.Model(&models.Confession{}).
			Where("id = ?", confessionID).
			Updates(map[string]interface{}{"likes": likesCount, "boos": boosCount})
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

		config.DB.Model(&models.Comment{}).
			Where("id = ?", commentID).
			Updates(map[string]interface{}{"likes": likesCount, "boos": boosCount})
	}

	data, _ := json.Marshal(fiber.Map{"event": "reaction_removed", "id": id})
	redis.Client.Publish(redis.Ctx, "reactions:removed", data)

	return c.JSON(fiber.Map{"message": "Reaction removed"})
}

func uuidPtr(id uuid.UUID) *uuid.UUID {
	return &id
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

	claims := c.Locals("user").(jwt.MapClaims)
	userID := uuid.MustParse(claims["user_id"].(string))

	var reaction models.Reaction
	err := config.DB.Where("user_id = ? AND confession_id = ?", userID, confessionID).First(&reaction).Error

	if err == nil {
		// Update existing reaction
		reaction.Type = input.Type
		reaction.UpdatedAt = time.Now()
		config.DB.Save(&reaction)
	} else {
		// Create new
		newReaction := models.Reaction{
			UserID:       userID,
			ConfessionID: uuidPtr(uuid.MustParse(confessionID)),
			Type:         input.Type,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
		config.DB.Create(&newReaction)
		reaction = newReaction
	}

	// Publish to Redis
	data, _ := json.Marshal(fiber.Map{"event": "confession_reacted", "data": reaction})
	redis.Client.Publish(redis.Ctx, "confessions:reactions", data)

	return c.JSON(reaction)
}

// ReactToComment allows a user to like/boo a comment
func ReactToComment(c *fiber.Ctx) error {
	commentID := c.Params("id")
	var input ReactionInput

	if err := c.BodyParser(&input); err != nil || (input.Type != "like" && input.Type != "boo") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid reaction type"})
	}

	claims := c.Locals("user").(jwt.MapClaims)
	userID := uuid.MustParse(claims["user_id"].(string))

	var reaction models.Reaction
	err := config.DB.Where("user_id = ? AND comment_id = ?", userID, commentID).First(&reaction).Error

	if err == nil {
		// Update existing reaction
		reaction.Type = input.Type
		reaction.UpdatedAt = time.Now()
		config.DB.Save(&reaction)
	} else {
		// Create new
		newReaction := models.Reaction{
			UserID:    userID,
			CommentID: uuidPtr(uuid.MustParse(commentID)),
			Type:      input.Type,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		config.DB.Create(&newReaction)
		reaction = newReaction
	}

	// Publish to Redis
	data, _ := json.Marshal(fiber.Map{"event": "comment_reacted", "data": reaction})
	redis.Client.Publish(redis.Ctx, "comments:reactions", data)

	return c.JSON(reaction)
}

// RemoveReaction allows user to remove their reaction (confession or comment)
func RemoveReaction(c *fiber.Ctx) error {
	id := c.Params("id") // reaction ID
	claims := c.Locals("user").(jwt.MapClaims)
	userID := claims["user_id"].(string)

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

	data, _ := json.Marshal(fiber.Map{"event": "reaction_removed", "id": id})
	redis.Client.Publish(redis.Ctx, "reactions:removed", data)

	return c.JSON(fiber.Map{"message": "Reaction removed"})
}

func uuidPtr(id uuid.UUID) *uuid.UUID {
	return &id
}
>>>>>>> 8a7c502 (Added ConfessionService in front, modified the front):Backend/controllers/reaction_controller.go
