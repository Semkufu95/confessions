package controllers

import (
	"strings"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/Semkufu95/confessions/Backend/utils"
	"github.com/gofiber/fiber/v2"
)

type RegisterInput struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

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

	token, err := utils.GenerateJWT(user.ID.String())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not generate token"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"user": fiber.Map{
			"id":        user.ID,
			"username":  user.Username,
			"email":     user.Email,
			"createdAt": user.CreatedAt,
		},
		"access_token": token,
	})
}

func Login(c *fiber.Ctx) error {
	var input RegisterInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))

	var user models.User
	result := config.DB.First(&user, "email = ?", input.Email)
	if result.Error != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	if !utils.CheckPasswordHash(input.Password, user.PasswordHash) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	token, err := utils.GenerateJWT(user.ID.String())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not generate token"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"user": fiber.Map{
			"id":        user.ID,
			"username":  user.Username,
			"email":     user.Email,
			"createdAt": user.CreatedAt,
		},
		"access_token": token,
	})
}

// TODO: Add email authentication and verification, User receive email for verification
