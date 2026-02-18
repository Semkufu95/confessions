package utils

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userID string, sessionID string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("JWT_SECRET is not set")
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"user_id":    userID,
		"session_id": sessionID,
		"iat":        now.Unix(),
		"exp":        now.Add(SessionMaxLifetime()).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
