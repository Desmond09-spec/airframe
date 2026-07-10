You are the Chief Systems Architect responsible for designing the engineering blueprint for a project called **Airframe Bootstrap**.

This is NOT a README.

This is NOT user documentation.

This is NOT marketing material.

Treat this as the primary engineering reference that another senior software engineer could use to build the project from scratch five years from now without speaking to the original author.

The document should read like an internal engineering specification or architectural blueprint produced at a company like Microsoft, JetBrains, Docker, Cloudflare, Linear, or Apple.

Write in Markdown.

The document should be comprehensive, deeply reasoned, and explain not only HOW every subsystem works, but WHY it exists and why each design decision was made.

Avoid unnecessary verbosity, but do not oversimplify.

The target audience is software engineers.

---

# Project Overview

Airframe Bootstrap is NOT an installer.

It is the entry point into the Airframe ecosystem.

Its responsibility is to prepare a machine for Airframe, install selected Airframe components, verify downloaded packages, configure the operating system, launch Airframe, and then permanently hand over responsibility to Airframe's own Updater.

Bootstrap should NEVER become responsible for application updates.

Bootstrap should NEVER contain the Airframe application binaries.

Bootstrap downloads them.

Bootstrap verifies them.

Bootstrap installs them.

Bootstrap launches them.

Bootstrap exits.

After installation it is no longer involved.

---

# Airframe Philosophy

Airframe is built around independent architectural layers.

Examples include:

Capture

↓

Transport

↓

Processing

↓

Rendering

↓

Receiver

Every layer is independent from every other layer.

Bootstrap should follow exactly the same philosophy.

Every subsystem should have one responsibility.

Everything should be modular.

Everything should be replaceable.

Everything should evolve independently.

---

# Document Requirements

Produce a professional engineering blueprint with a full table of contents.

Include detailed sections covering (at minimum):

1. Philosophy
2. Vision
3. Goals
4. Non-goals
5. Design Principles
6. Engineering Principles
7. User Experience Principles
8. High-Level Architecture
9. System Components
10. Execution Lifecycle
11. Bootstrap Lifecycle
12. Component Responsibilities
13. Folder Structure
14. Repository Structure
15. Frontend Architecture
16. Backend Architecture
17. Go Package Layout
18. React Project Layout
19. State Management
20. Dependency Graph
21. Installation Pipeline
22. Runtime Detection
23. Environment Inspection
24. Download Manager
25. Package Manifest Design
26. Version Resolution
27. Integrity Verification
28. SHA-256 Verification
29. Digital Signature Verification (future)
30. Package Extraction
31. Installer Engine
32. Rollback Strategy
33. Atomic Installation
34. Shortcut Creation
35. Registry Management
36. File Associations
37. Uninstall Registration
38. Logging
39. Error Handling
40. Recovery Strategy
41. Security Model
42. Threading Model
43. Concurrency
44. Progress Reporting
45. Communication Between Components
46. Launching Airframe
47. Why Bootstrap Exits
48. Relationship with Airframe Updater
49. Update Architecture
50. Release Pipeline
51. GitHub Releases Strategy
52. CI/CD
53. Testing Strategy
54. Design System
55. UI Architecture
56. Animation Principles
57. Accessibility
58. Future Evolution
59. Airframe Hub
60. Plugin Installation
61. Component Installer
62. Package Manager Vision
63. Risks
64. Tradeoffs
65. Technical Decisions
66. Engineering Invariants
67. Roadmap
68. Appendix
69. Glossary

---

# Engineering Invariants

One of the most important chapters should be Engineering Invariants.

These are architectural rules that should almost never be broken.

Examples include:

- Bootstrap never contains Airframe binaries.
- Bootstrap never performs updates.
- Bootstrap never communicates with Airframe after launch.
- Every downloaded package must be verified.
- Every subsystem has exactly one responsibility.
- Installation must be recoverable.
- Installation must be resumable.
- The UI must remain responsive.
- Business logic must not exist inside UI components.
- Bootstrap should remain platform-agnostic where possible.
- Platform-specific code should be isolated.
- Every subsystem should expose clear interfaces.
- Every subsystem should be independently testable.

Expand these into a much larger engineering constitution.

---

# Repository Structure

Design a repository that could realistically support this project for many years.

Example:

airframe-bootstrap/

    apps/

    internal/

    pkg/

    assets/

    scripts/

    docs/

    tools/

    tests/

Design every folder.

Explain why it exists.

Explain what belongs inside.

---

# Codebase Architecture

Design the internal Go architecture.

Describe packages.

Interfaces.

Services.

Dependency injection.

Configuration.

Logging.

Concurrency.

Event flow.

Lifecycle management.

State transitions.

Error propagation.

Dependency graph.

Avoid circular dependencies.

---

# Frontend

The UI should be written in React + TypeScript.

The backend should be Go.

The desktop shell should be Wails.

Explain why.

Design the UI architecture.

Component hierarchy.

Hooks.

Contexts.

State flow.

Animations.

Progress updates.

Accessibility.

---

# Visual Design

Airframe follows a minimal monochrome design language.

No skeuomorphism.

No gradients.

No unnecessary decoration.

Large typography.

Clean spacing.

Rounded corners.

Minimal animations.

Fast.

Professional.

The installer should feel like an Airframe application rather than a traditional Windows installer.

---

# Long-Term Vision

Bootstrap should eventually evolve into the Airframe Hub.

The Hub should become capable of:

- installing Airframe products
- installing plugins
- downloading transports
- downloading SDKs
- downloading Capture modules
- downloading Receiver modules
- downloading diagnostics
- managing updates
- uninstalling components
- repairing installations

Describe how today's Bootstrap architecture should make that future evolution possible without requiring a rewrite.

---

# Writing Style

Write this document like an engineering specification.

Avoid fluff.

Avoid marketing language.

Explain reasoning.

Explain tradeoffs.

Include diagrams using Markdown.

Include architecture diagrams.

Include lifecycle diagrams.

Include folder trees.

Include sequence diagrams.

Include dependency graphs.

Include examples.

Include pseudo-code where appropriate.

The final document should feel like the blueprint for a serious engineering project that could be maintained for the next decade.