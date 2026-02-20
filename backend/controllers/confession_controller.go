package controllers

import (
	"encoding/json"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/Semkufu95/confessions/Backend/redis"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

var allowedConfessionCategories = map[string]struct{}{
	"general":    {},
	"love":       {},
	"friendship": {},
	"work":       {},
	"family":     {},
}

func normalizeConfessionCategory(raw string) (string, bool) {
	category := strings.TrimSpace(strings.ToLower(raw))
	if category == "" {
		return "", true
	}
	_, ok := allowedConfessionCategories[category]
	return category, ok
}

// CreateConfession handles anonymous posting
func CreateConfession(c *fiber.Ctx) error {
	type ConfessionInput struct {
		Content  string `json:"content"`
		Category string `json:"category"`
	}

	var input ConfessionInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	input.Content = strings.TrimSpace(input.Content)
	if input.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Confession content is required"})
	}
	if len(input.Content) > 1000 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Confession content must be 1000 characters or less"})
	}
	category, isCategoryValid := normalizeConfessionCategory(input.Category)
	if !isCategoryValid {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid category"})
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
		Category:  category,
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

	type commentCountRow struct {
		ConfessionID uuid.UUID
		Total        int64
	}

	var countRows []commentCountRow
	_ = config.DB.Model(&models.Comment{}).
		Select("confession_id, COUNT(*) as total").
		Group("confession_id").
		Scan(&countRows).Error

	commentCountByConfessionID := make(map[uuid.UUID]int, len(countRows))
	for _, row := range countRows {
		commentCountByConfessionID[row.ConfessionID] = int(row.Total)
	}
	for i := range confessions {
		confessions[i].Comments = commentCountByConfessionID[confessions[i].ID]
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
		Content  string  `json:"content"`
		Category *string `json:"category"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	input.Content = strings.TrimSpace(input.Content)
	if input.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Confession content is required"})
	}
	if len(input.Content) > 1000 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Confession content must be 1000 characters or less"})
	}
	var normalizedCategory *string
	if input.Category != nil {
		category, isCategoryValid := normalizeConfessionCategory(*input.Category)
		if !isCategoryValid {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid category"})
		}
		normalizedCategory = &category
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
	if normalizedCategory != nil {
		confession.Category = *normalizedCategory
	}
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

func ShareConfession(c *fiber.Ctx) error {
	id := c.Params("id")
	var confession models.Confession
	if err := config.DB.First(&confession, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Confession not found"})
	}

	confession.Shares += 1
	if err := config.DB.Save(&confession).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to share confession"})
	}

	frontendBaseURL := resolveFrontendBaseURL(c)
	shareURL := frontendBaseURL + "/confession/" + confession.ID.String()

	data, _ := json.Marshal(confession)
	redis.Client.Publish(redis.Ctx, "confessions:confession:updated", data)

	return c.JSON(fiber.Map{
		"message":    "Confession shared",
		"share_url":  shareURL,
		"confession": confession,
	})
}

func resolveFrontendBaseURL(c *fiber.Ctx) string {
	configured := strings.TrimSpace(os.Getenv("FRONTEND_BASE_URL"))
	if configured != "" {
		return strings.TrimRight(configured, "/")
	}

	origin := strings.TrimSpace(c.Get("Origin"))
	if origin != "" {
		if parsed, err := url.Parse(origin); err == nil && parsed.Scheme != "" && parsed.Host != "" {
			host := strings.ToLower(parsed.Hostname())
			if host != "localhost" && host != "127.0.0.1" {
				return strings.TrimRight(origin, "/")
			}
		}
	}

	return "https://confessions.africa"
}

// GetConfessionWithComments fetches a confession and all its comments
func GetConfessionWithComments(c *fiber.Ctx) error {
	id := c.Params("id")

	var confession models.Confession
	if err := config.DB.First(&confession, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Confession not found"})
	}

	var comments []models.Comment
	if err := config.DB.Preload("Author").Where("confession_id = ?", id).Order("created_at asc").Find(&comments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch comments"})
	}
	confession.Comments = len(comments)
	_ = config.DB.Model(&models.Confession{}).Where("id = ?", confession.ID).Update("comments", confession.Comments).Error

	result := fiber.Map{
		"confession": confession,
		"comments":   comments,
	}

	// cache fetch result (optional, TTL 60s)
	data, _ := json.Marshal(result)
	redis.Client.Set(redis.Ctx, "confessions:"+id+":with_comments", data, 60*time.Second)

	return c.JSON(result)
}
