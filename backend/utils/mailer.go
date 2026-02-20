package utils

import (
	"errors"
	"fmt"
	"net"
	"net/smtp"
	"os"
	"strings"
)

var ErrEmailDeliveryNotConfigured = errors.New("email delivery is not configured")

func SendEmailVerification(toEmail string, verificationURL string) error {
	subject := "Verify your email"
	body := fmt.Sprintf(
		"Hi,\r\n\r\nUse the link below to verify your account:\r\n%s\r\n\r\nIf you didn't request this, you can ignore this email.\r\n",
		verificationURL,
	)
	return sendSMTPMail(toEmail, subject, body)
}

func SendContactMessage(toEmail, senderName, senderEmail, subject, message string) error {
	cleanSubject := strings.TrimSpace(subject)
	if cleanSubject == "" {
		cleanSubject = "Contact form message"
	}

	body := fmt.Sprintf(
		"New contact form message:\r\n\r\nName: %s\r\nEmail: %s\r\nSubject: %s\r\n\r\nMessage:\r\n%s\r\n",
		strings.TrimSpace(senderName),
		strings.TrimSpace(senderEmail),
		cleanSubject,
		strings.TrimSpace(message),
	)

	return sendSMTPMail(toEmail, "[Confessions] "+cleanSubject, body)
}

func sendSMTPMail(toEmail, subject, body string) error {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")
	from := os.Getenv("SMTP_FROM")

	if host == "" || port == "" || username == "" || password == "" || from == "" {
		return ErrEmailDeliveryNotConfigured
	}

	auth := smtp.PlainAuth("", username, password, host)
	address := net.JoinHostPort(host, port)

	subjectLine := "Subject: " + subject + "\r\n"
	headers := "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=\"UTF-8\"\r\n"
	message := []byte(subjectLine + headers + "\r\n" + body)
	return smtp.SendMail(address, auth, from, []string{toEmail}, message)
}
