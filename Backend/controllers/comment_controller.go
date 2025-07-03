package controllers

import (
	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
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

	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["user_id"].(string)

	comment := models.Comment{
		UserID:       uuid.MustParse(userID),
		ConfessionID: uuid.MustParse(confessionID),
		Content:      input.Content,
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not post comment"})
	}

	return c.JSON(comment)
}

// GetConfessionWithComments returns a confession and its comments
func GetConfessionWithComments(c *fiber.Ctx) error {
	confessionID := c.Params("id")

	var confession models.Confession
	if err := config.DB.First(&confession, "id = ?", confessionID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Confession not found"})
	}

	var comments []models.Comment
	if err := config.DB.Where("confession_id = ?", confessionID).Order("created_at asc").Find(&comments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load comments"})
	}

	return c.JSON(fiber.Map{
		"confession": confession,
		"comments":   comments,
	})
}
