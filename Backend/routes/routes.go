package routes

import (
	"github.com/Semkufu95/confessions/Backend/controllers"
	"github.com/Semkufu95/confessions/Backend/middlewares"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Post("/register", controllers.Register)
	api.Post("/login", controllers.Login)

	// Protected routes
	protected := api.Group("/", middlewares.Protected())

	// Confession routes
	protected.Post("/confessions", controllers.CreateConfession)
	protected.Get("/confessions", controllers.GetAllConfessions)

	// Commenting routes
	protected.Post("/confessions/:id/comments", controllers.PostComment)
	protected.Get("/confessions/:id", controllers.GetConfessionWithComments)
}
