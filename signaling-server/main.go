package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
)

const Port = 4747

// getLanIp discovers the best LAN IP, filtering out virtual adapters
func getLanIp() string {
	interfaces, err := net.Interfaces()
	if err != nil {
		return "127.0.0.1"
	}

	var candidates []string

	for _, iface := range interfaces {
		nameLower := strings.ToLower(iface.Name)
		// Skip virtual adapters
		if strings.Contains(nameLower, "loopback") ||
			strings.Contains(nameLower, "vmware") ||
			strings.Contains(nameLower, "hyper-v") ||
			strings.Contains(nameLower, "wsl") ||
			strings.Contains(nameLower, "vethernet") ||
			strings.Contains(nameLower, "virtual") {
			continue
		}

		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}

		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}

			// Must be IPv4 and not loopback
			if ip != nil && ip.To4() != nil && !ip.IsLoopback() {
				candidates = append(candidates, ip.String())
			}
		}
	}

	if len(candidates) == 0 {
		return "127.0.0.1"
	}

	// Prefer 192.168.x.x
	for _, ip := range candidates {
		if strings.HasPrefix(ip, "192.168.") {
			return ip
		}
	}
	// Prefer 10.x.x.x
	for _, ip := range candidates {
		if strings.HasPrefix(ip, "10.") {
			return ip
		}
	}
	// Prefer 172.16.x.x - 172.31.x.x
	for _, ip := range candidates {
		if strings.HasPrefix(ip, "172.") {
			return ip
		}
	}

	return candidates[0]
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for local app
	},
}

type Client struct {
	conn *websocket.Conn
}

var (
	clients = make(map[*Client]bool)
	mutex   = sync.Mutex{}
)

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("[-] Failed to upgrade to websocket:", err)
		return
	}
	defer ws.Close()

	client := &Client{conn: ws}
	mutex.Lock()
	clients[client] = true
	mutex.Unlock()

	clientIp := r.RemoteAddr
	log.Printf("[+] Client connected from %s\n", clientIp)

	for {
		messageType, p, err := ws.ReadMessage()
		if err != nil {
			log.Printf("[-] Client disconnected (%s): %v\n", clientIp, err)
			mutex.Lock()
			delete(clients, client)
			mutex.Unlock()
			break
		}

		// Quick parse to log role/type if possible
		var data map[string]interface{}
		if err := json.Unmarshal(p, &data); err == nil {
			role := "unknown"
			msgType := "unknown"
			if r, ok := data["role"].(string); ok {
				role = r
			}
			if t, ok := data["type"].(string); ok {
				msgType = t
			}
			log.Printf("[MSG] type: %s | from: %s\n", msgType, role)
		}

		// Broadcast to all OTHER clients
		mutex.Lock()
		for c := range clients {
			if c != client {
				err := c.conn.WriteMessage(messageType, p)
				if err != nil {
					log.Println("[-] Write error:", err)
					c.conn.Close()
					delete(clients, c)
				}
			}
		}
		mutex.Unlock()
	}
}

func main() {
	hostIp := getLanIp()

	// HTTP Handler for Health Check (and WebSocket upgrade on the same port)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// If it's a websocket upgrade request, route it to our WS handler
		if websocket.IsWebSocketUpgrade(r) {
			handleConnections(w, r)
			return
		}

		// Otherwise, answer health check
		if r.Method == "GET" && r.URL.Path == "/" {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Access-Control-Allow-Origin", "*")

			resp := map[string]string{
				"name":      "Airframe Signaling Server",
				"status":    "online",
				"version":   "0.6.0 (Go)",
				"networkIp": hostIp,
			}

			json.NewEncoder(w).Encode(resp)
		} else {
			http.NotFound(w, r)
		}
	})

	log.Println("==================================================")
	log.Println("🚀 Airframe Signaling Server (Stage 0.6 Go)")
	log.Println("==================================================")
	log.Printf("Local IP:   ws://127.0.0.1:%d\n", Port)
	log.Printf("Network IP: ws://%s:%d\n", hostIp, Port)
	log.Println("")
	log.Println("Waiting for connections...")
	log.Println("==================================================")

	err := http.ListenAndServe(fmt.Sprintf("0.0.0.0:%d", Port), nil)
	if err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
