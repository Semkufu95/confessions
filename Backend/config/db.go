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
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Failed to load .env file")
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to the database: ", err)
	}

	// Auto-migrate the models
	err = db.AutoMigrate(&models.User{}, &models.Confession{}, &models.Comment{})
	if err != nil {
		log.Fatal("Migration failed: ", err)
	}

	DB = db
	fmt.Println("Connected to the database and migrated models")
}
