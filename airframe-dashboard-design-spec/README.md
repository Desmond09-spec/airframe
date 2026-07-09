# Airframe Dashboard

A single desktop application that combines the signaling server and dashboard UI, built with Wails (Go + React).

## Overview

Airframe Dashboard replaces the previous two-process architecture (separate `signaling-server.exe` and `airframe-receiver.exe`) with a unified application. When you open the dashboard:

- The Go signaling server starts automatically in the background
- The React dashboard UI opens showing a QR code for pairing
- OBS can connect directly to the video feed using the obs-webrtc plugin

## Prerequisites

- Go 1.22 or higher
- Node.js 18 or higher
- Wails CLI: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

## Development

Run the application in development mode:

```powershell
wails dev
```

This will:
1. Compile the Go backend
2. Start a Vite dev server for the React frontend
3. Open the desktop window with hot reload enabled

## Building for Production

Build a single redistributable `.exe` file:

```powershell
wails build
```

The output will be at: `build/bin/Airframe Dashboard.exe`

## Testing with Android Capture App

1. Run `wails dev` or the built executable
2. The dashboard will display a QR code containing `ws://YOUR_IP:4747`
3. Open the Airframe Capture app on your Android phone
4. Scan the QR code to establish the WebRTC connection
5. The video stream will appear in the monitoring thumbnail

## OBS Configuration

### Installing the obs-webrtc Plugin

1. Download the latest release from: https://github.com/obsproject/obs-webrtc/releases
2. Extract the `.dll` file to your OBS plugins folder:
   - Windows: `C:\Program Files\obs-studio\obs-plugins\64bit\`
3. Restart OBS completely

### Adding a WHIP Source

1. In OBS, click the `+` icon in the Sources panel
2. Select "WHIP Source"
3. Enter Server URL: `http://127.0.0.1:4747/whip`
4. Leave Bearer Token empty
5. Click OK

**Note**: The WHIP endpoint is currently in MVP mode. It relays SDP offers to the capture app but does not implement full synchronous session management. For production use, the endpoint needs to be enhanced to return the SDP answer in the HTTP response.

## Troubleshooting

### QR Code Not Appearing

- Check that the signaling server started: look for `[signaling] Server started on port 4747` in the terminal
- Verify the network IP detection is working by visiting `http://127.0.0.1:4747` in a browser
- Check firewall settings to ensure port 4747 is not blocked

### Android App Won't Connect

- Ensure both devices are on the same local network
- Check that the QR code URL uses the correct IP address (not 127.0.0.1)
- Verify the Android app is pointing to the correct WebSocket URL
- Check the terminal for connection logs from the signaling server

### OBS WHIP Source Fails

- Ensure the obs-webrtc plugin is installed correctly
- Verify the Server URL is exactly `http://127.0.0.1:4747/whip`
- Check that the Dashboard is running before adding the WHIP source
- Note: The WHIP endpoint is in MVP mode and may not work with all OBS versions

### Connection Drops Frequently

- Check network stability between devices
- Ensure no other applications are using port 4747
- Verify the Android app has a stable internet connection for STUN server access

## Architecture

- **Backend**: Go signaling server embedded in the Wails app
- **Frontend**: React + TypeScript with Tailwind CSS
- **Communication**: Wails bindings for Go-to-React calls
- **Streaming**: WebRTC peer-to-peer connection via WebSocket signaling

## Project Structure

```
airframe-dashboard/
├── main.go           # App entry point
├── app.go            # App struct with Wails bindings
├── signaling.go      # Embedded WebSocket signaling server
├── go.mod            # Go dependencies
├── wails.json        # Wails configuration
└── frontend/         # React frontend
    ├── src/
    │   ├── App.tsx   # Main React component
    │   ├── index.css # Design system CSS variables
    │   └── main.tsx  # React entry point
    └── package.json  # Node dependencies
```

## Design System

The UI follows the design constitution in `DESIGN_SYSTEM.md`:
- Background: `#0A0A09`
- Text primary: `#FAFAF9`
- Text secondary: `#737370`
- Accent (LIVE): `#FF6600`
- Fonts: Inter (body), JetBrains Mono (data)
