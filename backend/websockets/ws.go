package websockets

import (
	"sync"

	"github.com/gofiber/websocket/v2"
)

var Clients = make(map[*websocket.Conn]bool)
var Mu sync.Mutex

func Broadcast(message string) {
	Mu.Lock()
	defer Mu.Unlock()
	for c := range Clients {
		if err := c.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
			err := c.Close()
			if err != nil {
				return
			}
			delete(Clients, c)

		}
	}
}
