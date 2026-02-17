package controllers

import (
	"sync"
	"time"

	"github.com/Semkufu95/confessions/Backend/websockets"
	"github.com/gofiber/fiber/v2"
)

type statsObservation struct {
	timestamp time.Time
	online    int
}

type communityStats struct {
	CurrentOnline  int `json:"currentOnline"`
	MaxVisitors24h int `json:"maxVisitors24h"`
	MaxVisitors7d  int `json:"maxVisitors7d"`
	MaxVisitors1m  int `json:"maxVisitors1m"`
	MaxVisitors1yr int `json:"maxVisitors1yr"`
}

var (
	statsMu      sync.Mutex
	statsHistory []statsObservation
)

func GetRealtimeStats(c *fiber.Ctx) error {
	now := time.Now()
	currentOnline := websockets.ClientCount()

	statsMu.Lock()
	statsHistory = append(statsHistory, statsObservation{
		timestamp: now,
		online:    currentOnline,
	})

	// Keep only one-year history in memory because maxVisitors1yr is the longest window.
	oneYearCutoff := now.AddDate(-1, 0, 0)
	firstValid := 0
	for firstValid < len(statsHistory) && statsHistory[firstValid].timestamp.Before(oneYearCutoff) {
		firstValid++
	}
	if firstValid > 0 {
		statsHistory = statsHistory[firstValid:]
	}

	result := communityStats{
		CurrentOnline:  currentOnline,
		MaxVisitors24h: maxOnlineSinceLocked(now.Add(-24 * time.Hour)),
		MaxVisitors7d:  maxOnlineSinceLocked(now.AddDate(0, 0, -7)),
		MaxVisitors1m:  maxOnlineSinceLocked(now.AddDate(0, -1, 0)),
		MaxVisitors1yr: maxOnlineSinceLocked(oneYearCutoff),
	}
	statsMu.Unlock()

	return c.JSON(result)
}

func maxOnlineSinceLocked(cutoff time.Time) int {
	maxOnline := 0
	for _, item := range statsHistory {
		if item.timestamp.Before(cutoff) {
			continue
		}
		if item.online > maxOnline {
			maxOnline = item.online
		}
	}
	return maxOnline
}
