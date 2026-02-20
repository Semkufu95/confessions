package controllers

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/Semkufu95/confessions/Backend/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RegisterInput struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type verifyEmailInput struct {
	Token string `json:"token"`
}

type resendVerificationInput struct {
	Email string `json:"email"`
}

const (
	maxUsernameLength           = 50
	maxEmailLength              = 254
	emailVerificationTokenBytes = 32
)

var emailVerificationTokenTTL = 24 * time.Hour

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

	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User already exists or invalid data"})
	}

	verificationSent, err := issueEmailVerification(&user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not prepare email verification"})
	}

	sessionID, token, err := createSessionAndToken(user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create session"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"user": fiber.Map{
			"id":            user.ID,
			"username":      user.Username,
			"email":         user.Email,
			"emailVerified": user.EmailVerified,
			"createdAt":     user.CreatedAt,
		},
		"access_token":            token,
		"session_id":              sessionID,
		"email_verification_sent": verificationSent,
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

	if requireEmailVerification() && !user.EmailVerified {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Email is not verified. Please verify your email first.",
		})
	}

	sessionID, token, err := createSessionAndToken(user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create session"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"user": fiber.Map{
			"id":            user.ID,
			"username":      user.Username,
			"email":         user.Email,
			"emailVerified": user.EmailVerified,
			"createdAt":     user.CreatedAt,
		},
		"access_token": token,
		"session_id":   sessionID,
	})
}

func VerifyEmail(c *fiber.Ctx) error {
	token := strings.TrimSpace(c.Query("token"))
	if token == "" {
		var input verifyEmailInput
		if err := c.BodyParser(&input); err == nil {
			token = strings.TrimSpace(input.Token)
		}
	}
	if token == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Verification token is required"})
	}

	tokenHash := hashEmailVerificationToken(token)
	now := time.Now()

	var user models.User
	if err := config.DB.
		Where("email_verification_token_hash = ? AND email_verification_expires_at IS NOT NULL AND email_verification_expires_at > ?", tokenHash, now).
		First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid or expired verification token"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not verify email"})
	}

	if err := config.DB.Model(&user).Updates(map[string]interface{}{
		"email_verified":                true,
		"email_verification_token_hash": "",
		"email_verification_expires_at": nil,
	}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not verify email"})
	}

	return c.JSON(fiber.Map{
		"message":        "Email verified successfully",
		"email_verified": true,
	})
}

func ResendVerificationEmail(c *fiber.Ctx) error {
	var input resendVerificationInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	if input.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email is required"})
	}
	if len(input.Email) > maxEmailLength || !utils.IsValidEmailFormat(input.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid email format"})
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Do not leak account existence.
			return c.JSON(fiber.Map{"message": "If your account exists, a verification email has been sent."})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not process request"})
	}

	if user.EmailVerified {
		return c.JSON(fiber.Map{
			"message":        "Email is already verified.",
			"email_verified": true,
		})
	}

	sent, err := issueEmailVerification(&user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not send verification email"})
	}

	return c.JSON(fiber.Map{
		"message":                 "Verification email sent.",
		"email_verification_sent": sent,
		"email_verified":          false,
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

func issueEmailVerification(user *models.User) (bool, error) {
	token, tokenHash, expiresAt, err := generateEmailVerificationToken()
	if err != nil {
		return false, err
	}

	if err := config.DB.Model(user).Updates(map[string]interface{}{
		"email_verified":                false,
		"email_verification_token_hash": tokenHash,
		"email_verification_expires_at": expiresAt,
	}).Error; err != nil {
		return false, err
	}

	verificationURL, err := buildEmailVerificationURL(token)
	if err != nil {
		return false, err
	}

	err = utils.SendEmailVerification(user.Email, verificationURL)
	if err != nil {
		if errors.Is(err, utils.ErrEmailDeliveryNotConfigured) {
			return false, nil
		}
		return false, err
	}

	return true, nil
}

func generateEmailVerificationToken() (string, string, time.Time, error) {
	bytes := make([]byte, emailVerificationTokenBytes)
	if _, err := rand.Read(bytes); err != nil {
		return "", "", time.Time{}, err
	}
	token := base64.RawURLEncoding.EncodeToString(bytes)
	tokenHash := hashEmailVerificationToken(token)
	expiresAt := time.Now().Add(emailVerificationTokenTTL)
	return token, tokenHash, expiresAt, nil
}

func hashEmailVerificationToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func buildEmailVerificationURL(token string) (string, error) {
	baseURL := strings.TrimSpace(os.Getenv("APP_VERIFY_EMAIL_BASE_URL"))
	if baseURL == "" {
		baseURL = "http://localhost:5173/verify-email"
	}

	parsedURL, err := url.Parse(baseURL)
	if err != nil {
		return "", err
	}

	query := parsedURL.Query()
	query.Set("token", token)
	parsedURL.RawQuery = query.Encode()
	return parsedURL.String(), nil
}

func requireEmailVerification() bool {
	switch strings.ToLower(strings.TrimSpace(os.Getenv("REQUIRE_EMAIL_VERIFICATION"))) {
	case "1", "true", "yes", "on":
		return true
	default:
		return false
	}
}
