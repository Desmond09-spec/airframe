package main

import (
	"context"
	"log"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	log.Println("[app] Starting Airframe Signaling Server...")
	go startSignalingServer()
}

// GetNetworkIP returns the local network IP address.
// This is called by the React frontend via Wails binding.
func (a *App) GetNetworkIP() string {
	return getLanIp()
}
