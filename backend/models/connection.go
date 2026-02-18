package models

import (
	"time"

	"github.com/google/uuid"
)

type Connection struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null" json:"-"`
	Title       string    `gorm:"type:text;not null" json:"title"`
	Description string    `gorm:"type:text;not null" json:"description"`
	Category    string    `gorm:"type:text;not null;default:'friendship'" json:"category"`
	Location    string    `gorm:"type:text" json:"location,omitempty"`
	Age         *int      `gorm:"type:int" json:"age,omitempty"`
	Interests   string    `gorm:"type:text;not null;default:'[]'" json:"-"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Author User `gorm:"foreignKey:UserID;references:ID" json:"author"`
}
