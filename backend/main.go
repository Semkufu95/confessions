package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"strconv"
	"sync"
	"syscall"
	"time"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/redis"
	"github.com/Semkufu95/confessions/Backend/routes"
	"github.com/Semkufu95/confessions/Backend/websockets"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/websocket/v2"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found, using system environment")
	}

	// Connect to Database
	config.InitDB()

	// Connect to Redis
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "redis:6379"
	}
	redis.ConnectRedis(redisAddr)

	shutdownCtx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	var workers sync.WaitGroup

	// Start Redis subscriber (background worker)
	redis.StartSubscriber(shutdownCtx, &workers)

	// Start Fiber
	bodyLimit := 1024 * 1024 // 1MB default
	if value := os.Getenv("API_BODY_LIMIT_BYTES"); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed <= 0 {
			log.Printf("invalid API_BODY_LIMIT_BYTES=%q, falling back to %d", value, bodyLimit)
		} else {
			bodyLimit = parsed
		}
	}

	app := fiber.New(fiber.Config{
		BodyLimit: bodyLimit,
	})
	app.Use(logger.New())

	// Request rate limiting
	maxRequests := 100
	if value := os.Getenv("RATE_LIMIT_MAX"); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed <= 0 {
			log.Printf("invalid RATE_LIMIT_MAX=%q, falling back to %d", value, maxRequests)
		} else {
			maxRequests = parsed
		}
	}

	window := time.Minute
	if value := os.Getenv("RATE_LIMIT_WINDOW"); value != "" {
		parsed, err := time.ParseDuration(value)
		if err != nil || parsed <= 0 {
			log.Printf("invalid RATE_LIMIT_WINDOW=%q, falling back to %s", value, window)
		} else {
			window = parsed
		}
	}
	app.Use(limiter.New(limiter.Config{
		Max:        maxRequests,
		Expiration: window,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Rate limit exceeded",
			})
		},
	}))

	// WebSocket endpoint
	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		defer c.Close()

		websockets.Mu.Lock()
		websockets.Clients[c] = true
		websockets.Mu.Unlock()

		for {
			if _, _, err := c.ReadMessage(); err != nil {
				websockets.Mu.Lock()
				delete(websockets.Clients, c)
				websockets.Mu.Unlock()
				break
			}
		}
	}))

	// Redis PubSub -> Broadcast to WebSocket clients
	redis.StartWebsocketBroadcaster(shutdownCtx, &workers, websockets.Broadcast)

	// Enable CORS for frontend
	allowOrigins := os.Getenv("CORS_ALLOW_ORIGINS")
	if allowOrigins == "" {
		allowOrigins = "http://localhost:5173"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowOrigins,
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
	}))

	app.Use(func(c *fiber.Ctx) error {
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "DENY")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		c.Set("Cross-Origin-Opener-Policy", "same-origin")
		c.Set("Cross-Origin-Resource-Policy", "same-site")
		c.Set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; object-src 'none'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' ws: wss: http: https:")
		c.Set("Server", "")
		if c.Protocol() == "https" {
			c.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		}
		return c.Next()
	})

	// API Routes
	routes.SetupRoutes(app)

	// Server port
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	serverErr := make(chan error, 1)
	go func() {
		serverErr <- app.Listen(":" + port)
	}()

	select {
	case err := <-serverErr:
		if err != nil {
			log.Fatal(err)
		}
	case <-shutdownCtx.Done():
		log.Println("shutdown signal received, stopping server...")
	}

	shutdownDone := make(chan struct{})
	go func() {
		defer close(shutdownDone)

		if err := app.Shutdown(); err != nil {
			log.Printf("fiber shutdown error: %v", err)
		}
		stop()
		workers.Wait()
		websockets.Shutdown()
		if redis.Client != nil {
			if err := redis.Client.Close(); err != nil {
				log.Printf("redis close error: %v", err)
			}
		}
	}()

	select {
	case <-shutdownDone:
		log.Println("graceful shutdown complete")
	case <-time.After(10 * time.Second):
		log.Println("graceful shutdown timed out")
	}
}
