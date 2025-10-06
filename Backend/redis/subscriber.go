package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
)

var ctx = context.Background()

// StartSubscriber listens to Redis pub/sub channels
func StartSubscriber() {
	pubsub := Client.Subscribe(ctx,
		"confessions:confession:created",
		"confessions:confession:updated",
		"confessions:confession:starred",
		"confessions:comment:created",
		"confessions:comment:updated",
	)

	ch := pubsub.Channel()

	go func() {
		for msg := range ch {
			switch msg.Channel {
			case "confessions:confession:created":
				handleConfessionCreated(msg.Payload)
			case "confessions:confession:updated":
				handleConfessionUpdated(msg.Payload)
			case "confessions:confession:starred":
				handleConfessionStarred(msg.Payload)
			case "confessions:comment:created":
				handleCommentCreated(msg.Payload)
			case "confessions:comment:updated":
				handleCommentUpdated(msg.Payload)
			default:
				log.Printf("Unhandled channel: %s", msg.Channel)
			}
		}
	}()
}

func handleConfessionCreated(payload string) {
	fmt.Println("📌 Confession Created:", payload)

	// Example: clear cache list so new confession appears in GetAllConfessions
	Client.Del(ctx, "confessions:all")
}

func handleConfessionUpdated(payload string) {
	fmt.Println("✏️ Confession Updated:", payload)

	var data map[string]interface{}
	_ = json.Unmarshal([]byte(payload), &data)

	if id, ok := data["ID"].(string); ok {
		Client.Del(ctx, "confessions:"+id+":with_comments")
	}
}

func handleConfessionStarred(payload string) {
	fmt.Println("⭐ Confession Starred:", payload)

	var data map[string]interface{}
	_ = json.Unmarshal([]byte(payload), &data)

	if id, ok := data["ID"].(string); ok {
		Client.Del(ctx, "confessions:"+id+":with_comments")
	}
}

func handleCommentCreated(payload string) {
	fmt.Println("💬 Comment Created:", payload)

	var data map[string]interface{}
	_ = json.Unmarshal([]byte(payload), &data)

	if confessionID, ok := data["ConfessionID"].(string); ok {
		Client.Del(ctx, "confessions:"+confessionID+":with_comments")
	}
}

func handleCommentUpdated(payload string) {
	fmt.Println("✏️ Comment Updated:", payload)

	var data map[string]interface{}
	_ = json.Unmarshal([]byte(payload), &data)

	if confessionID, ok := data["ConfessionID"].(string); ok {
		Client.Del(ctx, "confessions:"+confessionID+":with_comments")
	}
}
