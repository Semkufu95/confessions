package config

import (
	"fmt"
	"log"
	"os"

	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	// Only load .env if running locally
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set")

	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to the database: ", err)
	}

	//Create uuid-extension before migration
	UuidExecution(db)

	// Auto-migrate the models
	err = db.AutoMigrate(
		&models.User{},
		&models.Confession{},
		&models.Comment{},
		&models.Reply{},
		&models.Reaction{},
		&models.Connection{},
		&models.ConnectionRequest{},
		&models.Session{},
		&models.UserSettings{},
		&models.StatsObservation{},
	)
	if err != nil {
		log.Fatal("Migration failed: ", err)
	}

	DB = db
	fmt.Println("Connected to the database and migrated models")
}
