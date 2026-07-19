# Airframe Architecture Overview

Comprehensive architecture documentation for the Airframe wireless camera system, including the dashboard, capture app, and their interactions.

## System Overview

Airframe is a wireless camera system that enables live video streaming from mobile devices to a desktop receiver. The system consists of three main components:

1. **Airframe Dashboard** (Desktop): Wails-based receiver application with WebRTC signaling
2. **Capture App** (Mobile): React Native + Expo camera transmitter
3. **Signaling Server** (Go): WebSocket signaling for WebRTC peer connection

## High-Level Architecture

```mermaid
graph TB
    subgraph "Mobile Device"
        Capture["Capture App\nReact Native + Expo"]
        Camera["Camera\nVision Camera"]
        Mic["Microphone"]
    end

    subgraph "Desktop Receiver"
        Dashboard["Airframe Dashboard\nWails + React"]
        Signaling["Signaling Server\nGo WebSocket"]
        OBS["OBS Studio\nobs-webrtc plugin"]
    end

    Camera -->|"Video Stream"| Capture
    Mic -->|"Audio Stream"| Capture
    Capture -->|"WebRTC Offer/Answer"| Signaling
    Signaling -->|"Signaling"| Capture
    Signaling -->|"Signaling"| Dashboard
    Dashboard -->|"WebRTC Stream"| OBS
    OBS -->|"Broadcast"| Internet

    style Capture fill:#4D8AFF
    style Dashboard fill:#0054FA
    style Signaling fill:#34C759
```

## Component Architecture

### 1. Airframe Dashboard

The desktop receiver application built with Wails (Go backend + React frontend).

#### Technology Stack

- **Backend**: Go 1.22+ with Wails v2
- **Frontend**: React 19.1.0 + TypeScript
- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite`
- **Charts**: Recharts 3.9.2
- **Icons**: Lucide React 1.23.0
- **QR Codes**: qrcode.react 4.2.0

#### Directory Structure

```
airframe-dashboard/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main app with WebRTC logic
│   │   ├── components/
│   │   │   ├── MonitorTab.tsx   # Preview pane with metrics
│   │   │   ├── MetricCard.tsx   # Quality indicator cards
│   │   │   └── StatusPill.tsx   # Connection status badge
│   │   └── index.css            # Tailwind CSS v4 with @theme
│   ├── package.json
│   └── vite.config.ts           # Vite with @tailwindcss/vite
├── main.go                      # Wails entry point
├── signaling.go                 # WebSocket signaling server
└── wails.json                   # Wails configuration
```

#### Dashboard Architecture

```mermaid
graph TD
    subgraph "Dashboard Frontend"
        App["App.tsx\nReact 19.1.0"]
        Monitor["MonitorTab.tsx\nPreview Pane"]
        Metrics["MetricCard.tsx\nQuality Cards"]
        Status["StatusPill.tsx\nConnection Status"]
    end

    subgraph "Dashboard Backend"
        Wails["Wails Runtime\nGo 1.22+"]
        Signaling["signaling.go\nWebSocket Server"]
    end

    App --> Monitor
    App --> Metrics
    App --> Status
    Monitor -->|"WebRTC Stats"| App
    Status -->|"Connection State"| App
    App -->|"WebSocket Messages"| Signaling
    Signaling -->|"Signaling"| Wails
    Wails -->|"Native Bridge"| App

    style App fill:#0054FA
    style Signaling fill:#34C759
