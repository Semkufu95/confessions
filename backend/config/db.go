package config

import (
	"fmt"
	"log"
	"net/url"
	"os"
	"strings"

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
		dsn = databaseURLFromParts()
	}
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set. Provide DATABASE_URL or DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME")
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

func databaseURLFromParts() string {
	host := strings.TrimSpace(os.Getenv("DB_HOST"))
	user := strings.TrimSpace(os.Getenv("DB_USER"))
	name := strings.TrimSpace(os.Getenv("DB_NAME"))
	if host == "" || user == "" || name == "" {
		return ""
	}

	port := strings.TrimSpace(os.Getenv("DB_PORT"))
	if port == "" {
		port = "5432"
	}

	password := os.Getenv("DB_PASSWORD")
	sslMode := strings.TrimSpace(os.Getenv("DB_SSLMODE"))
	if sslMode == "" {
		sslMode = "disable"
	}

	dsn := url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(user, password),
		Host:   host + ":" + port,
		Path:   name,
	}
	query := dsn.Query()
	query.Set("sslmode", sslMode)
	dsn.RawQuery = query.Encode()

	return dsn.String()
}
