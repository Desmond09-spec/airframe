# Airframe: Wails Migration Plan

**Document Purpose:** A step-by-step engineering guide for migrating the Airframe desktop receiver from NeutralinoJS to Wails.

**Audience:** Junior developer. Every concept is explained from first principles. No prior knowledge of Go or Wails is assumed.

**Status:** Approved for implementation.

---

## Before You Start: What Are We Even Doing?

Right now, Airframe's desktop side is made of two completely separate programs that the user has to run manually:

1. `signaling-server.exe` — A tiny Go server that helps the phone and the computer find each other.
2. `airframe-receiver.exe` (NeutralinoJS) — The desktop app UI that shows the video.

**The problem:** This is fragile. If the user only opens one of them, nothing works. Also, when the video is streaming, the only way to get it into OBS is "Window Capture," which is slow, heavy, and breaks if the window is minimized.

**What we are building instead:** One single app — the **Airframe Dashboard** — built with Wails. When the user opens it:
- The Go signaling server starts automatically in the background.
- The React dashboard UI opens showing the QR code.
- OBS connects to the video feed directly using its own built-in WebRTC plugin.

The user opens one file. Everything just works.

---

## Part 0: Concepts You Need to Understand First

### What is Go?

Go (sometimes called "Golang") is a programming language made by Google. It is famous for being very fast and compiling into a single, small executable file with no dependencies. This is why we use it for the signaling server — a single `signaling-server.exe` that you can just double-click.

**Documentation:** https://go.dev/doc/

### What is Wails?

Wails is a tool that lets you build a desktop app where:
- The **backend** (the engine) is written in Go.
- The **frontend** (the visual interface) is written in HTML, CSS, and JavaScript (or React, TypeScript, etc.).

The two halves communicate through "bindings" — special functions that Wails generates so your React code can call Go functions directly, like a walkie-talkie between the two.

The final product is a single `.exe` file. No installer needed. Just run it.

**Documentation:** https://wails.io/docs/introduction

### What is a WebView?

A WebView is like a browser engine embedded inside a desktop application. On Windows, it is called WebView2 (the same engine that powers Microsoft Edge). On macOS, it is called WebKit (the same engine that powers Safari).

When you run a Wails app, the Go process starts, then opens a window that contains this embedded browser. Your React code renders inside that browser, just like a website. But it also has access to the Go backend functions through Wails' bridge.

This is what makes Wails apps so lightweight — they reuse the browser engine already installed on the operating system. They do not ship a copy of Chrome like Electron does.

### What is the Signaling Server?

WebRTC (the technology we use to stream video) has a two-step process:

**Step 1 — Handshake (Signaling):** Before the video starts, the phone and the desktop need to introduce themselves to each other. They need to agree on how they will communicate, what their network addresses are, and what video format to use. This introduction is called "signaling" and it happens over a simple WebSocket connection to our Go server.

**Step 2 — Video Stream (Direct Connection):** Once the handshake is complete, the phone and desktop establish a direct peer-to-peer connection. The video data flows directly between them and never passes through our server again. The signaling server's job is done.

**Think of it like this:** The signaling server is a matchmaker at a party. It introduces two people (the phone and OBS), they exchange phone numbers (ICE candidates), and then they call each other directly. The matchmaker is not involved in the conversation.

### What is the obs-webrtc Plugin?

OBS is open-source, which means anyone can add features to it by writing a "plugin." The `obs-webrtc` plugin adds a new type of source to OBS called a "WHIP WebRTC Source." When you add this source, OBS connects to a WebRTC signaling server and receives the video stream directly, just like any other WebRTC client would.

This means OBS becomes a full participant in the WebRTC handshake — it connects to our Go signaling server, negotiates a direct link with the Android phone, and the video streams straight into OBS, completely bypassing the Dashboard application.

**Plugin repository:** https://github.com/obsproject/obs-webrtc

---

## Part 1: Setting Up Your Development Environment

### Step 1.1 — Install Go

Go must be installed on your computer before you can work with Wails.

1. Go to: https://go.dev/dl/
2. Download the installer for your operating system (Windows `.msi`, macOS `.pkg`).
3. Run the installer. Accept all defaults.
4. Open a new terminal (PowerShell on Windows, Terminal on Mac) and type:

```powershell
go version
```

You should see something like `go version go1.22.0 windows/amd64`. If you see this, Go is installed correctly.

**Troubleshooting:** If you get "command not found", close your terminal completely and open a new one. The installer adds Go to your PATH, but old terminals will not see it.

