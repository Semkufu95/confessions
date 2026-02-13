package middleware

import (
	"fmt"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func makeToken(t *testing.T, secret string, method jwt.SigningMethod, claims jwt.MapClaims) string {
	t.Helper()
	token := jwt.NewWithClaims(method, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}
	return signed
}

func setupAuthTestApp() *fiber.App {
	app := fiber.New()
	app.Get("/protected", RequireAuth, func(c *fiber.Ctx) error {
		userID, _ := c.Locals("user_id").(string)
		return c.Status(fiber.StatusOK).SendString(userID)
	})
	return app
}

func TestRequireAuth_MissingToken(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret")
	app := setupAuthTestApp()

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", fiber.StatusUnauthorized, resp.StatusCode)
	}
}

func TestRequireAuth_ValidBearerToken(t *testing.T) {
	secret := "test-secret"
	os.Setenv("JWT_SECRET", secret)
	app := setupAuthTestApp()

	token := makeToken(t, secret, jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": "user-123",
		"exp":     time.Now().Add(time.Hour).Unix(),
	})

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected status %d, got %d", fiber.StatusOK, resp.StatusCode)
	}
}

func TestRequireAuth_RejectsWrongSigningMethod(t *testing.T) {
	secret := "test-secret"
	os.Setenv("JWT_SECRET", secret)
	app := setupAuthTestApp()

	token := makeToken(t, secret, jwt.SigningMethodHS384, jwt.MapClaims{
		"user_id": "user-123",
		"exp":     time.Now().Add(time.Hour).Unix(),
	})

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", fiber.StatusUnauthorized, resp.StatusCode)
	}
}

func TestRequireAuth_RejectsMissingUserIDClaim(t *testing.T) {
	secret := "test-secret"
	os.Setenv("JWT_SECRET", secret)
	app := setupAuthTestApp()

	token := makeToken(t, secret, jwt.SigningMethodHS256, jwt.MapClaims{
		"exp": time.Now().Add(time.Hour).Unix(),
	})

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", fiber.StatusUnauthorized, resp.StatusCode)
	}
}
