# Session Handover — C6.1 Complete, Ready for Next Issue

## Current State

| Item | Detail |
|---|---|
| **Branch aktif** | `feature/dualsense` (sudah merge dari `feat/c6.1-setup-kamera`) |
| **Remote** | `origin/feature/dualsense` — up to date |
| **Status C6.1** | ✅ Done — Issue #30 di Project Board → "Review" |
| **13 issues remaining** | C6.2, C6.3, C7.1, C7.2, C8.2, C8.3, C9.1, C9.2, D10.1–D10.3, D11.1, D11.2 |

## Files Changed (C6.1)

### `src/utils/vision.js`
- **FACEMESH_LIPS** constant: `{top:13, bottom:14, left:78, right:308}` + named export
- **`initCamera(videoElement, onResults, onError)`** — factory fungsi kamera:
  - LocateFile → `/mediapipe/`
  - FaceMesh options: `maxNumFaces:1, refineLandmarks:true, minDetectionConfidence:0.5, minTrackingConfidence:0.5`
  - onResults callback with throttle (15 FPS) + guard clause `multiFaceLandmarks`
  - Camera 480x480, fallback 360x360 on OverconstrainedError/NotSupportedError
  - Try-catch on constructor & start(), calls onError callback
- **`computeEuclideanDistance(p, q)`** — pure function
- **`computeLipAspectRatio(landmarks)`** — extracts 4 landmarks, computes LAR

### `src/main.js`
- Imports: `initCamera`, `computeLipAspectRatio` from vision.js, `lar_threshold` from constants.js
- State: `cameraController`, `sessionActive`, `lastFaceTime`, `lastLar`, `monitorTimer`
- **`onFaceLandmarks(landmarks)`** — updates LAR display, records lastFaceTime + lastLar
- **`startMonitor()`** — interval 500ms cek 2 kondisi:
  1. No face > 1.5s → "No Face Detected"
  2. LAR <= `lar_threshold.low` (0.2) → "Mouth Closed"
  3. Prioritas: No Face > Mouth Closed > OK (visual feedback only, NOT a gate)
- **`showCameraError(err)`** — NotAllowedError → "Camera Access Denied"
- Removed: audio imports, LAR gate logic, threshold state, userId param

### `src/styles/main.css`
- Added `#camera-feed { transform: scaleX(-1); }` for mirror

### `index.html`
- Added `id="error-title"` and `id="error-message"` on error-screen elements

## Critical Rules (must enforce in new session)

1. **ZERO** Node.js backend modules (`fs`, `path`, `express`, etc.)
2. **snake_case** for all fields: `user_id`, `lar_threshold`, `f_min`, `f_max`, `session_id`, `module_type`, `lar_accuracy`, `f0_stability`, `star_score`
3. Memory < 150MB, camera square max 480p, FPS 15-20
4. FFT size 2048, noise floor RMS < 0.01
5. Fat-finger: all buttons `min-w-[60px] min-h-[60px]`
6. Color tokens: `#0D47A1`, `#22C55E`, `#EF4444`, `#EAB308`, `#FFFFFF`, `#F8FAFC`
7. **Scope 50% PoC**: vowels A & I only, IndexedDB history deferred, placeholder graphics
8. Branch from `feature/dualsense` for each new task (naming: `feat/<kode-task>-<nama>`)
9. Always run `npm run validate` before commit

## Next Steps — Remaining Tasks (ShofaKhafiiy)

### Priority order (by dependency chain):

| Order | Issue | Task | Depends On | Status |
|---|---|---|---|---|
| 1 | #30 | **C6.1** — Setup Kamera ✅ | A2.2 | **DONE** |
| 2 | #31 | C6.2 — Ekstraksi 4 Landmark Bibir | C6.1 | Code already exists in vision.js |
| 3 | #32 | C6.3 — Throttling Frame Rate | C6.2 | Code partially exists (vision.js) |
| 4 | #33 | C7.1 — Euclidean Distance | C6.2 | Code already exists |
| 5 | #34 | C7.2 — Lip Aspect Ratio | C7.1 | Code already exists |
| 6 | #36 | C8.2 — Validasi /a/ | C8.1 (done by MBOEDIK) | |
| 7 | #37 | C8.3 — Validasi /i/ | C8.1 | |
| 8 | #38 | C9.1 — Monitor LAR Loop | C8.3 | |
| 9 | #39 | C9.2 — Reset State + Visual Error | C9.1 | |
| 10 | #40 | D10.1 — Flash Hijau (Success) | C8.3 | |
| 11 | #41 | D10.2 — Flash Kuning (Hypernasal) | D10.1 | |
| 12 | #42 | D10.3 — Flash Merah (Error/Idle) | D10.2 | |
| 13 | #43 | D11.1 — Render Oval Transparan | C6.2 | |
| 14 | #44 | D11.2 — Posisi Oval Ikut Wajah | D11.1 | |

**Note:** Issues C6.2 (#31), C7.1 (#33), C7.2 (#34) are partially/fully implemented in vision.js but not yet marked Done on the project board.

## File Structure Overview

```
src/
├── main.js                    # Entry point, orchestrator
├── styles/
│   └── main.css               # Tailwind + custom CSS (#camera-feed mirror)
├── components/
│   └── .gitkeep               # Empty (for future game components)
└── utils/
    ├── vision.js               # initCamera, FACEMESH_LIPS, Euclidean, LAR
    ├── audio.js                # Audio pipeline (initAudioStream, extractPitch)
    ├── constants.js            # lar_threshold, f_min, f_max
    └── db.js                   # IndexedDB (deferred for 50% PoC)
public/
├── mediapipe/                  # FaceMesh WASM + model files (offline cache)
├── fonts/                      # Inter + Montserrat woff2
└── icons/                      # PWA icons 192x192, 512x512
```

## GitHub CLI Quick Reference

```bash
# Check current branch
git branch --show-current

# Create new branch for next issue (from feature/dualsense)
git checkout feature/dualsense
git checkout -b feat/<kode-task>-<nama>
git push -u origin feat/<kode-task>-<nama>

# View issue details
gh issue view <number> --repo MBOEDIK/v-nada

# Update project board status
# Project ID: PVT_kwHOBwzd2c4Bc6wq
# Status field ID: PVTSSF_lAHOBwzd2c4Bc6wqzhXgE2w
# Options: Todo(f75ad846) / In progress(47fc9ee4) / Done(98236657)
gh project item-edit --project-id PVT_kwHOBwzd2c4Bc6wq \
  --id <ITEM_ID> \
  --field-id PVTSSF_lAHOBwzd2c4Bc6wqzhXgE2w \
  --single-select-option-id <OPTION_ID>

# Validate architecture
npm run validate

# Start dev server
tmux new-session -d -s vite-dev 'node_modules/.bin/vite --host 0.0.0.0'
# Stop: tmux kill-session -t vite-dev
```

## Project Board Fields
- Status options: `Todo` (f75ad846), `In progress` (47fc9ee4), `REVISI` (fdaf4464), `Review` (9d770ed4), `Done` (98236657)
- User (ShofaKhafiiy) has **Write** permission on repo
- All team collaborators: **MBOEDIK** (Admin), **Irwand13** (Write/VocaTone), **ShofaKhafiiy** (Write/Dual-Sense)
