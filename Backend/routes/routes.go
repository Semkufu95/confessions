package routes

import (
	"github.com/Semkufu95/confessions/Backend/controllers"
	"github.com/Semkufu95/confessions/Backend/middleware"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	// ===== AUTH (Public) =====
	api.Post("/login", controllers.Login)
	api.Post("/register", controllers.Register)

	// ===== PROTECTED ROUTES =====
	protected := api.Group("/", middleware.RequireAuth)

	// ===== CONFESSIONS =====
	confessions := protected.Group("/confessions")
	confessions.Post("/", controllers.CreateConfession)                     // Create a confession
	confessions.Get("/", controllers.GetAllConfessions)                     // Get all confessions
	confessions.Put("/:id", controllers.UpdateConfession)                   // Update a confession
	confessions.Delete("/:id", controllers.DeleteConfession)                // Delete a confession
	confessions.Post("/:id/star", controllers.StarConfession)               // Star a confession
	confessions.Post("/:id/react", controllers.ReactToConfession)           // Like/Boo a confession
	confessions.Get("/:id/comments", controllers.GetConfessionWithComments) // Fetch confession + comments

	// ===== COMMENTS =====
	comments := protected.Group("/comments")
	comments.Post("/:id", controllers.PostComment)
	comments.Put("/:id", controllers.UpdateComment)
	comments.Delete("/:id", controllers.DeleteComment)
	comments.Post("/:id/react", controllers.ReactToComment)
	comments.Get("/:id", controllers.GetCommentsByConfession)

	// ===== REACTIONS =====
	reactions := protected.Group("/reactions")
	reactions.Delete("/:id/remove", controllers.RemoveReaction)
}