### Step 1.2 — Install Wails CLI

The Wails CLI is a command-line tool that helps you create new projects, run them in development mode, and build them for production.

In your terminal, run:

```powershell
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

This downloads the Wails tool and places it in your Go "bin" folder. After it finishes, verify it installed:

```powershell
wails version
```

You should see a version number like `v2.9.x`.

**Documentation:** https://wails.io/docs/gettingstarted/installation

### Step 1.3 — Install Node.js (if not already installed)

Wails uses Node.js to build the React frontend. Check if you have it:

```powershell
node --version
npm --version
```

If not installed, download from: https://nodejs.org (choose the LTS version).

### Step 1.4 — Run the Wails Doctor

Wails has a built-in tool to check that your environment is set up correctly:

```powershell
wails doctor
```

Read the output carefully. If anything shows as `[FAIL]`, follow the instructions it gives to fix it before moving on.

---

## Part 2: Creating the New Wails Project

### Step 2.1 — Navigate to the Airframe Folder

Open your terminal and navigate to the root of the Airframe project:

```powershell
cd C:\Users\danie\Documents\Projects\Airframe
```

### Step 2.2 — Create the Wails App

Run this command to create a new Wails project using React with TypeScript:

```powershell
wails init -n airframe-dashboard -t react-ts
```

**What this command does:**
- `-n airframe-dashboard` — Names the new project "airframe-dashboard".
- `-t react-ts` — Uses the React + TypeScript template for the frontend.

This creates a new folder called `airframe-dashboard` inside your Airframe directory with the following structure:

```
airframe-dashboard/
├── main.go          <- The Go backend. This is where your app starts.
├── app.go           <- The Go "App" struct. Your backend logic lives here.
├── go.mod           <- Go's version of package.json. Lists Go dependencies.
├── go.sum           <- A lockfile for Go dependencies (like package-lock.json).
├── wails.json       <- Wails configuration (like neutralino.config.json).
└── frontend/        <- The React frontend
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── ...
    ├── package.json
    └── index.html
```

### Step 2.3 — Understand the Generated main.go

Open `main.go`. It will look like this:

```go
package main

import (
    "embed"
    "github.com/wailsapp/wails/v2"
    "github.com/wailsapp/wails/v2/pkg/options"
)

//go:embed all:frontend/dist
var assets embed.FS  // This embeds your built React app into the Go binary

func main() {
    app := NewApp()  // Creates an instance of your App struct from app.go

    err := wails.Run(&options.App{
        Title:            "Airframe Dashboard",
        Width:            1280,
        Height:           720,
        Assets:           assets,
        BackgroundColour: &options.RGBA{R: 10, G: 10, B: 9, A: 1}, // #0A0A09
        OnStartup:        app.startup,
        Bind: []interface{}{
            app, // Exposes all public methods on 'app' to the frontend
        },
    })

    if err != nil {
        println("Error:", err.Error())
    }
}
```

### Step 2.4 — Understand the Generated app.go

Open `app.go`. It will look like this:

```go
package main

import "context"

// App struct — this is the main backend object.
// Think of it like the "class" that your Go backend is built around.
type App struct {
    ctx context.Context
}

// NewApp creates a new App instance.
func NewApp() *App {
    return &App{}
}

// startup is called automatically by Wails when the app window opens.
// ctx gives you access to Wails runtime APIs (emit events, get screen info, etc.)
func (a *App) startup(ctx context.Context) {
    a.ctx = ctx
    // We will start the signaling server here in Part 3.
}
```

Any method on the `App` struct that starts with a **capital letter** is automatically exposed to your React frontend by Wails. This is how Go marks something as "public."

---

## Part 3: Migrating the Signaling Server Into Wails

This is the core of the migration. We are taking the code from `signaling-server/main.go` and embedding it into the Wails application so it starts automatically when the user opens the app.

### Step 3.1 — Install the WebSocket Dependency

The signaling server uses the `gorilla/websocket` library. Add it to the new Wails project:

```powershell
cd C:\Users\danie\Documents\Projects\Airframe\airframe-dashboard
go get github.com/gorilla/websocket
```

This is the Go equivalent of `npm install`. It downloads the library and adds it to `go.mod`.

### Step 3.2 — Create the Signaling Server File

Inside `airframe-dashboard/`, create a new file called `signaling.go`. Paste the following content into it:

```go
package main

// This file contains the WebSocket signaling server.
// It runs in the background when the Airframe Dashboard opens.
// Its job: act as a matchmaker between the Android Capture App and OBS.

