# Airframe Design Book: V2 Addendum & Constitution

**Version:** 0.2
**Status:** Living Document
**Date:** July 2026
**Inheritance:** This document supersedes specific architectural and UI sections of `DESIGN_BOOK.md` (v0.1) while inheriting its core invariants, personas, and vision by reference. When this document and v0.1 contradict each other, this document wins.

---

## Overview of Changes

This version records three strategic pivots made during the Stage 1 build:

1. **Architecture:** The desktop runtime migrates from NeutralinoJS + a standalone Go binary to a unified **Wails** application.
2. **Consumer Integration:** The "Window Capture" method is officially retired. It is replaced by a **two-module** architecture where OBS connects natively via a WebRTC plugin.
3. **UI:** The entire design language is superseded by the **Daniel Akanmu Design Constitution** (`DESIGN_SYSTEM.md`).

---

## Part 1 — The Two-Module Architecture

### The Problem Being Solved

The original v0.1 architecture had a single receiver application that did everything: it ran the signaling server, negotiated the WebRTC connection, and displayed the video. When the video was live, the operator's only way to get it into OBS was "Window Capture"—a method where OBS scrapes your screen pixels every frame, like taking a screenshot 60 times per second.

This is unacceptable for two reasons:
- **Memory and CPU:** Window Capture forces the GPU and CPU to constantly copy screen pixels, adding significant overhead to a machine already running OBS.
- **Fragility:** If the receiver window is minimized, obscured by another window, or resized, OBS breaks.

### The Two-Module Solution

The new architecture splits the desktop side into two completely independent units.

---

**Module 1: The Dashboard**

What it is: A Wails desktop application.
What it does: Displays all control information about the current session. QR code for pairing, connection health, latency, resolution, packet stats. It also shows a thumbnail preview of the incoming feed for monitoring purposes.
What it does NOT do: It is not the primary receiver of the video. It does not feed video into OBS.

---

**Module 2: The OBS Source Plugin**

