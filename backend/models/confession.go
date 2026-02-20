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
	Shares    int       `gorm:"type:int;not null;default:0" json:"shares"`
	Comments  int       `gorm:"type:int;not null;default:0" json:"comments"`
	Category  string    `gorm:"type:text;not null" json:"category"`
	Trending  bool      `gorm:"type:boolean;not null;default:false" json:"trending"`
	CreatedAt time.Time `json:"created_at"`
}
