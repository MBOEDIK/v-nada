# CHECKPOINT — V-NADA Refactor Sprint 1

**Branch:** `refactor/shared-foundation`
**Base:** `origin/develop` (synced with `origin/main` via fast-forward, commit `9d900dd`)
**Last Commit:** `02522f3` — Fase A2 done
**Total Progress:** 10/29 PROGRESS.md tasks | 15/136 refactor-todolist items

---

## Ringkasan Eksekusi

| Fase | Item | Status | File Terkena |
|------|------|--------|-------------|
| **A1 — 🔴 Shared Foundation** | C01, C02, C23, C24 + 11 bonus items | ✅ Selesai | `gatekeeper.js` (baru), `vision.js`, `audio.js`, `main.js`, `main.css` |
| **A2 — 🟡 Shared Foundation** | T11-T14, T26-T30, G09, U28, S34 | ✅ Selesai | `audio.js`, `vision.js`, `db.js`, `main.js`, `vite.config.js` |
| **A3 — 🟢 Shared Foundation** | ~26 item ringan | ⏳ BELUM | — |
| **B — VocaTone** | 22 item (🔴3→🟡8→🟢11) | ⏳ BELUM | — |
| **C — DualSense** | 73 item (🔴16→🟡42→🟢15) | ⏳ BELUM | — |

---

## Yang SUDAH Dilakukan (15 item)

### 🔴 Kritis (4+6 bonus = 10 item)

| Item | Deskripsi | Keterangan |
|------|-----------|-----------|
| **C01** | Export pattern standarisasi | `GateKeeper` class + `STATES` enum — named exports |
| **C02** | `initCamera()` API standarisasi | `initCamera({ videoElement, onFace, onNoFace })` — object parameter |
| **C23** | `f_min` konsistensi | `constants.js` sebagai single source of truth (`f_min:150`) |
| **C24** | GateKeeper state machine | Class `GateKeeper` di `gatekeeper.js` — valid transisi, `onEnter`/`onExit`, throw on invalid |
| **T01/S08** | Euclidean 3D → 2D | `computeEuclideanDistance()` — sumbu Z dihapus |
| **T17/S10/S21** | Fallback reset ke CAMERA_ACTIVE (bukan IDLE) | `triggerFallback()` → `gatekeeper.fallbackTo(CAMERA_ACTIVE)` |
| **S01** | Mic idle by default | Hapus `preGrantAudioPermission()` — lazy init via GateKeeper |
| **S04/S32** | LAR_CHECK bypass + silent return | State machine strict — throw `Error` on invalid transition |
| **S07/T22** | AudioContext resume | `ensureResumed()` — resume di Chrome/Android |
| **S11/S27** | Face loss — mic ditutup + onNoFace callback | `onNoFace()` callback + polling 500ms + `closeAudioGate()` |
| **S30** | Camera start fire-and-forget | `await cameraCtrl.start()` + try/catch |
| **S40/S45** | Flash merah saat no suara | `setFlash('flash-error')` via canvas CSS class |
| **S35** | VocaTone threshold constants | Impor `lar_threshold` dari `constants.js` (0.5 bukan 0.3) |

### 🟡 Sedang (11 item — bonus dari A1 + A2)

| Item | Deskripsi | Keterangan |
|------|-----------|-----------|
| **T05** | `closeAudioStream()` sync→async | `await audioContext.close()` |
| **T06** | `computeRMS()` private→public | Exported |
| **T07** | `getPitchHz()` getter | Exported convenience function |
| **T08** | FPS 15 → 20 | `TARGET_FPS = 20` |
| **T10** | `refineLandmarks` true→false | Hapus 400KB overhead |
| **T11** | Sample rate 44.1kHz | `TARGET_SAMPLE_RATE=44100` + `sampleRate: { ideal }` di getUserMedia |
| **T12** | FaceMesh dispose | `faceMeshInstance.close()` di `stopCamera()` |
| **T13** | srcObject cleanup | `videoElementRef.srcObject = null` + track stop di `stopCamera()` |
| **T14** | MediaPipe caching | `.binarypb/.data` runtime caching CacheFirst |
| **T18** | Map→Float64Array | Ganti `new Map()` ~800 entries dengan `Float64Array` |
| **T20/T38** | AudioContext cleanup on error | `try/catch` getUserMedia + `ctx.close()` |
| **T23** | State cleanup di stopSession | Reset semua state variables |
| **T24** | computeRMS guard div-by-zero | `if (!buffer || buffer.length === 0) return 0` |
| **T26** | IndexedDB dead code | `saveProfile()` dipanggil di `startSession()` seed default |
| **T27** | f_min/f_max dari profile | `getProfile()` + `getDefaultProfile()` di `startSession()` |
| **T28** | Stale-While-Revalidate | Untuk `assets/index-*.{js,css}` |
| **T29** | Race condition guard | `audioInitializing` flag cegah re-entry `initAudioStream()` |
| **T30** | Sensor disconnected | `try/catch` di FaceMesh `onFrame` |
| **G09** | RMS ambient calibration | `calibrateAmbientNoise()` — 10 frame sampling |
| **U28** | LAR crosshair indicator | Canvas crosshair + pulsing circle |
| **S34** | `MIN_PITCH_HZ` → `f_min` | Import dari `constants.js` |

