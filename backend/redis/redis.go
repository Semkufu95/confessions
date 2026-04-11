package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	goredis "github.com/redis/go-redis/v9"
)

var Ctx = context.Background()
var Client *goredis.Client

func ConnectRedis(addr string) bool {
	addr = strings.TrimSpace(addr)
	if addr == "" {
		log.Println("Redis not configured, continuing without cache/pubsub")
		return false
	}

	var (
		client *goredis.Client
		err    error
	)

	if strings.HasPrefix(addr, "redis://") || strings.HasPrefix(addr, "rediss://") {
		var options *goredis.Options
		options, err = goredis.ParseURL(addr)
		if err != nil {
			log.Printf("Failed to parse Redis URL, continuing without Redis: %v", err)
			return false
		}
		client = goredis.NewClient(options)
	} else {
		client = goredis.NewClient(&goredis.Options{
			Addr: addr,
		})
	}

	_, err = client.Ping(Ctx).Result()
	if err != nil {
		log.Printf("Failed to connect to Redis, continuing without it: %v", err)
		return false
	}
	Client = client
	fmt.Println("Connected to Redis")
	return true
}

func PublishJSON(channel string, payload interface{}) {
	if Client == nil {
		return
	}
	data, err := json.Marshal(payload)
	if err != nil {
		log.Printf("failed to marshal redis payload for %s: %v", channel, err)
		return
	}
	if err := Client.Publish(Ctx, channel, data).Err(); err != nil {
		log.Printf("failed to publish redis payload for %s: %v", channel, err)
	}
}

func SetJSON(key string, payload interface{}, ttl time.Duration) {
	if Client == nil {
		return
	}
	data, err := json.Marshal(payload)
	if err != nil {
		log.Printf("failed to marshal redis cache payload for %s: %v", key, err)
		return
	}
	if err := Client.Set(Ctx, key, data, ttl).Err(); err != nil {
		log.Printf("failed to cache redis payload for %s: %v", key, err)
	}
}

func Delete(keys ...string) {
	if Client == nil || len(keys) == 0 {
		return
	}
	if err := Client.Del(Ctx, keys...).Err(); err != nil {
		log.Printf("failed to delete redis keys %v: %v", keys, err)
	}
}
