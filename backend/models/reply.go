package models

import (
	"time"

	"github.com/google/uuid"
)

type Reply struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	CommentID uuid.UUID `gorm:"type:uuid;not null;index" json:"comment_id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	Likes     int       `gorm:"type:int;not null;default:0" json:"likes"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Author User `gorm:"foreignKey:UserID;references:ID" json:"author"`
}
