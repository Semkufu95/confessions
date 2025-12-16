<<<<<<< HEAD:backend/models/comment.go
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
	CreatedAt    time.Time `json:"created_at"`

	Author User `gorm:"foreignKey:UserID;references:ID" json:"author"` // ✅ correct
}
=======
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
	CreatedAt    time.Time `json:"created_at"`
}

// TODO: Add likes, boos.
// TODO: Define reply?
>>>>>>> 8a7c502 (Added ConfessionService in front, modified the front):Backend/models/comment.go
