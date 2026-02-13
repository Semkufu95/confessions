package main

import (
	"log"
	"os"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/redis"
	"github.com/Semkufu95/confessions/Backend/routes"
	"github.com/Semkufu95/confessions/Backend/websockets"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
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

	// Start Redis subscriber (background worker)
	redis.StartSubscriber()

	// Start Fiber
	app := fiber.New()
	app.Use(logger.New())

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
	go func() {
		sub := redis.Client.PSubscribe(redis.Ctx, "confessions:*")
		ch := sub.Channel()
		for msg := range ch {
			websockets.Broadcast(msg.Payload)
		}
	}()

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

	// API Routes
	routes.SetupRoutes(app)

	// Server port
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	log.Fatal(app.Listen(":" + port))
}
