<div style="page-break-after: always; min-height: 250mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; padding-top: 8em;">
<div>
<div style="width: 48px; height: 3px; background: #4D8AFF; margin-bottom: 2.5em;"></div>
<h1 style="font-size: 56pt; font-weight: 700; line-height: 1.0; margin: 0 0 0.1em 0; padding: 0; border: none; color: #0A0A09; letter-spacing: -0.03em; page-break-before: avoid;">Airframe</h1>
<p style="font-size: 24pt; font-weight: 300; color: #737370; margin: 0 0 3em 0; letter-spacing: -0.01em;">Design Book</p>
<div style="width: 100%; height: 1px; background: #E5E5E3; margin-bottom: 2em;"></div>
<p style="font-size: 12pt; font-weight: 400; font-style: italic; color: #737370; margin: 0 0 2em 0; max-width: 340px; line-height: 1.6;">Airframe is the space between two things.</p>
<p style="font-size: 8.5pt; font-weight: 500; color: #A3A3A0; margin: 0; letter-spacing: 0.08em; text-transform: uppercase; line-height: 2;">Product Requirements · Architecture Decisions<br>Technical Specification · Engineering Handbook</p>
</div>
<div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 1.5em; border-top: 1px solid #E5E5E3;">
<div>
<p style="font-size: 7pt; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #A3A3A0; margin: 0 0 0.4em 0;">Version</p>
<p style="font-size: 12pt; font-weight: 500; color: #0A0A09; margin: 0;">0.1</p>
</div>
<div style="text-align: center;">
<p style="font-size: 7pt; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #A3A3A0; margin: 0 0 0.4em 0;">Date</p>
<p style="font-size: 12pt; font-weight: 500; color: #0A0A09; margin: 0;">July 2026</p>
</div>
<div style="text-align: right;">
<p style="font-size: 7pt; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #A3A3A0; margin: 0 0 0.4em 0;">Status</p>
<p style="font-size: 12pt; font-weight: 500; color: #0A0A09; margin: 0;">Living Document</p>
</div>
</div>
</div>



## Table of Contents

### Part I — Vision

