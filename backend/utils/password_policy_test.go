package utils

import "testing"

func TestIsValidPassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		valid    bool
	}{
		{
			name:     "valid password",
			password: "Abcdef!",
			valid:    true,
		},
		{
			name:     "too short",
			password: "A!c1",
			valid:    false,
		},
		{
			name:     "missing uppercase",
			password: "abcdef!",
			valid:    false,
		},
		{
			name:     "missing symbol",
			password: "Abcdef1",
			valid:    false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := IsValidPassword(tc.password)
			if got != tc.valid {
				t.Fatalf("expected %v, got %v for password %q", tc.valid, got, tc.password)
			}
		})
	}
}
