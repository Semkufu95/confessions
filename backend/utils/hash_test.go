package utils

import "testing"

func TestHashPasswordAndCheck(t *testing.T) {
	password := "super-secret-password"

	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("hashing failed: %v", err)
	}
	if hash == password {
		t.Fatalf("hash should not equal plain password")
	}
	if !CheckPasswordHash(password, hash) {
		t.Fatalf("expected password to match hash")
	}
	if CheckPasswordHash("wrong-password", hash) {
		t.Fatalf("expected wrong password not to match hash")
	}
}
