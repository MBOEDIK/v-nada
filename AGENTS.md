# V-NADA Agent Operational Rules

## Project Identity
- **Project Name**: V-NADA (Visual Networked Audio & Digital Articulation)
- **Nature**: 100% Client-Side Computational Processing — Zero-Cloud Server Dependency
- **Runtime Target**: Mobile Browser (Google Chrome / WebView Android context)
- **Architecture**: Single Page Application (SPA) — Vanilla JS (ES6+ Module), Vite Bundler, Tailwind CSS, HTML5 Canvas
- **Offline Mode**: Fully offline-first via Service Worker (Cache Storage API & IndexedDB)

---

## Critical Restrictions

### 1. ZERO Server-Side Code
This project runs ENTIRELY inside the user's browser. No Node.js backend, no server, no cloud compute.
- **ABSOLUTELY PROHIBITED** from importing or using any Node.js backend modules: `fs`, `path`, `crypto`, `express`, `http`, `https`, `net`, `os`, `child_process`, `cluster`, `dns`, `dgram`, `readline`, `stream`, `worker_threads`, `zlib`, `util` (Node-specific), `events` (Node-specific).
- Do NOT add any `package.json` fields for server scripts, server dependencies, or server runtimes.
- Do NOT import from `node:` prefix.
- All computations must use Native Browser APIs only (Web Audio API, Canvas API, MediaPipe, IndexedDB, Cache Storage API).

### 2. Memory & Performance Constraints
- Low-end mobile device target: <150MB memory limit.
- Camera resolution: Square 360p or 480p maximum.
- Frame rate throttling: 15-20 FPS via `requestAnimationFrame` time-debounce.
- Audio FFT size: 2048 or 4096 via `AnalyserNode`.
- Dead code / unused variables are FORBIDDEN — every allocation counts.

### 3. Variable Naming Convention
All database fields, configuration objects, and state variables MUST use exact snake_case naming below:

| Variable | Type | Description |
|---|---|---|
| `user_id` | String (PK) | Unique user identifier |
| `lar_threshold` | Object | Lip Aspect Ratio threshold configuration |
| `f_min` | Number | Minimum frequency (Hz) for pitch detection |
| `f_max` | Number | Maximum frequency (Hz) for pitch detection |
| `session_id` | String (PK) | Unique training session identifier |
| `timestamp` | Date | Session recording timestamp |
| `module_type` | Enum | Training module type identifier |
| `lar_accuracy` | Float | Lip aspect ratio accuracy score (0.0-1.0) |
| `f0_stability` | Float | Fundamental frequency stability score |
| `star_score` | Integer | Star rating (1-3) |

---

## UI/UX Constraints

### Fat-Finger Standards
All interactive child UI elements MUST respect minimum touch target sizes:
- **Minimum target**: 60x60 device-independent pixels (dp)
- Use `min-w-[60px] min-h-[60px]` Tailwind utilities.

### Color Tokens (WCAG AAA 7:1 Ratio)
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#0D47A1` | Main action items, UI buttons |
| `success` | `#22C55E` | Correct phonation / validated LAR feedback |
| `danger` | `#EF4444` | Incorrect motoric / error execution state |
| `warning` | `#EAB308` | Shrill pitch / hypernasal warning state |
| `bg-light` | `#FFFFFF` | Base application canvas layout background |
| `muted` | `#F8FAFC` | Neutral indicator: no face detected, idle, or low amplitude |

---

## MVP Feature Modules

### Core Modules (50% PoC Scope)
The Proof of Concept implements two core modules, unified under a shared visual interface layer:

**Module 1 — VocaTone (Single-Game Balloon)**
- **Mechanic**: Web Audio API Autocorrelation pitch detection.
- **Interaction**: User phonates into microphone; detected pitch moves a placeholder object (geometric shape) vertically on Canvas.
- **Goal**: Sustain phonation to keep the object afloat.
- **Status**: Audio-only pipeline. No camera dependency. Sequential Validation Logic does NOT apply.

