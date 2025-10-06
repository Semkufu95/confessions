package redis

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

var Ctx = context.Background()
var Client *redis.Client

func ConnectRedis(addr string) {
	Client = redis.NewClient(&redis.Options{
		Addr: addr,
	})

	_, err := Client.Ping(Ctx).Result()
	if err != nil {
		log.Fatal("Failed to connect to Redis")
	}
}
