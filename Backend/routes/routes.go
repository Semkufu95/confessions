package routes

import (
	"github.com/Semkufu95/confessions/Backend/controllers"
	"github.com/Semkufu95/confessions/Backend/middleware"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	// Authorization
	api.Post("/login", controllers.Login)
	api.Post("/register", controllers.Register)

	// Protected routes (require JWT)
	protected := api.Group("/", middleware.RequireAuth)

	// ===== CONFESSIONS =====
	confessions := protected.Group("/confessions")
	confessions.Post("/", controllers.CreateConfession)                     // Create a confession
	api.Get("/", controllers.GetAllConfessions)                             // Get all confessions
	confessions.Put("/:id", controllers.UpdateConfession)                   // Update a confession
	confessions.Delete("/:id", controllers.DeleteConfession)                // Delete a confession
	confessions.Post("/:id/star", controllers.StarConfession)               // Star a confession
	confessions.Post("/:id/react", controllers.ReactToConfession)           // Like/Boo a confession
	confessions.Get("/:id/comments", controllers.GetConfessionWithComments) // Fetch confession + comments

	// ===== COMMENTS =====
	comments := protected.Group("/comments")
	comments.Post("/:id", controllers.PostComment)          // Add comment to confession
	comments.Put("/:id", controllers.UpdateComment)         // Edit comment
	comments.Delete("/:id", controllers.DeleteComment)      // Delete comment
	comments.Post("/:id/react", controllers.ReactToComment) // Like/Boo a comment

	// ===== REACTIONS =====
	reactions := protected.Group("/reactions")
	reactions.Delete("/:id/remove", controllers.RemoveReaction) // Remove reaction
}
