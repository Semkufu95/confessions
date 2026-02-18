package controllers

import (
	"errors"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type updateSettingsInput struct {
	PushNotifications  *bool `json:"pushNotifications"`
	EmailNotifications *bool `json:"emailNotifications"`
	CommentReplies     *bool `json:"commentReplies"`
	NewFollowers       *bool `json:"newFollowers"`
}

func GetMySettings(c *fiber.Ctx) error {
	userID, err := authUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	settings, err := ensureUserSettings(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load settings"})
	}

	return c.JSON(settingsResponse(settings))
}

func UpdateMySettings(c *fiber.Ctx) error {
	userID, err := authUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	var input updateSettingsInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid settings payload"})
	}

	settings, err := ensureUserSettings(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load settings"})
	}

	if input.PushNotifications != nil {
		settings.PushNotifications = *input.PushNotifications
	}
	if input.EmailNotifications != nil {
		settings.EmailNotifications = *input.EmailNotifications
	}
	if input.CommentReplies != nil {
		settings.CommentReplies = *input.CommentReplies
	}
	if input.NewFollowers != nil {
		settings.NewFollowers = *input.NewFollowers
	}

	if err := config.DB.Save(&settings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update settings"})
	}

	return c.JSON(settingsResponse(settings))
}

func ensureUserSettings(userID uuid.UUID) (models.UserSettings, error) {
	var settings models.UserSettings
	err := config.DB.Where("user_id = ?", userID).First(&settings).Error
	if err == nil {
		return settings, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return models.UserSettings{}, err
	}

	settings = models.UserSettings{
		UserID:             userID,
		PushNotifications:  true,
		EmailNotifications: false,
		CommentReplies:     true,
		NewFollowers:       false,
	}
	if createErr := config.DB.Create(&settings).Error; createErr != nil {
		return models.UserSettings{}, createErr
	}
	return settings, nil
}

func authUserID(c *fiber.Ctx) (uuid.UUID, error) {
	userIDStr, ok := c.Locals("user_id").(string)
	if !ok || userIDStr == "" {
		return uuid.Nil, fiber.ErrUnauthorized
	}
	return uuid.Parse(userIDStr)
}

func settingsResponse(settings models.UserSettings) fiber.Map {
	return fiber.Map{
		"pushNotifications":  settings.PushNotifications,
		"emailNotifications": settings.EmailNotifications,
		"commentReplies":     settings.CommentReplies,
		"newFollowers":       settings.NewFollowers,
		"updatedAt":          settings.UpdatedAt,
	}
}
