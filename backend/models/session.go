package models

import (
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID           uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	UserID       uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	LastActivity time.Time  `gorm:"not null;index" json:"last_activity"`
	ExpiresAt    time.Time  `gorm:"not null;index" json:"expires_at"`
	RevokedAt    *time.Time `gorm:"index" json:"revoked_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