```

#### WebRTC Flow in Dashboard

```mermaid
sequenceDiagram
    participant Dashboard as Dashboard
    participant Signaling as Signaling Server
    participant Capture as Capture App
    participant WebRTC as WebRTC Peer

    Dashboard->>Signaling: Start WebSocket server (ws://:4747)
    Capture->>Signaling: Connect (ws://IP:4747)
    Capture->>Signaling: Join as 'capture' role
    Signaling->>Dashboard: Forward join message
    Dashboard->>WebRTC: Create PeerConnection
    Capture->>WebRTC: Create PeerConnection
    Capture->>WebRTC: Create offer
    Capture->>Signaling: Send offer
    Signaling->>Dashboard: Forward offer
    Dashboard->>WebRTC: Set remote description
    Dashboard->>WebRTC: Create answer
    Dashboard->>Signaling: Send answer
    Signaling->>Capture: Forward answer
    Capture->>WebRTC: Set remote description
    Capture->>Dashboard: ICE candidates
    Dashboard->>Capture: ICE candidates
    WebRTC->>WebRTC: Connection established
    Capture->>Dashboard: Video/audio stream
    Dashboard->>Dashboard: Poll WebRTC stats (1s interval)
```

### 2. Capture App

The mobile transmitter application built with React Native + Expo.

#### Technology Stack

- **Framework**: React Native 0.86.0 + Expo ~57.0.4
- **Camera**: react-native-vision-camera 5.1.0
- **WebRTC**: react-native-webrtc 124.0.7
- **Icons**: lucide-react-native 1.23.0
- **Fonts**: Figtree + DM Mono (Google Fonts)
- **Language**: TypeScript 6.0.3

#### Directory Structure

```
capture-app/
├── screens/
│   ├── SplashScreen.tsx      # Brand splash with auto-redirect
│   ├── DiscoverScreen.tsx    # Network discovery and device list
│   ├── PreviewScreen.tsx     # Viewfinder with HUD controls
│   └── SettingsScreen.tsx   # Camera configuration
├── App.tsx                   # Main app with navigation and WebRTC
├── ErrorBoundary.tsx        # Error handling wrapper
├── MOBILE_APP_DESIGN.md      # Complete design specification
└── package.json
```

#### Capture App Architecture

```mermaid
graph TD
    subgraph "Capture App"
        Main["App.tsx\nNavigation + WebRTC"]
        Splash["SplashScreen.tsx\nBrand + Auto-redirect"]
        Discover["DiscoverScreen.tsx\nNetwork Discovery"]
        Preview["PreviewScreen.tsx\nViewfinder HUD"]
        Settings["SettingsScreen.tsx\nCamera Config"]
    end

    subgraph "React Native Modules"
        Camera["Vision Camera\nCamera Access"]
        WebRTC["WebRTC\nPeer Connection"]
        WS["WebSocket\nSignaling Client"]
    end

    Main --> Splash
    Main --> Discover
    Main --> Preview
    Main --> Settings
    Preview --> Camera
    Main --> WebRTC
    Main --> WS

    style Main fill:#4D8AFF
    style Camera fill:#34C759
    style WebRTC fill:#F59E0B
```

#### Screen Navigation Flow

```mermaid
stateDiagram-v2
    [*] --> Splash: App Launch
    Splash --> Discover: Auto-redirect (~2s)
    Discover --> Preview: Connect to receiver
    Preview --> Settings: Tap settings icon
    Settings --> Preview: Back gesture/button
    Preview --> Discover: Connection lost
    Discover --> [*]: App closed
    Preview --> [*]: App closed
```

### 3. Signaling Server

The WebSocket signaling server implemented in Go.

#### Technology Stack

- **Language**: Go 1.22+
- **Framework**: Wails v2
- **Protocol**: WebSocket (RFC 6455)
- **Port**: 4747 (default)

#### Signaling Protocol

```mermaid
graph LR
    subgraph "Message Types"
        Join["join\nrole: capture/receiver"]
        Offer["offer\nSDP payload"]
        Answer["answer\nSDP payload"]
        Candidate["candidate\nICE payload"]
    end

    subgraph "Flow"
        Capture["Capture App"] --> Join
        Receiver["Receiver"] --> Join
        Capture --> Offer
        Receiver --> Answer
        Capture -.-> Candidate
        Receiver -.-> Candidate
    end

    style Join fill:#34C759
    style Offer fill:#4D8AFF
    style Answer fill:#0054FA
    style Candidate fill:#F59E0B
```

#### Signaling Message Format

```json
{
  "type": "join|offer|answer|candidate",
  "role": "capture|receiver",
  "payload": {
    "type": "offer|answer",
    "sdp": "v=0\r\no=- ...",
    "candidate": "candidate:1 1 UDP ...",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

## Data Flow

### Streaming Pipeline

```mermaid
graph LR
    Camera["Camera\n1080p@60fps"] -->|"Raw Video"| Capture["Capture App"]
    Mic["Microphone\nAAC"] -->|"Raw Audio"| Capture
    Capture -->|"WebRTC\nH.264/Opus"| Network["Network\nWiFi/LTE"]
    Network -->|"WebRTC Stream"| Dashboard["Dashboard"]
    Dashboard -->|"Video Feed"| OBS["OBS Studio"]
    OBS -->|"RTMP/SRT"| Platform["Streaming Platform"]

    style Camera fill:#4D8AFF
    style Capture fill:#4D8AFF
    style Dashboard fill:#0054FA
    style OBS fill:#34C759
```

### Metrics Collection

```mermaid
graph TD
    WebRTC["WebRTC PeerConnection"] -->|"getStats()"| Poll["Poll Interval\n1 second"]
    Poll -->|"Inbound RTP"| Bitrate["Bitrate Calculation"]
    Poll -->|"Remote Inbound RTP"| Latency["Latency Calculation"]
    Poll -->|"Inbound RTP"| FPS["FPS Calculation"]
    Bitrate -->|"Update State"| Metrics["Metrics State"]
    Latency -->|"Update State"| Metrics
    FPS -->|"Update State"| Metrics
    Metrics -->|"Render"| Monitor["MonitorTab"]

    style WebRTC fill:#F59E0B
    style Metrics fill:#0054FA
```

## Network Architecture

### Local Network Setup

```mermaid
graph TB
    Router["WiFi Router\n192.168.1.1"]
    Desktop["Desktop Receiver\n192.168.1.100:4747"]
    Mobile["Mobile Device\n192.168.1.101"]
    Internet["Internet"]

    Router -->|"WiFi"| Desktop
    Router -->|"WiFi"| Mobile
    Desktop -->|"WebSocket Signaling"| Mobile
    Mobile -->|"WebRTC Stream"| Desktop
    Desktop -->|"OBS Stream"| Internet

    style Router fill:#34C759
    style Desktop fill:#0054FA
    style Mobile fill:#4D8AFF
```

### Port Usage

| Port | Protocol | Usage | Direction |
|------|----------|-------|-----------|
| 4747 | WebSocket | Signaling server | Bi-directional |
| Dynamic | UDP | WebRTC media | Bi-directional |
| Dynamic | TCP | WebRTC data | Bi-directional |

## Design System Integration

### Design Tokens

```mermaid
graph TD
    subgraph "Dashboard Design Tokens"
        Colors["Colors\n#F5F5F3, #0F0F0E, #0054FA"]
        Fonts["Fonts\nFigtree, DM Mono"]
        Spacing["Spacing\n4px, 8px, 16px, 24px"]
        Radius["Border Radius\n0.875rem, 1.125rem, 1.375rem"]
    end

    subgraph "Capture App Design Tokens"
        Colors2["Colors\n#0A0A09, #080808, #4D8AFF"]
        Fonts2["Fonts\nFigtree, DM Mono"]
        Spacing2["Spacing\n10px, 14px, 18px"]
        Radius2["Border Radius\n10px, 14px, 18px"]
    end

    Colors -->|"Shared"| Colors2
    Fonts -->|"Shared"| Fonts2

    style Colors fill:#0054FA
    style Colors2 fill:#4D8AFF
```

### Typography System

```mermaid
graph LR
    Figtree["Figtree\nHuman-authored text"]
    DMMono["DM Mono\nMachine-generated values"]

    Figtree -->|"Headings, Labels,\nButton Text"| DashboardUI["Dashboard UI"]
    Figtree -->|"Headings, Labels,\nButton Text"| CaptureUI["Capture UI"]
    DMMono -->|"IPs, Bitrates,\nResolutions"| DashboardUI
    DMMono -->|"IPs, Bitrates,\nResolutions"| CaptureUI

    style Figtree fill:#0054FA
    style DMMono fill:#4D8AFF
```

## Error Handling

### Error Boundary Architecture

```mermaid
graph TD
    App["React App"] --> ErrorBoundary["ErrorBoundary"]
    ErrorBoundary -->|"No Error"| Children["Child Components"]
    ErrorBoundary -->|"Error Caught"| Fallback["Error Fallback UI"]
    Fallback -->|"Log Error"| Console["Console.error"]
    Fallback -->|"Display"| ErrorMessage["User-friendly Message"]

    style ErrorBoundary fill:#EF4444
    style Fallback fill:#F59E0B
```

### Connection Error Handling

```mermaid
stateDiagram-v2
    [*] --> Connecting: WebSocket connect
    Connecting --> Connected: onopen
    Connecting --> Error: onerror
    Connected --> Streaming: WebRTC connected
    Connected --> Error: WebSocket close
    Streaming --> Error: WebRTC disconnect
    Error --> Reconnecting: Auto-reconnect
    Reconnecting --> Connecting: Retry (3s delay)
    Error --> [*]: Max retries exceeded
    Streaming --> [*]: User disconnect
```

## Performance Considerations

### WebRTC Optimization

- **SDP Bitrate Hack**: Enforce 20 Mbps limit for quality
- **ICE Servers**: Google STUN server for NAT traversal
- **Codec Selection**: H.264 for video, Opus for audio
- **Resolution**: 1920x1080 @ 60fps target
- **Polling Interval**: 1 second for stats collection

### React Performance

- **React 19.1.0**: Latest React with concurrent features
- **Vite**: Fast development server and optimized builds
- **Code Splitting**: Lazy loading for large components
- **Memoization**: React.memo for expensive renders

### Mobile Performance

- **Vision Camera**: Hardware-accelerated camera access
- **Native Modules**: WebRTC and camera use native implementations
- **Optimized Renders**: Functional components with hooks
- **Animation**: Native Animated API for smooth animations

## Security Considerations

### WebSocket Security

- **Local Network Only**: No public internet exposure
- **No Authentication**: Trusted local network environment
- **Role-Based**: Capture/receiver role separation

### WebRTC Security

- **DTLS/SRTP**: Encrypted media transport
- **ICE Candidates**: Controlled candidate exchange
- **STUN Only**: No TURN server (local network only)

## Deployment

### Dashboard Deployment

```mermaid
graph LR
    Build["wails build"] --> Binary["Airframe Dashboard.exe"]
    Binary --> Install["User Installation"]
    Install --> Run["Desktop Application"]

    style Build fill:#34C759
    style Binary fill:#0054FA
```

### Capture App Deployment

```mermaid
graph LR
    Build["eas build"] --> IPA["iOS .ipa"]
    Build --> APK["Android .apk"]
    IPA --> AppStore["App Store"]
    APK --> PlayStore["Google Play"]
    AppStore --> Install["User Installation"]
    PlayStore --> Install

    style Build fill:#34C759
    style IPA fill:#4D8AFF
    style APK fill:#4D8AFF
```

## Future Architecture

### Planned Enhancements

```mermaid
graph TD
    Current["Current Architecture"] --> Multi["Multi-Receiver Support"]
    Current --> Discovery["Real Network Discovery"]
    Current --> Recording["Recording Capability"]
    Current --> Stats["Advanced Statistics"]

    Multi -->|"mDNS/Bonjour"| Discovery
    Discovery -->|"UDP Broadcast"| Stats
    Recording -->|"Local Storage"| Stats

    style Current fill:#0054FA
    style Multi fill:#4D8AFF
    style Discovery fill:#34C759
    style Recording fill:#F59E0B
    style Stats fill:#EF4444
```

### Scalability Considerations

- **Multi-Receiver**: Support multiple capture apps per receiver
- **Load Balancing**: Distribute streams across multiple receivers
- **Cloud Signaling**: Optional cloud signaling for remote connections
- **Recording**: Local and cloud recording options
- **Analytics**: Stream quality analytics and monitoring

## References

- [Wails Documentation](https://wails.io/docs)
- [React Native Documentation](https://reactnative.dev)
- [WebRTC Specification](https://w3c.github.io/webrtc-pc/)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Expo Documentation](https://docs.expo.dev)

## Web Presence & Documentation Strategy (Stage One)

For post-Stage One distribution and documentation, Airframe will utilize a top-level web presence:

- **Central Hub (`airframe.website`)**: The primary domain for Airframe marketing, downloads, and documentation. Using a dedicated domain rather than subdomains emphasizes the maturity of the ecosystem and acts as the central entry point for new users to discover both the desktop Receiver and mobile Capture apps.
- **Naming Convention**: 
  - Modules are named as parallel peers (e.g., **Airframe Capture**, **Airframe Receiver**) without colons to avoid filesystem restrictions and signal a cohesive product suite rather than a franchise format.
- **Universal Logo**: 
  - A single universal "Airframe" logo (the 3D-extruded dark squircle with the geometric "A") is used across all modules. This unifies the brand identity, relying on platform contexts (desktop vs. mobile) to distinguish the specific module being run.
