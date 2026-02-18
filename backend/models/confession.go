package models

import (
	"time"

	"github.com/google/uuid"
)

type Confession struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"-"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	Likes     int       `gorm:"type:int;not null;default:0" json:"likes"`
	Boos      int       `gorm:"type:int;not null;default:0" json:"boos"`
	Stars     int       `gorm:"type:int;not null;default:0" json:"stars"`
	Comments  int       `gorm:"type:int;not null;default:0" json:"comments"`
	Category  string    `gorm:"type:text;not null" json:"category"`
	CreatedAt time.Time `json:"created_at"`
}

// TODO: Add likes, boos, stars, shares and comments on the confession.
// TODO: Add a category if (work, love, life) && Add a trending (boolean)
