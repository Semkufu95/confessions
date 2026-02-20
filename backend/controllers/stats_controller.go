package controllers

import (
	"time"

	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/Semkufu95/confessions/Backend/websockets"
	"github.com/gofiber/fiber/v2"
)

type communityStats struct {
	CurrentOnline  int `json:"currentOnline"`
	MaxVisitors24h int `json:"maxVisitors24h"`
	MaxVisitors7d  int `json:"maxVisitors7d"`
	MaxVisitors1m  int `json:"maxVisitors1m"`
	MaxVisitors1yr int `json:"maxVisitors1yr"`
}

func GetRealtimeStats(c *fiber.Ctx) error {
	now := time.Now().UTC()
	currentOnline := websockets.ClientCount()

	oneYearCutoff := now.AddDate(-1, 0, 0)

	if config.DB != nil {
		_ = config.DB.Create(&models.StatsObservation{
			ObservedAt: now,
			Online:     currentOnline,
		}).Error

		// Keep one-year rolling observations.
		_ = config.DB.Where("observed_at < ?", oneYearCutoff).Delete(&models.StatsObservation{}).Error
	}

	return c.JSON(communityStats{
		CurrentOnline:  currentOnline,
		MaxVisitors24h: maxOnlineSince(now.Add(-24 * time.Hour)),
		MaxVisitors7d:  maxOnlineSince(now.AddDate(0, 0, -7)),
		MaxVisitors1m:  maxOnlineSince(now.AddDate(0, -1, 0)),
		MaxVisitors1yr: maxOnlineSince(oneYearCutoff),
	})
}

func maxOnlineSince(cutoff time.Time) int {
	if config.DB == nil {
		return 0
	}

	var maxOnline int64
	if err := config.DB.Model(&models.StatsObservation{}).
		Select("COALESCE(MAX(online), 0)").
		Where("observed_at >= ?", cutoff.UTC()).
		Scan(&maxOnline).Error; err != nil {
		return 0
	}

	return int(maxOnline)
}
