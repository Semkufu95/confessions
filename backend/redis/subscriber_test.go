package redis

import "testing"

func TestStringValueFromPayload(t *testing.T) {
	payload := `{"id":"abc-123","confession_id":"cid-001"}`

	if got := stringValueFromPayload(payload, "id"); got != "abc-123" {
		t.Fatalf("expected id abc-123, got %q", got)
	}
	if got := stringValueFromPayload(payload, "confession_id"); got != "cid-001" {
		t.Fatalf("expected confession_id cid-001, got %q", got)
	}
	if got := stringValueFromPayload(payload, "missing_key"); got != "" {
		t.Fatalf("expected empty value for missing key, got %q", got)
	}
}

func TestStringValueFromPayload_InvalidJSON(t *testing.T) {
	payload := `{"id":`

	if got := stringValueFromPayload(payload, "id"); got != "" {
		t.Fatalf("expected empty value for invalid json, got %q", got)
	}
}
