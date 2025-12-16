package models

import (
	"time"

	"github.com/google/uuid"
)

type Reaction struct {
	ID           uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	UserID       uuid.UUID  `gorm:"type:uuid;not null" json:"user_id"`
	ConfessionID *uuid.UUID `gorm:"type:uuid" json:"confession_id,omitempty"`
	CommentID    *uuid.UUID `gorm:"type:uuid" json:"comment_id,omitempty"`
	Type         string     `gorm:"type:varchar(10);not null" json:"type"` // "like" or "boo"
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
