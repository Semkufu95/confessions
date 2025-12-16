<<<<<<< HEAD:backend/redis/redis.go
package redis

import (
	"context"
	"fmt"
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
		log.Fatal("Huuh! Failed to connect to Redis")
	}
	fmt.Println("Connected to Redis")
}
=======
package redis

import (
	"context"
	"fmt"
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
	fmt.Println("Connected to Redis")
}
>>>>>>> 8a7c502 (Added ConfessionService in front, modified the front):Backend/redis/redis.go
