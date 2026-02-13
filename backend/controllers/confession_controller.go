package controllers

import (
	"encoding/json"
	"time"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/Semkufu95/confessions/Backend/redis"
	"github.com/gofiber/fiber/v2"
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

	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	confession := models.Confession{
		UserID:    parsedUserID,
		Content:   input.Content,
		CreatedAt: time.Now(),
	}

	if err := config.DB.Create(&confession).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not save confession"})
	}

	// 🔹 Publish event to Redis for real-time updates
	data, _ := json.Marshal(confession)
	redis.Client.Publish(redis.Ctx, "confessions:confession:created", data)

	return c.JSON(confession)
}

// GetAllConfessions returns all confessions (latest first)
func GetAllConfessions(c *fiber.Ctx) error {
	var confessions []models.Confession
	if err := config.DB.Order("created_at desc").Find(&confessions).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch confessions"})
	}

	return c.JSON(confessions)
}

// GetConfessionByID returns a single confession by ID
func GetConfessionByID(c *fiber.Ctx) error {
	id := c.Params("id")

	var confession models.Confession
	if err := config.DB.First(&confession, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Confession not found"})
	}

	return c.JSON(confession)
}

// DeleteConfession allows deleting a confession (owner only)
func DeleteConfession(c *fiber.Ctx) error {
	id := c.Params("id")
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	var confession models.Confession
	if err := config.DB.First(&confession, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Confession not found"})
	}

	// Ownership check
	if confession.UserID.String() != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You cannot delete this confession"})
	}

	if err := config.DB.Delete(&confession).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete confession"})
	}

	// 🔹 Publish delete event
	data, _ := json.Marshal(fiber.Map{"id": id})
	redis.Client.Publish(redis.Ctx, "confessions:confession:deleted", data)

	return c.JSON(fiber.Map{"message": "Confession deleted"})
}

// UpdateConfession allows editing an existing confession
func UpdateConfession(c *fiber.Ctx) error {
	id := c.Params("id")
	var input struct {
		Content string `json:"content"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var confession models.Confession
	if err := config.DB.First(&confession, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Confession not found"})
	}

	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}
	if confession.UserID.String() != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You cannot update this confession"})
	}

	confession.Content = input.Content
	if err := config.DB.Save(&confession).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update confession"})
	}

	// publish update event
	data, _ := json.Marshal(confession)
	redis.Client.Publish(redis.Ctx, "confessions:confession:updated", data)

	return c.JSON(confession)
}

// StarConfession increments stars for a confession
func StarConfession(c *fiber.Ctx) error {
	id := c.Params("id")
	var confession models.Confession
	if err := config.DB.First(&confession, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Confession not found"})
	}

	confession.Stars += 1
	if err := config.DB.Save(&confession).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to star confession"})
	}

	// publish star event
	data, _ := json.Marshal(confession)
	redis.Client.Publish(redis.Ctx, "confessions:confession:starred", data)

	return c.JSON(confession)
}

// GetConfessionWithComments fetches a confession and all its comments
func GetConfessionWithComments(c *fiber.Ctx) error {
	id := c.Params("id")

	var confession models.Confession
	if err := config.DB.First(&confession, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Confession not found"})
	}

	var comments []models.Comment
	if err := config.DB.Where("confession_id = ?", id).Order("created_at asc").Find(&comments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch comments"})
	}

	result := fiber.Map{
		"confession": confession,
		"comments":   comments,
	}

	// cache fetch result (optional, TTL 60s)
	data, _ := json.Marshal(result)
	redis.Client.Set(redis.Ctx, "confessions:"+id+":with_comments", data, 60*time.Second)

	return c.JSON(result)
}
