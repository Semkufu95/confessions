package controllers

import (
	"encoding/json"
	"errors"
	"sort"
	"strings"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
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

type connectionRequestResponse struct {
	ID           uuid.UUID `json:"id"`
	ConnectionID uuid.UUID `json:"connection_id"`
	SenderID     uuid.UUID `json:"sender_id"`
	ReceiverID   uuid.UUID `json:"receiver_id"`
	Status       string    `json:"status"`
	CreatedAt    string    `json:"created_at"`
}

type connectionPreviewResponse struct {
	ID        uuid.UUID `json:"id"`
	Title     string    `json:"title"`
	Category  string    `json:"category"`
	CreatedAt string    `json:"created_at"`
}

type connectionProfileResponse struct {
	ID                uuid.UUID                   `json:"id"`
	Username          string                      `json:"username"`
	CreatedAt         string                      `json:"created_at"`
	ConnectionsPosted int64                       `json:"connections_posted"`
	Categories        []string                    `json:"categories"`
	RecentConnections []connectionPreviewResponse `json:"recent_connections"`
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

func ConnectToConnection(c *fiber.Ctx) error {
	connectionIDStr := strings.TrimSpace(c.Params("id"))
	connectionID, err := uuid.Parse(connectionIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid connection id"})
	}

	userIDStr, ok := c.Locals("user_id").(string)
	if !ok || userIDStr == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}
	senderID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	var connection models.Connection
	if err := config.DB.First(&connection, "id = ?", connectionID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Connection not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch connection"})
	}

	if connection.UserID == senderID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "You cannot connect to your own post"})
	}

	var existing models.ConnectionRequest
	err = config.DB.Where("connection_id = ? AND sender_id = ?", connection.ID, senderID).First(&existing).Error
	if err == nil {
		return c.JSON(fiber.Map{
			"message": "Connection request already sent",
			"request": mapConnectionRequestResponse(existing),
		})
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to check connection request"})
	}

	request := models.ConnectionRequest{
		ConnectionID: connection.ID,
		SenderID:     senderID,
		ReceiverID:   connection.UserID,
		Status:       "pending",
	}

	if err := config.DB.Create(&request).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create connection request"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Connection request sent",
		"request": mapConnectionRequestResponse(request),
	})
}

func GetConnectionProfile(c *fiber.Ctx) error {
	connectionIDStr := strings.TrimSpace(c.Params("id"))
	connectionID, err := uuid.Parse(connectionIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid connection id"})
	}

	var connection models.Connection
	if err := config.DB.Preload("Author").First(&connection, "id = ?", connectionID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Connection not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch profile"})
	}

	var postedConnections []models.Connection
	if err := config.DB.
		Where("user_id = ?", connection.UserID).
		Order("created_at desc").
		Limit(5).
		Find(&postedConnections).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch profile connections"})
	}

	var totalPosted int64
	if err := config.DB.Model(&models.Connection{}).Where("user_id = ?", connection.UserID).Count(&totalPosted).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch profile summary"})
	}

	categorySet := make(map[string]struct{})
	previews := make([]connectionPreviewResponse, 0, len(postedConnections))
	for _, item := range postedConnections {
		if item.Category != "" {
			categorySet[item.Category] = struct{}{}
		}
		previews = append(previews, connectionPreviewResponse{
			ID:        item.ID,
			Title:     item.Title,
			Category:  item.Category,
			CreatedAt: item.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	categories := make([]string, 0, len(categorySet))
	for category := range categorySet {
		categories = append(categories, category)
	}
	sort.Strings(categories)

	return c.JSON(connectionProfileResponse{
		ID:                connection.Author.ID,
		Username:          connection.Author.Username,
		CreatedAt:         connection.Author.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		ConnectionsPosted: totalPosted,
		Categories:        categories,
		RecentConnections: previews,
	})
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

func mapConnectionRequestResponse(item models.ConnectionRequest) connectionRequestResponse {
	return connectionRequestResponse{
		ID:           item.ID,
		ConnectionID: item.ConnectionID,
		SenderID:     item.SenderID,
		ReceiverID:   item.ReceiverID,
		Status:       item.Status,
		CreatedAt:    item.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
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