What it is: The `obs-webrtc` plugin (open-source, pre-built, free to install).
Download: https://github.com/obsproject/obs-studio/wiki/Scripting-Using-OBS-WebRTC
What it does: Acts as a WebRTC client that lives *inside* OBS. The operator adds it as a source in their OBS scene. The plugin connects to the Airframe signaling server (which is embedded in the Dashboard's Wails backend) and receives the video stream from the Android capture app directly.
What it does NOT do: It has nothing to do with the Dashboard app. It does not depend on the Dashboard being open. OBS receives the video independently.

---

### How The Pieces Connect At Runtime

```
[Android Capture App]
        |
        | (WebRTC video stream + signaling via WebSocket)
        |
[Wails Go Backend — Signaling Server on port 4747]
        |
        |--- WebSocket ---> [Dashboard React UI — stats, QR code, monitoring thumbnail]
        |
        |--- WebSocket ---> [OBS obs-webrtc Plugin — full quality video stream to OBS scene]
```

The Android phone is the **source**. It sends video to two listeners simultaneously. The Dashboard gets a low-bandwidth monitoring feed. The OBS plugin gets the full-quality production feed. They are completely independent. If the Dashboard crashes, OBS keeps streaming.

---

## Part 2 — The Wails Migration

### What Wails Is

Wails is a framework for building desktop applications using Go for the backend and any web technology (React, Vite, etc.) for the frontend. It compiles into a single `.exe` (Windows) or `.app` (macOS) binary.

Think of it like this: instead of having a Go program and a web app as two separate things, Wails welds them together. The Go code runs in the background as the application's engine. The React code runs in the operating system's native browser engine (called a WebView) as the user interface. They talk to each other through a bridge that Wails provides.

**Documentation:** https://wails.io/docs/introduction

### Why We Are Migrating

Our current setup has two separate problems:

**Problem 1 — Two Executables:** The user currently has to manually run `signaling-server.exe` AND open `airframe-receiver.exe`. If they forget one, nothing works. With Wails, the Go signaling server code lives inside the same application. Opening the app starts everything automatically.

**Problem 2 — NeutralinoJS Limitations:** NeutralinoJS has no way to run arbitrary Go code. Our signaling server must be a separate compiled executable. Wails eliminates this entirely—the signaling server is just a function in Go called on app startup.

---

## Part 3 — The UI Constitution

Airframe V2 adopts the **Daniel Akanmu Design Constitution** (`DESIGN_SYSTEM.md`) as the binding law for all interface work.

The key shift from v0.1: the existing UI was built with an optimistic, feature-demonstrating aesthetic. V2 treats every visual element as guilty until proven innocent.

### The Guiding Question

Before adding any element, ask: *"Does removing this improve the design?"* If yes, remove it.

### Applied Rules for Airframe Interfaces

**Colors**
- Background: `#0A0A09` (near-black, not pure black)
- Text Primary: `#FAFAF9` (near-white)
- Text Secondary: `#737370` (muted grey)
- Active / Live state: `#FF6600` (safety orange — used ONLY when actively streaming)
- Borders and dividers: `#E5E5E3` on light surfaces, `rgba(255,255,255,0.08)` on dark surfaces
- No blue accents. Blue was the v0.1 accent. It has no semantic meaning. Replace all `#4D8AFF` instances.

**Typography**
- One font family: `'Inter'`, falling back to `system-ui`
- Headings: weight 500–600, tight letter-spacing (`-0.02em`)
- Body: weight 400
- Data/technical values (IP addresses, latency numbers): monospace stack — `'JetBrains Mono', 'Fira Code', monospace`

**Layout**
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px only. Never arbitrary values.
- Generous whitespace. Never compress.
- The QR code is the hero element of the pairing screen. Everything else is secondary.

**Status and Diagnostics**
- Status is always visible. Never hidden behind a toggle or menu.
- When LIVE: one clearly visible orange indicator.
- When disconnected: the exact reason (e.g., *"Lost connection to signaling server — restart the Dashboard"*), never just "Disconnected".

**Motion**
- No decorative animations.
- The only permitted animation is a single pulsing dot on the LIVE indicator to confirm the stream is active.
- Transitions between states: 150ms ease-out only.

---

## Part 4 — Technology Decisions (Superseding v0.1)

| Decision | v0.1 | v0.2 |
|---|---|---|
| Desktop runtime | NeutralinoJS | Wails |
| Signaling server | Standalone Go `.exe` | Embedded in Wails `main.go` |
| OBS integration | Window Capture | `obs-webrtc` native plugin |
| Desktop frontend | React + Vite + TailwindCSS | React + Vite + Vanilla CSS |
| Android camera | Vision Camera v4 + config plugins | Vision Camera v5 (Nitro Modules) |
| QR scanner | `useCodeScanner` hook | `<CodeScanner>` component |
| UI color accent | Blue `#4D8AFF` | Orange `#FF6600` for live only |
| UI design system | Ad hoc | Daniel Akanmu Design Constitution |

---

## Part 5 — Invariants Carried Forward

These five rules from v0.1 are unchanged and remain binding:

1. Airframe is transport-agnostic. WebRTC is the current implementation. It is not the permanent one.
2. Airframe is capture-agnostic. Android CameraX is the current implementation. It is not the permanent one.
3. Airframe coordinates. It does not create or transform media.
4. Layers communicate through contracts, not implementations.
5. Every component has a single responsibility.

The two-module desktop architecture is a direct expression of Invariant 5. The Dashboard's responsibility is monitoring and control. The OBS plugin's responsibility is video ingestion. They do not share responsibilities.


**Version:** 0.2
**Status:** Living Document
**Inheritance:** This document supersedes specific architectural and UI guidelines from `DESIGN_BOOK.md` (v0.1) while inheriting its core design invariants by reference.

---

## 1. Architectural Pivot: The Unified Wails Binary

The original architecture separated the desktop environment into two independent executables: a NeutralinoJS UI frontend and a standalone Go signaling server. This violated our goal of absolute operational simplicity.

**The V2 Architecture** abandons this split in favor of a unified **Wails** binary.
- **The Engine:** The desktop application is fundamentally a Go application. It natively embeds the WebSocket signaling server directly into its process lifecycle. 
- **The Interface:** The frontend remains a React/Vite web application, rendered via the OS's native WebView (WebView2 on Windows, WebKit on macOS).
- **The Result:** The operator runs a single `.exe` or `.app`. There are no zombie background processes, no port collisions, and no complex deployment scripts. 

### WebRTC Remains the Transport
While the architecture shifts to Wails, the transport remains strictly **WebRTC**. 
The Go backend acts exclusively as a signaling bridge (routing SDP offers and ICE candidates). Once the handshake completes, the Android device and the desktop WebView negotiate a direct, peer-to-peer UDP connection over the local network, achieving sub-50ms latency. The Go backend never touches the video packets.

---

## 2. Capture Layer Evolution: Nitro Modules

The Android Capture application (built on Expo) has migrated to **Vision Camera v5**, powered by Native C++ Nitro Modules.

**The Paradigm Shift:**
- We no longer rely on legacy Expo Config Plugins for camera linking.
- QR Code scanning and camera processing are bound directly to the C++ engine (`CodeScanner`), bypassing the JavaScript bridge for frame processing.
- The Capture Layer maintains absolute agnosticism. It captures the frames, reads the QR payload, and hands the raw `ws://` URL to the Transport Layer.

---

## 3. Consumer Integration: Ending "Window Capture"

**The Problem:** V1 relied on the operator using OBS "Window Capture" to scrape the desktop application's window. This is computationally expensive, prone to visual artifacts (capturing UI elements), and unreliable if the window is minimized or obscured.

**The V2 Solution:** The desktop receiver is no longer a window to be captured. It is an ingestion pipeline. We adopt two seamless ingestion methods:

1. **The OBS Browser Source (Zero-Install Integration):**
   The Go backend serves the React Receiver App over a local HTTP port. The operator adds an "OBS Browser Source" and points it to `http://localhost:4747`. The Chromium engine inside OBS executes the React app, connects to the local Go signaling server, and negotiates the WebRTC connection *directly inside OBS*. The video renders natively within the OBS compositor. No virtual drivers required.

2. **NDI (Network Device Interface) via Go (Future Extension):**
   For advanced broadcast environments, the Wails Go backend can utilize native Go-NDI wrappers to broadcast the received video stream across the LAN as a standard NDI source, allowing instant discovery by any professional vision mixer (OBS, vMix, TriCaster).

---

## 4. The UI Constitution

Airframe V2 adopts the **Daniel Akanmu Design Constitution** (`DESIGN_SYSTEM.md`). The UI of the Receiver App is completely overhauled to reflect an inevitable, tactile, hardware-first aesthetic inspired by Teenage Engineering and Linear.

### Core Rules
- **No Decorations:** Every pixel must serve a functional purpose. If removing an element improves comprehension, remove it.
- **Aggressive Hierarchy:** Whitespace and typography (size/weight) dictate structure. Color is never used for structure.
- **Tactile Brutalism:** High contrast (deep blacks, stark whites, industrial greys). Punches of safety orange (`#FF6600`) are reserved exclusively for active streaming states.
- **Grid Conformity:** Layouts must feel engineered, mimicking physical hardware consoles rather than fluid web pages.
- **Transparency over Simplicity:** Real-time diagnostics (latency, packet loss, resolution) are foregrounded as primary UI elements, not hidden behind advanced toggles. 

### Interaction Patterns
- **Skeletons over Spinners:** Loading states must reflect the eventual structure of the content.
- **Actionable Errors:** A disconnected state must explicitly state *why* it disconnected and exactly what the operator must do to recover.
- **Zero Configuration:** The app opens. The QR code displays. The phone scans it. The stream starts. Any setting that requires configuration before streaming begins is a failure of design.

---

## 5. Roadmap Adjustments

- **Immediate Goal:** Finalize the Wails migration and execute the UI Constitution on the Desktop Receiver.
- **Secondary Goal:** Implement the OBS Browser Source web-serving capability in the Go backend to eliminate Window Capture.
- **Long-Term Goal:** Transition the Expo Android application to a minimal EAS Development Build ecosystem, allowing instant OTA Javascript updates during development without requiring full APK compilation.
