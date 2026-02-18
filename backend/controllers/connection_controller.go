package controllers

import (
	"encoding/json"
	"strings"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type connectionInput struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Location    string   `json:"location"`
	Age         *int     `json:"age"`
	Interests   []string `json:"interests"`
}

type connectionAuthorResponse struct {
	ID        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	CreatedAt string    `json:"createdAt"`
}

type connectionResponse struct {
	ID          uuid.UUID                `json:"id"`
	Title       string                   `json:"title"`
	Description string                   `json:"description"`
	Category    string                   `json:"category"`
	Location    string                   `json:"location,omitempty"`
	Age         *int                     `json:"age,omitempty"`
	Interests   []string                 `json:"interests"`
	CreatedAt   string                   `json:"created_at"`
	Author      connectionAuthorResponse `json:"author"`
}

func GetAllConnections(c *fiber.Ctx) error {
	var connections []models.Connection
	if err := config.DB.Preload("Author").Order("created_at desc").Find(&connections).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch connections"})
	}

	response := make([]connectionResponse, 0, len(connections))
	for _, item := range connections {
		response = append(response, mapConnectionResponse(item))
	}

	return c.JSON(response)
}

func CreateConnection(c *fiber.Ctx) error {
	var input connectionInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	input.Title = strings.TrimSpace(input.Title)
	input.Description = strings.TrimSpace(input.Description)
	input.Location = strings.TrimSpace(input.Location)
	input.Category = strings.TrimSpace(strings.ToLower(input.Category))

	if input.Title == "" || input.Description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Title and description are required"})
	}

	if input.Category == "" {
		input.Category = "friendship"
	}
	if input.Category != "love" && input.Category != "friendship" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Category must be either love or friendship"})
	}

	if input.Age != nil && *input.Age < 18 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Age must be at least 18"})
	}

	userIDStr, ok := c.Locals("user_id").(string)
	if !ok || userIDStr == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	serializedInterests, err := serializeInterests(input.Interests)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid interests format"})
	}

	connection := models.Connection{
		UserID:      userID,
		Title:       input.Title,
		Description: input.Description,
		Category:    input.Category,
		Location:    input.Location,
		Age:         input.Age,
		Interests:   serializedInterests,
	}

	if err := config.DB.Create(&connection).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create connection"})
	}

	if err := config.DB.Preload("Author").First(&connection, "id = ?", connection.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load connection author"})
	}

	return c.Status(fiber.StatusCreated).JSON(mapConnectionResponse(connection))
}

func mapConnectionResponse(item models.Connection) connectionResponse {
	interests, err := deserializeInterests(item.Interests)
	if err != nil {
		interests = []string{}
	}

	return connectionResponse{
		ID:          item.ID,
		Title:       item.Title,
		Description: item.Description,
		Category:    item.Category,
		Location:    item.Location,
		Age:         item.Age,
		Interests:   interests,
		CreatedAt:   item.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		Author: connectionAuthorResponse{
			ID:        item.Author.ID,
			Username:  item.Author.Username,
			Email:     item.Author.Email,
			CreatedAt: item.Author.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		},
	}
}

func serializeInterests(values []string) (string, error) {
	cleaned := make([]string, 0, len(values))
	seen := make(map[string]struct{})
	for _, value := range values {
		normalized := strings.TrimSpace(value)
		if normalized == "" {
			continue
		}
		key := strings.ToLower(normalized)
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		cleaned = append(cleaned, normalized)
	}

	data, err := json.Marshal(cleaned)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func deserializeInterests(raw string) ([]string, error) {
	if strings.TrimSpace(raw) == "" {
		return []string{}, nil
	}
	var values []string
	if err := json.Unmarshal([]byte(raw), &values); err != nil {
		return nil, err
	}
	return values, nil
}