1. [Introduction](#1-introduction)
2. [Why Airframe Exists](#2-why-airframe-exists)
3. [The Problem with Existing Solutions](#3-the-problem-with-existing-solutions)
4. [Design Philosophy](#4-design-philosophy)
5. [Product Principles](#5-product-principles)
6. [Long-Term Vision](#6-long-term-vision)
7. [Non-Goals](#7-non-goals)
8. [Success Criteria](#8-success-criteria)

### Part II — Product

9. [What Airframe Is](#9-what-airframe-is)
10. [What Airframe Is Not](#10-what-airframe-is-not)
11. [User Personas](#11-user-personas)
12. [Church Workflow](#12-church-workflow)
13. [Creator Workflow](#13-creator-workflow)
14. [Production Workflow](#14-production-workflow)
15. [MVP Scope](#15-mvp-scope)
16. [Future Scope](#16-future-scope)

### Part III — Architecture

17. [Layered Architecture](#17-layered-architecture)
18. [Capture Layer](#18-capture-layer)
19. [Airframe Core](#19-airframe-core)
20. [Transport Layer](#20-transport-layer)
21. [Receiver Layer](#21-receiver-layer)
22. [Rendering Layer](#22-rendering-layer)
23. [Session Lifecycle](#23-session-lifecycle)
24. [Device Discovery](#24-device-discovery)
25. [Pairing](#25-pairing)
26. [Diagnostics](#26-diagnostics)
27. [Security](#27-security)
28. [Encryption](#28-encryption)
29. [Reliability](#29-reliability)
30. [Error Recovery](#30-error-recovery)

### Part IV — Interfaces

31. [Core Interfaces](#31-core-interfaces)
32. [State Machines](#32-state-machines)
33. [Protocol Design](#33-protocol-design)
34. [Message Types](#34-message-types)
35. [Frame Format](#35-frame-format)
36. [Synchronization](#36-synchronization)

### Part V — UI

37. [Design Language](#37-design-language)
38. [Visual Identity](#38-visual-identity)
39. [Typography](#39-typography)
40. [Components](#40-components)
41. [Motion](#41-motion)
42. [Accessibility](#42-accessibility)
43. [Android Screens](#43-android-screens)
44. [Desktop Screens](#44-desktop-screens)

### Part VI — Engineering

45. [Repository Structure](#45-repository-structure)
46. [Folder Structure](#46-folder-structure)
47. [Naming](#47-naming)
48. [Coding Standards](#48-coding-standards)
49. [Testing](#49-testing)
50. [CI/CD](#50-cicd)
51. [Build Pipeline](#51-build-pipeline)
52. [Releases](#52-releases)
53. [Versioning](#53-versioning)

### Part VII — Roadmap

54. [MVP](#54-mvp)
55. [v0.2](#55-v02)
56. [v0.5](#56-v05)
57. [v1.0](#57-v10)
58. [Airframe Platform](#58-airframe-platform)
59. [Plugin SDK](#59-plugin-sdk)
60. [Goldtooth Integration](#60-goldtooth-integration)

### Part VIII — Research

61. [AI Camera Switching](#61-ai-camera-switching)
62. [Distributed Streaming](#62-distributed-streaming)
63. [Scene Understanding](#63-scene-understanding)
64. [Future Capture Technologies](#64-future-capture-technologies)
65. [Long-Term Research Notes](#65-long-term-research-notes)

### Appendices

- [Glossary](#glossary)
- [Architecture Diagrams](#architecture-diagrams)
- [Sequence Diagrams](#sequence-diagrams)
- [Component Diagrams](#component-diagrams)
- [Network Flows](#network-flows)
- [Protocol Reference](#protocol-reference)
- [Coding Conventions](#coding-conventions)
- [Developer Checklist](#developer-checklist)

---

# Part I — Vision

---

## 1. Introduction

This is the Airframe Design Book.

It defines what Airframe is, why it exists, how it works architecturally, and how it should evolve over time. It is the single source of truth for product intent, architectural decisions, engineering standards, and design direction. When a question arises about why Airframe does something a particular way, the answer should either be in this document or should be added to it.

The Design Book serves four functions:

**Product Requirements.** Parts I and II establish the problem Airframe solves, who it solves it for, and what it deliberately refuses to solve. Every feature decision flows from these sections.

**Architecture Decisions.** Parts III and IV define the technical architecture—not as a snapshot of current implementation, but as the intended system design. Architectural decisions are recorded inline where they occur, with context, rationale, and consequences stated plainly. There is no separate ADR repository. The decisions live next to the structures they govern.

**Technical Specification.** Parts IV and V provide interface contracts, state machine definitions, protocol formats, and UI specifications at the level of detail required to implement without ambiguity. Where a specification admits multiple valid interpretations, one is chosen and the reasoning is documented.

**Engineering Handbook.** Part VI defines how the codebase is organized, how code is written, how it is tested, how it ships. These are not suggestions. They are standards. They exist because consistency across a codebase is a force multiplier, and inconsistency is a tax that compounds.

### How to Read This Document

If you are building Airframe, read it cover to cover. The document is structured so that each part builds on the previous one. The philosophy in Part I informs the product decisions in Part II. The product decisions constrain the architecture in Part III. The architecture determines the interfaces in Part IV. The interfaces shape the UI in Part V. The engineering practices in Part VI exist to protect everything that came before.

If you need to make a decision quickly, start with Chapter 4 (Design Philosophy). It contains the Design Invariants—five rules that constrain every architectural and product decision. If a proposed change violates an invariant, it does not belong in Airframe.

This is a living document. It evolves alongside the project. But it evolves deliberately. Changes to this document, especially to Parts I and III, should be treated with the same care as changes to a public API. They have consequences downstream.

---

## 2. Why Airframe Exists

Most media workflows today are built as vertical stacks. A camera application captures video, encodes it, sends it over a specific protocol, and delivers it to a specific receiver on the other end. The capture logic, the transport logic, and the consumption logic are welded together.

This works until you need to change something.

Consider a common setup. A church livestream team uses a phone as a camera source. The phone runs DroidCam. DroidCam captures the camera feed, encodes it, transports it over the local network using a proprietary protocol, and exposes it as a virtual webcam on a Windows machine running OBS.

```
Phone Camera
     │
     ▼
  DroidCam
  (capture + encode + transport)
     │
     ▼
  DroidCam Driver
  (receive + decode + virtual device)
     │
     ▼
    OBS
```

This chain works—until it doesn't.

The Wi-Fi drops. There is no automatic recovery. The connection dies silently, and the operator discovers it when the congregation notices the stream is frozen.

The team wants to add a second camera. DroidCam has no concept of multi-device session management. Each phone is an independent, uncoordinated connection.

The team wants to see diagnostics—latency, bitrate, packet loss. The tool doesn't expose this information because it was designed to be simple, not transparent.

The team wants to switch from Wi-Fi to USB for reliability. This is a different DroidCam mode with different behavior, different limitations, and no way to fall back to Wi-Fi if USB disconnects.

Every one of these problems exists because three distinct concerns—capturing media, transporting media, and consuming media—are treated as a single concern. They share code, share state, and share failure modes. Changing the transport means changing the capture pipeline. Changing the receiver means changing the transport assumptions.

Airframe exists to decompose this.

```
Reality
    │
    ▼
Capture Layer
(Camera · Screen · Sensor)
    │
    ▼
Airframe Core
(Session · Routing · Timing)
    │
    ▼
Transport Layer
(WebRTC · USB · Bluetooth · Future)
    │
    ▼
Receiver Layer
    │
    ▼
Consumer
(OBS · Preview · Recording)
```

Each layer is independent. Each layer has a single responsibility. Each layer communicates with its neighbors through a defined contract. Replace the transport—the capture layer does not notice. Replace the capture source—the transport layer does not care.

This is not a novel architectural idea. It is how networking stacks, operating systems, and compilers have been designed for decades. But it has not been applied to real-time media transport between mobile devices and desktop production environments. Airframe applies it.

The result: a system where the phone's camera, the network connection, the receiving machine, and the consuming application are all independent variables. Change any one of them without disturbing the others.

---

## 3. The Problem with Existing Solutions

Several tools exist for moving video from a phone to a desktop. Each solves part of the problem. None solve the right problem.

### DroidCam

DroidCam is the most widely used phone-to-desktop camera tool. It works. For simple setups—one phone, one laptop, stable Wi-Fi—it is adequate. But its design imposes hard limits.

DroidCam is a monolith. Capture, encoding, transport, and virtual device registration are one pipeline. There is no way to use DroidCam's transport with a different capture source. There is no way to use DroidCam's capture with a different transport. The system is not composable.

Session management is minimal. If the connection drops, the operator reconnects manually. There is no diagnostic feedback during the session—no latency measurement, no packet loss reporting, no bitrate graph. The operator is blind to the health of the connection until the output visibly degrades.

Multi-device support is rudimentary. Each phone connects independently. There is no shared session, no coordinated timing, no centralized monitoring. Scaling from one camera to three cameras means managing three separate, unrelated connections.

The transport is proprietary. There is no specification, no extensibility, no path to alternative transports. The protocol is an implementation detail hidden inside the application. If the transport is inadequate for a given network environment, the user has no recourse.

### NDI (Network Device Interface)

NDI, developed by Vizrt, is a high-quality network video protocol used extensively in broadcast production. It solves network transport well. But its design targets a different environment.

NDI assumes high-bandwidth local area networks. A single 1080p60 NDI stream can consume 100–150 Mbps. This is fine in a wired broadcast facility. It is not viable over consumer Wi-Fi, and it is not designed for mobile devices with constrained thermal and power budgets.

NDI is a protocol, not a platform. It handles transport but provides no session management, no device discovery negotiation, no diagnostics dashboard, no multi-device coordination. These responsibilities fall to the application developer.

NDI's SDK is proprietary and commercially licensed. Building on NDI means accepting a dependency on a closed platform with no access to the transport internals. If the protocol fails in an unexpected way, you cannot debug it. You can only report it.

### Video Conferencing Tools (Zoom, Meet, Teams)

Video conferencing platforms are designed for bidirectional, multi-party communication. Their compression algorithms are optimized for talking heads—they prioritize faces and deprioritize background detail. This is the opposite of what production workflows require, where the entire frame matters.

These tools treat all participants as equal peers. There is no concept of a "source" device that captures and a "receiver" device that consumes. The roles are symmetric by design. Airframe's roles are asymmetric by design—a deliberate architectural distinction.

Latency in conferencing tools is managed for conversational comfort (150–300 ms), not for production synchronization (sub-50 ms). The encoding profiles, error correction strategies, and buffer management are all tuned for a use case that is structurally different from live production.

### OBS WebSocket and Companion Tools

OBS provides a WebSocket API for remote control—switching scenes, starting recordings, adjusting audio levels. This is a control plane, not a media plane. It coordinates OBS's behavior but does not transport media to OBS. The capture and transport of the actual video feed remain outside OBS's responsibility.

Various companion tools attempt to bridge this gap, but they are adapters layered on top of architectures that were not designed for the problem. They accumulate complexity at integration boundaries rather than resolving it through clean abstraction.

### The Common Failure

Every existing solution couples at least two of the three core concerns: capture, transport, and consumption. In most cases, all three are entangled. This coupling creates several systemic problems:

**Fragility.** A failure in the transport layer propagates to the capture layer and the consumption layer. A Wi-Fi hiccup becomes a full pipeline failure.

**Opacity.** The internal state of the transport is not observable. The operator cannot see latency, packet loss, or buffer health in real time. Problems are discovered through their symptoms, not their causes.

**Inflexibility.** Changing the transport mechanism requires changing the capture pipeline. Adding a new capture source requires changes to the transport. The system resists modification.

**Vendor lock-in.** Because the layers are not separable, adopting a tool means adopting its entire stack. There is no way to keep the parts that work and replace the parts that don't.

Airframe solves these problems by refusing to create them. Each concern gets its own layer. Each layer gets its own contract. The coupling is eliminated at the architectural level, not patched over at the integration level.

---

## 4. Design Philosophy

Airframe is built on one structural idea and five invariants that follow from it.

### The Structural Idea

Every responsibility deserves its own layer. A layer should know as little as possible about the layers above and below it.

This is not minimalism for its own sake. It is a direct response to the coupling problem described in the previous chapters. When a camera application handles capture, encoding, transport, session management, and receiver registration in a single codebase, every change touches everything. Bugs propagate across boundaries that shouldn't exist. Testing requires the full stack. Deployment is all-or-nothing.

Airframe draws hard boundaries between responsibilities. Each boundary is defined by a contract—an interface that specifies inputs, outputs, and behavioral guarantees without specifying implementation. The contract is the only thing each layer knows about its neighbors.

This has a cost. Abstraction has overhead—conceptual overhead in understanding the system, and sometimes runtime overhead in crossing layer boundaries. Airframe accepts this cost because the alternative—a coupled monolith that works until it doesn't and then fails in ways you cannot diagnose—is worse. The cost of abstraction is paid once, at design time. The cost of coupling is paid continuously, at every maintenance cycle, every debugging session, every feature addition.

### Design Invariants

These are the laws of Airframe. They constrain every decision—architectural, product, and engineering. If a proposed feature or change violates an invariant, it does not belong in Airframe. It belongs somewhere else.

Violating an invariant is not impossible. But doing so means redefining what Airframe is. That should happen rarely, deliberately, and with full understanding of the consequences.

---

**Invariant 1. Airframe is transport-agnostic.**

Airframe never assumes how data moves between endpoints. The initial implementation uses WebRTC. Future implementations may use raw UDP, USB, Bluetooth, or technologies that do not yet exist. The architecture does not privilege any transport. Transport is a pluggable implementation behind a stable contract.

*Consequence:* No code outside the Transport Layer may reference WebRTC types, APIs, or concepts. If the word "WebRTC" appears in the Capture Layer, the Session Manager, or the Receiver Layer, something is wrong.

---

**Invariant 2. Airframe is capture-agnostic.**

Airframe never assumes where media originates. The initial implementation captures from an Android device camera via CameraX. Future implementations may capture from screen recording, depth sensors, thermal sensors, LiDAR, or sources that do not exist yet. The architecture treats all capture sources identically—as implementations of the Capture contract.

*Consequence:* No code outside the Capture Layer may reference CameraX, Camera2, MediaProjection, or any platform-specific capture API. The Capture Layer exports frames. How those frames were produced is the Capture Layer's private concern.

---

**Invariant 3. Airframe coordinates; it does not create media.**

Airframe does not generate video. It does not generate audio. It does not apply filters, effects, or transformations to media content. It receives media from the Capture Layer, routes it through the Transport Layer, delivers it to the Receiver Layer, and provides session management, diagnostics, and reliability guarantees along the way.

This is a critical distinction. A media creation tool has opinions about what the media looks like. Airframe has no opinions about media content. It has opinions about media delivery—timing, ordering, reliability, synchronization—but the pixels themselves are opaque.

*Consequence:* If someone proposes adding image processing, video effects, or content-aware encoding to Airframe Core, the proposal is out of scope. These belong in the Capture Layer (as capture-time processing) or in the Consumer (as render-time processing), never in the transport pipeline.

---

**Invariant 4. Layers communicate through contracts, not implementations.**

Every layer depends on interfaces. Never on concrete types, never on implementation classes, never on internal state of another layer. The contract defines what a layer provides and what it requires. The implementation fulfills the contract. If the implementation changes—new transport, new capture source, new receiver—the contract remains stable and the adjacent layers are unaffected.

*Consequence:* Dependency injection is not optional. It is structural. Every layer boundary is an injection point. Tests mock at contract boundaries. New implementations are added by implementing contracts, not by modifying existing code.

---

**Invariant 5. Every component has a single responsibility.**

The Session Manager manages sessions. The Transport sends data. The Capture Layer captures frames. The Receiver receives them. No component does two things. No component accumulates responsibilities over time.

This invariant is the most vulnerable to erosion. It is easy to add "just one more thing" to a component that already exists rather than creating a new component with a clear responsibility. Airframe resists this. When a new responsibility emerges, it gets a new component, a new contract, and a new home in the architecture.

*Consequence:* If a class has the word "and" in its description—"this class manages sessions *and* handles reconnection *and* tracks diagnostics"—it is doing too much. Split it.

---

### The Name

Names shape how people think about software. DroidCam tells you it is a camera for Android. Stream Camera tells you it streams from a camera. These names are accurate descriptions of current functionality, but they constrain future thinking. If DroidCam adds screen capture, the name becomes misleading. If Stream Camera adds USB transport, the name no longer fits.

Airframe was chosen deliberately to avoid this trap.

The name originated from the problem that started the project: moving video frames from a phone to a laptop over Wi-Fi. Frames, traveling through the air. Air-frame. But the name turned out to carry a deeper meaning. In aviation, the airframe is the mechanical structure of an aircraft—the fuselage, wings, and structural components that everything else attaches to. It is not the engine. It is not the avionics. It is not the payload. It is the structure that holds everything together and makes flight possible.

Airframe, the software platform, occupies the same role. It is not the camera (engine). It is not the UI (avionics). It is not the video content (payload). It is the structure that connects capture to transport to consumption and makes the media pipeline work.

The name describes what Airframe *is*, not what it currently *does*. When the transport changes from Wi-Fi to USB, the name still fits. When the capture source changes from a camera to a depth sensor, the name still fits. When the consumer changes from OBS to an AR headset, the name still fits. The name is as agnostic as the architecture.

---

## 5. Product Principles

Design invariants constrain the architecture. Product principles constrain the experience. They define how Airframe should feel to the people who use it.

### Reliability Is the Feature

Airframe's first users are church livestream operators. They do not have a backup camera crew. They do not have a network engineer on staff. They have one phone, one laptop, one Sunday morning, and a congregation watching online. If the stream drops, there is no second take.

This context shapes everything. The most important feature Airframe can offer is not resolution, not frame rate, not low latency. It is reliability. The stream should not drop. If it does drop, it should recover automatically. If it cannot recover, it should tell the operator exactly what happened and what to do about it.

Every feature, every setting, every architectural decision is evaluated against this principle first. A feature that adds capability but introduces a new failure mode is not a net positive. Reliability is not a feature among features. It is the foundation that makes all other features useful.

### Transparency Over Simplicity

Many tools hide complexity by hiding information. Airframe hides complexity by presenting information clearly.

The operator should always be able to answer three questions without navigating away from the primary screen:

1. Is the stream live?
2. Is the connection healthy?
3. If something is wrong, what is it?

This means real-time diagnostics are not an advanced feature. They are a primary interface element. Latency, bitrate, packet loss, and signal quality are always visible. Not because every operator understands these metrics in detail, but because the pattern of "green means good, yellow means caution, red means act" is universally understood.

When something fails, the error message must be actionable. "Connection lost" is a symptom. "Wi-Fi signal dropped below usable threshold — move closer to the router or switch to USB" is a diagnosis. Airframe always provides the diagnosis.

### Respect the Operator's Time

A livestream setup happens under time pressure. The service starts at a fixed time. The operator is often a volunteer, not a technician. Setup should take seconds, not minutes.

Device discovery should be automatic. Pairing should require one confirmation, not a configuration sequence. Reasonable defaults should cover 90% of use cases. Settings that require expertise should be accessible but not prominent.

The Preview screen on Android is full-bleed—the camera viewfinder fills the screen with controls overlaid minimally. This is not a cosmetic choice. It is a time-saving choice. The operator sees exactly what the audience will see, immediately, without navigating through setup screens.

### Progressive Disclosure

Not every operator needs every control. A volunteer running a single camera for a church stream does not need multi-device routing configuration. A professional production engineer managing four cameras across two transports does.

Airframe surfaces the right controls for the complexity of the current session. A single-device session shows a simple interface. A multi-device session reveals coordination controls. Advanced diagnostics are available but not foregrounded during normal operation.

This is not about dumbing down the interface. It is about matching the interface to the task. Every control that is visible but irrelevant is a distraction. Every control that is hidden but needed is a barrier. Progressive disclosure finds the boundary between the two.

### Build for the 2 AM Rehearsal

The true test of a production tool is not how it works during the event. It is how it works during setup, when the operator is alone, the venue is empty, and they are testing whether everything will work tomorrow.

Airframe's diagnostics, connection status, and error reporting are designed for this moment. An operator testing alone should have enough information to determine whether the setup is production-ready without a live audience as a feedback mechanism. Signal quality, latency trends, bitrate stability, and connection history should make the system's readiness self-evident.

---

## 6. Long-Term Vision

Airframe is designed to evolve through five stages. Each stage builds on the previous one. Each stage increases capability without changing the core abstractions. The layer boundaries, the contracts, the invariants—these remain constant. What changes is the sophistication of each layer's implementation.

### Stage One — Working Tool

**Objective:** Replace DroidCam for church livestream use.

Stage One is the proof of concept. A single Android phone captures video via CameraX. A Windows desktop receives the stream via WebRTC over the local network. The receiver exposes the stream as a virtual camera device that OBS can consume. The connection is monitored with real-time diagnostics.

This stage proves three things. First, the layered architecture works in practice, not just in theory. Second, the abstraction overhead is acceptable for real-time media at 1080p60. Third, the system is reliable enough for live production use.

Success at this stage means a church livestream operator can replace DroidCam with Airframe and experience fewer dropped connections, better diagnostic visibility, and equivalent or better video quality.

### Stage Two — Production Tool

**Objective:** Reliability and polish.

Stage Two does not add major features. It hardens what exists. CameraX integration moves from basic to comprehensive—hardware encoding via MediaCodec, optimized camera parameter management, power-aware capture modes. Networking moves from functional to robust—connection health monitoring, automatic reconnection with exponential backoff, configurable buffer management.

Device discovery graduates from IP entry to mDNS-based automatic detection. The UI incorporates real usage feedback—controls that proved awkward are redesigned, information that proved insufficient is expanded.

The objective is not to do more. It is to do the same things well enough that operators stop thinking about the tool and start thinking about their content.

### Stage Three — Professional Platform

**Objective:** Multi-device, multi-transport capability.

Stage Three is where Airframe becomes a platform rather than a tool. Multiple Android devices connect to a single receiver simultaneously. The Session Manager coordinates timing across devices. The operator can switch between cameras, monitor all feeds, and manage the production from the desktop interface.

Multiple transports become available—WebRTC for wireless, USB for wired reliability, potentially Bluetooth for short-range low-power scenarios. The Transport Layer's contract-based design pays its dividend here. Adding a new transport means implementing the Transport contract. The Capture Layer, Session Manager, and Receiver are unaware of the change.

A Plugin SDK opens the platform to third-party extension. Custom capture sources, custom transports, custom consumers—all pluggable through the same contracts that Airframe uses internally.

### Stage Four — Intelligent Transport

**Objective:** The platform makes operational decisions.

Stage Four introduces intelligence into the transport pipeline. The system predicts network degradation before it causes visible quality loss and adjusts encoding parameters proactively. Transport selection becomes automatic—Airframe chooses the best available transport based on current conditions, available bandwidth, and reliability history.

AI-assisted camera switching analyzes scene content and recommends or executes camera transitions. Failure recovery moves from reactive (reconnect after loss) to predictive (switch transport before loss).

Diagnostics evolve from display to analysis. Instead of showing the operator that latency is rising, the system identifies *why* latency is rising and suggests corrective action.

### Stage Five — Adaptive Media Platform

**Objective:** Capture-source independence.

Stage Five is where the Capture Layer's agnosticism fully materializes. Capture is no longer assumed to be a conventional camera. Depth maps, reconstructed 3D environments, spatial audio fields, sensor fusion outputs—these are all capture sources that produce frame data. The transport architecture handles them identically.

At this stage, Airframe is no longer "a tool for streaming phone cameras to desktops." It is a media transport platform that moves time-synchronized data between endpoints, regardless of what produced the data or what will consume it.

The abstractions defined in Stage One—the five invariants, the layer contracts, the separation of concerns—remain unchanged. They were designed for this moment. The architecture evolves while its foundations hold.

---

## 7. Non-Goals

Non-goals are not missing features. They are deliberate exclusions—capabilities that Airframe could provide but chooses not to because they violate the design philosophy, distract from the core mission, or belong in a different layer of the ecosystem.

**Airframe is not a camera application.** It does not own the camera UI, camera settings, or photographic experience. The Capture Layer wraps platform camera APIs. The user-facing camera experience is minimal and utilitarian—a viewfinder for framing, not a photography tool. Users who want camera filters, photo modes, or creative capture controls should use a dedicated camera application and feed its output into Airframe through a capture adapter.

**Airframe is not a video editor.** It does not trim, cut, splice, color-correct, or post-process media. Media enters Airframe from the Capture Layer and exits through the Receiver to a Consumer. Between entry and exit, the content is untouched. Processing belongs in the Consumer.

**Airframe is not a livestream platform.** It does not stream to YouTube, Twitch, Facebook, or any public endpoint. It transports media to a local receiver. The receiver may feed into OBS, which may then stream to a public platform. Airframe is the transport layer, not the distribution layer.

**Airframe is not video conferencing.** It is not bidirectional by design. There are capture endpoints (sources) and receiver endpoints (sinks). The architecture is asymmetric. This is intentional. Production workflows have sources and consumers. Conferencing has peers. These are different models with different requirements.

**Airframe is not OBS.** It does not composite scenes, manage audio mixing, render overlays, or control transitions. OBS is a consumer of Airframe's output. They are complementary, not competitive.

**Airframe does not manage content.** It does not store, catalog, search, or organize media files. It transports live media in real time. Recording is a consumer concern—if a consumer wants to record the stream, it records it. Airframe moves the frames. What happens to them after delivery is outside its scope.

**Airframe does not assume its own importance.** The system is designed to be invisible during normal operation. If an operator is thinking about Airframe during a live production, something has gone wrong. The ideal experience is one where the tool disappears and only the content remains.

---

## 8. Success Criteria

Airframe is successful when the following statements are true.

### Operational Success

**Reliability.** A single-device Airframe session on a consumer Wi-Fi network maintains a continuous stream for 4+ hours with fewer than 3 interruptions. Recovery from any interruption completes within 5 seconds without operator intervention.

**Latency.** End-to-end latency from camera sensor to OBS preview is under 100 ms on a local network for the default quality preset, and under 50 ms in performance mode. Latency jitter (variation) stays within ±15 ms during stable operation.

**Quality.** At 1080p60 with 8 Mbps encoding, the output is visually indistinguishable from a direct camera feed to a casual observer. At 4K30 with 20 Mbps encoding, the output meets broadcast-adjacent quality for the target production environments.

**Setup time.** An operator who has used Airframe once before can go from app launch to live stream in under 60 seconds. First-time setup, including receiver installation, completes in under 5 minutes.

### Architectural Success

**Transport substitution.** A new transport implementation (e.g., USB) can be integrated by implementing the Transport contract without modifying any code in the Capture, Session, or Receiver layers. Integration of a new transport, excluding the transport implementation itself, requires fewer than 50 lines of configuration code.

**Capture substitution.** A new capture source (e.g., screen recording) can be integrated by implementing the Capture contract without modifying any code in the Transport, Session, or Receiver layers.

**Independent deployment.** The Android capture application and the Windows receiver application can be updated independently. A version update to the capture application does not require a corresponding update to the receiver, and vice versa, as long as the protocol version is compatible.

### Perceptual Success

This is the hardest criterion to measure and the most important one to achieve.

Airframe is successful when developers stop thinking "I'm sending camera video" and start thinking "I'm transporting synchronized media." When the conversation shifts from the specific (cameras, Wi-Fi, OBS) to the general (capture sources, transports, consumers), the architectural vision has landed.

Airframe is successful when an operator at a church, a school, a small production house, or a conference venue can set up a multi-camera live production with consumer hardware, over a consumer network, and have it work—reliably, transparently, without requiring a broadcast engineering degree.

Airframe is successful when someone asks "What does Airframe do?" and the answer is not "It turns your phone into a webcam." The answer is: "It moves reality between endpoints—reliably, efficiently, and without caring how reality was captured or how it will be experienced."

---

# Part II — Product

---

## 9. What Airframe Is

Airframe is a media transport platform.

That sentence requires careful parsing. Each word is chosen.

**Media.** Airframe handles video, audio, and associated metadata. In its initial implementation, this means H.264-encoded video and AAC audio from an Android camera. In its target state, "media" includes any time-series data that must be delivered synchronously—depth maps, sensor readings, spatial audio, reconstructed surfaces. The architecture does not distinguish between these. They are all frame data.

**Transport.** Airframe moves data from point A to point B. It does not create data (that is the Capture Layer's job). It does not interpret data (that is the Consumer's job). It owns the space between creation and consumption: session negotiation, routing, timing, reliability, and delivery. This is the core competence.

**Platform.** Airframe is not an application. It is the substrate that applications are built on. The Android transmitter application and the Windows receiver application are the first two applications on the platform. They are not the platform itself. The platform is the set of layers, contracts, and protocols that any application can use to participate in media transport.

Put together: Airframe is the infrastructure for moving time-synchronized media between endpoints, reliably and efficiently, independent of how the media was produced or how it will be consumed.

### The Scope Boundary

Airframe owns the following:

| Responsibility | Description |
|---|---|
| Session management | Establishing, maintaining, and tearing down connections between endpoints |
| Device discovery | Finding available receivers on the network |
| Media routing | Directing captured frames from source to destination |
| Transport abstraction | Providing a stable interface over multiple underlying transport mechanisms |
| Timing and synchronization | Ensuring media arrives in order and on time |
| Reliability | Detecting, reporting, and recovering from failures |
| Diagnostics | Measuring and exposing system health in real time |

Airframe does not own:

| Non-Responsibility | Owner |
|---|---|
| What the camera captures | The operator |
| How the camera captures it | The Capture Layer (CameraX, platform APIs) |
| What the consumer does with the stream | OBS, recording software, preview windows |
| Network infrastructure | The operator's router, ISP, venue IT |
| Content decisions | The production team |

---

## 10. What Airframe Is Not

Chapter 7 established non-goals at the philosophy level. This chapter makes them concrete.

Airframe is not a replacement for OBS. OBS composites scenes, mixes audio, manages overlays, encodes output streams, and broadcasts to platforms. Airframe feeds into OBS as a source. They do not overlap. An operator who uses Airframe still uses OBS. They use Airframe *because* they use OBS—to get better source material into it.

Airframe is not a replacement for Zoom or Google Meet. Those tools are designed for symmetrical, bidirectional, multi-party communication with echo cancellation, noise suppression, speaker detection, and adaptive bitrate tuned for conversation. Airframe is designed for asymmetrical, unidirectional media delivery tuned for production quality. A Zoom call has many senders and many receivers. An Airframe session has sources and sinks.

Airframe is not a CDN. It does not distribute media to a large audience. It transports media from a small number of capture devices to a small number of receivers on a local network or direct connection. The receiver may feed into a system that distributes to a large audience (OBS streaming to YouTube), but that distribution is outside Airframe's scope.

Airframe is not a recording tool. It does not write media to disk. A consumer can record the media that Airframe delivers, but the recording responsibility belongs to the consumer, not to Airframe. This is a deliberate application of Invariant 5 (single responsibility).

Airframe is not a hardware product. It does not include cameras, capture cards, or networking equipment. It is a software platform that works with commodity hardware—phones and laptops that people already own. This is a product decision, not a technical limitation. The target users are churches, small creators, and independent production teams. They cannot afford dedicated broadcast hardware. Airframe meets them where they are.

---

## 11. User Personas

Three personas represent Airframe's primary users. They are ordered by urgency—the first persona defines the MVP, the second validates the product-market fit, the third proves platform viability.

### Persona 1: The Church Operator

**Name:** Marcus

**Context:** Marcus volunteers at a 300-member church. He runs the livestream every Sunday. His equipment: a Samsung Galaxy phone on a tripod, a laptop running OBS, a consumer Wi-Fi router, and a ring light. He has no formal production training. He learned OBS from YouTube tutorials.

**Current pain:** Marcus uses DroidCam. It works most of the time. But twice in the past month, the connection dropped during the sermon with no warning and no automatic recovery. He didn't notice for several minutes because DroidCam's last frame froze on screen, and OBS continued streaming the frozen image. The online congregation noticed before he did. He has no diagnostic tools to determine why the drop happened or how to prevent it.

**What Marcus needs from Airframe:**
- A connection that stays up for the full 90-minute service
- Automatic reconnection if the connection drops
- A clear visual indicator of connection health so he can see a problem forming before it becomes a failure
- Setup that takes under a minute: launch the app, see the receiver, tap to connect
- A viewfinder that shows him exactly what the audience sees
- The ability to answer "Is this going to work today?" during the pre-service sound check

**What Marcus does not need:**
- Multi-camera switching
- Advanced encoding controls
- Plugin extensibility
- Custom transport configuration

Marcus defines the MVP.

### Persona 2: The Solo Creator

**Name:** Priya

**Context:** Priya runs a YouTube channel about product design. She films talking-head content with a phone as her primary camera and occasionally uses a second phone for a top-down shot of her desk. She edits in DaVinci Resolve. She does not livestream—she records and edits.

**Current pain:** Priya's current workflow requires her to record on both phones independently, transfer the files to her laptop, and manually synchronize them in the editor. This adds 15–30 minutes to every editing session. She has tried DroidCam for the top-down shot, but the quality degradation is unacceptable for her polished content. She wants a way to capture both angles simultaneously and have them arrive at her laptop in sync.

**What Priya needs from Airframe:**
- High-quality, low-latency transport that preserves the camera's native quality
- Two simultaneous device connections with synchronized timing
- A receiver that can route each camera to a separate virtual device so DaVinci Resolve sees them as two independent sources
- Reliable operation for 2–3 hour recording sessions

**What Priya does not need:**
- Livestream-specific features (tally lights, broadcast status)
- OBS integration (she uses Resolve)
- Network scanning across subnets

Priya validates multi-device support and quality-critical use cases.

### Persona 3: The Production Engineer

**Name:** James

**Context:** James manages AV for a 2,000-seat conference venue. He runs 4–8 cameras per event, mixing live between them. His current setup uses SDI cameras, a hardware video switcher, and NDI for camera feeds positioned far from the control room. He has a background in broadcast engineering.

**What James needs from Airframe:**
- 4+ simultaneous camera sources from Android devices
- Sub-50 ms latency for live switching
- USB transport as a primary option for cameras near the control room (SDI-level reliability)
- WebRTC transport for cameras in remote positions (the balcony, the lobby)
- Centralized monitoring: all camera feeds, all diagnostics, all connection states in one interface
- API access for integrating Airframe into his existing production control system
- Plugin support for custom transport and custom consumers

**What James does not need:**
- Simplified setup (he wants full control)
- Automatic camera switching (he switches manually, by professional judgment)
- Consumer hardware assumptions (he has dedicated networking infrastructure)

James proves platform viability and drives the Plugin SDK.

---

## 12. Church Workflow

The church livestream is Airframe's foundational workflow. Every architectural decision must survive contact with this scenario. If a feature makes the church workflow harder, slower, or less reliable, the feature is wrong.

### Pre-Service Setup

Marcus arrives 30 minutes before the service. He positions his phone on the tripod, plugs in the charging cable, and launches Airframe.

The app opens to the Splash screen. The Airframe wordmark appears for 1.5 seconds while the app initializes the camera pipeline and begins network discovery. This is not a vanity screen—it covers the initialization time that would otherwise be a blank screen or a loading spinner.

The app transitions to the Discovery screen. The receiver on Marcus's laptop is already running (it was configured to launch with OBS). Discovery happens automatically via mDNS—the receiver broadcasts its presence, and the Android app finds it. Marcus sees "Studio Mac Mini" appear in the discovered devices list with signal strength and IP address.

He taps the device. The connection negotiates in under 2 seconds. The app transitions to the Preview screen.

### Pre-Service Check

The Preview screen is a full-bleed camera viewfinder. Marcus sees exactly what the audience will see—framing, exposure, white balance, focus. A small overlay shows "STANDBY" in the upper left. In the upper right, resolution and frame rate are displayed: "1080 · 60 fps."

On the Windows receiver, the OBS scene is already configured with Airframe as a source. The preview window shows the incoming feed. The metrics panel shows latency (24 ms), frame rate (59.9 fps), bitrate (8.4 Mb/s), and packet loss (0.0%). The signal quality bar reads 94%.

Marcus checks the framing, adjusts the tripod, and confirms the audio level indicator on the receiver shows the lapel microphone is active. The pre-service check is complete. Total time from app launch to confirmed readiness: under 45 seconds.

### During the Service

Marcus taps the record button on the Preview screen. The "STANDBY" badge transitions to a red "LIVE" badge with a pulsing indicator. A timer begins counting in the bottom HUD alongside the current bitrate.

For the next 90 minutes, Marcus does not touch the phone. His attention is on OBS, where he manages scene transitions, lower thirds, and output monitoring. The Airframe receiver continues to display real-time diagnostics in the metrics panel.

At minute 47, the Wi-Fi signal dips momentarily. The signal quality drops from 94% to 71%. The latency increases from 24 ms to 68 ms. The receiver's metrics panel reflects this in real time—the latency indicator changes from green to yellow. On the Android device, the system reduces the encoding bitrate automatically to accommodate the reduced bandwidth.

Three seconds later, the signal recovers. Bitrate returns to normal. Latency drops back to 26 ms. The transition is invisible in the OBS output. No frames were dropped. No operator intervention was required. Marcus did not notice because there was nothing to notice.

### Post-Service

Marcus taps the stop button. The "LIVE" badge returns to "STANDBY." The session summary is available on the receiver: total duration, average latency, peak latency, total dropped frames, reconnection events. Today's session: 1 h 31 m, avg latency 26 ms, peak 68 ms, 0 dropped frames, 0 reconnections.

Marcus closes the app. The session is complete.

### Failure Scenario

On a different Sunday, the Wi-Fi router reboots unexpectedly at minute 22. The connection drops.

The receiver immediately displays "Connection lost" with the timestamp and last known IP. The Android app detects the transport failure and enters automatic reconnection. The state badge shows "RECONNECTING" with an animated indicator.

The router comes back online 35 seconds later. The Android app re-discovers the receiver via mDNS, re-negotiates the transport, and re-establishes the session. Total interruption: 38 seconds. The interruption is visible in OBS as a frozen frame—the receiver holds the last good frame during disconnection rather than showing black.

On the receiver, a yellow notification appears: "Reconnected — 38 s interruption at 00:22:14." The diagnostics log records the event with full detail: transport error code, reconnection attempts, time to recovery.

Marcus saw the reconnection notification. He did not need to do anything. The system recovered. This is the difference.

---

## 13. Creator Workflow

The creator workflow extends the church workflow with two additional requirements: multi-device synchronization and quality-critical transport.

### Setup

Priya positions two phones. Phone A is her main camera on a tripod, facing her desk. Phone B is mounted above her desk on an articulating arm, pointed straight down.

She launches Airframe on both phones. Both discover the receiver on her editing machine. Both phones appear in the Discovery screen's device list. She connects Phone A, then Phone B.

The receiver shows two incoming feeds in a split-panel view. Each feed has independent diagnostics. The receiver registers each feed as a separate virtual camera device—"Airframe Camera 1" and "Airframe Camera 2." DaVinci Resolve sees both as input sources.

### Recording Session

Priya starts both streams simultaneously from the receiver's interface (the "Start All" action). Both cameras begin streaming with synchronized timestamps. The synchronization is managed by the Session Layer—both streams reference a shared session clock, so the receiver can align frames from both sources to the same point in time.

She records for two hours. When she opens the footage in Resolve, both camera angles are automatically aligned because the timestamps match. She no longer needs to manually sync by clapping or counting.

### Quality Requirements

Priya's content is published at 4K. She needs the transport to preserve the camera's native quality as closely as possible. Airframe supports configurable encoding—she sets both cameras to 4K30 at 20 Mbps. The transport handles this without modification. The Capture Layer is responsible for encoding at the requested quality. The Transport Layer delivers the encoded frames. Neither layer makes quality decisions for the other.

If her network cannot sustain two 4K30 streams simultaneously (40 Mbps aggregate), the diagnostics will show it clearly—rising latency, increasing packet loss. She can drop to 1080p60 or switch Phone B to USB transport (when available) to reduce wireless bandwidth demand.

---

## 14. Production Workflow

The production workflow validates Airframe as professional infrastructure.

### Setup

James is configuring a conference keynote. Four cameras: two on tripods in the audience (wireless, WebRTC transport), one on a jib arm near the stage (wired USB transport), and one handheld operated by a camera operator in the pit (wireless, WebRTC).

The receiver runs on a dedicated Windows workstation in the AV control room. Each camera appears as an independent source in the receiver interface. The multi-device monitoring view shows all four feeds simultaneously, each with independent diagnostics.

### During the Event

James's video switcher takes each Airframe virtual camera as an SDI input via a capture card. He cuts between cameras manually during the keynote. Latency on the wired USB cameras is under 15 ms. Latency on the wireless cameras is 35–60 ms.

Camera 3 (the jib) is on USB transport. It has dedicated bandwidth and zero packet loss. Camera 4 (the handheld) is on WebRTC over 5 GHz Wi-Fi. Its signal quality fluctuates as the operator moves through the venue. The diagnostics panel on the receiver shows Camera 4's latency rising when the operator is near the far wall. James radios the operator to stay closer to the access point.

### Integration

James's control system communicates with the Airframe receiver via the Plugin SDK's API. He has written a custom plugin that maps Airframe's connection status to tally lights on each camera—a green light when the camera is connected and transmitting, a red light when it is on-air (selected by the video switcher). The tally light integration required implementing a single event listener against Airframe's session event contract.

### Post-Event

The receiver's session log shows all four cameras' complete session history: connection times, disconnection events, latency distributions, encoding parameters, transport types. James exports this log for the venue's AV documentation.

---

## 15. MVP Scope

The MVP is defined by what Marcus needs. Everything else is future scope.

### MVP Includes

**Android transmitter application.**
- Camera capture via CameraX (rear camera, standard lens)
- H.264 encoding via MediaCodec hardware encoder
- AAC audio capture from device microphone
- Resolution options: 720p, 1080p, 4K
- Frame rate options: 24, 30, 60 fps
- Configurable bitrate: 2–20 Mbps
- Full-bleed camera preview with minimal HUD overlay
- Tally indicator (STANDBY / LIVE)
- Session timer and bitrate display during streaming
- Device discovery via mDNS (automatic) and manual IP entry
- Settings screen: resolution, frame rate, bitrate, audio toggle, auto-reconnect toggle

**Windows receiver application.**
- WebRTC stream reception
- Virtual camera device registration (visible to OBS and other capture software)
- Real-time diagnostics dashboard: latency, frame rate, bitrate, packet loss, signal quality
- Bitrate history chart (rolling 30-second window)
- Connection state management: connected, connecting, disconnected, error
- Automatic reconnection with configurable retry behavior
- Quality presets: Performance (lowest latency), Balanced (default), Quality (highest fidelity)
- Configurable listening port and receive buffer

**Transport.**
- WebRTC over local network (Wi-Fi)
- DTLS-SRTP encryption (enabled by default)
- ICE candidate negotiation
- STUN for NAT traversal on local network

**Protocol.**
- Session negotiation: offer/answer over WebSocket signaling
- Heartbeat and keepalive
- Graceful session teardown

### MVP Excludes

Everything not listed above. Specifically:

- Multi-device support (Stage Three)
- USB transport (Stage Three)
- Bluetooth transport (Stage Three)
- macOS receiver (future scope)
- Linux receiver (future scope)
- Screen capture (future scope)
- Plugin SDK (Stage Three)
- AI-assisted features (Stage Four)
- Recording functionality (consumer responsibility)
- Automatic quality adjustment based on network conditions (Stage Two)
- Multi-camera switching UI (Stage Three)

### MVP Quality Bar

The MVP ships when:

- A single-device session runs for 4 hours without operator intervention on a consumer Wi-Fi network
- End-to-end latency is under 100 ms at the Balanced preset
- Automatic reconnection succeeds within 10 seconds of transport failure
- The virtual camera device is recognized by OBS 29+ on Windows 10 and 11
- The Android app runs without thermal throttling for 2+ hours on a mid-range device (Pixel 7 class)

---

## 16. Future Scope

Future scope is separated from the MVP to prevent scope creep, but documented here to ensure architectural decisions in the MVP do not preclude these capabilities.

### Near Future (v0.2–v0.5)

**Adaptive bitrate encoding.** The Capture Layer monitors transport feedback (available bandwidth, packet loss rate) and adjusts encoding bitrate dynamically. This requires a feedback channel from the Transport Layer to the Capture Layer through a defined contract—not a direct dependency.

**Enhanced discovery.** mDNS discovery augmented with persistent device history. Previously connected receivers appear in a "Recent" section even before mDNS discovery completes. Receivers can be bookmarked with custom names.

**Session persistence.** If the Android app is backgrounded and returns to foreground, the session resumes without re-pairing. The session identity is maintained across app lifecycle events.

**Improved diagnostics.** Latency histogram (not just current value), packet loss burst detection, network path analysis (hop count, route changes), session quality scoring over time.

**macOS receiver.** A native macOS receiver application. The receiver architecture is platform-agnostic at the contract level—WebRTC reception, virtual camera registration, and diagnostic display are implemented against platform-specific APIs (DirectShow on Windows, CoreMediaIO on macOS) behind shared contracts.

### Medium Future (v0.5–v1.0)

**Multi-device sessions.** The Session Manager coordinates multiple capture devices within a single session. Each device maintains an independent transport connection. The receiver displays all feeds with unified diagnostics.

**USB transport.** USB-based media transport for wired reliability. Implemented as a new Transport contract implementation. The Capture Layer, Session Manager, and Receiver Layer are unaware of whether the underlying transport is WebRTC or USB.

**Bluetooth transport.** Low-bandwidth Bluetooth transport for short-range scenarios where Wi-Fi is unavailable. Primarily useful for audio-only streams or very low-resolution monitoring feeds.

**Screen capture source.** Android screen recording as a capture source. Implemented as a new Capture contract implementation using MediaProjection. The Transport, Session, and Receiver layers handle screen capture frames identically to camera frames.

**Quality presets per device.** In multi-device sessions, each camera can have independent quality settings. A wide shot might run at 4K30 while a close-up runs at 1080p60.

### Far Future (v1.0+)

**Plugin SDK.** Third-party extensibility across all layers. Detailed in Chapter 59.

**Transport auto-selection.** Airframe automatically selects the best available transport based on latency, bandwidth, reliability, and battery constraints.

**AI-assisted diagnostics.** The system identifies the root cause of quality degradation and suggests corrective actions. "Latency is rising because your phone is thermal-throttling. Reduce resolution to 1080p or move the phone out of direct sunlight."

**Predictive reconnection.** Airframe detects degrading transport conditions and proactively switches to an alternative transport before the current one fails.

**Spatial audio.** Transport of spatial audio fields alongside video, enabling consumers to reconstruct audio directionality.

**Depth and sensor data.** Transport of depth maps, LiDAR point clouds, and arbitrary sensor data alongside conventional video. The Capture contract is already agnostic to data type. This future scope requires extending the frame format to carry typed metadata alongside the primary media payload.

---

# Part III — Architecture

---

## 17. Layered Architecture

Airframe's architecture is a strict vertical stack. Data flows downward from reality to consumer. Control flows upward from session management to capture configuration. No layer skips another. No layer reaches across the stack.

```
┌─────────────────────────────────────────────┐
│                  Reality                     │
│          (the physical world)                │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│             Capture Layer                    │
│     CameraX · MediaProjection · Sensors      │
│                                              │
│  Responsibility: Acquire raw media from       │
│  hardware, encode, produce frames             │
└──────────────────┬──────────────────────────┘
                   │ CaptureOutput (frames)
                   ▼
┌─────────────────────────────────────────────┐
│             Airframe Core                    │
│     Session · Routing · Timing · Diagnostics │
│                                              │
│  Responsibility: Coordinate the pipeline,     │
│  manage sessions, track health                │
└──────────────────┬──────────────────────────┘
                   │ TransportInput (frames + metadata)
                   ▼
┌─────────────────────────────────────────────┐
│            Transport Layer                   │
│     WebRTC · USB · Bluetooth · Goldtooth     │
│                                              │
│  Responsibility: Move data between            │
│  endpoints over a physical medium             │
└──────────────────┬──────────────────────────┘
                   │ Wire (network / cable)
                   ▼
┌─────────────────────────────────────────────┐
│             Receiver Layer                   │
│     Demux · Decode · Virtual Device          │
│                                              │
│  Responsibility: Accept incoming data,        │
│  reconstruct frames, expose to consumers      │
└──────────────────┬──────────────────────────┘
                   │ ConsumerOutput (decoded frames)
                   ▼
┌─────────────────────────────────────────────┐
│               Consumer                       │
│         OBS · Preview · Recording            │
│                                              │
│  Not owned by Airframe                       │
└─────────────────────────────────────────────┘
```

### Layer Rules

**1. Downward data flow.** Media data flows from Capture to Transport to Receiver. No layer sends media data upward.

**2. Upward control flow.** Configuration and control signals flow from the Session Manager upward to the Capture Layer (e.g., "change resolution to 720p") and downward to the Transport Layer (e.g., "switch to USB"). Control signals do not carry media data.

**3. No skip connections.** The Capture Layer does not communicate directly with the Transport Layer. The Transport Layer does not communicate directly with the Consumer. Every interaction passes through the adjacent layer or through the Session Manager, which has visibility into all layers.

**4. Contract boundaries.** Each arrow in the diagram represents a contract—a defined interface with specified inputs, outputs, and behavioral guarantees. The contract is stable. The implementation behind it is replaceable.

**5. Independent lifecycle.** Each layer can be started, stopped, and restarted independently. The Capture Layer can restart (e.g., camera switch) without tearing down the transport connection. The Transport Layer can reconnect without interrupting the capture pipeline. Layer failures are isolated.

### Architecture Decision Record: Why Layered?

**Context.** The initial prototype was a monolithic Android application that captured camera frames, encoded them, established a WebRTC connection, and sent the data to a desktop receiver. The prototype worked but had several problems: changing the transport required touching capture code, transport errors crashed the capture pipeline, and testing any single component required the full stack.

**Decision.** Adopt a strict layered architecture with contract-based boundaries between layers.

**Consequences.**
- *Positive:* Each layer can be tested independently. New transports can be added without modifying capture code. Layer failures are isolated.
- *Negative:* Abstraction overhead. More interfaces to maintain. Crossing layer boundaries incurs (minor) performance cost. The system has more moving parts.
- *Accepted tradeoff:* The abstraction cost is constant and bounded. The coupling cost in a monolith grows with every feature addition.

---

## 18. Capture Layer

The Capture Layer is the boundary between physical reality and the Airframe pipeline. It acquires media from hardware, encodes it, and produces standardized frames that the rest of the system can handle without knowing what produced them.

### Responsibilities

1. **Hardware access.** Open and configure the capture hardware (camera sensor, microphone, screen recorder).
2. **Encoding.** Encode raw sensor output into a compressed format suitable for transport (H.264 for video, AAC for audio).
3. **Frame production.** Package encoded data into Airframe frames with timestamps and metadata.
4. **Configuration.** Accept runtime configuration changes (resolution, frame rate, bitrate) without restarting the entire pipeline.
5. **Resource management.** Handle hardware lifecycle—sensor open/close, power management, thermal throttling response.

### What the Capture Layer Does Not Do

- It does not know where frames go after production. It produces frames and hands them to Airframe Core.
- It does not manage network connections. That is the Transport Layer's responsibility.
- It does not manage session state. That is the Session Manager's responsibility.
- It does not apply creative effects to media content. It encodes faithfully.

### MVP Capture Implementation: CameraX + MediaCodec

The MVP Capture Layer targets Android using CameraX for camera access and MediaCodec for hardware-accelerated encoding.

**CameraX** provides a lifecycle-aware camera abstraction over Android's Camera2 API. It handles device-specific quirks, lens selection, auto-focus, auto-exposure, and white balance. It surfaces a preview stream for the on-screen viewfinder and an analysis/capture stream for encoding.

**MediaCodec** provides hardware-accelerated H.264 encoding through the device's video encoder chipset. On modern Android devices (Pixel 7+, Samsung Galaxy S22+), this delivers 1080p60 encoding at 8–20 Mbps with minimal CPU load and acceptable thermal performance.

### Architecture Decision Record: Why CameraX over Camera2?

**Context.** Android provides two camera APIs: Camera2 (low-level, full control) and CameraX (Jetpack library, higher-level abstraction). Camera2 offers more granular control over sensor parameters. CameraX offers lifecycle management, device compatibility handling, and simpler setup.

**Decision.** Use CameraX for the MVP. Evaluate Camera2 for specific advanced use cases in later stages.

**Consequences.**
- *Positive:* Faster development. Built-in device compatibility. Lifecycle management prevents resource leaks. Preview and capture use cases are first-class constructs.
- *Negative:* Less granular control over sensor parameters. Some advanced features (manual focus ramping, per-frame exposure control) are harder or impossible through CameraX.
- *Accepted tradeoff:* The MVP does not require manual sensor control. CameraX covers 100% of MVP capture requirements. If advanced sensor control becomes necessary, a Camera2-based Capture implementation can be built behind the same Capture contract.

### Architecture Decision Record: Why MediaCodec over Software Encoding?

**Context.** Video encoding can be performed in software (e.g., x264, FFmpeg) or in hardware (via the device's dedicated video encoder chip through MediaCodec). Software encoding offers more control over encoding parameters. Hardware encoding offers lower CPU usage, lower power consumption, and lower thermal output.

**Decision.** Use MediaCodec hardware encoding for all video encoding in the Capture Layer.

**Consequences.**
- *Positive:* Dramatically lower CPU usage (hardware encoder runs on dedicated silicon, not the main CPU). Lower thermal output—critical for a phone that may stream for 90+ minutes. Lower power consumption.
- *Negative:* Hardware encoders have device-specific quirks. Encoding parameter support varies by chipset. Some advanced encoding features (B-frames, multi-pass) may not be available on all devices.
- *Accepted tradeoff:* For the target devices (modern Android phones, 2022+), hardware H.264 encoding is mature and reliable. The encoding quality at 8–20 Mbps is more than adequate for the target use cases.

### Capture Pipeline

```
Camera Sensor
      │
      ▼
   CameraX
   (preview + capture streams)
      │
      ├──────────► Preview Surface (on-screen viewfinder)
      │
      ▼
   MediaCodec
   (H.264 hardware encoder)
      │
      ▼
   Frame Packager
   (timestamp + metadata + encoded data)
      │
      ▼
   CaptureOutput
   (→ Airframe Core)
```

Audio follows a parallel pipeline:

```
Microphone
      │
      ▼
   AudioRecord
      │
      ▼
   MediaCodec
   (AAC hardware encoder)
      │
      ▼
   Frame Packager
      │
      ▼
   CaptureOutput
   (→ Airframe Core)
```

Video and audio frames are produced independently and timestamped against a shared monotonic clock. Synchronization happens downstream in Airframe Core, not in the Capture Layer.

---

## 19. Airframe Core

Airframe Core is the brain of the system. It does not capture media. It does not transport media. It coordinates the layers that do.

### Responsibilities

1. **Session management.** Create, maintain, and tear down sessions between capture endpoints and receivers.
2. **Routing.** Direct frames from capture sources to the appropriate transport connections.
3. **Timing.** Maintain a session clock and timestamp all frames against it. Synchronize multiple capture sources within a session.
4. **Diagnostics.** Collect, aggregate, and expose health metrics from all layers—latency, bitrate, packet loss, frame rate, connection state.
5. **Configuration.** Apply and propagate configuration changes across layers—resolution changes, transport switches, quality preset adjustments.
6. **Lifecycle coordination.** Manage the startup and shutdown sequence of all layers. Ensure layers start in the correct order and stop gracefully.

### The Session Manager

The Session Manager is the central component of Airframe Core. It owns the session—the logical connection between one or more capture sources and one or more receivers.

A session has an identity (a unique session ID), a state (see Chapter 32 for the full state machine), a clock (monotonic, shared across all participants), and a set of participants (capture endpoints and receiver endpoints).

```
                  ┌─────────────────────┐
                  │   Session Manager    │
                  │                      │
                  │  • session ID        │
                  │  • session state     │
                  │  • session clock     │
                  │  • participants[]    │
                  │  • diagnostics       │
                  │                      │
     ┌────────────┤  Controls:           │
     │            │  • Capture Layer     │
     │            │  • Transport Layer   │
     │            │  • Receiver Layer    │
     │            └─────────┬───────────┘
     │                      │
     ▼                      ▼
  Capture              Transport
  Config               Config
```

### Routing

In the MVP (single device, single receiver), routing is trivial: frames from the one capture source go to the one transport connection. But the routing system is designed for multi-device sessions from the start.

Each capture source is identified by a `SourceId`. Each receiver connection is identified by a `SinkId`. The routing table maps sources to sinks. In the MVP, the table has one entry. In a multi-device session, each source maps to the shared session sink (or to individual sinks for multi-receiver setups).

```
Routing Table (MVP):
┌──────────────┬──────────────┐
│   SourceId   │    SinkId    │
├──────────────┼──────────────┤
│  camera-0    │  receiver-0  │
└──────────────┴──────────────┘

Routing Table (Multi-device):
┌──────────────┬──────────────┐
│   SourceId   │    SinkId    │
├──────────────┼──────────────┤
│  camera-0    │  receiver-0  │
│  camera-1    │  receiver-0  │
│  camera-2    │  receiver-0  │
│  overhead-0  │  receiver-0  │
└──────────────┴──────────────┘
```

The routing table is a runtime construct, not a compile-time configuration. Sources and sinks can be added and removed during an active session without restarting the pipeline.

### Timing

Airframe Core maintains a monotonic session clock. All frames from all capture sources within a session are timestamped against this clock. This enables:

- **Frame ordering.** Frames from a single source arrive in order. Frames from multiple sources can be interleaved correctly.
- **Synchronization.** A receiver displaying two camera feeds can align them temporally.
- **Latency measurement.** The difference between the session timestamp when a frame was produced and the wall-clock time when it was received gives an accurate latency measurement.

The session clock is established during session negotiation. Both endpoints agree on a reference point. Clock drift between the Android device and the Windows receiver is expected to be negligible for session durations under 24 hours (sub-millisecond drift on modern hardware). For longer sessions or higher precision requirements, NTP-based clock synchronization can be added as a future enhancement without changing the timing contract.

---

## 20. Transport Layer

The Transport Layer moves data between endpoints over a physical medium. It is the layer most likely to have multiple implementations, which is why transport agnosticism is a design invariant.

### Responsibilities

1. **Connection establishment.** Negotiate a connection with the remote endpoint using the signaling protocol.
2. **Data transmission.** Send encoded frames from the local endpoint to the remote endpoint.
3. **Congestion management.** Adapt to network conditions—manage send rates, handle backpressure, report available bandwidth.
4. **Encryption.** Encrypt data in transit. Decrypt data on receipt.
5. **Error detection.** Detect packet loss, corruption, and connection failures. Report these to Airframe Core.

### What the Transport Layer Does Not Do

- It does not know what the data represents. Video frames, audio frames, and metadata are all opaque byte sequences to the Transport Layer.
- It does not decide what to send. The routing table in Airframe Core determines which frames go to which transport connections.
- It does not manage sessions. The Session Manager manages sessions. The Transport Layer manages connections.

A connection is not a session. A session is a logical construct that may span multiple connection attempts (e.g., after a reconnection). A connection is a physical construct that represents an active data path between two endpoints.

### MVP Transport: WebRTC

The MVP transport uses WebRTC for media delivery and WebSocket for signaling.

**Why WebRTC.** WebRTC provides a complete real-time media transport stack: ICE for NAT traversal, DTLS for encryption, SRTP for media delivery, and built-in congestion control (Google Congestion Control / GCC). It is designed for exactly this use case—low-latency, real-time media transport between endpoints on a local network or across the internet.

**Why not raw UDP.** Raw UDP would give full control over the transport protocol but would require reimplementing NAT traversal, encryption, congestion control, and media framing. WebRTC provides all of these as a proven, tested stack. The engineering effort to match WebRTC's maturity with a custom protocol is not justified at the MVP stage.

**Why not TCP.** TCP's reliability guarantees (in-order delivery, retransmission) introduce head-of-line blocking that is unacceptable for real-time media. A single lost packet can stall the entire stream while TCP waits for retransmission. Real-time media prefers to drop a frame and continue rather than stall.

### Architecture Decision Record: Why WebRTC?

**Context.** Several transport options were evaluated: raw UDP, raw TCP, WebRTC, QUIC, NDI, and SRT.

**Decision.** Use WebRTC as the MVP transport.

**Consequences.**
- *Positive:* Proven technology for real-time media. Built-in NAT traversal (ICE), encryption (DTLS-SRTP), and congestion control (GCC). Available on both Android (via Google's WebRTC library) and Windows (via libwebrtc). Large ecosystem of tools and documentation.
- *Negative:* WebRTC carries complexity beyond what Airframe needs (e.g., the full SDP offer/answer model is heavier than necessary for a point-to-point connection). WebRTC libraries are large (~20 MB on Android). Some WebRTC internals are poorly documented.
- *Accepted tradeoff:* The unused complexity does not impose runtime cost. The library size is acceptable for a dedicated streaming application. The stability and maturity of WebRTC outweigh the overhead.

### Signaling

WebRTC requires a signaling channel to exchange SDP offers/answers and ICE candidates before the media connection can be established. Airframe uses WebSocket for signaling.

```
Android                           Windows Receiver
   │                                      │
   │   1. WebSocket connect               │
   │ ──────────────────────────────────►   │
   │                                      │
   │   2. SDP Offer                       │
   │ ──────────────────────────────────►   │
   │                                      │
   │   3. SDP Answer                      │
   │ ◄────────────────────────────────── │
   │                                      │
   │   4. ICE Candidates (trickle)        │
   │ ◄──────────────────────────────────► │
   │                                      │
   │   5. DTLS Handshake                  │
   │ ◄══════════════════════════════════► │
   │                                      │
   │   6. SRTP Media Flow                 │
   │ ══════════════════════════════════►   │
```

The WebSocket signaling connection is maintained throughout the session for control messages (configuration changes, heartbeats, graceful teardown). Media data does not flow over the WebSocket—only signaling and control messages.

### Future Transports

The Transport contract is designed to accept additional implementations without changes to other layers:

| Transport | Medium | Use Case | Status |
|-----------|--------|----------|--------|
| WebRTC | Wi-Fi / Internet | Wireless, primary MVP transport | MVP |
| USB | USB cable | Wired, maximum reliability | Stage Three |
| Bluetooth | Bluetooth | Short-range, low-power | Stage Three |
| Goldtooth | TBD | Speculative future transport | Research |

Each transport implements the same contract: `connect()`, `send(frame)`, `disconnect()`, `onStateChange()`, `getMetrics()`. Airframe Core does not know or care which transport is active.

---

## 21. Receiver Layer

The Receiver Layer is the mirror of the Capture Layer. Where the Capture Layer converts physical reality into encoded frames, the Receiver Layer converts encoded frames back into a format that consumers can use.

### Responsibilities

1. **Connection acceptance.** Listen for incoming transport connections and accept authenticated sessions.
2. **Demultiplexing.** Separate incoming data into video frames, audio frames, and control messages.
3. **Decoding.** Decode compressed media (H.264 → raw video, AAC → raw audio) for preview and virtual device output.
4. **Virtual device registration.** Register a virtual camera device with the operating system so that OBS, Resolve, and other applications see Airframe as a camera source.
5. **Diagnostic collection.** Measure receive-side metrics (jitter, decode time, frame drop rate) and report them to the diagnostics system.

### Virtual Camera Device

The virtual camera device is the integration point between Airframe and the consumer ecosystem. On Windows, this is implemented as a DirectShow filter that registers as a video capture device. OBS, Zoom, Teams, Resolve, and any application that enumerates video capture devices will see "Airframe Camera" as an available source.

The virtual camera device outputs raw frames (NV12 or I420 color space) at the stream's native resolution and frame rate. The consumer application treats it identically to a physical USB webcam or capture card.

### Architecture Decision Record: Why Virtual Camera Over Direct Integration?

**Context.** Two approaches for delivering video to consumers: (1) a virtual camera device that appears as a system-level video source, or (2) direct integration plugins for specific applications (OBS plugin, Resolve plugin, etc.).

**Decision.** Use a virtual camera device as the primary consumer interface.

**Consequences.**
- *Positive:* Works with every application that supports video input devices, not just OBS. No per-application plugin maintenance. One implementation serves all consumers.
- *Negative:* Virtual camera devices have limitations—they cannot carry arbitrary metadata (timecodes, device names) through the video device interface. Some applications may not enumerate virtual cameras reliably.
- *Accepted tradeoff:* Application-specific plugins can be built later (via the Plugin SDK) for consumers that need richer integration. The virtual camera device provides the broadest compatibility with the least implementation effort.

### Receiver Pipeline

```
Transport Layer
      │
      ▼
   Demuxer
   (separate video / audio / control)
      │
      ├──────────► Control Messages → Session Manager
      │
      ├──────────► Audio Frames → Audio Decoder → Audio Output
      │
      ▼
   Video Decoder
   (H.264 → raw frames)
      │
      ├──────────► Preview Window (on-screen)
      │
      ▼
   Virtual Camera Device
   (DirectShow / CoreMediaIO)
      │
      ▼
   Consumer Application
   (OBS, Resolve, etc.)
```

---

## 22. Rendering Layer

The Rendering Layer is not a transport layer. It is the presentation layer on both the Android transmitter and the Windows receiver that displays information to the operator.

On the Android side, the Rendering Layer displays:
- The camera viewfinder (full-bleed preview)
- The HUD overlay (tally, resolution, frame rate, timer, bitrate)
- The Discovery screen
- The Settings screen

On the Windows side, the Rendering Layer displays:
- The preview window (live feed from the receiver)
- The diagnostics dashboard (latency, bitrate, packet loss, signal quality, bitrate chart)
- The device info strip
- The settings panel

The Rendering Layer reads state from Airframe Core (session state, diagnostic metrics, connection state) and presents it. It does not modify state—user interactions in the Rendering Layer dispatch commands to Airframe Core, which then executes them.

This separation is important. The Rendering Layer is a view. Airframe Core is the model and controller. If the Rendering Layer were removed entirely, Airframe would still function—it would just have no operator-facing interface. This is exactly the architecture that the Plugin SDK depends on: a headless Airframe session with a custom consumer is a valid deployment.

---

## 23. Session Lifecycle

A session is the primary unit of work in Airframe. It represents a complete connection lifecycle from discovery to teardown.

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │
│  IDLE    │────►│DISCOVERING│────►│CONNECTING│────►│ ACTIVE   │
│          │     │          │     │          │     │          │
└──────────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
                      │               │               │
                      │               │               ▼
                      │               │          ┌──────────┐
                      │               │          │          │
                      │               │          │STREAMING │
                      │               │          │          │
                      │               │          └────┬─────┘
                      │               │               │
                      ▼               ▼               ▼
                 ┌──────────┐    ┌──────────┐    ┌──────────┐
                 │          │    │          │    │          │
                 │ FAILED   │    │ FAILED   │    │RECOVERING│
                 │          │    │          │    │          │
                 └──────────┘    └──────────┘    └────┬─────┘
                                                      │
                                                      ▼
                                                 ┌──────────┐
                                                 │          │
                                                 │  ENDED   │
                                                 │          │
                                                 └──────────┘
```

### States

**IDLE.** The application has launched but no session activity has begun. The Capture Layer may or may not be initialized.

**DISCOVERING.** The system is scanning for available receivers via mDNS. Discovered receivers are presented to the operator. The system remains in this state until the operator selects a receiver or enters an IP manually.

**CONNECTING.** A receiver has been selected. The signaling channel (WebSocket) is being established and the transport (WebRTC) is being negotiated. This state covers SDP exchange, ICE candidate gathering, DTLS handshake, and initial media flow setup.

**ACTIVE.** The transport connection is established and media can flow, but the operator has not yet started streaming. The camera preview is live. Diagnostics are active. The system is ready.

**STREAMING.** Media is flowing from the Capture Layer through the Transport Layer to the Receiver. The tally indicator shows LIVE. The session clock is running. Diagnostics are being recorded.

**RECOVERING.** The transport connection was lost during streaming. The system is attempting automatic reconnection. The Capture Layer continues producing frames (they are buffered or discarded during recovery). The Receiver holds the last good frame.

**FAILED.** Recovery was unsuccessful after the configured number of retry attempts. The session cannot continue without operator intervention.

**ENDED.** The session was terminated gracefully by the operator or by the receiver. Session diagnostics are finalized and available for review.

### Transitions

| From | To | Trigger |
|------|-----|---------|
| IDLE | DISCOVERING | App launch / operator action |
| DISCOVERING | CONNECTING | Operator selects receiver |
| CONNECTING | ACTIVE | Transport negotiation complete |
| CONNECTING | FAILED | Transport negotiation timeout (10 s) |
| ACTIVE | STREAMING | Operator starts stream |
| STREAMING | ACTIVE | Operator stops stream |
| STREAMING | RECOVERING | Transport failure detected |
| RECOVERING | STREAMING | Transport re-established |
| RECOVERING | FAILED | Max retry attempts exceeded |
| Any | ENDED | Operator disconnect / receiver shutdown |

---

## 24. Device Discovery

Device discovery is how the Android transmitter finds available receivers on the network. The MVP supports two discovery mechanisms: mDNS (automatic) and manual IP entry.

### mDNS (DNS-SD)

The receiver advertises its presence on the local network using mDNS (multicast DNS) with DNS-SD (DNS Service Discovery). The service type is `_airframe._tcp`.

```
Service Advertisement:
┌─────────────────────────────────────────────┐
│  Service Type: _airframe._tcp               │
│  Instance:     Studio Mac Mini              │
│  Host:         studio-mac.local             │
│  Port:         4747                         │
│  TXT Record:                                │
│    version=0.1.0                            │
│    protocol=webrtc                          │
│    capabilities=video,audio                 │
└─────────────────────────────────────────────┘
```

The Android app listens for `_airframe._tcp` services using Android's NSD (Network Service Discovery) API. When a service is discovered, it appears in the Discovery screen with the instance name, IP address, and signal strength.

### Architecture Decision Record: Why mDNS?

**Context.** Several discovery mechanisms were evaluated: mDNS/DNS-SD, SSDP (UPnP), custom broadcast protocol, cloud-based device registry.

**Decision.** Use mDNS/DNS-SD for local network discovery.

**Consequences.**
- *Positive:* Standard protocol, well-supported on Android (NSD API), Windows (Bonjour/mDNS Responder), and macOS (native). Does not require a server. Works entirely on the local network. Widely used by other production tools (AirPlay, Chromecast, Sonos).
- *Negative:* Requires multicast support on the network. Some corporate networks disable multicast. Discovery is limited to the local subnet by default.
- *Accepted tradeoff:* The target environments (churches, home offices, small venues) use consumer routers that support multicast. For networks that block multicast, manual IP entry provides a fallback.

### Manual IP Entry

When mDNS is unavailable or the receiver is on a different subnet, the operator can enter the receiver's IP address manually. The Android app validates the IP, attempts a WebSocket connection to the signaling port, and transitions to CONNECTING if successful.

The manual entry field supports both IPv4 addresses (`192.168.1.42`) and hostnames (`studio-mac.local`).

---

## 25. Pairing

Pairing is the process of establishing mutual trust between a transmitter and a receiver. In the MVP, pairing is implicit—the transmitter connects to a discovered receiver, and the receiver accepts the connection. There is no authentication challenge.

### MVP Pairing Flow

```
Android                              Receiver
   │                                      │
   │  1. Discover via mDNS                │
   │  ◄ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │ (service advertisement)
   │                                      │
   │  2. Operator taps device             │
   │                                      │
   │  3. WebSocket connect                │
   │  ─────────────────────────────────►  │
   │                                      │
   │  4. Session request                  │
   │  ─────────────────────────────────►  │
   │                                      │
   │  5. Session accepted                 │
   │  ◄─────────────────────────────────  │
   │                                      │
   │  6. Transport negotiation begins     │
   │  ◄════════════════════════════════►  │
```

### Future: Authenticated Pairing

Post-MVP, pairing will support authentication:

**PIN-based pairing.** The receiver displays a 6-digit PIN. The operator enters the PIN on the Android app. The PIN is verified during session negotiation. This prevents unauthorized devices from connecting to the receiver.

**Certificate-based pairing.** After initial PIN-based pairing, the devices exchange certificates. Subsequent connections from the same device are authenticated automatically using the stored certificate. This provides security without repeated PIN entry.

**Device allowlist.** The receiver maintains a list of trusted devices. Only devices on the allowlist can establish sessions. New devices require explicit receiver-side approval.

---

## 26. Diagnostics

Diagnostics are not a secondary feature. They are a first-class system that runs continuously from the moment a session begins until it ends.

### Collected Metrics

| Metric | Source | Update Frequency | Display |
|--------|--------|------------------|---------|
| Latency (ms) | Transport round-trip measurement | Every 1 s | Numeric + color indicator |
| Frame rate (fps) | Capture output counter / Receiver input counter | Every 1 s | Numeric |
| Bitrate (Mb/s) | Transport byte counter | Every 1 s | Numeric + rolling chart |
| Packet loss (%) | Transport loss counter | Every 1 s | Numeric + color indicator |
| Signal quality (%) | Composite of latency, loss, jitter | Every 1 s | Progress bar + label |
| Jitter (ms) | Inter-frame arrival time variance | Every 5 s | Internal (feeds signal quality) |
| Decode time (ms) | Receiver decode timer | Every 1 s | Internal (feeds diagnostics log) |
| Buffer health | Receiver buffer occupancy | Every 1 s | Internal |

### Signal Quality Composite

Signal quality is a composite metric designed for operators who may not understand individual network metrics. It combines latency, packet loss, and jitter into a single 0–100% score with a human-readable label.

```
Score Calculation:
  base = 100
  base -= latency_penalty(latency_ms)
  base -= loss_penalty(packet_loss_pct)
  base -= jitter_penalty(jitter_ms)
  score = clamp(base, 0, 100)

Where:
  latency_penalty:  0 if <30ms, 5 if <50ms, 15 if <80ms, 30 if <120ms, 50 if >120ms
  loss_penalty:     0 if <0.1%, 10 if <0.5%, 25 if <1%, 40 if <2%, 60 if >2%
  jitter_penalty:   0 if <5ms, 5 if <10ms, 15 if <20ms, 30 if >20ms

Labels:
  90-100%  Excellent
  70-89%   Good
  50-69%   Fair
  30-49%   Poor
  0-29%    Critical
```

### Diagnostics Log

All metrics are logged with timestamps for post-session analysis. The log format is structured JSON, one entry per second:

```json
{
  "ts": "2026-07-06T10:32:47.123Z",
  "session_id": "af-sess-7f3a2b",
  "latency_ms": 24,
  "fps": 59.94,
  "bitrate_mbps": 8.4,
  "pkt_loss_pct": 0.0,
  "signal_quality": 94,
  "jitter_ms": 2.1,
  "decode_time_ms": 3.2,
  "buffer_frames": 2
}
```

---

## 27. Security

Airframe handles live media streams that may contain sensitive content (church services, private meetings, corporate presentations). Security is a baseline requirement, not an optional enhancement.

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| Eavesdropping on media stream | DTLS-SRTP encryption (Chapter 28) |
| Unauthorized device connecting to receiver | Pairing authentication (Chapter 25, post-MVP) |
| Man-in-the-middle on signaling channel | WSS (WebSocket over TLS) for signaling |
| Replay attacks on session negotiation | Session IDs with expiry, nonce-based challenges |
| Denial of service on receiver port | Connection rate limiting, max concurrent sessions |
| Physical access to device | Android app does not store media; sensitive data encrypted at rest |

### Security Principles

**Encryption by default.** All media transport is encrypted. There is no option to disable encryption in the production build. Development builds may offer unencrypted mode for debugging, controlled by a build flag that is never set in release builds.

**Minimal trust.** The transmitter does not trust the receiver to be who it claims. The receiver does not trust the transmitter to be authorized. Trust is established through the pairing process and maintained through cryptographic session tokens.

**No persistent credentials in logs.** Diagnostics logs do not contain session keys, pairing PINs, or certificate material. Session IDs are opaque identifiers with no embedded information.

---

## 28. Encryption

### Transport Encryption: DTLS-SRTP

Media streams are encrypted using SRTP (Secure Real-time Transport Protocol) with keys exchanged via DTLS (Datagram Transport Layer Security). This is the standard WebRTC encryption mechanism and is mandatory per the WebRTC specification.

**DTLS** performs a handshake over UDP to establish a shared secret between the transmitter and receiver. The handshake uses ephemeral Diffie-Hellman key exchange with self-signed certificates (for the MVP; CA-signed certificates are a future enhancement).

**SRTP** uses the shared secret from DTLS to encrypt each RTP media packet. Encryption is AES-128-CM (Counter Mode). Authentication is HMAC-SHA1.

```
Encryption Stack:

Application Data (H.264 frames, AAC audio)
         │
         ▼
      SRTP
      (AES-128-CM encryption, HMAC-SHA1 authentication)
         │
         ▼
      DTLS
      (key exchange, certificate verification)
         │
         ▼
      UDP
      (network transport)
```

### Signaling Encryption

The WebSocket signaling channel carries SDP offers/answers and ICE candidates. In the MVP on a local network, the signaling channel uses plaintext WebSocket (`ws://`). Post-MVP, the signaling channel upgrades to TLS-encrypted WebSocket (`wss://`) with certificate pinning.

This is an acceptable MVP tradeoff because the signaling channel operates on a local network where the primary threat (remote eavesdropping) is mitigated by network isolation. The media stream itself is always encrypted regardless of the signaling channel's encryption state.

---

## 29. Reliability

Reliability in Airframe operates at three levels: prevention, detection, and recovery.

### Prevention

**Congestion control.** WebRTC's built-in congestion control (GCC — Google Congestion Control) monitors network conditions and adjusts the send rate to avoid overwhelming the network. If available bandwidth decreases, GCC reduces the send rate before packet loss occurs.

**Buffer management.** The receiver maintains a configurable receive buffer (default: 80 ms). The buffer absorbs jitter—short-term variations in packet arrival time—so that the consumer sees a smooth frame rate even when individual packets arrive irregularly.

**Heartbeat.** A heartbeat message is sent over the signaling channel every 5 seconds. If the receiver does not receive a heartbeat within 15 seconds, it considers the connection lost and enters recovery. If the transmitter does not receive a heartbeat acknowledgment within 15 seconds, it enters recovery.

### Detection

**Packet loss detection.** SRTP sequence numbers allow the receiver to detect missing packets. Packet loss below 0.5% is normal and compensated by the buffer. Loss above 2% indicates network degradation and triggers a diagnostic alert.

**Frame drop detection.** The receiver tracks expected vs. received frame count. Dropped frames are logged and counted. Sustained frame drops (>5% over a 10-second window) trigger a quality warning.

**Latency spike detection.** If measured latency exceeds 3× the session average for more than 3 consecutive measurements, the system flags a latency spike and logs the event.

### Recovery

**Automatic reconnection.** When the transport connection is lost, the system enters the RECOVERING state and attempts to re-establish the connection. The reconnection strategy uses exponential backoff:

```
Attempt 1:  immediate
Attempt 2:  1 second delay
Attempt 3:  2 seconds delay
Attempt 4:  4 seconds delay
Attempt 5:  8 seconds delay
(max 5 attempts, then FAILED)
```

During reconnection, the Capture Layer continues operating (the camera stays on, frames are produced but discarded or buffered). The Receiver holds the last good frame. This means the consumer (OBS) sees a freeze rather than black—a freeze is recoverable; black suggests the source has been removed.

**Session continuity.** When the transport reconnects, the session resumes with the same session ID and session clock. The session is not restarted. Diagnostics continue accumulating from the same baseline. The operator does not need to re-pair.

---

## 30. Error Recovery

Errors in Airframe fall into three categories: transient, persistent, and fatal. Each category has a different recovery strategy.

### Transient Errors

Transient errors are short-lived disruptions that resolve without intervention. Examples: a brief Wi-Fi signal dip, a momentary CPU spike on the encoding device, a single burst of packet loss.

**Strategy:** Absorb and continue. The receive buffer absorbs jitter. The encoder recovers from CPU spikes by dropping a frame and continuing. Packet loss bursts are compensated by forward error correction (when available) or accepted as minor quality degradation.

**Operator visibility:** Transient errors appear as momentary changes in the diagnostics panel (latency spike, quality dip) but do not generate alerts unless they recur.

### Persistent Errors

Persistent errors are sustained conditions that degrade quality but do not terminate the session. Examples: sustained high packet loss (1–5%), chronically high latency (>150 ms), thermal throttling reducing encoding quality.

**Strategy:** Adapt and notify. The system adapts by reducing encoding bitrate, adjusting buffer size, or requesting the operator to change configuration. The diagnostics panel shows sustained warning indicators. A notification describes the condition and suggests corrective action.

**Corrective actions suggested to operator:**
- "Packet loss is sustained at 2.3%. Move the phone closer to the router or reduce resolution."
- "Latency is averaging 180 ms. Switch to Performance quality preset for lower latency."
- "Device is thermal-throttling. Reduce resolution to 720p or move the phone out of direct sunlight."

### Fatal Errors

Fatal errors terminate the session and cannot be recovered automatically. Examples: receiver application crash, network adapter failure, phone battery death.

**Strategy:** Fail clearly. The system enters the FAILED state and displays a clear error message with the cause, timestamp, and recommended action. The diagnostics log records the full error chain.

**Error messages are specific:**
- ✗ "Connection lost" (too vague)
- ✓ "Receiver at 192.168.1.42 stopped responding at 10:32:47. Last successful heartbeat was 18 seconds ago. Check that the receiver application is running."

---

# Part IV — Interfaces

---

## 31. Core Interfaces

Interfaces are the contracts between layers. They define what a layer provides and what it requires—without specifying how. Every layer boundary in Airframe is defined by an interface. Implementations are injected at runtime. Tests mock at interface boundaries.

The four core interfaces are Capture, Transport, Receiver, and Renderer.

### Capture Interface

The Capture interface abstracts media acquisition. Any source that can produce timestamped frames—camera, screen, sensor—implements this interface.

```
interface CaptureSource {

    // Lifecycle
    fun initialize(config: CaptureConfig): Result<Unit>
    fun start(): Result<Unit>
    fun stop(): Result<Unit>
    fun release()

    // Output
    fun setFrameCallback(callback: (Frame) -> Unit)

    // Configuration (runtime-mutable)
    fun updateConfig(config: CaptureConfig): Result<Unit>
    fun getCapabilities(): CaptureCapabilities

    // State
    fun getState(): CaptureState
    fun setStateCallback(callback: (CaptureState) -> Unit)
}
```

```
data class CaptureConfig(
    val resolution: Resolution,       // e.g., 1920x1080
    val frameRate: Int,               // e.g., 60
    val bitrate: Int,                 // e.g., 8_000_000 (bits/s)
    val codec: VideoCodec,            // e.g., H264
    val audioEnabled: Boolean,
    val audioBitrate: Int,            // e.g., 128_000 (bits/s)
    val audioCodec: AudioCodec,       // e.g., AAC
)

data class CaptureCapabilities(
    val supportedResolutions: List<Resolution>,
    val supportedFrameRates: List<Int>,
    val bitrateRange: IntRange,
    val supportedCodecs: List<VideoCodec>,
    val hasAudio: Boolean,
    val hasTorch: Boolean,
    val supportedLenses: List<LensId>,
)

enum class CaptureState {
    UNINITIALIZED,
    READY,
    CAPTURING,
    ERROR,
    RELEASED,
}
```

**Contract guarantees:**
- `start()` begins frame production. Frames are delivered to the registered callback.
- Frames arrive in monotonically increasing timestamp order.
- `updateConfig()` applies new settings without stopping capture. If the new config requires a pipeline restart (e.g., resolution change), the implementation handles the restart internally. The consumer sees a brief gap in frames, not an error.
- `release()` is terminal. After release, the instance cannot be reused.

### Transport Interface

The Transport interface abstracts data movement between endpoints. WebRTC, USB, Bluetooth, and future transports all implement this interface.

```
interface Transport {

    // Lifecycle
    fun connect(endpoint: Endpoint, config: TransportConfig): Result<Unit>
    fun disconnect(): Result<Unit>

    // Data
    fun send(frame: Frame): Result<Unit>
    fun setReceiveCallback(callback: (Frame) -> Unit)

    // Metrics
    fun getMetrics(): TransportMetrics

    // State
    fun getState(): TransportState
    fun setStateCallback(callback: (TransportState) -> Unit)
}
```

```
data class TransportConfig(
    val maxBitrate: Int,              // bits/s
    val bufferSize: Int,              // milliseconds
    val encryption: EncryptionMode,   // REQUIRED, NONE (debug only)
    val heartbeatInterval: Int,       // milliseconds
    val reconnectPolicy: ReconnectPolicy,
)

data class TransportMetrics(
    val latencyMs: Double,
    val bitrateKbps: Double,
    val packetLossPct: Double,
    val jitterMs: Double,
    val roundTripTimeMs: Double,
    val bytesSent: Long,
    val bytesReceived: Long,
    val connectionUptime: Duration,
)

enum class TransportState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    RECONNECTING,
    FAILED,
}

data class ReconnectPolicy(
    val maxAttempts: Int,             // default: 5
    val initialDelayMs: Long,        // default: 0 (immediate first attempt)
    val backoffMultiplier: Double,   // default: 2.0
    val maxDelayMs: Long,            // default: 8000
)
```

**Contract guarantees:**
- `send()` is non-blocking. If the transport's internal buffer is full, the frame is dropped and a metric is incremented. The caller is not stalled.
- `getMetrics()` returns a snapshot of current transport health. It is safe to call at any frequency.
- State transitions are delivered to the callback on a dedicated thread. The callback must not block.
- `disconnect()` is idempotent. Calling it on an already-disconnected transport is a no-op.

### Receiver Interface

The Receiver interface abstracts incoming stream handling. It is the mirror of the Transport interface on the receiving end.

```
interface Receiver {

    // Lifecycle
    fun startListening(config: ReceiverConfig): Result<Unit>
    fun stopListening(): Result<Unit>

    // Incoming connections
    fun setConnectionCallback(callback: (IncomingSession) -> Unit)

    // Frame output
    fun setFrameCallback(sourceId: SourceId, callback: (Frame) -> Unit)

    // Consumer registration
    fun registerConsumer(consumer: FrameConsumer): ConsumerId
    fun unregisterConsumer(id: ConsumerId)

    // State
    fun getState(): ReceiverState
    fun getActiveSessions(): List<SessionInfo>
}
```

```
data class ReceiverConfig(
    val listenPort: Int,              // default: 4747
    val maxConcurrentSessions: Int,   // default: 1 (MVP), 8 (Stage Three)
    val bufferMs: Int,                // default: 80
    val virtualCameraEnabled: Boolean,
    val qualityPreset: QualityPreset,
)

enum class QualityPreset {
    PERFORMANCE,    // lowest latency, lower fidelity
    BALANCED,       // default
    QUALITY,        // highest fidelity, higher latency
}

data class IncomingSession(
    val sessionId: SessionId,
    val sourceDevice: DeviceInfo,
    val requestedConfig: CaptureConfig,
    fun accept(): Result<Unit>,
    fun reject(reason: String): Result<Unit>,
)
```

### Renderer Interface

The Renderer interface abstracts UI presentation. It allows the same core logic to drive different UI implementations—Android native views, desktop windows, or headless operation.

```
interface Renderer {

    // Display
    fun showPreview(surface: RenderSurface)
    fun hidePreview()

    // State display
    fun updateConnectionState(state: TransportState)
    fun updateMetrics(metrics: TransportMetrics)
    fun updateSessionState(state: SessionState)

    // Notifications
    fun showNotification(notification: Notification)
    fun dismissNotification(id: NotificationId)

    // User actions (outbound)
    fun setActionCallback(callback: (UserAction) -> Unit)
}
```

The Renderer is deliberately thin. It receives state updates and displays them. It forwards user actions to Airframe Core. It makes no decisions.

---

## 32. State Machines

State machines formalize the transitions described in Chapter 23. They are the authoritative specification for component behavior. If the code disagrees with the state machine, the code is wrong.

### Session State Machine

```
                        ┌─────────────────────────────────────────┐
                        │                                         │
    ┌──────┐     ┌──────▼─────┐     ┌───────────┐     ┌─────────┴──┐
    │      │     │            │     │           │     │            │
    │ IDLE │────►│ DISCOVERING│────►│ CONNECTING│────►│  ACTIVE    │
    │      │     │            │     │           │     │            │
    └──────┘     └──────┬─────┘     └─────┬─────┘     └──────┬─────┘
                        │                 │                   │
                        │            timeout(10s)        start_stream
                        │                 │                   │
                        │                 ▼                   ▼
                   no_receivers     ┌───────────┐     ┌────────────┐
                        │          │           │     │            │
                        │          │  FAILED   │     │ STREAMING  │◄──┐
                        │          │           │     │            │   │
                        │          └───────────┘     └──────┬─────┘   │
                        │                                   │         │
                        │                          transport_lost     │
                        │                                   │    recovered
                        │                                   ▼         │
                        │                            ┌────────────┐   │
                        │                            │            │   │
                        │                            │ RECOVERING │───┘
                        │                            │            │
                        │                            └──────┬─────┘
                        │                                   │
                        │                            max_retries
                        │                                   │
                        ▼                                   ▼
                   ┌───────────┐                      ┌───────────┐
                   │           │                      │           │
                   │  ENDED    │◄─────────────────────│  FAILED   │
                   │           │    operator_action    │           │
                   └───────────┘                      └───────────┘
```

### Transport State Machine

```
    ┌──────────────┐
    │              │
    │ DISCONNECTED │◄───────────────────────────┐
    │              │                             │
    └──────┬───────┘                             │
           │                                     │
      connect()                             max_retries
           │                                     │
           ▼                                     │
    ┌──────────────┐         ┌──────────────┐    │
    │              │         │              │    │
    │  CONNECTING  │────────►│   CONNECTED  │    │
    │              │         │              │    │
    └──────┬───────┘         └──────┬───────┘    │
           │                        │            │
      timeout(10s)            connection_lost    │
           │                        │            │
           ▼                        ▼            │
    ┌──────────────┐         ┌──────────────┐    │
    │              │         │              │    │
    │    FAILED    │         │ RECONNECTING │────┘
    │              │         │              │
    └──────────────┘         └──────┬───────┘
                                    │
                               reconnected
                                    │
                                    ▼
                             ┌──────────────┐
                             │              │
                             │  CONNECTED   │
                             │              │
                             └──────────────┘
```

### Capture State Machine

```
    ┌───────────────┐
    │               │
    │ UNINITIALIZED │
    │               │
    └───────┬───────┘
            │
       initialize()
            │
            ▼
    ┌───────────────┐         ┌───────────────┐
    │               │         │               │
    │    READY      │────────►│  CAPTURING    │
    │               │  start  │               │
    └───────┬───────┘◄────────└───────┬───────┘
            │          stop           │
            │                    hw_error
            │                         │
            │                         ▼
            │                  ┌───────────────┐
            │                  │               │
            │                  │    ERROR      │
            │                  │               │
            │                  └───────┬───────┘
            │                          │
            │                     reinitialize
            │                          │
            ▼                          ▼
    ┌───────────────┐          ┌───────────────┐
    │               │          │               │
    │   RELEASED    │          │    READY      │
    │               │          │               │
    └───────────────┘          └───────────────┘
```

---

## 33. Protocol Design

The Airframe protocol operates at two levels: the signaling protocol (WebSocket, text-based) and the media protocol (WebRTC/SRTP, binary). The signaling protocol handles session negotiation and control. The media protocol handles frame delivery.

### Signaling Protocol

The signaling protocol uses JSON messages over WebSocket. Every message has a `type` field and a `seq` field (monotonically increasing sequence number for ordering and deduplication).

```
Base Message:
{
    "type": "<message_type>",
    "seq": <sequence_number>,
    "ts": "<ISO 8601 timestamp>",
    "session_id": "<session_id | null>"
}
```

### Protocol Versioning

The first message exchanged on a new signaling connection is a `HELLO` that includes the protocol version. If the versions are incompatible, the connection is rejected with a `VERSION_MISMATCH` error.

```
→ HELLO
{
    "type": "hello",
    "seq": 0,
    "ts": "2026-07-06T10:30:00.000Z",
    "session_id": null,
    "protocol_version": "0.1.0",
    "device": {
        "name": "Pixel 8 Pro",
        "platform": "android",
        "app_version": "0.1.0"
    }
}

← HELLO_ACK
{
    "type": "hello_ack",
    "seq": 0,
    "ts": "2026-07-06T10:30:00.012Z",
    "session_id": null,
    "protocol_version": "0.1.0",
    "device": {
        "name": "Studio Mac Mini",
        "platform": "windows",
        "app_version": "0.1.0"
    },
    "compatible": true
}
```

Version compatibility follows semver semantics: major version changes are breaking, minor version changes are backward-compatible, patch changes are transparent.

---

## 34. Message Types

The signaling protocol defines the following message types. Each message is documented with its purpose, direction, and payload.

### Session Messages

| Message | Direction | Purpose |
|---------|-----------|---------|
| `hello` | TX → RX | Initial handshake, version negotiation |
| `hello_ack` | RX → TX | Handshake response, compatibility check |
| `session_request` | TX → RX | Request to establish a new session |
| `session_accept` | RX → TX | Accept the session request |
| `session_reject` | RX → TX | Reject the session request with reason |
| `session_end` | TX ↔ RX | Graceful session termination |

### Transport Messages

| Message | Direction | Purpose |
|---------|-----------|---------|
| `sdp_offer` | TX → RX | WebRTC SDP offer |
| `sdp_answer` | RX → TX | WebRTC SDP answer |
| `ice_candidate` | TX ↔ RX | ICE candidate exchange (trickle) |

### Control Messages

| Message | Direction | Purpose |
|---------|-----------|---------|
| `stream_start` | TX → RX | Notify receiver that media flow is beginning |
| `stream_stop` | TX → RX | Notify receiver that media flow is stopping |
| `config_update` | TX → RX | Notify receiver of capture config change |
| `config_request` | RX → TX | Request transmitter to change config |

### Health Messages

| Message | Direction | Purpose |
|---------|-----------|---------|
| `heartbeat` | TX → RX | Liveness check |
| `heartbeat_ack` | RX → TX | Liveness acknowledgment |
| `metrics_report` | TX → RX | Transmitter-side metrics snapshot |

### Error Messages

| Message | Direction | Purpose |
|---------|-----------|---------|
| `error` | TX ↔ RX | Report an error condition |
| `version_mismatch` | RX → TX | Protocol version incompatibility |

### Session Request Example

```
→ session_request
{
    "type": "session_request",
    "seq": 1,
    "ts": "2026-07-06T10:30:01.234Z",
    "session_id": "af-sess-7f3a2b",
    "capture_config": {
        "resolution": { "width": 1920, "height": 1080 },
        "frame_rate": 60,
        "bitrate": 8000000,
        "codec": "h264",
        "audio_enabled": true,
        "audio_bitrate": 128000,
        "audio_codec": "aac"
    },
    "source": {
        "source_id": "camera-0",
        "device_name": "Pixel 8 Pro",
        "lens": "main"
    }
}

← session_accept
{
    "type": "session_accept",
    "seq": 1,
    "ts": "2026-07-06T10:30:01.247Z",
    "session_id": "af-sess-7f3a2b",
    "sink_id": "receiver-0",
    "clock_reference": "2026-07-06T10:30:01.240Z"
}
```

---

## 35. Frame Format

The Airframe frame is the fundamental data unit. Every piece of media that flows through the pipeline is wrapped in a frame. Frames are produced by the Capture Layer and consumed by the Receiver Layer.

### Frame Structure

```
┌───────────────────────────────────────────────────┐
│                   Frame Header                     │
│                   (32 bytes)                       │
├───────────────────────────────────────────────────┤
│                                                    │
│                   Frame Payload                    │
│              (variable length)                     │
│                                                    │
└───────────────────────────────────────────────────┘
```

### Header Layout

```
Offset  Size    Field               Description
──────  ──────  ──────────────────  ─────────────────────────────
0       4       magic               0x41465246 ("AFRF" — AirFRame Frame)
4       2       version             Frame format version (1)
6       1       type                Frame type (video=0x01, audio=0x02,
                                    metadata=0x03, control=0x04)
7       1       flags               Bitfield:
                                      bit 0: keyframe
                                      bit 1: end-of-sequence
                                      bit 2: fragmented
                                      bit 3: has-extension
                                      bits 4-7: reserved
8       8       timestamp           Session clock timestamp (microseconds,
                                    uint64, monotonic)
16      4       source_id           Source identifier (uint32, maps to
                                    routing table)
20      4       sequence            Frame sequence number (uint32, per-source,
                                    monotonically increasing)
24      4       payload_length      Payload size in bytes (uint32)
28      4       checksum            CRC-32 of header + payload
```

Total header size: 32 bytes.

### Frame Types

| Type | Value | Payload Contents |
|------|-------|-----------------|
| Video | `0x01` | H.264 NAL units (one or more) |
| Audio | `0x02` | AAC audio frames |
| Metadata | `0x03` | Key-value pairs (JSON, UTF-8 encoded) |
| Control | `0x04` | Internal control messages |

### Keyframe Marking

Video frames with the keyframe flag set (`flags & 0x01`) contain an IDR (Instantaneous Decoder Refresh) frame. The receiver can begin decoding from any keyframe without prior context. Keyframes are produced at configurable intervals (default: every 2 seconds).

The keyframe interval affects two tradeoffs:
- **Shorter intervals** → faster recovery after packet loss (the receiver waits for the next keyframe to resync), but higher bandwidth usage (keyframes are 5–10× larger than P-frames).
- **Longer intervals** → lower bandwidth usage, but slower recovery after quality degradation.

The default 2-second interval balances bandwidth and recovery for the target use cases.

### Frame Sequencing

Each source maintains an independent, monotonically increasing sequence counter. The receiver uses the sequence number to detect:
- **Missing frames** (gap in sequence → packet loss)
- **Duplicate frames** (repeated sequence → network retransmission artifact)
- **Out-of-order frames** (non-monotonic sequence → reorder in buffer or drop)

### Fragment Support

If a single encoded frame exceeds the transport's maximum transmission unit (MTU), it is split into fragments. The `fragmented` flag indicates that the payload is a fragment. Fragments share the same `sequence` number and are reassembled by the receiver before decoding.

Fragment reassembly has a timeout. If all fragments of a frame do not arrive within 50 ms, the frame is considered lost and the receiver waits for the next keyframe.

---

## 36. Synchronization

Synchronization in Airframe addresses three problems: audio-video sync within a single source, temporal alignment across multiple sources, and clock agreement between transmitter and receiver.

### Audio-Video Sync

Audio and video frames are produced by independent hardware pipelines (camera sensor + video encoder, microphone + audio encoder). They share a common session clock for timestamps but may have different capture latencies.

The receiver aligns audio and video by timestamp. If a video frame at timestamp T=1000 and an audio frame at timestamp T=1000 arrive at different wall-clock times, the receiver buffers the earlier-arriving stream until the later one catches up, then presents both at the same output moment.

The receive buffer (default: 80 ms) provides the window for this alignment. If audio and video timestamps differ by more than the buffer size, the streams are considered desynchronized and the receiver logs a diagnostic warning.

### Multi-Source Sync

When multiple capture devices stream to the same receiver, their frames must be temporally aligned. This requires a shared time reference.

During session negotiation, the Session Manager distributes a `clock_reference` timestamp. Each capture device offsets its local clock to align with the session clock. The offset is calculated once during negotiation and applied to all subsequent frame timestamps.

```
Device A local clock:  100ms
Device B local clock:  250ms
Session clock ref:     0ms

Device A offset:       -100ms
Device B offset:       -250ms

Device A frame at local 500ms  →  session timestamp 400ms
Device B frame at local 650ms  →  session timestamp 400ms
(both represent the same moment in real time)
```

Clock drift between devices is expected to be under 1 ms per hour on modern smartphones. For sessions under 4 hours, drift is negligible. For longer sessions, periodic resynchronization can be triggered via the signaling channel.

### Latency Measurement

End-to-end latency is measured using the signaling channel:

1. The transmitter sends a `heartbeat` message with its current session clock timestamp.
2. The receiver records the wall-clock time of receipt.
3. The receiver sends a `heartbeat_ack` with the original timestamp and its own receipt timestamp.
4. The transmitter calculates round-trip time (RTT) from the acknowledgment.
5. One-way latency is estimated as RTT / 2.

This estimate assumes symmetric network paths, which is approximately correct for local network connections. For more precise measurement, NTP-style clock synchronization can be implemented as a future enhancement.

---

# Part V — UI

---

## 37. Design Language

Airframe's interface is built around three convictions: the tool should disappear during use, the system state should always be legible, and every pixel should serve a purpose.

The design language is derived from production tools and broadcast monitors, not from consumer social applications. It uses dark surfaces to reduce eye strain during extended use. It uses monospaced type for data values to enable at-a-glance comparison. It uses color sparingly—reserved almost entirely for status indication rather than decoration.

### Design Tokens

The design system is built on a constrained set of tokens. Every color, size, and spacing value in the interface derives from this set. Ad hoc values are not permitted.

**Surfaces:**

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `background` | `#FFFFFF` | `#0A0A09` | Primary background |
| `card` | `#F8F8F8` | `#141413` | Cards, panels, secondary surfaces |
| `muted` | `#F0F0EF` | `#1E1E1C` | Inputs, toggles, inactive elements |
| `border` | `#E5E5E4` | `rgba(255,255,255,0.07)` | Borders, dividers |

**Text:**

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `foreground` | `#0A0A09` | `#FAFAF9` | Primary text |
| `muted-foreground` | `#737370` | `rgba(255,255,255,0.45)` | Secondary text, labels |
| `accent` | `#4D8AFF` | `#4D8AFF` | Interactive elements, links |

**Status:**

| Token | Value | Usage |
|-------|-------|-------|
| `status-good` | `#34C759` / `emerald-500` | Healthy, connected, excellent |
| `status-warn` | `#FFCC00` / `amber-500` | Caution, degraded, fair |
| `status-bad` | `#FF3B30` / `red-500` | Error, critical, failed |
| `status-neutral` | `foreground` | No judgment, informational |

**Spacing:**

The spacing scale follows a 4px base unit: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. All margins, padding, and gaps use values from this scale. Intermediate values are avoided.

**Radii:**

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `8px` | Small elements, pills, badges |
| `radius-md` | `12px` | Buttons, inputs, small cards |
| `radius-lg` | `16px` | Cards, panels |
| `radius-xl` | `20px` | Large cards, phone frame screen |
| `radius-full` | `9999px` | Circles, status dots |

---

## 38. Visual Identity

### The Wordmark

Airframe's wordmark is the text "AF" set in Figtree Bold inside a rounded rectangle. The background is the foreground color; the text is the background color. This inverts in dark mode.

```
┌──────┐
│  AF  │  Figtree Bold, 10px
└──────┘  rounded-md (8px corners)
          size: 24×24px (compact), 56×56px (splash)
```

The wordmark does not include a logomark or icon illustration. The letterform is the brand. This is intentional—Airframe is infrastructure, not a consumer brand. The identity should feel professional and understated, like a tool marking rather than a product logo.

### Color

Airframe has one brand color: `#4D8AFF`. It is a saturated, medium-brightness blue. It appears in interactive elements (connect buttons, active toggles, the Wi-Fi scan pulse) and nowhere else. The interface is otherwise achromatic—black, white, and shades of gray.

The single-color approach prevents the interface from competing with the media content it transports. When an operator is looking at a camera preview, the surrounding UI should recede. Color draws attention. Airframe's UI should not draw attention to itself.

### Dark Mode as Default

The Android transmitter runs exclusively in dark mode. The camera preview is the primary interface element, and a dark surround maximizes the perceived contrast of the preview content. Light UI elements around a dark camera feed create visual competition. Dark surfaces do not.

The Windows receiver supports both light and dark modes because it operates in a desktop environment where the system theme preference should be respected. However, dark mode is the recommended setting for production use, and the diagnostics dashboard is designed to be most legible against a dark background.

---

## 39. Typography

### Type Families

Airframe uses two type families:

**Figtree** (sans-serif) — primary interface type. Used for headings, labels, body text, and navigation elements. Figtree is a geometric sans-serif with clean proportions and excellent legibility at small sizes. It has a humanist quality that avoids feeling clinical.

**DM Mono** (monospaced) — data display type. Used for numeric values, IP addresses, timestamps, version numbers, technical identifiers, and diagnostic readouts. Monospaced type ensures that numeric values maintain consistent alignment and width, enabling at-a-glance comparison.

### Type Scale

| Level | Family | Size | Weight | Tracking | Usage |
|-------|--------|------|--------|----------|-------|
| Display | Figtree | 22px | Semibold (600) | -0.02em | Screen titles ("Find Receiver", "Capture") |
| Body | Figtree | 14px | Regular (400) | 0 | Descriptions, labels |
| Body Small | Figtree | 13px | Regular (400) | 0 | Secondary descriptions |
| Caption | Figtree | 12px | Medium (500) | 0 | Annotations, sub-labels |
| Overline | DM Mono | 10px | Regular (400) | 0.2em | Section headers ("AIRFRAME", "RESOLUTION") |
| Data | DM Mono | 22px | Medium (500) | 0 | Primary metric values (latency, bitrate) |
| Data Small | DM Mono | 12px | Regular (400) | 0 | Secondary data, IP addresses |
| Data Tiny | DM Mono | 10px | Regular (400) | 0 | Range labels, footnotes |

### The Overline Convention

Section headers throughout the Airframe interface use a distinctive convention: uppercase text in DM Mono at 10px with wide letter-spacing (0.2em) and reduced opacity. This creates a visual label that organizes content without demanding attention.

```
AIRFRAME               ← overline (DM Mono, 10px, uppercase, 0.2em, 30% opacity)
Find Receiver          ← title (Figtree, 22px, semibold)
Scanning local network ← subtitle (Figtree, 14px, 45% opacity)
```

This convention is used consistently across both platforms. It provides rhythm and hierarchy without introducing additional visual weight.

---

## 40. Components

### Status Pill

The status pill is a small badge that communicates connection state. It appears in the receiver toolbar and the device info strip.

```
┌──────────────────────┐
│  ● Connected         │   dot color: status-good
│                      │   background: card
│                      │   border: border
│                      │   text: muted-foreground
└──────────────────────┘   font: 12px, medium weight
                           padding: 6px 12px
                           radius: full
```

| State | Dot Color | Label | Dot Animation |
|-------|-----------|-------|---------------|
| Connected | `emerald-500` | Connected | None |
| Connecting | `amber-400` | Connecting… | Pulse |
| Disconnected | `zinc-400` | No signal | None |
| Error | `red-500` | Error | None |

### Metric Card

The metric card displays a single diagnostic value. It is the primary component of the receiver's diagnostics panel.

```
┌────────────────────────┐
│  LATENCY        ← overline (DM Mono, 10px)
│
│  24 ms          ← value (DM Mono, 22px) + unit (DM Mono, 12px)
│  Excellent      ← sub-label (Figtree, 11px)
└────────────────────────┘
  background: card
  border: border
  padding: 16px
  radius: 16px
```

Value color changes based on the `quality` prop:
- `good` → `emerald-500`
- `warn` → `amber-500`
- `bad` → `red-500`
- `neutral` → `foreground`

### Toggle

A minimal switch control used for boolean settings (Include Audio, Auto-Reconnect).

```
OFF:  [○        ]   background: muted
ON:   [        ●]   background: accent

Width: 40px, Height: 24px
Thumb: 20px circle, white, shadow-sm
Transition: 200ms ease
```

### Signal Quality Bar

A horizontal progress bar that visualizes the composite signal quality score.

```
┌──────────────────────────────────────────┐
│  SIGNAL QUALITY                          │
│                                          │
│  [████████████████████░░░░░] 94%         │
│  Excellent · 5 GHz · ch.36 · WPA3       │
└──────────────────────────────────────────┘

Bar color: emerald-500 (>80%), amber-500 (50-80%), red-500 (<50%)
Track: muted, 6px height, full radius
```

### Bitrate Chart

A rolling 30-second area chart showing bitrate over time. Uses a gradient fill from the chart color to transparent.

```
Chart height: 56px
Stroke: 1.5px, chart-1 color
Fill: linear gradient from chart-1 at 28% opacity to chart-1 at 0% opacity
Dot: none
Animation: disabled (real-time data, animation causes jitter)
Tooltip: DM Mono 11px, card background, border, 8px radius
```

---

## 41. Motion

Motion in Airframe is functional. Animations exist to communicate state changes, not to entertain. Every animation answers a question: "What just happened?" or "What is happening now?"

### Principles

**Transitions, not animations.** UI elements transition between states (visible/hidden, active/inactive, connected/disconnected). They do not animate in isolation. There is no decorative motion.

**Duration under 300 ms.** The longest transition in the interface is 300 ms. Most are 150–200 ms. Production tools must respond instantly. If an operator taps a button and waits for an animation to complete before seeing the result, the animation is too long.

**Ease-out curves.** All transitions use ease-out timing (fast start, gradual stop). This feels responsive—the element starts moving immediately and settles into its final position.

### Specific Motions

| Element | Motion | Duration | Curve |
|---------|--------|----------|-------|
| STANDBY → LIVE badge | Color crossfade, dot pulse starts | 300 ms | ease-out |
| Connection state dot (pulse) | Opacity 1 → 0.4 → 1 | 2000 ms | ease-in-out (repeating) |
| Discovery scan pulse | Scale + fade ring | 2000 ms | ease-out (repeating) |
| Toggle switch | Thumb translate-x | 200 ms | ease-out |
| Metrics value change | Opacity crossfade | 150 ms | linear |
| Error alert appearance | Fade in + slight scale | 200 ms | ease-out |
| Manual IP expand/collapse | Height transition | 200 ms | ease-out |
| Splash loading dots | Sequential opacity pulse | 250 ms per dot, 500 ms stagger | ease-in-out |

### Loading States

Airframe uses two loading patterns:

**The scan pulse.** On the Discovery screen, an expanding ring animates around the Wi-Fi icon, indicating active network scanning. The ring expands and fades simultaneously. This communicates "the system is actively searching" without blocking interaction.

**The connection spinner.** During transport negotiation, a spinning ring appears on the receiver's preview pane. The ring is a circle with an incomplete border that rotates continuously. It communicates "something is in progress" for the brief negotiation period (<2 seconds in normal conditions).

No skeleton screens. No shimmer effects. These are designed for content-loading scenarios (social feeds, product lists) that do not apply to Airframe's interface.

---

## 42. Accessibility

Accessibility in Airframe serves two purposes: compliance with platform accessibility standards, and operational usability in challenging environments (dim church sanctuaries, bright outdoor stages, noisy venues).

### Color and Contrast

All text meets WCAG 2.1 AA contrast requirements (4.5:1 for body text, 3:1 for large text) in both light and dark modes. Status colors (green, amber, red) are supplemented with text labels ("Excellent," "Fair," "Critical") so that color-blind operators can interpret the diagnostics.

The diagnostics panel does not rely solely on color to communicate quality. Metric values include labels (`good`, `warn`, `bad`) and numeric thresholds that provide the same information without color perception.

### Touch Targets

All interactive elements on the Android transmitter meet the 48×48dp minimum touch target size. The primary transport button (record/stop) is 68×68dp—oversized deliberately because it is the most important action in the application and may be tapped in stressful, time-sensitive moments.

### Screen Reader Support

All interactive elements have descriptive `aria-label` or `contentDescription` attributes. The status pill announces its state ("Connected," "Connecting," "Error") to screen readers. Metric cards announce their label, value, and quality assessment ("Latency: 24 milliseconds, excellent").

### Reduced Motion

When the operating system's reduced-motion preference is enabled, all repeating animations (scan pulse, tally pulse, loading spinner) are replaced with static indicators. State transitions still occur but without animation—elements snap to their target state.

---

## 43. Android Screens

The Android transmitter has four screens: Splash, Discovery, Preview, and Settings. Each screen has a single purpose.

### Splash

**Purpose:** Brand presence during initialization.

The Splash screen displays the Airframe wordmark ("AF" in a white rounded rectangle) centered on a `#0A0A09` background. Two concentric circles pulse outward from the wordmark. The app name "Airframe" appears below in Figtree Semibold 20px. The version string appears in DM Mono 10px, uppercase, with wide letter-spacing.

Three dots pulse sequentially at the bottom to indicate loading activity.

**Duration:** 1.5 seconds (covers camera and network initialization).

**Transition:** Fade to Discovery screen.

### Discovery

**Purpose:** Find and select a receiver.

The Discovery screen is divided into three zones:

1. **Header zone.** The overline "AIRFRAME" label, the title "Find Receiver," and the subtitle "Scanning local network."

2. **Scan indicator.** A row containing the Wi-Fi icon with a pulsing ring, a gradient line, and the network info badge ("5 GHz · ch.36" in DM Mono).

3. **Device list.** Each discovered receiver is a card showing:
   - A monitor icon in a rounded container
   - The device name (Figtree 14px, medium weight)
   - The IP address (DM Mono 12px, 35% opacity)
   - A signal strength bar (4 vertical bars, colored by threshold)
   - A chevron-right arrow

Below the device list, a dashed-border button offers manual IP entry. Tapping it reveals a text input (DM Mono placeholder "192.168.1.xxx") and a "Connect" button.

An error state (connection refused, unreachable host) appears as a red-tinted card with an alert icon, error title, and detail text.

### Preview

**Purpose:** Camera viewfinder and stream control.

The Preview screen is full-bleed—the camera feed fills the entire screen with no chrome or bars. All controls are overlaid with semi-transparent backgrounds.

**Grid overlay.** A rule-of-thirds grid at 3.2% opacity with small crosshair marks at the four intersection points. The grid helps the operator frame the shot. It is not visible in the output stream.

**Corner brackets.** Four L-shaped bracket marks in the corners define the safe area. These reference broadcast safe-area conventions.

**Focus reticle.** A circular ring at screen center indicates the auto-focus target.

**Exposure gauge.** A vertical gauge on the right edge shows the current exposure value.

**Top HUD.** Left: tally badge (STANDBY in dark pill, or LIVE in red pill with pulsing dot). Right: resolution and frame rate badge, microphone mute button.

**Bottom controls.** Three buttons centered horizontally:
- Left: flip camera (FlipHorizontal icon)
- Center: record/stop button (68px circle, white outline in standby, red with square stop icon when live)
- Right: settings (gear icon)

**Live HUD.** When streaming, a timer and bitrate readout appear below the bottom controls in DM Mono.

### Settings

**Purpose:** Capture configuration.

The Settings screen is a scrollable form organized into sections:

1. **Resolution.** Three segmented buttons: 4K, 1080p, 720p. Selected state: white background with dark text. Unselected: glass background with 50% opacity text.

2. **Frame Rate.** Three segmented buttons: 60 fps, 30 fps, 24 fps. Same styling as resolution.

3. **Bitrate.** A slider from 2 Mbps to 20 Mbps with the current value displayed in DM Mono. The filled track uses accent blue.

4. **Toggles.** Include Audio (with subtitle "Stream device microphone") and Auto-Reconnect (with subtitle "Retry on connection loss"). Toggle switches with accent color when active.

5. **Network details.** A card showing Port, Timeout, Protocol, and Auth as key-value rows in a bordered container.

---

## 44. Desktop Screens

The Windows receiver has two views: Monitor and Settings, accessed via tabs in the toolbar.

### Application Chrome

The receiver window uses a custom title bar with macOS-style traffic light buttons (decorative—actual close/minimize/maximize use the OS controls). The title bar shows "Airframe Receiver · 2.4.0" in DM Mono.

Below the title bar, a toolbar contains:
- The Airframe wordmark (AF rounded rectangle + "Airframe" text)
- Two tab buttons (Monitor, Settings) with icons (Activity, Settings)
- A status pill showing the current connection state

### Monitor View

The Monitor view is split into two panels:

**Preview panel (left, flexible width).** The incoming camera feed displayed in a dark rounded rectangle. When connected, overlays show:
- A live indicator strip at top center (red dot + "LIVE · 60 fps · 8.4 Mb/s" in DM Mono)
- Corner bracket marks
- A focus reticle
- Device identification at bottom left ("Pixel 8 Pro — Main · 1920 × 1080 · H.264" in DM Mono)

Connection states change the preview content:
- **Connected:** Live camera feed with overlays
- **Connecting:** Centered spinner with "Connecting · 192.168.1.42"
- **Disconnected:** Centered WifiOff icon with "No device connected" and instructions
- **Error:** Centered AlertCircle icon with "Connection lost," timestamp, and Reconnect button

Below the preview, a device info strip shows the device name, IP/OS/port info, status pill, and reconnect button.

**Metrics panel (right, 240px fixed width).** A vertical stack of diagnostic components:
1. **Metric cards** (2×2 grid): Latency, Frame Rate, Bitrate, Packet Loss
2. **Signal quality bar:** Composite score with label and network details
3. **Bitrate chart:** Rolling 30-second area chart
4. **Stream info card:** Key-value pairs (Resolution, Codec, Keyframe, Audio, Network)

### Settings View

The Settings view is a single-column form capped at 480px width:

1. **OBS Integration section.** Virtual Camera Output toggle, Launch with OBS toggle.
2. **Network section.** Listening Port text input, Receive Buffer slider (0–500 ms).
3. **Quality Preset section.** Three radio-style options (Performance, Balanced, Quality) with descriptions.
4. **Save Changes button.** Transitions to green "Saved" state for 2.2 seconds after click.

---

# Part VI — Engineering

---

## 45. Technology Stack

### Android Transmitter

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Language | Kotlin | 1.9+ | Primary language |
| UI Framework | Jetpack Compose | 1.6+ | Declarative UI |
| Camera | CameraX | 1.3+ | Camera abstraction |
| Encoding | MediaCodec | Android 12+ | Hardware H.264/AAC encoding |
| Audio | AudioRecord | Android 12+ | Microphone capture |
| WebRTC | Google WebRTC | M120+ | Real-time media transport |
| Discovery | NSD (Network Service Discovery) | Android 12+ | mDNS device discovery |
| Networking | OkHttp | 4.12+ | WebSocket signaling |
| JSON | kotlinx.serialization | 1.6+ | Message serialization |
| DI | Hilt | 2.50+ | Dependency injection |
| Minimum SDK | 31 | Android 12 | Baseline OS version |
| Target SDK | 35 | Android 15 | Latest OS version |

### Windows Receiver

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Language | TypeScript | 5.4+ | Primary language |
| Runtime | Electron | 30+ | Desktop application shell |
| UI Framework | React | 19+ | Declarative UI |
| Styling | Tailwind CSS | 3.4+ | Utility-first CSS |
| Components | Radix UI | Latest | Accessible primitives |
| Icons | Lucide | Latest | Icon library |
| Charts | Recharts | 2.12+ | Diagnostic charts |
| WebRTC | wrtc / libwebrtc | Latest | Real-time media reception |
| Virtual Camera | Custom DirectShow filter | N/A | System-level video device |
| Discovery | mdns-js / bonjour | Latest | mDNS service advertisement |
| Build | Vite | 5+ | Dev server and bundler |
| Package Manager | pnpm | 9+ | Fast, disk-efficient |

### Architecture Decision Record: Why Electron?

**Context.** Desktop application targets evaluated: Electron (web technologies), Tauri (Rust + web frontend), native Win32/WPF (C++/C#), Qt (C++/Python). The primary requirements: WebRTC support, virtual camera device driver, cross-platform potential (Windows first, macOS later).

**Decision.** Use Electron for the receiver desktop application.

**Consequences.**
- *Positive:* Full WebRTC support via Chromium. Large ecosystem (React, TypeScript). Shared design language between prototype and production. Cross-platform without separate codebases. Fastest path to MVP.
- *Negative:* Large binary size (~150 MB). Higher memory footprint than native applications. Chromium update cadence creates maintenance burden. Performance ceiling lower than native for GPU-intensive rendering.
- *Accepted tradeoff:* The receiver is not a high-performance rendering application—it receives, decodes, and forwards frames. The CPU-intensive work (decoding, virtual camera output) happens in native modules, not in the Electron renderer. Memory and binary size are acceptable for a desktop production tool.

---

## 46. Build System

### Android

The Android transmitter uses Gradle with the Kotlin DSL. Build variants:

| Variant | Purpose | Encryption | Debug Logging |
|---------|---------|-----------|---------------|
| `debug` | Development and testing | Optional (flag) | Verbose |
| `release` | Production distribution | Enforced | Error only |
| `benchmark` | Performance profiling | Enforced | Metrics only |

Build requirements:
- JDK 17+
- Android Gradle Plugin 8.3+
- Gradle 8.5+
- Android NDK (for WebRTC native libraries)

### Windows

The Windows receiver uses Vite for development and Electron Builder for distribution.

```
Development:
  pnpm dev            → Vite dev server (hot reload)
  pnpm electron:dev   → Electron with Vite dev server

Production:
  pnpm build          → Vite production build
  pnpm electron:build → Electron Builder → .exe installer

Test:
  pnpm test           → Vitest unit tests
  pnpm test:e2e       → Playwright end-to-end tests
```

### Monorepo Structure

If shared code emerges between the Android and Windows applications (protocol definitions, message schemas, diagnostic algorithms), it is extracted into a `shared/` package:

```
airframe/
├── android/              ← Android transmitter (Kotlin/Gradle)
├── desktop/              ← Windows receiver (TypeScript/Electron)
├── shared/               ← Shared protocol definitions
│   ├── protocol/         ← Message type schemas
│   ├── diagnostics/      ← Signal quality algorithm
│   └── constants/        ← Shared constants (ports, versions)
├── docs/                 ← Documentation
└── DESIGN_BOOK.md        ← This document
```

---

## 47. Testing Strategy

Testing in Airframe follows the testing pyramid with an emphasis on integration tests at the contract boundary.

### Unit Tests

Unit tests cover individual functions and classes in isolation. They mock all external dependencies (hardware, network, file system).

**Coverage targets:**
- Capture Layer: encoding configuration logic, frame packaging, timestamp generation
- Airframe Core: session state machine transitions, routing table operations, signal quality calculation, diagnostics aggregation
- Transport Layer: signaling message serialization/deserialization, reconnection policy logic
- Receiver Layer: frame reassembly, sequence gap detection, buffer management
- UI: component rendering, state-driven display logic

**Excluded from unit tests:** Hardware interaction (camera, microphone), network I/O, WebRTC internals. These are covered by integration and end-to-end tests.

### Contract Tests

Contract tests verify that each layer implementation conforms to its interface contract. They run against the real implementation but with controlled inputs.

Example: A CaptureSource contract test verifies that:
- `initialize()` transitions state from `UNINITIALIZED` to `READY`
- `start()` transitions state from `READY` to `CAPTURING`
- Frames delivered to the callback have monotonically increasing timestamps
- `updateConfig()` does not transition state away from `CAPTURING`
- `release()` transitions to `RELEASED` and subsequent calls throw

Contract tests are the most important test category. If the contracts hold, the layers compose correctly. If the contracts break, nothing works.

### Integration Tests

Integration tests verify that two or more layers work together correctly. They use real implementations (not mocks) for the layers under test and controlled implementations for external dependencies.

**Key integration tests:**
- Capture → Core: Frames produced by CameraX + MediaCodec are correctly timestamped and routed by the Session Manager.
- Core → Transport: The Session Manager correctly sends frames through the WebRTC transport and handles state transitions.
- Transport → Receiver: Frames sent via WebRTC arrive at the receiver, are demuxed, decoded, and output to the virtual camera device.
- Full pipeline: End-to-end latency measurement from capture to virtual camera output.

### End-to-End Tests

End-to-end tests exercise the complete user workflow:
1. Launch the Android app on a physical device or emulator.
2. Launch the receiver on a Windows machine.
3. Discover the receiver via mDNS.
4. Establish a session.
5. Stream for a configured duration.
6. Verify diagnostic metrics are within expected ranges.
7. Gracefully terminate the session.

End-to-end tests run on physical hardware in a controlled network environment. They are not run in CI (too slow, requires physical devices) but are part of the release verification checklist.

---

## 48. Performance Budgets

Performance budgets define the boundaries of acceptable behavior. If a metric exceeds its budget, the build does not ship.

### Latency Budgets

| Segment | Budget | Measurement Point |
|---------|--------|-------------------|
| Capture (sensor → encoded frame) | ≤ 15 ms | CameraX callback to MediaCodec output |
| Encoding (raw → H.264) | ≤ 8 ms | MediaCodec input to output (hardware encoder) |
| Transport (send → receive) | ≤ 30 ms | WebRTC send to receive (local network) |
| Decoding (H.264 → raw) | ≤ 5 ms | Hardware decoder input to output |
| Virtual camera output | ≤ 3 ms | Decoded frame to DirectShow delivery |
| **Total end-to-end** | **≤ 100 ms** | Sensor capture to consumer display (Balanced preset) |

### Memory Budgets

| Application | Budget | Measurement |
|-------------|--------|-------------|
| Android transmitter (idle) | ≤ 80 MB | Process resident memory, no active stream |
| Android transmitter (streaming) | ≤ 200 MB | Process resident memory, 1080p60 stream |
| Windows receiver (idle) | ≤ 150 MB | Process resident memory, no active connection |
| Windows receiver (streaming) | ≤ 350 MB | Process resident memory, receiving 1080p60 |

### Startup Budgets

| Application | Budget | Measurement |
|-------------|--------|-------------|
| Android cold start to Discovery screen | ≤ 2.5 s | From process creation to first interactive frame |
| Windows cold start to Monitor view | ≤ 3.0 s | From process creation to window visible |
| Discovery to Connected | ≤ 2.0 s | From device tap to ACTIVE state |

### Thermal Budgets

| Scenario | Budget |
|----------|--------|
| 1080p30 streaming, Pixel 7 | No thermal throttling for 3 hours |
| 1080p60 streaming, Pixel 8 Pro | No thermal throttling for 2 hours |
| 4K30 streaming, Pixel 8 Pro | No thermal throttling for 1 hour |

---

## 49. CI/CD

### Continuous Integration

Every pull request triggers:

1. **Lint.** Code style validation (ktlint for Kotlin, ESLint + Prettier for TypeScript).
2. **Compile.** Full build of both Android and Windows applications.
3. **Unit tests.** All unit tests run. Failure blocks merge.
4. **Contract tests.** All contract tests run. Failure blocks merge.
5. **Static analysis.** Android: detekt. TypeScript: TypeScript strict mode + custom rules.
6. **Bundle size check.** APK size and Electron bundle size compared against budgets.

### Continuous Deployment

Releases follow a trunk-based development model:

```
main branch
   │
   ├── feature branches (short-lived, <3 days)
   │
   ├── release tags (v0.1.0, v0.2.0, ...)
   │
   └── hotfix branches (cherry-picked to release)
```

Release process:
1. Tag the release on `main`.
2. CI builds release variants (APK, signed Electron installer).
3. Run integration test suite against release builds.
4. Generate changelog from conventional commits.
5. Publish artifacts to distribution channels.

---

## 50. Code Organization

### Naming Conventions

**Packages/modules** use lowercase with dots (Kotlin) or slashes (TypeScript):
```
com.airframe.capture
com.airframe.core.session
com.airframe.transport.webrtc
```

**Classes** use PascalCase:
```
SessionManager
WebRtcTransport
CameraXCaptureSource
```

**Interfaces** do not use the `I` prefix:
```
✓ CaptureSource
✗ ICaptureSource
```

**Functions** use camelCase and start with a verb:
```
✓ calculateSignalQuality()
✓ sendFrame()
✗ signalQuality()
✗ frame()
```

**Constants** use SCREAMING_SNAKE_CASE:
```
const val DEFAULT_LISTEN_PORT = 4747
const val MAX_RECONNECT_ATTEMPTS = 5
const val HEARTBEAT_INTERVAL_MS = 5000
```

**Event callbacks** use `on` prefix:
```
onStateChange(state: TransportState)
onFrameReceived(frame: Frame)
onSessionEnded(reason: EndReason)
```

### File Organization

Each layer has a consistent internal structure:

```
capture/
├── api/                  ← Public interfaces and data classes
│   ├── CaptureSource.kt
│   ├── CaptureConfig.kt
│   └── Frame.kt
├── impl/                 ← Implementations
│   ├── CameraXCaptureSource.kt
│   └── ScreenCaptureSource.kt
├── internal/             ← Internal utilities (not exported)
│   ├── FramePackager.kt
│   └── TimestampGenerator.kt
└── test/                 ← Tests
    ├── CaptureContractTest.kt
    └── FramePackagerTest.kt
```

---

## 51. Dependency Management

### Principles

**Pin major versions.** All dependencies specify major version ranges. Minor and patch updates are accepted automatically. Major version bumps require explicit review.

**Minimize direct dependencies.** Every dependency is a liability—maintenance burden, security surface, build time. Before adding a dependency, the team must answer: "Can we implement this in under 200 lines of code?" If yes, implement it. If no, evaluate the dependency.

**No transitive exposure.** Dependencies used internally by a layer are not exposed through the layer's public interface. If the Capture Layer uses CameraX internally, the Capture interface does not reference CameraX types. This prevents dependency leakage across layer boundaries.

### Dependency Audit

Dependencies are audited quarterly for:
- Security vulnerabilities (Dependabot for npm, dependency-check for Gradle)
- License compatibility (all dependencies must be MIT, Apache 2.0, or BSD)
- Maintenance status (last commit date, open issue count, release frequency)
- Size impact (tree-shaken bundle contribution for npm, method count for Android)

---

## 52. Versioning

Airframe follows Semantic Versioning 2.0.0 (semver).

```
MAJOR.MINOR.PATCH

MAJOR — Incompatible changes to the protocol or public interfaces.
        Increments when: signaling protocol breaks backward compatibility,
        frame format changes in a non-backward-compatible way,
        public API removes or changes existing methods.

MINOR — New features that are backward-compatible.
        Increments when: new transport added, new capture source type,
        new diagnostic metric, new UI feature.

PATCH — Bug fixes and performance improvements.
        Increments when: bug fixed, performance improved,
        documentation updated, dependency patched.
```

### Protocol Version vs. Application Version

The protocol version and application version are tracked independently. The protocol version changes only when the signaling protocol or frame format changes. The application version changes with every release.

```
Application: v0.3.2 (many releases)
Protocol:    v0.1.0 (rarely changes)
```

This allows the Android app and Windows receiver to update at different cadences without breaking compatibility. An Android app at v0.4.0 (protocol v0.1.0) can connect to a Windows receiver at v0.3.1 (protocol v0.1.0) because the protocol versions match.

---

## 53. Error Handling Philosophy

### Errors Are Data

Errors in Airframe are structured data, not exceptions. Every operation that can fail returns a `Result<T>` (Kotlin) or `Result<T, Error>` (TypeScript). Callers must handle both success and failure cases. Unhandled errors are compile-time warnings (Kotlin) or lint errors (TypeScript).

```kotlin
// Kotlin
val result = transport.connect(endpoint, config)
when (result) {
    is Result.Success -> handleConnected()
    is Result.Failure -> handleError(result.error)
}
```

```typescript
// TypeScript
const result = await transport.connect(endpoint, config);
if (result.ok) {
    handleConnected();
} else {
    handleError(result.error);
}
```

### Error Categories

| Category | Code Range | Recovery | Example |
|----------|-----------|----------|---------|
| Transport | 1000–1999 | Automatic (reconnect) | Connection timeout, packet loss spike |
| Capture | 2000–2999 | Automatic (restart pipeline) | Camera disconnected, encoder reset |
| Session | 3000–3999 | Operator action | Version mismatch, authentication failed |
| System | 4000–4999 | Fatal | Out of memory, OS permission denied |
| Config | 5000–5999 | Configuration change | Invalid resolution, unsupported codec |

### Error Propagation

Errors propagate upward through the layer stack. A Transport error is reported to the Session Manager, which decides the response (reconnect, notify operator, or fail the session). A Capture error is reported to the Session Manager, which decides whether to restart the capture pipeline or notify the operator.

Errors do not propagate sideways. A Transport error does not directly affect the Capture Layer. The Session Manager mediates all cross-layer error handling.

### Logging

Logs follow a structured format with severity levels:

```
[2026-07-06T10:32:47.123Z] [ERROR] [transport.webrtc] Connection lost to 192.168.1.42:4747
  code: 1001
  reason: "ICE connection failed"
  last_heartbeat: "2026-07-06T10:32:29.456Z"
  session_id: "af-sess-7f3a2b"
  retry_attempt: 1
  next_retry_ms: 1000
```

Log levels:
- `ERROR` — Something failed. Requires attention or automatic recovery.
- `WARN` — Something is degraded but functional. May require future attention.
- `INFO` — Significant state changes. Session started, connected, disconnected.
- `DEBUG` — Detailed operational data. Frame counts, timing measurements.
- `TRACE` — Extremely verbose. Individual frame timestamps, raw metric samples.

Production builds log at `INFO` level and above. Debug builds log at `DEBUG`. Trace logging is enabled explicitly via a debug setting.

---

# Part VII — Roadmap

---

## 54. Development Stages

Airframe development is organized into four stages. Each stage has a clear goal, a defined scope, and a measurable exit criterion. Stages are sequential—each builds on the previous.

### Stage One: Foundation

**Goal:** A single Android phone streams reliably to a single Windows receiver.

**Scope:**
- Android transmitter: CameraX capture, MediaCodec encoding, WebRTC transport, mDNS discovery, full UI (Splash, Discovery, Preview, Settings)
- Windows receiver: WebRTC reception, DirectShow virtual camera, diagnostics dashboard, full UI (Monitor, Settings)
- Signaling protocol: WebSocket, session negotiation, heartbeat
- Transport: WebRTC over local Wi-Fi

**Exit criteria:**
- Marcus's workflow (Chapter 12) runs end-to-end without intervention for 4 hours
- End-to-end latency ≤ 100 ms on a consumer Wi-Fi network
- Automatic reconnection succeeds within 10 seconds
- OBS 29+ on Windows 10/11 recognizes the virtual camera device

**Estimated duration:** 12–16 weeks

### Stage Two: Stability

**Goal:** The MVP is production-hardened. Edge cases are addressed. Performance is optimized.

**Scope:**
- Adaptive bitrate encoding (Capture Layer responds to Transport feedback)
- Enhanced diagnostics: latency histogram, packet loss burst detection, session quality scoring
- Session persistence across Android app lifecycle events (backgrounding, screen rotation)
- Enhanced discovery: device history, bookmarks, custom receiver names
- Improved error messaging and recovery UX
- Performance optimization against thermal and memory budgets
- macOS receiver (CoreMediaIO virtual camera, native mDNS)

**Exit criteria:**
- Adaptive bitrate reduces quality smoothly under bandwidth pressure (no visible stutter)
- Session survives Android app background/foreground cycle
- macOS receiver passes the same test suite as the Windows receiver
- All performance budgets (Chapter 48) are met

**Estimated duration:** 8–12 weeks

### Stage Three: Scale

**Goal:** Airframe supports multi-device sessions and alternative transports.

**Scope:**
- Multi-device sessions: 2–8 simultaneous capture sources
- USB transport implementation
- Bluetooth transport implementation (low-bandwidth, audio-focused)
- Receiver multi-feed view (grid, split-panel)
- Per-device quality settings
- Plugin SDK v1 (Chapter 59)
- Screen capture source (Android MediaProjection)

**Exit criteria:**
- Priya's workflow (Chapter 13) runs end-to-end with two devices
- James's workflow (Chapter 14) runs end-to-end with four devices
- USB transport achieves ≤ 15 ms end-to-end latency
- Plugin SDK supports custom transport and custom consumer implementations
- A third-party developer can build and load a plugin without Airframe team assistance

**Estimated duration:** 16–20 weeks

### Stage Four: Intelligence

**Goal:** Airframe provides intelligent assistance and predictive capabilities.

**Scope:**
- AI-assisted diagnostics (root cause identification, corrective action suggestions)
- Predictive reconnection (transport failover before failure)
- Transport auto-selection (best available transport based on conditions)
- Spatial audio transport
- Depth and sensor data transport
- Advanced analytics and session reporting

**Exit criteria:**
- AI diagnostics correctly identifies the root cause of quality degradation in 80% of test scenarios
- Predictive reconnection reduces visible interruption time by 50% compared to reactive reconnection
- Transport auto-selection chooses the optimal transport in 90% of multi-transport scenarios

**Estimated duration:** 20+ weeks (ongoing)

---

## 55. Milestones

| Milestone | Stage | Target | Description |
|-----------|-------|--------|-------------|
| M1: First Frame | One | Week 4 | Camera frame arrives at receiver and displays in preview window |
| M2: First Session | One | Week 6 | Full session lifecycle: discovery → connect → stream → disconnect |
| M3: Virtual Camera | One | Week 8 | OBS receives video from Airframe virtual camera device |
| M4: Diagnostics | One | Week 10 | All MVP metrics displaying in receiver dashboard |
| M5: Reliability | One | Week 14 | 4-hour stress test passes. Auto-reconnection verified |
| M6: MVP Ship | One | Week 16 | MVP release candidate. All Stage One exit criteria met |
| M7: Adaptive | Two | Week 22 | Adaptive bitrate operational under bandwidth pressure |
| M8: macOS | Two | Week 26 | macOS receiver feature-complete |
| M9: Multi-Device | Three | Week 34 | Two-device session stable for 2 hours |
| M10: USB Transport | Three | Week 38 | USB transport ≤ 15 ms latency verified |
| M11: Plugin SDK | Three | Week 44 | Third-party plugin loads and runs |
| M12: Intelligence | Four | Week 56+ | AI diagnostics operational |

---

## 56. Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| WebRTC library instability on specific Android devices | High | Medium | Device-specific testing matrix. Fallback to Camera2 + custom RTP if necessary |
| DirectShow virtual camera driver conflicts with antivirus | High | Medium | Code signing. Allowlist documentation. User-facing troubleshooting guide |
| Wi-Fi multicast disabled on target networks (churches, venues) | Medium | Medium | Manual IP entry fallback. Discovery fallback documentation |
| Thermal throttling on sustained 4K streams | Medium | High | Adaptive bitrate. Thermal monitoring. Resolution fallback recommendations |
| Electron memory bloat under sustained streaming | Medium | Medium | Profiling regime. Memory budget enforcement in CI. Consider Tauri migration path |
| WebRTC protocol changes in upstream library | Medium | Low | Pin major versions. Abstraction layer between Airframe and WebRTC internals |
| Android CameraX API breaking changes | Low | Low | CameraX is a Jetpack library with strong backward compatibility guarantees |
| OBS virtual camera enumeration changes | Medium | Low | Test against OBS beta releases. Maintain compatibility matrix |
| Network stack differences between Android manufacturers | Medium | Medium | NSD wrapper with manufacturer-specific workarounds. Test on Samsung, Pixel, OnePlus |
| Battery drain during extended streaming sessions | Medium | High | Power profiling. Efficiency mode option. Documentation on charging during streaming |

---

## 57. Competitive Analysis

### DroidCam

**What it does well:** Simple setup. Works. Large user base. Free tier available.

**Where it falls short:**
- No automatic reconnection. Connection drops require manual re-pairing.
- No diagnostic information. The operator cannot determine connection quality.
- Quality degradation under network pressure is not communicated. The stream silently degrades or freezes.
- No multi-device support.
- Closed source. No extensibility.

**Airframe's differentiation:** Reliability (auto-reconnect), transparency (real-time diagnostics), and extensibility (Plugin SDK). Airframe answers the question DroidCam never asks: "Is this connection healthy?"

### Iriun Webcam

**What it does well:** USB connection support. Low latency over USB. Clean interface.

**Where it falls short:**
- Limited diagnostic information.
- No multi-device support.
- Closed source.
- Wi-Fi performance inconsistent.

**Airframe's differentiation:** Transport agnosticism. Iriun's USB support is an advantage that Airframe will match in Stage Three, while also offering WebRTC and Bluetooth. The layered architecture means adding a transport does not require changing the rest of the system.

### NDI (Newtek)

**What it does well:** Industry standard for IP video in professional production. Excellent quality. Low latency. Multi-device. Discovery and management tools.

**Where it falls short:**
- Requires NDI-compatible software or hardware.
- Significant bandwidth requirements (100+ Mbps for full-quality NDI).
- Not designed for phone-as-camera use cases.
- Licensing costs for full SDK.

**Airframe's differentiation:** Airframe targets the gap between consumer webcam tools (DroidCam) and professional IP video (NDI). It provides production-level reliability and diagnostics without requiring professional infrastructure or licensing.

### OBS Virtual Camera (built-in)

**What it does well:** Free. Built into OBS. Zero additional software.

**Where it falls short:**
- Output-only—sends OBS's output as a virtual camera. Does not solve the camera-input problem.
- Not a transport solution.

**Airframe's differentiation:** Complementary, not competitive. Airframe feeds into OBS. OBS Virtual Camera feeds out of OBS. They solve different problems.

---

## 58. Release Criteria

### Pre-Release Checklist

Every release must pass all items before distribution:

**Functional:**
- [ ] All unit tests pass (100% pass rate, no skips)
- [ ] All contract tests pass
- [ ] Integration test suite passes on reference hardware
- [ ] Session lifecycle: discovery → connect → stream → disconnect completes without error
- [ ] Auto-reconnection succeeds within 10 seconds after simulated network drop
- [ ] Virtual camera device is recognized by OBS on target OS versions

**Performance:**
- [ ] End-to-end latency ≤ 100 ms (Balanced preset, local Wi-Fi)
- [ ] Memory usage within budget (Chapter 48)
- [ ] Cold start within budget
- [ ] No thermal throttling for 2 hours at 1080p60 on reference device

**Quality:**
- [ ] No crash reports in 24-hour soak test
- [ ] No memory leaks in 4-hour stress test (RSS delta < 10 MB)
- [ ] Diagnostics log is well-formed JSON for entire session
- [ ] All error messages are specific and actionable (no generic "Error occurred")

**Security:**
- [ ] DTLS-SRTP encryption verified active in release build
- [ ] No debug flags enabled in release variant
- [ ] No sensitive data in diagnostics logs
- [ ] Dependencies scanned for known vulnerabilities

**Documentation:**
- [ ] CHANGELOG updated with user-facing changes
- [ ] Known issues documented
- [ ] Breaking changes (if any) documented with migration guide

---

## 59. Plugin SDK

The Plugin SDK enables third-party extensibility across Airframe's layer boundaries. It is scoped for Stage Three delivery.

### Plugin Architecture

Plugins are self-contained modules that implement one or more Airframe contracts. They are loaded at runtime and registered with the Session Manager. The plugin system does not modify Airframe's core—it extends it through the same interfaces that Airframe's own components use.

```
┌─────────────────────────────────────────────┐
│              Plugin Manager                  │
│                                              │
│  • Discovers plugins at startup              │
│  • Validates plugin manifests                │
│  • Loads and initializes plugin modules      │
│  • Registers plugin contracts                │
│  • Manages plugin lifecycle                  │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│Custom  │ │Custom  │ │Custom  │
│Transport│ │Consumer│ │Source  │
│Plugin  │ │Plugin  │ │Plugin  │
└────────┘ └────────┘ └────────┘
```

### Plugin Manifest

Every plugin includes a `plugin.json` manifest:

```json
{
    "id": "com.example.tally-light",
    "name": "Tally Light Integration",
    "version": "1.0.0",
    "airframe_version": ">=0.5.0",
    "author": "Example Productions",
    "description": "Maps Airframe session events to hardware tally lights",
    "entry": "tally-plugin.js",
    "type": "consumer",
    "permissions": [
        "session.events",
        "session.state"
    ]
}
```

### Plugin Types

| Type | Implements | Purpose | Example |
|------|-----------|---------|---------|
| `transport` | `Transport` interface | Add a new transport mechanism | NDI transport, SRT transport |
| `source` | `CaptureSource` interface | Add a new media source | Screen capture, external camera SDK |
| `consumer` | `FrameConsumer` interface | Add a new output target | Custom recording, cloud upload |
| `diagnostic` | `DiagnosticProvider` interface | Add custom metrics | GPU temperature, battery monitoring |
| `event` | `EventListener` interface | React to session events | Tally lights, webhook notifications |

### Transport Plugin Contract

A custom transport plugin implements the `Transport` interface (Chapter 31) and registers with the Plugin Manager:

```typescript
// Example: Custom SRT Transport Plugin
import { Transport, TransportConfig, TransportState, Frame } from '@airframe/sdk';

export class SrtTransport implements Transport {
    private state: TransportState = 'disconnected';

    async connect(endpoint: Endpoint, config: TransportConfig): Promise<Result<void>> {
        // SRT-specific connection logic
        this.state = 'connecting';
        const srtSocket = await createSrtSocket(endpoint.address, endpoint.port);
        if (srtSocket.ok) {
            this.state = 'connected';
            return { ok: true };
        }
        this.state = 'failed';
        return { ok: false, error: srtSocket.error };
    }

    async send(frame: Frame): Promise<Result<void>> {
        // Package frame into SRT payload and send
        return await this.srtSocket.send(frame.serialize());
    }

    async disconnect(): Promise<Result<void>> {
        this.state = 'disconnected';
        return await this.srtSocket.close();
    }

    getState(): TransportState { return this.state; }
    getMetrics(): TransportMetrics { return this.metricsCollector.snapshot(); }

    setStateCallback(cb: (state: TransportState) => void): void { /* ... */ }
    setReceiveCallback(cb: (frame: Frame) => void): void { /* ... */ }
}
```

### Consumer Plugin Contract

A consumer plugin receives decoded frames and does something with them:

```typescript
// Example: Session Event Logger Plugin
import { EventListener, SessionEvent } from '@airframe/sdk';

export class WebhookNotifier implements EventListener {
    private webhookUrl: string;

    constructor(config: { url: string }) {
        this.webhookUrl = config.url;
    }

    async onSessionEvent(event: SessionEvent): Promise<void> {
        if (event.type === 'state_change') {
            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: event.sessionId,
                    previous_state: event.previousState,
                    new_state: event.newState,
                    timestamp: event.timestamp,
                }),
            });
        }
    }
}
```

### Plugin Permissions

Plugins declare required permissions in their manifest. The Plugin Manager grants only the declared permissions. A transport plugin cannot access session events unless it declares the `session.events` permission.

| Permission | Access |
|-----------|--------|
| `capture.frames` | Receive raw capture frames |
| `transport.send` | Send data through the active transport |
| `transport.metrics` | Read transport metrics |
| `session.events` | Receive session lifecycle events |
| `session.state` | Read current session state |
| `session.config` | Read and modify session configuration |
| `diagnostics.read` | Read diagnostic metrics |
| `diagnostics.write` | Register custom diagnostic metrics |
| `receiver.consumers` | Register as a frame consumer |

### Plugin Lifecycle

```
1. DISCOVERED    Plugin manifest found in plugins directory
2. VALIDATED     Manifest parsed, version compatibility confirmed
3. LOADED        Plugin module loaded into runtime
4. INITIALIZED   Plugin constructor called with configuration
5. ACTIVE        Plugin registered with Session Manager, receiving events
6. STOPPED       Plugin unregistered, cleanup completed
7. UNLOADED      Plugin module removed from runtime
```

Plugins can be loaded and unloaded during an active session. A transport plugin cannot be unloaded while it is the active transport—the session must switch to a different transport first.

---

## 60. Goldtooth

Goldtooth is a speculative future transport. It is documented here as a research placeholder, not a committed feature.

### Concept

Goldtooth explores transport over a custom low-power radio protocol, occupying the space between Bluetooth's limited bandwidth and Wi-Fi's power consumption. It would target scenarios where Wi-Fi is unavailable or unreliable, and Bluetooth's bandwidth is insufficient for even low-resolution video.

### Potential Use Cases

- Outdoor event production where Wi-Fi infrastructure is absent
- Remote camera positions beyond Wi-Fi range (parking lot, exterior building shots)
- Backup transport that activates when Wi-Fi fails

### Research Questions

1. **Frequency band.** 900 MHz ISM (long range, low bandwidth) or 5.8 GHz (shorter range, higher bandwidth)?
2. **Bandwidth.** What video quality is achievable at 1–5 Mbps sustained throughput?
3. **Latency.** Can sub-200 ms end-to-end latency be achieved with custom framing?
4. **Range.** What practical range is achievable with commodity radio hardware?
5. **Regulatory.** What are the licensing requirements for the target frequency bands in the US, EU, and UK?
6. **Hardware.** Can the radio be implemented as a USB dongle that attaches to both the phone and the receiver?

### Current Status

Goldtooth is in the ideation phase. No implementation work has begun. No timeline is committed. It is included in the Design Book to ensure the transport abstraction layer is designed broadly enough to accommodate non-IP transports in the future.

If Goldtooth progresses beyond research, it will be implemented as a Transport plugin (Chapter 59) and will not require changes to Airframe Core, the Capture Layer, or the Receiver Layer. This is a direct consequence of Invariant 1 (transport agnosticism).

---

# Part VIII — Research

---

## 61. Latency Optimization

Latency is the interval between a photon hitting the camera sensor and the corresponding pixel appearing on the consumer's display. Every millisecond matters because the operator's perception of "real-time" degrades above approximately 100 ms.

### Latency Budget Analysis

The total latency budget (100 ms for Balanced preset) is distributed across five stages. Optimization efforts target each stage independently.

**Stage 1: Sensor to encoder input (≤ 15 ms).**
CameraX's ImageAnalysis pipeline introduces latency between the sensor readout and the frame arriving at the MediaCodec encoder. Research areas:
- Direct Surface output from CameraX to MediaCodec (bypasses ImageAnalysis callback)
- Camera2 Interop for lower-level control on specific devices
- Reducing auto-exposure and auto-focus convergence time (they add processing latency)

**Stage 2: Encoding (≤ 8 ms).**
Hardware encoding latency is dominated by the encoder's lookahead buffer and output scheduling. Research areas:
- Low-latency encoding profiles (Baseline Profile, no B-frames, minimal reference frames)
- MediaCodec `KEY_LATENCY` parameter (Android 12+, requests encoder to minimize output delay)
- Slice-based encoding (output partial frame data before the full frame is encoded)

**Stage 3: Transport (≤ 30 ms).**
WebRTC introduces latency through packetization, SRTP encryption, UDP send scheduling, and the receive-side jitter buffer. Research areas:
- Reducing the jitter buffer size (tradeoff: lower latency vs. higher sensitivity to jitter)
- Disabling WebRTC's built-in pacing (send frames immediately rather than smoothing send rate)
- Custom congestion control tuned for local networks (less conservative than GCC)
- QUIC-based transport as a WebRTC alternative (research only)

**Stage 4: Decoding (≤ 5 ms).**
Hardware decoding on the receiver is fast on modern GPUs. Research areas:
- DirectX Video Acceleration (DXVA) for hardware-accelerated H.264 decoding on Windows
- Zero-copy frame output (decode directly to the virtual camera's output buffer)
- Decoder warm-up: pre-initialize the decoder during connection negotiation, before the first frame arrives

**Stage 5: Virtual camera output (≤ 3 ms).**
DirectShow filter overhead is small but measurable. Research areas:
- Frame scheduling: deliver frames to the filter on a precise cadence, avoiding output jitter
- Memory mapping: use shared memory between the decoder and the filter to eliminate buffer copies

### Performance Preset: Performance Mode

The Performance preset reduces total latency to ≤ 60 ms by:
- Reducing the receive buffer from 80 ms to 20 ms
- Enabling low-latency encoding mode
- Disabling jitter buffer smoothing
- Accepting higher sensitivity to network jitter (more likely to see artifacts under poor conditions)

This preset is intended for live switching scenarios (James's workflow) where latency is more important than visual consistency.

---

## 62. Thermal Management

Smartphones are not designed for continuous high-workload operation. A phone encoding 1080p60 video while maintaining a WebRTC connection and rendering a camera preview will generate significant heat. Without thermal management, the device will throttle CPU and GPU performance, degrading stream quality.

### Thermal Monitoring

Android provides the `PowerManager.THERMAL_STATUS_*` API (Android 11+) for monitoring device thermal state:

| Status | Description | Action |
|--------|------------|--------|
| `THERMAL_STATUS_NONE` | Normal | No action |
| `THERMAL_STATUS_LIGHT` | Slightly warm | Log diagnostic event |
| `THERMAL_STATUS_MODERATE` | Warm | Reduce frame rate to 30 fps |
| `THERMAL_STATUS_SEVERE` | Hot | Reduce resolution to 720p, reduce frame rate to 24 fps |
| `THERMAL_STATUS_CRITICAL` | Dangerously hot | Notify operator, suggest stopping stream |
| `THERMAL_STATUS_EMERGENCY` | Shutdown imminent | Force-stop stream, save session log |

### Mitigation Strategies

**Encoding efficiency.** Hardware encoding (MediaCodec) generates less heat than software encoding because the work runs on dedicated silicon rather than the main CPU. This is already the default.

**Dynamic resolution.** When thermal pressure increases, the Capture Layer reduces resolution. The resolution change propagates through the pipeline via the existing `updateConfig()` contract. The operator is notified ("Resolution reduced to 720p due to device temperature").

**Frame rate reduction.** Reducing frame rate from 60 to 30 fps approximately halves the encoding workload. This is a less visible quality reduction than resolution for most content types (talking heads, static scenes).

**Operator guidance.** The diagnostics system suggests corrective actions: "Move the phone out of direct sunlight," "Remove the phone case to improve heat dissipation," "Reduce to 720p30 for extended streaming."

---

## 63. Codec Research

### Current: H.264 (AVC)

H.264 is the MVP codec choice for maximum compatibility. Every Android device with MediaCodec supports H.264 hardware encoding. Every video consumer (OBS, VLC, browser, Resolve) supports H.264 decoding.

Limitations: H.264's compression efficiency is surpassed by newer codecs. At the same visual quality, H.264 requires approximately 50% more bitrate than H.265.

### Future: H.265 (HEVC)

H.265 offers better compression efficiency, reducing bandwidth requirements for the same visual quality. Android hardware support for H.265 encoding is widespread on devices from 2020+.

Considerations:
- Patent licensing: H.265 has a complex patent landscape. Evaluate licensing requirements.
- Decoder availability: OBS supports H.265 decoding via FFmpeg. Verify consumer compatibility.
- Encoding latency: Some H.265 hardware encoders have higher latency than their H.264 counterparts.

### Future: AV1

AV1 offers the best compression efficiency and is royalty-free. Hardware AV1 encoding is becoming available on flagship devices (Pixel 8+, Samsung Galaxy S24+).

Considerations:
- Hardware support is still limited to recent flagship devices. Not viable for MVP.
- Encoding complexity is higher (slower encoding, higher power consumption).
- Decoder support in OBS and other consumers is growing but not universal.

### Codec Strategy

The Capture contract is codec-agnostic. The `CaptureConfig` specifies a `VideoCodec` enum that can grow:

```
enum class VideoCodec {
    H264,    // MVP, universal
    H265,    // Stage Two, better efficiency
    AV1,     // Stage Three, royalty-free, best efficiency
}
```

The receiver negotiates codec support during session establishment. Both endpoints agree on the highest-quality codec they both support.

---

## 64. Network Resilience

### The Church Network Problem

Church Wi-Fi networks are uniquely challenging. They are consumer-grade routers serving 50–300 simultaneous devices. The network was not designed for real-time media transport. It was designed for web browsing and email.

Common issues:
- **Channel congestion.** 2.4 GHz is overcrowded. Neighboring buildings contribute interference.
- **Router firmware bugs.** Consumer routers occasionally reboot or drop multicast support.
- **DHCP lease expiry during service.** If the phone's DHCP lease expires mid-session, the IP address may change.
- **QoS misconfigurations.** Some routers prioritize certain traffic types and deprioritize UDP.

### Mitigation Research

**5 GHz preference.** Airframe should strongly prefer 5 GHz Wi-Fi bands. The Android app can detect the current Wi-Fi frequency and warn the operator if connected to 2.4 GHz: "You're on 2.4 GHz. Switch to 5 GHz for better streaming performance."

**DSCP marking.** Mark Airframe's UDP packets with DSCP EF (Expedited Forwarding) to request priority handling from routers that support QoS. Not all routers honor DSCP, but those that do will prioritize Airframe's traffic.

**Link-local fallback.** If DHCP fails, the transmitter and receiver can communicate over link-local addresses (169.254.x.x). This provides last-resort connectivity when the router's DHCP server is unresponsive.

**Wi-Fi Direct.** Establish a direct Wi-Fi connection between the phone and the receiver, bypassing the router entirely. Wi-Fi Direct provides a dedicated, interference-free link but requires the receiver to support Wi-Fi Direct (most laptops do via their Wi-Fi adapter).

---

## 65. Platform Expansion

### iOS Transmitter

An iOS transmitter would significantly expand Airframe's addressable market. iPhone camera hardware is excellent, and many creators prefer iOS.

**Technical considerations:**
- Camera: AVCaptureSession (equivalent to CameraX)
- Encoding: VideoToolbox hardware H.264/H.265 encoding
- WebRTC: Google WebRTC library available for iOS
- Discovery: Bonjour (Apple's mDNS implementation, native)
- UI: SwiftUI

**Challenges:**
- Background execution: iOS aggressively limits background processing. The app must remain in the foreground during streaming.
- Virtual camera on the receiver: Not an iOS-specific challenge, but iOS users are more likely to use macOS, increasing priority for the macOS receiver.

**Timeline:** Post-Stage Two. The iOS transmitter would share the protocol and session contracts with the Android transmitter. The Capture Layer implementation would be platform-specific, but the interface is identical.

### Linux Receiver

A Linux receiver would serve the open-source and self-hosted production community.

**Technical considerations:**
- Virtual camera: v4l2loopback (virtual Video4Linux2 device)
- WebRTC: libwebrtc available for Linux
- UI: Electron (same codebase as Windows) or GTK native
- Discovery: Avahi (Linux mDNS implementation)

**Challenges:**
- v4l2loopback requires kernel module installation, which varies by distribution
- Audio integration varies (PulseAudio, PipeWire, ALSA)

**Timeline:** Post-Stage Two. If the Electron-based receiver is used, Linux support may come with minimal additional effort—Electron runs on Linux with the same codebase.

### Web Receiver

A browser-based receiver would enable zero-install operation. The operator opens a URL in Chrome, and the receiver runs entirely in the browser.

**Technical considerations:**
- WebRTC: Native browser support (Chrome, Firefox, Safari)
- Virtual camera: Not possible from a browser. The web receiver would be display-only (preview and diagnostics) or use browser tab capture as a virtual camera workaround.
- UI: React (same component library as the desktop receiver)

**Challenges:**
- No virtual camera device registration from a browser sandbox. This is a fundamental limitation—the web receiver cannot integrate with OBS or Resolve as a camera source.
- Potential use case: monitoring-only (preview and diagnostics without virtual camera output)

**Timeline:** Exploratory. The virtual camera limitation makes a web receiver incomplete as a primary receiver. It may have value as a monitoring companion.

---

# Appendices

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Airframe Core** | The coordination layer that manages sessions, routing, timing, and diagnostics |
| **Capture Layer** | The layer responsible for acquiring media from hardware and producing encoded frames |
| **Consumer** | Any application that receives frames from Airframe (OBS, Resolve, Preview, etc.) |
| **Contract** | A defined interface between layers specifying inputs, outputs, and behavioral guarantees |
| **DTLS** | Datagram Transport Layer Security — key exchange protocol for SRTP |
| **Frame** | The fundamental data unit in Airframe: a header (32 bytes) plus a payload (encoded media) |
| **GCC** | Google Congestion Control — WebRTC's built-in bandwidth estimation algorithm |
| **Goldtooth** | Speculative future transport over custom low-power radio (research only) |
| **ICE** | Interactive Connectivity Establishment — NAT traversal protocol used by WebRTC |
| **Keyframe** | An IDR frame that can be decoded independently, without prior frame context |
| **mDNS** | Multicast DNS — zero-configuration networking protocol for service discovery |
| **MediaCodec** | Android API for hardware-accelerated video/audio encoding and decoding |
| **MVP** | Minimum Viable Product — Stage One deliverable |
| **NSD** | Network Service Discovery — Android API for mDNS |
| **Plugin SDK** | The extensibility framework allowing third-party transport, consumer, and source plugins |
| **Receiver Layer** | The layer on the receiver endpoint that accepts, decodes, and outputs incoming frames |
| **Rendering Layer** | The UI presentation layer on both transmitter and receiver |
| **SDP** | Session Description Protocol — describes media capabilities during WebRTC negotiation |
| **Session** | A logical connection lifecycle from discovery to teardown between endpoints |
| **Session Manager** | The central component of Airframe Core that owns and coordinates sessions |
| **Signal Quality** | A composite 0–100% metric combining latency, packet loss, and jitter |
| **Sink** | A receiver endpoint in the routing table |
| **Source** | A capture endpoint in the routing table |
| **SRTP** | Secure Real-time Transport Protocol — encrypted media delivery |
| **Tally** | A visual indicator showing whether a camera is on-air (LIVE) or standing by (STANDBY) |
| **Transport Layer** | The layer responsible for moving data between endpoints over a physical medium |
| **Virtual Camera** | A system-level video device driver that presents Airframe output as a camera source |
| **WebRTC** | Web Real-Time Communication — the real-time media transport stack used for the MVP |

---

## Appendix B: Architecture Decision Record Index

| ADR | Chapter | Decision |
|-----|---------|----------|
| ADR-001 | 17 | Adopt a strict layered architecture with contract-based boundaries |
| ADR-002 | 18 | Use CameraX over Camera2 for the MVP Capture Layer |
| ADR-003 | 18 | Use MediaCodec hardware encoding over software encoding |
| ADR-004 | 20 | Use WebRTC as the MVP transport |
| ADR-005 | 21 | Use virtual camera device over direct application integration |
| ADR-006 | 24 | Use mDNS/DNS-SD for local network discovery |
| ADR-007 | 45 | Use Electron for the receiver desktop application |

---

## Appendix C: Diagram Index

| Diagram | Chapter | Description |
|---------|---------|-------------|
| Layer Stack | 17 | Full architecture from Reality to Consumer |
| Capture Pipeline (Video) | 18 | Camera sensor → CameraX → MediaCodec → Frame Packager → Core |
| Capture Pipeline (Audio) | 18 | Microphone → AudioRecord → MediaCodec → Frame Packager → Core |
| Session Manager | 19 | Session Manager component with control relationships |
| Routing Table | 19 | Source-to-sink mapping (MVP and multi-device) |
| Signaling Flow | 20 | WebSocket → SDP → ICE → DTLS → SRTP sequence |
| Receiver Pipeline | 21 | Transport → Demuxer → Decoder → Virtual Camera → Consumer |
| Session State Machine | 23 & 32 | Full state machine: IDLE through ENDED |
| Transport State Machine | 32 | DISCONNECTED → CONNECTING → CONNECTED → RECONNECTING cycle |
| Capture State Machine | 32 | UNINITIALIZED → READY → CAPTURING → ERROR lifecycle |
| mDNS Service Advertisement | 24 | Service type, instance, TXT record structure |
| Pairing Flow | 25 | Discovery → WebSocket → Session Request → Accept sequence |
| Encryption Stack | 28 | Application Data → SRTP → DTLS → UDP |
| Frame Header Layout | 35 | 32-byte header field layout with offsets and sizes |
| Plugin Architecture | 59 | Plugin Manager → Custom Transport/Consumer/Source |

---

## Appendix D: Configuration Reference

### Android Transmitter Defaults

| Setting | Default | Range | Notes |
|---------|---------|-------|-------|
| Resolution | 1080p | 720p, 1080p, 4K | |
| Frame Rate | 30 fps | 24, 30, 60 | |
| Bitrate | 8 Mbps | 2–20 Mbps | |
| Audio | Enabled | On/Off | |
| Audio Bitrate | 128 kbps | 64–256 kbps | |
| Auto-Reconnect | Enabled | On/Off | |
| Reconnect Attempts | 5 | 1–10 | |
| Signaling Port | 4747 | 1024–65535 | |
| Connection Timeout | 10 s | 5–30 s | |
| Heartbeat Interval | 5 s | 1–15 s | |
| Keyframe Interval | 2 s | 0.5–10 s | |

### Windows Receiver Defaults

| Setting | Default | Range | Notes |
|---------|---------|-------|-------|
| Listen Port | 4747 | 1024–65535 | |
| Receive Buffer | 80 ms | 0–500 ms | 0 = no buffer (lowest latency) |
| Quality Preset | Balanced | Performance, Balanced, Quality | |
| Virtual Camera | Enabled | On/Off | |
| Launch with OBS | Disabled | On/Off | |
| Max Concurrent Sessions | 1 | 1–8 | MVP: 1. Stage Three: configurable |
| Diagnostics Log | Enabled | On/Off | |
| Log Retention | 7 days | 1–90 days | |

### Quality Preset Definitions

| Preset | Receive Buffer | Jitter Compensation | Target Latency | Use Case |
|--------|---------------|--------------------|---------|----|
| Performance | 20 ms | Minimal | ≤ 60 ms | Live switching, gaming |
| Balanced | 80 ms | Standard | ≤ 100 ms | Livestreaming, general use |
| Quality | 200 ms | Aggressive | ≤ 250 ms | Recording, highest visual fidelity |

---

## Appendix E: Port and Service Reference

| Service | Protocol | Default Port | Configurable |
|---------|----------|-------------|-------------|
| WebSocket signaling | TCP | 4747 | Yes |
| WebRTC media (RTP) | UDP | Dynamic (ICE) | No (ICE-assigned) |
| mDNS service advertisement | UDP | 5353 | No (protocol-defined) |
| Virtual camera device | N/A | N/A | N/A (system-level driver) |

---

*End of the Airframe Design Book.*

*This document is the canonical reference for Airframe's design, architecture, and engineering. It is a living document—updated as the system evolves, never discarded. Every decision recorded here was made deliberately. Every decision not recorded here was not yet made.*

*Airframe does not turn your phone into a webcam. It moves reality between endpoints—reliably, efficiently, and without caring how reality was captured or how it will be experienced.*