**Module 2 — Dual-Sense (Articulation)**
- **Mechanic**: MediaPipe Face Mesh landmark tracking + Web Audio API (sequential gate).
- **Contrast Vowels**: /a/ vs /i/ only. (U, E, O deferred post-PoC.)
- **Interaction**: User opens mouth (LAR increases) for /a/, spreads lips (LAR decreases) for /i. Mic opens only after LAR passes threshold.
- **Goal**: Achieve correct LAR threshold for target vowel, then phonate with stable f0.
- **Validation**: Sequential Validation Logic — camera → LAR → mic → f0.

**Shared Visual Layer — Binary Visual Feedback & Mouth Silhouette Calibration**
- **Binary Feedback**: Green (#22C55E) for correct / Yellow (#EAB308) for shrill (f₀ > f_max) / Red (#EF4444) for wrong mouth shape / Grey (#F8FAFC) for no face detected or low amplitude.
- **Calibration**: Mouth silhouette oval outline (static, 30% opacity) on Canvas overlay via FaceMesh landmarks.
- **Real-time display**: LAR value, Pitch (Hz). Star rating & IndexedDB history deferred post-PoC.

---

## Technical Blueprint Index

All technical specifications, UX mappings, visual design systems, and game design documents are maintained in `project_context/technical_blueprint/`. This AI Agent MUST read every file in that directory before writing any code to ensure alignment with the latest specifications.

| Prefix | Domain | Key Files |
|---|---|---|
| TECH | Audio Processing, Camera Optimization, Data Architecture | `tech-01` → `tech-04` |
| UX | Persona, User Journey, Zero-Audio UX, Information Architecture | `ux-01` → `ux-04` |
| VISUAL | Design System, Overlay Guide, Asset Inventory | `visual-01` → `visual-03` |
| GAME | VocaTone GDD, Dual-Sense GDD, Visual Feedback, Reward System | `game-01` → `game-04` |

---

## RUNTIME BOUNDARY & CONTEXT LOCK (SPRINT 1)
1. **Mandatory Context Initialization:** Before receiving, processing, or executing any prompt or command from the user, you MUST explicitly open, read, and parse the `project_context\50_PERCENT_OF_MVP.md` file located in the repository.
2. **Strict Scope Constraint:** The `project_context\50_PERCENT_OF_MVP.md` document acts as your absolute system boundary. You are strictly forbidden from writing code, generating components, initializing endpoints, or building mechanics that exceed the 50% Proof of Concept (PoC) scope defined in that file.
3. **No Speculative Coding:** If a user instruction implicitly or explicitly requests a feature that belongs to the Full MVP (100% scope) or the Ideal Product scope (such as full Vowel U/E/O integration, IndexedDB analytics historical logging, or advanced asset animations), you must automatically downscale the implementation to match the 50% placeholder/core-engine standards and issue a reminder of this boundary.

### 4. Scope Confirmation via PROGRESS.md
Before executing any user request that involves code generation, file modification, or system implementation, you MUST:
   - Read `project_context\PROGRESS.md` and explicitly confirm with the user whether their request aligns with the scope defined in that file.
   - If the user confirms alignment, identify which specific task code (e.g., `A1.1`, `C6.2`, `D10.1`) the request belongs to.
   - If the user's request falls outside all task codes in PROGRESS.md, reject the request and remind the user of the 50% PoC scope boundary defined in `project_context\50_PERCENT_OF_MVP.md`.

### 5. Auto-Checkmark on Task Completion
After successfully completing a user-requested task (code generation, file modification, testing, etc.), you MUST:
   - Locate the corresponding checklist item in `project_context\PROGRESS.md`.
   - Update the `[ ]` to `[x]` for that specific task code.
   - Update the summary table at the bottom of PROGRESS.md to reflect the new completion count.