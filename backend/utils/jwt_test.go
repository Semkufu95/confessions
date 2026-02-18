package utils

import (
	"os"
	"testing"

	"github.com/golang-jwt/jwt/v5"
)

func TestGenerateJWT(t *testing.T) {
	secret := "unit-test-secret"
	os.Setenv("JWT_SECRET", secret)

	userID := "user-456"
	sessionID := "session-123"
	tokenString, err := GenerateJWT(userID, sessionID)
	if err != nil {
		t.Fatalf("GenerateJWT failed: %v", err)
	}
	if tokenString == "" {
		t.Fatalf("expected non-empty token")
	}

	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		t.Fatalf("token parse failed: %v", err)
	}

	gotUserID, ok := claims["user_id"].(string)
	if !ok || gotUserID != userID {
		t.Fatalf("expected user_id %q, got %#v", userID, claims["user_id"])
	}
	if _, ok := claims["exp"]; !ok {
		t.Fatalf("expected exp claim")
	}
	gotSessionID, ok := claims["session_id"].(string)
	if !ok || gotSessionID != sessionID {
		t.Fatalf("expected session_id %q, got %#v", sessionID, claims["session_id"])
	}
}
