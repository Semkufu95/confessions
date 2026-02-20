package controllers

import (
	"os"
	"strings"

	"github.com/Semkufu95/confessions/Backend/utils"
	"github.com/gofiber/fiber/v2"
)

const defaultContactRecipient = "semkufu95@gmail.com"

type contactInput struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

func SendContactMessage(c *fiber.Ctx) error {
	var input contactInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid contact request"})
	}

	input.Name = strings.TrimSpace(input.Name)
	input.Email = strings.TrimSpace(input.Email)
	input.Subject = strings.TrimSpace(input.Subject)
	input.Message = strings.TrimSpace(input.Message)

	if input.Name == "" || input.Email == "" || input.Subject == "" || input.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "All fields are required"})
	}
	if len(input.Name) > 80 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Name must be 80 characters or less"})
	}
	if len(input.Subject) > 160 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Subject must be 160 characters or less"})
	}
	if len(input.Message) > 5000 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Message must be 5000 characters or less"})
	}
	if !utils.IsValidEmailFormat(input.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid email format"})
	}

	recipient := strings.TrimSpace(os.Getenv("CONTACT_FORM_TO"))
	if recipient == "" {
		recipient = defaultContactRecipient
	}

	if err := utils.SendContactMessage(recipient, input.Name, input.Email, input.Subject, input.Message); err != nil {
		if err == utils.ErrEmailDeliveryNotConfigured {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "Email service is not configured"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to send contact message"})
	}

	return c.JSON(fiber.Map{"message": "Contact message sent"})
}
