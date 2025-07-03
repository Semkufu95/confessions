package controllers

import (
	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// CreateConfession handles anonymous posting
func CreateConfession(c *fiber.Ctx) error {
	type ConfessionInput struct {
		Content string `json:"content"`
	}

	var input ConfessionInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["user_id"].(string)

	confession := models.Confession{
		UserID:  uuid.MustParse(userID),
		Content: input.Content,
	}

	if err := config.DB.Create(&confession).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not save confession"})
	}

	return c.JSON(confession)
}

// GetAllConfessions returns all confessions (without user ID)
func GetAllConfessions(c *fiber.Ctx) error {
	var confessions []models.Confession
	if err := config.DB.Order("created_at desc").Find(&confessions).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch confessions"})
	}

	return c.JSON(confessions)
}
