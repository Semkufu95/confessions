package utils

import "testing"

func TestIsValidEmailFormat(t *testing.T) {
	valid := "user@example.com"
	invalid := "invalid-email"

	if !IsValidEmailFormat(valid) {
		t.Fatalf("expected %q to be valid", valid)
	}
	if IsValidEmailFormat(invalid) {
		t.Fatalf("expected %q to be invalid", invalid)
	}
}
