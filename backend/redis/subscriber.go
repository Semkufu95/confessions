package redis

import (
	"context"
	"encoding/json"
	"log"
	"sync"
)

// StartSubscriber listens to Redis pub/sub channels and invalidates cache keys.
func StartSubscriber(ctx context.Context, wg *sync.WaitGroup) {
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

	wg.Add(1)
	go func() {
		defer wg.Done()
		defer func() {
			if err := pubsub.Close(); err != nil {
				log.Printf("redis subscriber close error: %v", err)
			}
		}()
		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-ch:
				if !ok {
					return
				}
				switch msg.Channel {
				case "confessions:confession:created", "confessions:confession:deleted":
					Client.Del(Ctx, "confessions:all")
				case "confessions:confession:updated", "confessions:confession:starred":
					if id := stringValueFromPayload(msg.Payload, "id"); id != "" {
						Client.Del(Ctx, "confessions:"+id+":with_comments")
					}
				case "confessions:comment:created", "confessions:comment:updated", "confessions:comment:deleted":
					if confessionID := stringValueFromPayload(msg.Payload, "confession_id"); confessionID != "" {
						Client.Del(Ctx, "confessions:"+confessionID+":with_comments")
					}
				case "confessions:reaction:updated", "confessions:reaction:removed":
					if confessionID := stringValueFromPayload(msg.Payload, "confession_id"); confessionID != "" {
						Client.Del(Ctx, "confessions:"+confessionID+":with_comments")
					}
					if commentID := stringValueFromPayload(msg.Payload, "comment_id"); commentID != "" {
						Client.Del(Ctx, "comments:"+commentID)
					}
				default:
					log.Printf("Unhandled channel: %s", msg.Channel)
				}
			}
		}
	}()
}

// StartWebsocketBroadcaster relays Redis events to websocket clients.
func StartWebsocketBroadcaster(ctx context.Context, wg *sync.WaitGroup, broadcast func(string)) {
	pubsub := Client.PSubscribe(ctx, "confessions:*")
	ch := pubsub.Channel()

	wg.Add(1)
	go func() {
		defer wg.Done()
		defer func() {
			if err := pubsub.Close(); err != nil {
				log.Printf("redis websocket broadcaster close error: %v", err)
			}
		}()

		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-ch:
				if !ok {
					return
				}
				broadcast(msg.Payload)
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
