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

## Mathematical Definitions

### Euclidean Distance
For two points `p` and `q` in 2D landmark space:
```
d(p, q) = sqrt((p_x - q_x)^2 + (p_y - q_y)^2)
```

### Lip Aspect Ratio (LAR)
Computed from four specific FaceMesh lip landmarks:
```
LAR = d(P_top, P_bottom) / d(P_left, P_right)
```
Where:
- `P_top` = FaceMesh landmark index 13 (upper lip)
- `P_bottom` = FaceMesh landmark index 14 (lower lip)
- `P_left` = FaceMesh landmark index 78 (left mouth corner)
- `P_right` = FaceMesh landmark index 308 (right mouth corner)

### Noise Floor Gate
Audio pitch extraction is SKIPPED when:
```
RMS < 0.01
```
Where RMS is computed on the `Float32Array` from `getFloat32TimeDomainData()`.

### Fundamental Frequency (f0) via Autocorrelation
```
f0 = sampleRate / argmax_lag(correlation)
```
Where `correlation` is the normalized time-domain autocorrelation function over lags corresponding to 50-800 Hz range.

---

## Sequential Validation Logic Pipeline

The core orchestration follows this strict sequential gate:

```
[Process 1] Video Camera Stream
    ↓
[Process 1] MediaPipe FaceMesh → Landmark Detection
    ↓
[Process 1] Compute LAR = d(top,bottom) / d(left,right)
    ↓
[Logic Gate] LAR_actual >= LAR_threshold ?
    ├── YES → [Process 2] Open Microphone → Web Audio API → Autocorrelation Pitch → Extract f0
    └── NO  → [Fallback] Lock Microphone → Show Error Visual Screen → Return to Process 1
```

---

## UI/UX Constraints

### Fat-Finger Standards
All interactive child UI elements MUST respect minimum touch target sizes:
- **Minimum target**: 60x60 device-independent pixels (dp)
- Applied to: buttons, touch sliders, toggle zones, interactive feedback areas.
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

## RUNTIME BOUNDARY & CONTEXT LOCK (SPRINT 1)
1. **Mandatory Context Initialization:** Before receiving, processing, or executing any prompt or command from the user, you MUST explicitly open, read, and parse in order:
   - `project_context/50_PERCENT_OF_MVP.md` — batasan ruang lingkup 50% PoC
   - `project_context/SESSION_HANDOVER.md` — status proyek terakhir, branch aktif, task sisa, critical rules
   - `project_context/ISSUE_DRAFTS.md` — spesifikasi detail tiap task
2. **Strict Scope Constraint:** The `project_context/50_PERCENT_OF_MVP.md` document acts as your absolute system boundary. You are strictly forbidden from writing code, generating components, initializing endpoints, or building mechanics that exceed the 50% Proof of Concept (PoC) scope defined in that file.
3. **No Speculative Coding:** If a user instruction implicitly or explicitly requests a feature that belongs to the Full MVP (100% scope) or the Ideal Product scope (such as full Vowel U/E/O integration, IndexedDB analytics historical logging, or advanced asset animations), you must automatically downscale the implementation to match the 50% placeholder/core-engine standards and issue a reminder of this boundary.
4. **Session Handover:** At the end of every session, you MUST update `project_context/SESSION_HANDOVER.md` with:
   - Branch aktif dan status remote
   - Task yang sudah dikerjakan (dengan status ✅/⚠️/❌)
   - Perubahan file kunci
   - Bug yang ditemukan dan solusinya
   - Next steps yang jelas

## COMMIT CONVENTION
Semua commit message WAJIB menggunakan **Bahasa Indonesia** yang konsisten.
Format: `<type>: <deskripsi singkat dalam bahasa Indonesia>`

- `feat:` — fitur baru
- `fix:` — perbaikan bug
- `chore:` — tugas teknis (config, dependencies)
- `refactor:` — perubahan kode tanpa ubah fungsionalitas
- `docs:` — perubahan dokumentasi
- `debug:` — tambahan sementara untuk debugging (jangan di-merge ke main)
