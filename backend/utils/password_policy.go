package utils

import "unicode"

func IsValidPassword(password string) bool {
	if len(password) < 6 {
		return false
	}

	hasUpper := false
	hasSymbol := false

	for _, char := range password {
		if unicode.IsUpper(char) {
			hasUpper = true
		}
		if unicode.IsPunct(char) || unicode.IsSymbol(char) {
			hasSymbol = true
		}
	}

	return hasUpper && hasSymbol
}
