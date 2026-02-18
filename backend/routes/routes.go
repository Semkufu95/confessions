package routes

import (
	"github.com/Semkufu95/confessions/Backend/controllers"
	"github.com/Semkufu95/confessions/Backend/middleware"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	registerRoutes(app.Group("/"))
	registerRoutes(app.Group("/api"))
}

func registerRoutes(api fiber.Router) {
	// ===== AUTH (Public) =====
	api.Post("/login", controllers.Login)
	api.Post("/register", controllers.Register)
	api.Get("/stats", controllers.GetRealtimeStats)
	api.Get("/confessions", controllers.GetAllConfessions)
	api.Get("/connections", controllers.GetAllConnections)
	api.Get("/connections/:id/profile", controllers.GetConnectionProfile)
	api.Get("/confessions/:id/comments", controllers.GetConfessionWithComments)
	api.Get("/comments/:id", controllers.GetCommentsByConfession)

	// ===== PROTECTED ROUTES =====
	protected := api.Group("/", middleware.RequireAuth)
	protected.Post("/logout", controllers.Logout)
	protected.Get("/me/settings", controllers.GetMySettings)
	protected.Put("/me/settings", controllers.UpdateMySettings)

	// ===== CONFESSIONS =====
	confessions := protected.Group("/confessions")
	confessions.Post("/", controllers.CreateConfession)           // Create a confession
	confessions.Put("/:id", controllers.UpdateConfession)         // Update a confession
	confessions.Delete("/:id", controllers.DeleteConfession)      // Delete a confession
	confessions.Post("/:id/star", controllers.StarConfession)     // Star a confession
	confessions.Post("/:id/react", controllers.ReactToConfession) // Like/Boo a confession

	// ===== COMMENTS =====
	comments := protected.Group("/comments")
	comments.Post("/:id", controllers.PostComment)
	comments.Put("/:id", controllers.UpdateComment)
	comments.Delete("/:id", controllers.DeleteComment)
	comments.Post("/:id/react", controllers.ReactToComment)

	// ===== CONNECTIONS =====
	connections := protected.Group("/connections")
	connections.Post("/", controllers.CreateConnection)
	connections.Post("/:id/connect", controllers.ConnectToConnection)

	// ===== REACTIONS =====
	reactions := protected.Group("/reactions")
	reactions.Delete("/:id/remove", controllers.RemoveReaction)
}
