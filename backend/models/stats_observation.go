package models

import (
	"time"

	"github.com/google/uuid"
)

type StatsObservation struct {
	ID         uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	ObservedAt time.Time `gorm:"index;not null" json:"observed_at"`
	Online     int       `gorm:"type:int;not null;default:0" json:"online"`
}
