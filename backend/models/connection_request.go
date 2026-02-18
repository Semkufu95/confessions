package models

import (
	"time"

	"github.com/google/uuid"
)

type ConnectionRequest struct {
	ID           uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	ConnectionID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_connection_sender" json:"connection_id"`
	SenderID     uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_connection_sender" json:"sender_id"`
	ReceiverID   uuid.UUID `gorm:"type:uuid;not null" json:"receiver_id"`
	Status       string    `gorm:"type:text;not null;default:'pending'" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Sender     User       `gorm:"foreignKey:SenderID;references:ID" json:"sender"`
	Connection Connection `gorm:"foreignKey:ConnectionID;references:ID" json:"connection"`
}
