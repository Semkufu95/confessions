package controllers

import (
	"strings"
	"time"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/Semkufu95/confessions/Backend/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type RegisterInput struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

const (
	maxUsernameLength = 50
	maxEmailLength    = 254
)

func Register(c *fiber.Ctx) error {
	var input RegisterInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	input.Username = strings.TrimSpace(input.Username)
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))

	if input.Username == "" || input.Email == "" || input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Username, email, and password are required"})
	}
	if len(input.Username) > maxUsernameLength {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Username is too long"})
	}
	if len(input.Email) > maxEmailLength {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email is too long"})
	}

	if !utils.IsValidEmailFormat(input.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid email format"})
	}

	if !utils.IsValidPassword(input.Password) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Password must be at least 6 characters and include one uppercase letter and one symbol",
		})
	}

	// validate email if exists
	var existing models.User
	if err := config.DB.Where("email = ?", input.Email).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Email already exists"})
	}

	hash, err := utils.HashPassword(input.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not hash password"})
	}

	user := models.User{
		Username:     input.Username,
		Email:        input.Email,
		PasswordHash: hash,
	}

	result := config.DB.Create(&user)
	if result.Error != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User already exists or invalid data"})
	}

	sessionID, token, err := createSessionAndToken(user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create session"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"user": fiber.Map{
			"id":        user.ID,
			"username":  user.Username,
			"email":     user.Email,
			"createdAt": user.CreatedAt,
		},
		"access_token": token,
		"session_id":   sessionID,
	})
}

func Login(c *fiber.Ctx) error {
	var input RegisterInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	if input.Email == "" || input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email and password are required"})
	}
	if len(input.Email) > maxEmailLength {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email is too long"})
	}

	var user models.User
	result := config.DB.First(&user, "email = ?", input.Email)
	if result.Error != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	if !utils.CheckPasswordHash(input.Password, user.PasswordHash) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	sessionID, token, err := createSessionAndToken(user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create session"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"user": fiber.Map{
			"id":        user.ID,
			"username":  user.Username,
			"email":     user.Email,
			"createdAt": user.CreatedAt,
		},
		"access_token": token,
		"session_id":   sessionID,
	})
}

func Logout(c *fiber.Ctx) error {
	sessionIDStr, ok := c.Locals("session_id").(string)
	if !ok || sessionIDStr == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid session claims"})
	}

	now := time.Now()
	if err := config.DB.Model(&models.Session{}).
		Where("id = ? AND revoked_at IS NULL", sessionIDStr).
		Update("revoked_at", now).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to end session"})
	}

	return c.JSON(fiber.Map{"message": "Logged out"})
}

func createSessionAndToken(userID uuid.UUID) (string, string, error) {
	now := time.Now()
	session := models.Session{
		UserID:       userID,
		LastActivity: now,
		ExpiresAt:    now.Add(utils.SessionMaxLifetime()),
	}

	if err := config.DB.Create(&session).Error; err != nil {
		return "", "", err
	}

	token, err := utils.GenerateJWT(userID.String(), session.ID.String())
	if err != nil {
		_ = config.DB.Delete(&session).Error
		return "", "", err
	}

	return session.ID.String(), token, nil
}

// TODO: Add email authentication and verification, User receive email for verification