---

## Yang BELUM Dilakukan (121 item)

### Fase A3 — 🟢 Shared Foundation (~26 item)

| # | Item | File | Prioritas |
|---|------|------|-----------|
| T10 | Hapus `refineLandmarks: true` | ✅ Selesai di Fase A1 | |
| T15 | Memory limit <150MB (wajar PoC) | — | Wajar PoC |
| T16 | AudioContext tidak connect ke Destination | `audio.js` | ✅ Sebenarnya aman untuk PoC (mencegah feedback) |
| G07 | Siluet oval garis putus-putus | `overlay.js` / canvas | 🟢 |
| G11 | Mascot with Expressions (wajar PoC) | — | Wajar |
| G12 | Dynamic Obstacle scaling (wajar PoC) | — | Wajar |
| U04 | Halaman pemilihan modul | `index.html` + `main.js` | 🟢 |
| U06 | Haptic feedback | `navigator.vibrate` | 🟢 |
| U12 | Button 3-state styling | `main.css` | 🟢 |
| U14 | Camera vs mic denied dibedakan | `main.js` | 🟢 |
| U15 | Icon-based navigation (wajar PoC) | — | Wajar |
| U16 | Halaman history (wajar PoC) | — | Wajar |
| U17 | Splash screen (wajar PoC) | — | Wajar |
| U20 | Instruksi "Ayo Mulai" saat no face | `index.html` / `main.js` | 🟢 |
| U21 | Camera frame border hijau | `main.css` | 🟢 |
| U22 | Margin layar 16dp | `index.html` | 🟢 |
| U26 | Tombol kembali (back button) | `index.html` | 🟢 |
| U27 | Jarak antar komponen ≥ 16dp | `index.html` | 🟢 |
| U29 | Animated large checkmark icon | `main.js` / canvas | 🟢 |
| U30 | Orbiting Pulse animation | `main.js` / canvas | 🟢 |
| U31 | Pulsing red arrow indicator | `main.js` / canvas | 🟢 |
| U32 | Background layers & HUD SVG (wajar PoC) | — | Wajar |
| C05 | AGENTS.md syncing | `AGENTS.md` | 🟢 |
| C19 | Error screen CSS transition 700ms vs 500ms | `main.css` | 🟢 |
| C21 | Hardcoded "A" di `#vowel-indicator` | `index.html` | 🟢 |
| C22 | Camera feed mirror | `main.css` (`scaleX(-1)`) | 🟢 |
| U03 | Warna siluet oval per state | canvas | 🟢* |
| S03 | VocaTone objek hover di tengah canvas | VocaTone | 🟢 |

### Fase B — VocaTone (22 item)

#### 🔴 Kritis (3)
| # | Item | File |
|---|------|------|
| T02 | Vokal A threshold tunggal → `lar_threshold.high` | `main.js` vocatone |
| S35 | Tidak import constants.js — threshold 0.3 ≠ 0.5 | ✅ Selesai di A1 |
| S45 | Flash merah saat tidak ada suara | ✅ Selesai di A1 |

Sisa A1 sudah: **S45 ✅, S35 ✅**. Tersisa: **T02** (validasi A/I di vocatone entry point).

#### 🟡 Sedang (8)
| # | Item | File |
|---|------|------|
| T09 | Octave correction di vocatone | ✅ Selesai di A1 (audio.js) |
| T21 | `lar_threshold` schema mismatch IndexedDB | `main.js` |
| T31 | Camera start error — user-facing | `main.js` vocatone |
| G01 | Hapus inisialisasi kamera (audio-only) | `main.js` vocatone |
| G08 | `_drawBackground()` #F8FAFC | VocaTone canvas |
| S19 | Mic error dead code di `.catch()` | VocaTone main.js |
| S25 | Hapus kamera + FaceMesh | VocaTone main.js |
| S28 | Flash animasi "Berkedip" | VocaTone canvas |

