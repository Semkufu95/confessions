package models

import (
	"time"

	"github.com/google/uuid"
)

type UserSettings struct {
	ID                 uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	UserID             uuid.UUID `gorm:"type:uuid;not null;uniqueIndex" json:"user_id"`
	PushNotifications  bool      `gorm:"not null;default:true" json:"push_notifications"`
	EmailNotifications bool      `gorm:"not null;default:false" json:"email_notifications"`
	CommentReplies     bool      `gorm:"not null;default:true" json:"comment_replies"`
	NewFollowers       bool      `gorm:"not null;default:false" json:"new_followers"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}
