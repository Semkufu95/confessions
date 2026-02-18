package utils

import (
	"os"
	"time"
)

func SessionInactivityTimeout() time.Duration {
	return readDurationOrDefault("SESSION_INACTIVITY_TIMEOUT", 30*time.Minute)
}

func SessionMaxLifetime() time.Duration {
	return readDurationOrDefault("SESSION_MAX_LIFETIME", 72*time.Hour)
}

func SessionActivityUpdateInterval() time.Duration {
	return readDurationOrDefault("SESSION_ACTIVITY_UPDATE_INTERVAL", time.Minute)
}

func readDurationOrDefault(envVar string, fallback time.Duration) time.Duration {
	value := os.Getenv(envVar)
	if value == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(value)
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}
