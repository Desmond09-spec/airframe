package main

// This file contains the WebSocket signaling server.
// It runs in the background when the Airframe Dashboard opens.
// Its job: act as a matchmaker between the Android Capture App and OBS.

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/hashicorp/mdns"
)

const SignalingPort = 4747

// getLanIp finds the computer's real local network IP address.
// It skips virtual adapters (VMware, Hyper-V, WSL) that would return
// fake/irrelevant addresses.
func getLanIp() string {
	interfaces, err := net.Interfaces()
	if err != nil {
		return "127.0.0.1"
	}

	var candidates []string
	for _, iface := range interfaces {
		nameLower := strings.ToLower(iface.Name)
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
			if ip != nil && ip.To4() != nil && !ip.IsLoopback() {
				candidates = append(candidates, ip.String())
			}
		}
	}

	if len(candidates) == 0 {
		return "127.0.0.1"
	}

	for _, ip := range candidates {
		if strings.HasPrefix(ip, "192.168.") {
			return ip
		}
	}
	for _, ip := range candidates {
		if strings.HasPrefix(ip, "10.") {
			return ip
		}
	}
	return candidates[0]
}

// --- WebSocket Upgrader ---
// When a client connects via HTTP and requests a WebSocket connection,
// this upgrader handles switching the protocol.
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow connections from any origin (safe for a local-only server)
	},
}

// --- Client Registry ---
// A map that tracks all currently connected WebSocket clients.
// The mutex prevents data races — if two goroutines try to modify
// the map at the same time, only one gets access at a time.
type signalingClient struct {
	conn *websocket.Conn
}

var (
	signalingClients = make(map[*signalingClient]bool)
	signalingMutex   sync.Mutex
)

// handleSignalingConnection runs every time a new client connects.
// Each connection gets its own goroutine (Go's lightweight background thread).
func handleSignalingConnection(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("[signaling] Upgrade failed:", err)
		return
	}
	defer ws.Close() // When this function exits, close the connection

	client := &signalingClient{conn: ws}
	signalingMutex.Lock()
	signalingClients[client] = true
	signalingMutex.Unlock()

	log.Printf("[signaling] Client connected from %s\n", r.RemoteAddr)

	// Loop: read every message from this client and relay it to all others.
	// This loop runs forever until the client disconnects.
	for {
		messageType, message, err := ws.ReadMessage()
		if err != nil {
			log.Printf("[signaling] Client disconnected: %v\n", err)
			signalingMutex.Lock()
			delete(signalingClients, client)
			signalingMutex.Unlock()
			break
		}

		// Log the message for debugging
		var data map[string]interface{}
		if err := json.Unmarshal(message, &data); err == nil {
			role, _ := data["role"].(string)
			msgType, _ := data["type"].(string)
			log.Printf("[signaling] Relaying type='%s' from role='%s'\n", msgType, role)
		}

		// Broadcast to all OTHER connected clients
		signalingMutex.Lock()
		for c := range signalingClients {
			if c != client {
				if err := c.conn.WriteMessage(messageType, message); err != nil {
					log.Println("[signaling] Write error:", err)
					c.conn.Close()
					delete(signalingClients, c)
				}
			}
		}
		signalingMutex.Unlock()
	}
}

// startSignalingServer starts the HTTP+WebSocket server.
// This function BLOCKS (runs forever), so it must be called
// with the 'go' keyword to run it in a background goroutine.
func startMDNS(hostIp string) {
	hostname, err := os.Hostname()
	if err != nil || hostname == "" {
		hostname = "airframe"
	}

	info := []string{"Airframe Receiver"}
	service, err := mdns.NewMDNSService(hostname, "_airframe._tcp", "", hostIp, SignalingPort, nil, info)
	if err != nil {
		log.Printf("[mdns] Failed to create service: %v\n", err)
		return
	}

	server, err := mdns.NewServer(&mdns.Config{Zone: service})
	if err != nil {
		log.Printf("[mdns] Failed to start server: %v\n", err)
		return
	}

	log.Printf("[mdns] Broadcasting _airframe._tcp on %s:%d (hostname: %s)\n", hostIp, SignalingPort, hostname)

	// Keep the mDNS server alive for the lifetime of the process.
	// server.Shutdown() is never called — the OS reclaims resources on exit.
	_ = server
}

func startSignalingServer() {
	hostIp := getLanIp()

	go startMDNS(hostIp)

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if websocket.IsWebSocketUpgrade(r) {
			handleSignalingConnection(w, r)
			return
		}

		// Health check — returns the machine IP as JSON.
		// The React frontend calls this to know what URL to put in the QR code.
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]string{
			"name":      "Airframe Signaling Server",
			"status":    "online",
			"version":   "0.2.0 (Wails)",
			"networkIp": hostIp,
		})
	})

	// WHIP endpoint — for OBS plugin connection
	// OBS sends an HTTP POST to this URL with its SDP offer.
	// We relay it to the capture app, get the answer, and return it to OBS.
	mux.HandleFunc("/whip", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		// TODO: Implement synchronous WHIP session management using Go channels.
		// Current MVP implementation relays SDP asynchronously to WebSocket clients
		// but does not return the SDP answer in the HTTP response as required by
		// the WHIP specification (RFC 9725). A full implementation should:
		// 1. Store the pending session in a map with a channel
		// 2. Hold the HTTP response open while waiting for the capture app's answer
		// 3. Return the SDP answer in the HTTP response body when received
		// 4. Handle session lifecycle (creation, updates, deletion)
		body := make([]byte, r.ContentLength)
		r.Body.Read(body)

		offer := map[string]interface{}{
			"type":    "offer",
			"role":    "obs-whip",
			"payload": map[string]string{"sdp": string(body), "type": "offer"},
		}
		offerBytes, _ := json.Marshal(offer)

		signalingMutex.Lock()
		for c := range signalingClients {
			c.conn.WriteMessage(websocket.TextMessage, offerBytes)
		}
		signalingMutex.Unlock()

		w.Header().Set("Content-Type", "application/sdp")
		w.Header().Set("Location", "/whip/session/1")
		w.WriteHeader(http.StatusCreated)
	})

	log.Printf("[signaling] Server started on port %d\n", SignalingPort)
	log.Printf("[signaling] Network IP: %s\n", hostIp)

	if err := http.ListenAndServe(":4747", mux); err != nil {
		log.Fatalf("[signaling] Fatal error: %v\n", err)
	}
}