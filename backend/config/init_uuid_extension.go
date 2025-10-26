package config

import (
	"log"

	"gorm.io/gorm"
)

func UuidExecution(db *gorm.DB) {
	err := db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`).Error
	if err != nil {
		log.Fatalf("Failed to initiate uuid-ossp extension: %v", err)
	}
	log.Println("uuid-ossp extension created")
}
