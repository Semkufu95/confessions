package utils

import "net/mail"

func IsValidEmailFormat(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}
