<<<<<<< HEAD:backend/config/db.go
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
	if os.Getenv("RENDER") == "" {
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, using system environment variables")
		}

	}

	// use DATABASE_URL from render
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Fall back to local variables
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			os.Getenv("DB_HOST"),
			os.Getenv("DB_USER"),
			os.Getenv("DB_PASSWORD"),
			os.Getenv("DB_NAME"),
			os.Getenv("DB_PORT"),
		)

	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to the database: ", err)
	}

	//Create uuid-extension before migration
	UuidExecution(db)

	// Auto-migrate the models
	err = db.AutoMigrate(&models.User{}, &models.Confession{}, &models.Comment{}, &models.Reaction{})
	if err != nil {
		log.Fatal("Migration failed: ", err)
	}

	DB = db
	fmt.Println("Connected to the database and migrated models")
}
=======
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
	if os.Getenv("RENDER") == "" {
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, using system environment variables")
		}

	}

	// use DATABASE_URL from render
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Fall back to local variables
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			os.Getenv("DB_HOST"),
			os.Getenv("DB_USER"),
			os.Getenv("DB_PASSWORD"),
			os.Getenv("DB_NAME"),
			os.Getenv("DB_PORT"),
		)

	}

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
>>>>>>> 8a7c502 (Added ConfessionService in front, modified the front):Backend/config/db.go
