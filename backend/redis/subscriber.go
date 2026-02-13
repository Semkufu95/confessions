package redis

import (
	"context"
	"encoding/json"
	"log"
)

var ctx = context.Background()

// StartSubscriber listens to Redis pub/sub channels and invalidates cache keys.
func StartSubscriber() {
	pubsub := Client.Subscribe(ctx,
		"confessions:confession:created",
		"confessions:confession:updated",
		"confessions:confession:deleted",
		"confessions:confession:starred",
		"confessions:comment:created",
		"confessions:comment:updated",
		"confessions:comment:deleted",
		"confessions:reaction:updated",
		"confessions:reaction:removed",
	)

	ch := pubsub.Channel()
	go func() {
		for msg := range ch {
			switch msg.Channel {
			case "confessions:confession:created", "confessions:confession:deleted":
				Client.Del(ctx, "confessions:all")
			case "confessions:confession:updated", "confessions:confession:starred":
				if id := stringValueFromPayload(msg.Payload, "id"); id != "" {
					Client.Del(ctx, "confessions:"+id+":with_comments")
				}
			case "confessions:comment:created", "confessions:comment:updated", "confessions:comment:deleted":
				if confessionID := stringValueFromPayload(msg.Payload, "confession_id"); confessionID != "" {
					Client.Del(ctx, "confessions:"+confessionID+":with_comments")
				}
			case "confessions:reaction:updated", "confessions:reaction:removed":
				if confessionID := stringValueFromPayload(msg.Payload, "confession_id"); confessionID != "" {
					Client.Del(ctx, "confessions:"+confessionID+":with_comments")
				}
				if commentID := stringValueFromPayload(msg.Payload, "comment_id"); commentID != "" {
					Client.Del(ctx, "comments:"+commentID)
				}
			default:
				log.Printf("Unhandled channel: %s", msg.Channel)
			}
		}
	}()
}

func stringValueFromPayload(payload string, key string) string {
	var data map[string]interface{}
	if err := json.Unmarshal([]byte(payload), &data); err != nil {
		return ""
	}
	if value, ok := data[key].(string); ok {
		return value
	}
	return ""
}