#### 🟢 Ringan (11)
| # | Item | File |
|---|------|------|
| T25 | `f_max` dual source of truth | ✅ Selesai di A1 |
| G06 | Stability timer 0.5s → min 1s | VocaTone game.js |
| G13 | Balloon color bright blue | VocaTone canvas |
| G14 | Balloon smooth acceleration | VocaTone canvas |
| U01 | Font vokal 72pt | VocaTone canvas |
| U02 | Error handling mic denied | VocaTone main.js |
| U05 | Silhouette guide saat no face | VocaTone canvas/overlay |
| U11 | Scaling 1.2x objek saat fonasi benar | VocaTone canvas |
| U23 | Objek membesar saat naik | VocaTone canvas |
| U25 | Siluet kalibrasi saat no face | VocaTone canvas |
| S03 | Objek hover di tengah canvas | VocaTone canvas |

### Fase C — DualSense (73 item)

#### 🔴 Kritis (16 — beberapa ✅ di A1, sisanya ⬇️)
| # | Item | Status |
|---|------|--------|
| T01 | Euclidean 3D→2D | ✅ A1 |
| T03 | Vokal I pakai LAR≤low, bukan spread | **❌** |
| T17 | triggerFallback() ke CAMERA_ACTIVE | ✅ A1 |
| S01 | preGrantAudioPermission() | ✅ A1 |
| S04 | Bypass LAR_CHECK vokal /i/ | **❌** (sebagian ✅ — state machine strict, tapi logika /i/ masih pakai LAR≤low) |
| S07 | AudioContext resume | ✅ A1 |
| S08 | Euclidean 3D→2D | ✅ A1 |
| S09 | Vokal /i/ pakai LAR≤low | **❌** |
| S10 | triggerFallback() reset IDLE | ✅ A1 |
| S11 | Face loss mic ditutup | ✅ A1 |
| S12 | /i/ fallback monitor pakai LAR | **❌** |
| S21 | LAR_CHECK gagal → IDLE | ✅ A1 |
| S27 | onNoFace callback | ✅ A1 |
| S30 | Camera start fire-and-forget | ✅ A1 |
| S32 | transitionTo() silent return | ✅ A1 |
| S40 | Flash merah MIC_OPEN tanpa suara | ✅ A1 |
| S35/S45 | VocaTone threshold & flash | ✅ A1 |

**Sisa 🔴 DualSense:** T03, S04, S09, S12 (semua terkait logika vokal /i/)

#### 🟡 Sedang (42) — lihat refactor-todolist.md 🔴🟡 dualsense section
#### 🟢 Ringan (15) — lihat refactor-todolist.md 🟢 dualsense section

---

## Status File per Module

| File | Status Perubahan | Fase |
|------|-----------------|------|
| `src/utils/gatekeeper.js` | **BARU** — state machine inti | A1 |
| `src/utils/vision.js` | Diubah: 2D Euclidean, TARGET_FPS=20, refineLandmarks=false, object API, stopCamera, onNoFace | A1+A2 |
| `src/utils/audio.js` | Diubah: resume, try/catch, export computeRMS, Float64Array, octave correction, TARGET_SAMPLE_RATE, kalibrasi RMS | A1+A2 |
| `src/utils/db.js` | Diubah: tambah `getDefaultProfile()` | A2 |
| `src/utils/constants.js` | ✅ Tidak berubah (sudah sesuai blueprint) | — |
| `src/main.js` | Diubah total: GateKeeper state machine, crosshair, flash feedback, profile | A1+A2 |
| `src/styles/main.css` | Diubah: tambah flash-* CSS classes | A1 |
| `index.html` | ✅ Belum diubah (perlu A3 untuk back button, margin, dll) | — |
| `vite.config.js` | Diubah: caching strategy + StaleWhileRevalidate | A2 |
| `src/components/` | Kosong (.gitkeep only) — VocaTone game.js belum ada | — |

---

## Perintah untuk Chat Berikutnya

Mulai chat baru dengan agen V-NADA dan paste:
```
Lanjutkan refactor V-NADA dari branch `refactor/shared-foundation`.
Checkpoint detail di project_context/refactor_notes/CHECKPOINT.md.
Status lengkap per-item di project_context/refactor_notes/refactor-todolist.md.
Progress task di project_context/PROGRESS.md.
Scope boundary di project_context/50_PERCENT_OF_MVP.md.
```

---

*Checkpoint dibuat: 17 Jul 2026 | Branch: refactor/shared-foundation | Hash: 02522f3*
