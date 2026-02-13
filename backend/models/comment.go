package models

import (
	"time"

	"github.com/google/uuid"
)

type Comment struct {
	ID           uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	ConfessionID uuid.UUID `gorm:"type:uuid;not null" json:"confession_id"`
	UserID       uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	Content      string    `gorm:"type:text;not null" json:"content"`
	Likes        int       `gorm:"type:int;not null;default:0" json:"likes"`
	Boos         int       `gorm:"type:int;not null;default:0" json:"boos"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Author User `gorm:"foreignKey:UserID;references:ID" json:"author"` // ✅ correct
}

// TODO: Define reply?
