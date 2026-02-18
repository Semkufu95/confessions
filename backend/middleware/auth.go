package middleware

import (
	"errors"
	"os"
	"time"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/Semkufu95/confessions/Backend/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

func RequireAuth(c *fiber.Ctx) error {
	tokenString := c.Get("Authorization")
	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing token"})
	}
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Server auth is not configured"})
	}

	// Strip Bearer
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		if t.Method != jwt.SigningMethodHS256 {
			return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid token")
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
	}

	userID, ok := claims["user_id"].(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	sessionID, ok := claims["session_id"].(string)
	if !ok || sessionID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid session claims"})
	}

	if config.DB != nil {
		var session models.Session
		if err := config.DB.Where("id = ?", sessionID).First(&session).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Session not found"})
			}
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to verify session"})
		}

		now := time.Now()
		if session.UserID.String() != userID {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Session mismatch"})
		}
		if session.RevokedAt != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Session revoked"})
		}
		if now.After(session.ExpiresAt) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Session expired"})
		}

		if now.Sub(session.LastActivity) > utils.SessionInactivityTimeout() {
			_ = config.DB.Model(&models.Session{}).Where("id = ?", sessionID).Update("revoked_at", now).Error
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Session expired due to inactivity"})
		}

		if now.Sub(session.LastActivity) > utils.SessionActivityUpdateInterval() {
			_ = config.DB.Model(&models.Session{}).
				Where("id = ?", sessionID).
				Update("last_activity", now).Error
		}
	}

	c.Locals("user_id", userID)
	c.Locals("session_id", sessionID)
	return c.Next()
}