import (
    "encoding/json"
    "log"
    "net"
    "net/http"
    "strings"
    "sync"

    "github.com/gorilla/websocket"
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
func startSignalingServer() {
    hostIp := getLanIp()

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

    log.Printf("[signaling] Server started on port %d\n", SignalingPort)
    log.Printf("[signaling] Network IP: %s\n", hostIp)

    if err := http.ListenAndServe(":4747", mux); err != nil {
        log.Fatalf("[signaling] Fatal error: %v\n", err)
    }
}
```

### Step 3.3 — Start the Server from App Startup

Open `app.go` and replace its contents with this:

```go
package main

import (
    "context"
    "log"
)

type App struct {
    ctx context.Context
}

func NewApp() *App {
    return &App{}
}

// startup is called by Wails automatically when the desktop window opens.
func (a *App) startup(ctx context.Context) {
    a.ctx = ctx

    // 'go' means "run this in the background without blocking."
    // The app window opens immediately. The server starts in parallel.
    log.Println("[app] Starting Airframe Signaling Server...")
    go startSignalingServer()
}

// GetNetworkIP exposes the LAN IP to the React frontend.
// Because the method name starts with a capital letter, Wails
// automatically makes it callable from JavaScript.
func (a *App) GetNetworkIP() string {
    return getLanIp()
}
```

---

## Part 4: Migrating the React Frontend

### Step 4.1 — Copy the Existing Code

Copy the entire content of `receiver-app/src/App.tsx` into `airframe-dashboard/frontend/src/App.tsx`, replacing what is already there.

Copy `receiver-app/src/App.css` and `receiver-app/src/index.css` into the corresponding paths under `frontend/src/`.

### Step 4.2 — Install Frontend Dependencies

```powershell
cd C:\Users\danie\Documents\Projects\Airframe\airframe-dashboard\frontend
npm install qrcode.react lucide-react
```

### Step 4.3 — Use the Wails Binding Instead of a Fetch Call

The existing `App.tsx` fetches the network IP from the local HTTP server on startup:

```typescript
// OLD approach — remove this:
const fetchNetworkIp = async () => {
    const res = await fetch('http://127.0.0.1:4747');
    const data = await res.json();
    setNetworkIp(data.networkIp);
};
```

In the Wails version, we call the Go function directly. Wails auto-generates TypeScript bindings after you run the app once.

Run `wails dev` (see Part 5) first. Then, a file will be generated at `frontend/wailsjs/go/main/App.ts`. After that, replace the fetch with a direct call:

```typescript
// NEW approach — add this import at the top of App.tsx:
import { GetNetworkIP } from '../wailsjs/go/main/App';

// Replace the useEffect with this:
useEffect(() => {
    GetNetworkIP().then((ip) => {
        setNetworkIp(ip);
        connectSignaling();
    });
}, []);
```

**Why this is better:** No network round-trip. The Go function runs directly in the same process and returns instantly.

### Step 4.4 — Remove Window Capture Mode

In the existing `App.tsx`, when the phone connects, the entire UI switches to a full-screen black video element specifically designed for OBS Window Capture. This is no longer needed because OBS will use its own plugin.

Find and remove this entire block:

```typescript
// DELETE this entire if block:
if (peerConnected) {
    return (
        <div className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
            <video
                ref={(el) => {
                    if (el && remoteStream && el.srcObject !== remoteStream) {
                        el.srcObject = remoteStream;
                    }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
            />
        </div>
    );
}
```

After removing it, the Dashboard will always show its full UI with a small monitoring thumbnail when connected.

---

## Part 5: Running in Development Mode

### Step 5.1 — Start the Dev Server

```powershell
cd C:\Users\danie\Documents\Projects\Airframe\airframe-dashboard
wails dev
```

**What happens:**
1. Wails compiles your Go backend.
2. Wails starts a Vite dev server for your React frontend.
3. A desktop window opens showing your React app.
4. File watching is active — save a `.tsx` file and the app refreshes instantly. Save a `.go` file and the backend recompiles and restarts.

### Step 5.2 — Verify the Server Started

Look at the terminal output. You should see:

```
[app] Starting Airframe Signaling Server...
[signaling] Server started on port 4747
[signaling] Network IP: 192.168.x.x
```

If you see this, the embedded server is running. Confirm by opening a browser and visiting `http://127.0.0.1:4747`. You should get a JSON response like:

```json
{
  "name": "Airframe Signaling Server",
  "status": "online",
  "version": "0.2.0 (Wails)",
  "networkIp": "192.168.1.5"
}
```

### Step 5.3 — Check the QR Code

The Dashboard should display a QR code containing `ws://192.168.x.x:4747`. Scan it with the Airframe Capture App on your Android phone. The two should connect.

---

## Part 6: Configuring OBS with the WebRTC Plugin

### Step 6.1 — Install the Plugin

1. Visit: https://github.com/obsproject/obs-webrtc/releases
2. Download the latest release file for your operating system.
   - Windows: `obs-webrtc-x.x.x-windows.zip`
   - macOS: `obs-webrtc-x.x.x-macos.pkg`
3. On Windows: extract the `.zip` and copy the `.dll` file into your OBS plugins folder:
   `C:\Program Files\obs-studio\obs-plugins\64bit\`
4. On macOS: run the `.pkg` installer.
5. **Restart OBS completely** (quit and reopen).

### Step 6.2 — Add a WHIP Source

> **What is WHIP?** WHIP (WebRTC-HTTP Ingestion Protocol) is a standard that lets a client start a WebRTC connection using a simple HTTP request rather than a custom WebSocket protocol. The `obs-webrtc` plugin uses WHIP to connect to our server.

1. In OBS, in the **Sources** panel at the bottom, click the `+` icon.
2. From the dropdown list, select **"WHIP Source"**.
3. Give it a name (e.g., "Airframe Phone Camera").
4. In the **Server URL** field, enter: `http://127.0.0.1:4747/whip`
5. Leave the **Bearer Token** field empty.
6. Click **OK**.

### Step 6.3 — Add a WHIP Endpoint to the Go Server

The current signaling server only handles plain WebSocket connections. The OBS `obs-webrtc` plugin expects a `/whip` HTTP endpoint. Add this handler inside `startSignalingServer()` in `signaling.go`, inside the `mux.HandleFunc` block:

```go
// WHIP endpoint — for OBS plugin connection
// OBS sends an HTTP POST to this URL with its SDP offer.
// We relay it to the capture app, get the answer, and return it to OBS.
mux.HandleFunc("/whip", func(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
        return
    }
    // TODO: Full WHIP session management (store pending session,
    // wait for capture app answer, return SDP answer in HTTP response).
    // For MVP: relay the raw SDP to connected WebSocket clients.
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
```

> **Note for the implementer:** A complete WHIP implementation requires a synchronous request/response cycle — OBS sends an SDP offer in the POST body and expects the SDP answer in the HTTP response, before the response is sent. This requires holding the HTTP response open while waiting for the Android capture app to return its SDP answer via WebSocket, then forwarding it back. This is an advanced task that uses Go channels. It is documented as a follow-up item, not a blocker for the MVP.

---

## Part 7: UI Redesign per Design Constitution

The React frontend must be redesigned according to `DESIGN_SYSTEM.md`. The following specifies the exact target.

### Global CSS Variables

In `frontend/src/index.css`, define these at the root:

```css
:root {
  --bg: #0A0A09;
  --text-primary: #FAFAF9;
  --text-secondary: #737370;
  --border: rgba(255, 255, 255, 0.08);
  --live: #FF6600;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}
```

### The Pairing Screen Layout (Before Phone Connects)

The QR code is the only thing that matters on this screen. Every other element is secondary.

```
┌────────────────────────────────────────┐
│ AIRFRAME                  ● OFFLINE    │  <- Header. "AIRFRAME" weight 600.
│                                        │     Orange dot only when LIVE.
├────────────────────────────────────────┤
│                                        │
│                                        │
│           [QR CODE]                    │  <- Hero. 200x200px minimum.
│                                        │     No border, no card, no shadow.
│    Scan with Airframe Capture App      │  <- Single muted line below.
│                                        │
│                                        │
├────────────────────────────────────────┤
│  Server   ws://192.168.1.5:4747        │  <- Monospace font for the IP.
│  Status   Waiting for capture app...   │
└────────────────────────────────────────┘
```

### The Live Screen Layout (After Phone Connects)

```
┌────────────────────────────────────────┐
│ AIRFRAME                  ● LIVE       │  <- Orange dot, pulsing subtly.
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │     MONITORING THUMBNAIL         │  │  <- ~30% of screen height.
│  │     (small, not full-screen)     │  │     NOT full-screen. Never.
│  │                                  │  │
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│  Latency      42ms                     │  <- Monospace. Right-aligned values.
│  Bitrate      8.2 Mbps                 │
│  Resolution   1920 x 1080              │
│  OBS Plugin   Connected                │
└────────────────────────────────────────┘
```

### Rules to Follow

- Do NOT use `#4D8AFF` (blue) anywhere. It was the v0.1 accent and has no semantic meaning.
- The `#FF6600` orange is used ONLY for the LIVE state indicator dot.
- All IP addresses, latency values, and bitrate numbers must use the monospace font.
- Status messages must be specific. Never write "Disconnected." Write "Lost connection to signaling server. Is the Dashboard running?"

---

## Part 8: Building for Production

When the app is ready to distribute:

```powershell
cd C:\Users\danie\Documents\Projects\Airframe\airframe-dashboard
wails build
```

**What happens:**
1. Wails runs `npm run build` inside `frontend/` to compile the React app.
2. Wails embeds the compiled React output into the Go binary (via the `//go:embed` directive in `main.go`).
3. Everything is compiled into a single `.exe` file with no external dependencies.

The output file location: `airframe-dashboard/build/bin/Airframe Dashboard.exe`

**Documentation:** https://wails.io/docs/guides/windows

---

## Part 9: Final Folder Structure

After migration is complete, the Airframe repo should look like this:

```
Airframe/
├── capture-app/               <- Android app (no changes)
│   ├── App.tsx
│   ├── ErrorBoundary.tsx
│   └── app.json
│
├── airframe-dashboard/        <- NEW: Single Wails binary
│   ├── main.go                <- App entry point
│   ├── app.go                 <- App struct, startup hook, Go bindings
│   ├── signaling.go           <- Embedded WebSocket signaling server
│   ├── go.mod
│   ├── wails.json
│   └── frontend/              <- React frontend (redesigned)
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       └── package.json
│
├── receiver-app/              <- ARCHIVE: Replaced by airframe-dashboard
├── signaling-server/          <- ARCHIVE: Code ported into signaling.go
├── DESIGN_BOOK.md
├── DESIGN_BOOK_v2.md
├── DESIGN_SYSTEM.md
└── WAILS_MIGRATION_PLAN.md    <- This document
```

---

## Part 10: Implementation Checklist

Work through this list top to bottom. Check each item before moving to the next.

- [ ] Go installed (`go version` succeeds)
- [ ] Wails CLI installed (`wails version` succeeds)
- [ ] `wails doctor` passes all checks
- [ ] `wails init -n airframe-dashboard -t react-ts` ran successfully
- [ ] `gorilla/websocket` installed (`go get github.com/gorilla/websocket`)
- [ ] `signaling.go` created with full server code
- [ ] `app.go` updated to call `go startSignalingServer()` on startup
- [ ] `GetNetworkIP()` method added to `App` struct in `app.go`
- [ ] React code copied from `receiver-app/src/` to `frontend/src/`
- [ ] npm packages installed (`qrcode.react`, `lucide-react`)
- [ ] `wails dev` runs without errors
- [ ] Terminal shows `[signaling] Server started on port 4747`
- [ ] Browser visit to `http://127.0.0.1:4747` returns JSON
- [ ] QR code appears in the app window
- [ ] `GetNetworkIP` Wails binding imported and used in `App.tsx`
- [ ] Android app scans QR code and WebSocket connects
- [ ] Window Capture full-screen block removed from `App.tsx`
- [ ] `obs-webrtc` plugin installed and OBS restarted
- [ ] WHIP Source added in OBS pointing to `http://127.0.0.1:4747/whip`
- [ ] UI redesigned per `DESIGN_SYSTEM.md` (orange LIVE dot, monospace data, no blue)
- [ ] `wails build` produces a single `.exe`
- [ ] `.exe` runs without a terminal window (no console visible to end user)

---

## Reference Links

| Resource | URL |
|---|---|
| Wails Documentation | https://wails.io/docs/introduction |
| Wails Installation Guide | https://wails.io/docs/gettingstarted/installation |
| Wails: Binding Go to JS | https://wails.io/docs/guides/bindings |
| Wails: Building for Windows | https://wails.io/docs/guides/windows |
| Go Documentation | https://go.dev/doc/ |
| Go: gorilla/websocket | https://pkg.go.dev/github.com/gorilla/websocket |
| Go: net/http package | https://pkg.go.dev/net/http |
| obs-webrtc Plugin | https://github.com/obsproject/obs-webrtc |
| WHIP Protocol Explainer | https://www.ietf.org/rfc/rfc9725.html |
| WebRTC Explained (Mozilla) | https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API |
| Airframe Design Constitution | DESIGN_SYSTEM.md (this repo) |
| Airframe Design Book V2 | DESIGN_BOOK_v2.md (this repo) |
