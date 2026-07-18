# CHECKPOINT — V-NADA Refactor Sprint 1

**Branch saat ini:** `refactor/shared-foundation`
**Base:** `origin/develop` (synced dengan `origin/main`, commit `9d900dd`)
**Total Progress:** 10/29 PROGRESS.md tasks | 15/136 refactor-todolist items ✅

---

## ⚠️ ATURAN BRANCH — BACA INI DAHULU SEBELUM BEKERJA ⚠️

**SETIAP FASE HARUS DI BRANCH MASING-MASING. JANGAN CAMPUR.**

| Fase | Isi | Branch Wajib | Base Branch | Status |
|------|-----|-------------|-------------|--------|
| A1 | 🔴 Shared Foundation (C01,C02,C23,C24 + bonus) | `refactor/shared-foundation` | `develop` | ✅ Selesai |
| A2 | 🟡 Shared Foundation (T11-T14,T26-T30,G09,U28,S34) | `refactor/shared-foundation` | `develop` | ✅ Selesai |
| A3 | 🟢 Shared Foundation (~26 item ringan) | `refactor/shared-A3` | `develop` | ⏳ Belum |
| B | VocaTone (22 item: 🔴3→🟡8→🟢11) | `refactor/vocatone` | `develop` | ⏳ Belum |
| C | DualSense (73 item: 🔴16→🟡42→🟢15) | `refactor/dualsense` | `develop` | ⏳ Belum |

### 📌 Konsekuensi Jika Salah Branch

| Kesalahan | Akibat |
|-----------|--------|
| Fase B/C dikerjakan di `refactor/shared-foundation` | Branch jadi campur aduk, sulit di-review, conflict dengan branch module lain |
| Fase A3 dikerjakan di branch Vocatone/DualSense | Branch module membengkak dengan kode yang tidak relevan |

### ✅ Solusi Jika Terlanjur

```bash
# 1. Cari commit CHECKPOINT ini
git log --oneline | grep CHECKPOINT

# 2. Reset keras ke checkpoint (hilangkan semua commit setelahnya)
git reset --hard <hash-checkpoint>

# 3. Buat branch baru yang benar
git checkout develop
git pull origin develop
git checkout -b refactor/vocatone      # ganti sesuai fase
git cherry-pick <hash-A1>              # ambil gatekeeper.js + constants dari Fase A1
git cherry-pick <hash-A2>              # ambil db.js + audio.js dari Fase A2
# lalu lanjutkan fase di branch ini
```

### 🚀 Perintah untuk Langsung Mulai (copy-paste)

**Mulai Fase B (VocaTone):**
```bash
git checkout develop && git pull origin develop
git checkout -b refactor/vocatone
git cherry-pick 54a5b07 02522f3
# lalu lihat task di refactor-todolist.md bagian VocaTone
```

**Mulai Fase C (DualSense):**
```bash
git checkout develop && git pull origin develop
git checkout -b refactor/dualsense
git cherry-pick 54a5b07 02522f3
# lalu lihat task di refactor-todolist.md bagian DualSense
```

**Mulai Fase A3 (Shared 🟢):**
```bash
git checkout develop && git pull origin develop
git checkout -b refactor/shared-A3
git cherry-pick 54a5b07 02522f3
# lalu lihat task di refactor-todolist.md bagian 🟢 kedua
```

---

## ✅ SUDAH SELESAI (15 item — di branch `refactor/shared-foundation`)

### 🔴 Kritis (A1)

| Item | Deskripsi | File |
|------|-----------|------|
| C01 | Export pattern standarisasi — named exports | `gatekeeper.js` |
| C02 | `initCamera()` object-based API | `vision.js` |
| C23 | `f_min` konsisten dari `constants.js` | `audio.js` |
| C24 | GateKeeper state machine — valid transisi, onEnter/onExit, throw on invalid | `gatekeeper.js` (baru) |
| T01/S08 | Euclidean 2D — sumbu Z dihapus | `vision.js` |
| T17/S10/S21 | Fallback ke CAMERA_ACTIVE bukan IDLE | `main.js` |
| S01 | Mic idle by default — lazy init | `main.js` |
| S04/S32 | State machine strict — throw Error on invalid | `gatekeeper.js` |
| S07/T22 | AudioContext resume untuk Chrome/Android | `audio.js` |
| S11/S27 | Face loss → mic ditutup + onNoFace polling 500ms | `vision.js`, `main.js` |
| S30 | Camera start pakai await + try/catch | `main.js` |
| S40/S45 | Flash merah via canvas CSS class | `main.js`, `main.css` |
| S35 | Import constants.js, threshold 0.5 bukan 0.3 | `main.js` |
| T01/T03 | Vokal A high, Vokal I low | `main.js` |

### 🟡 Sedang (A1 + A2)

| Item | Deskripsi | File |
|------|-----------|------|
| T05 | `closeAudioStream()` async | `audio.js` |
| T06 | `computeRMS()` public | `audio.js` |
| T07 | `getPitchHz()` getter | `audio.js` |
| T08 | FPS 15→20 | `vision.js` |
| T10 | `refineLandmarks` false | `vision.js` |
| T11 | Sample rate 44.1kHz | `audio.js` |
| T12 | FaceMesh dispose | `vision.js` |
| T13 | srcObject cleanup | `vision.js` |
| T14 | MediaPipe caching `.binarypb/.data` | `vite.config.js` |
| T18 | Map→Float64Array | `audio.js` |
| T20/T38 | AudioContext cleanup on getUserMedia error | `audio.js` |
| T23 | State cleanup di stopSession | `main.js` |
| T24 | computeRMS guard div-by-zero | `audio.js` |
| T26 | IndexedDB seed profile | `db.js`, `main.js` |
| T27 | f_min/f_max dari profile | `db.js`, `main.js` |
| T28 | StaleWhileRevalidate untuk game components | `vite.config.js` |
| T29 | Race condition guard | `main.js` |
| T30 | Sensor disconnected try/catch | `vision.js` |
| G09 | RMS ambient noise calibration | `audio.js` |
| U28 | LAR crosshair indicator | `main.js` |
| S34 | `MIN_PITCH_HZ` diganti `f_min` | `audio.js` |

---

## ⏳ BELUM — Fase A3 (Shared Foundation 🟢)

**Branch wajib:** `refactor/shared-A3`
**Base:** `develop` + cherry-pick `54a5b07 02522f3`

| # | Item | File | Prioritas |
|---|------|------|-----------|
| U04 | Halaman pemilihan modul (VocaTone/DualSense) | `index.html` + `main.js` | 🟢 |
| U12 | Button 3-state (pressed 10% darker, disabled 40%+greyscale) | `main.css` | 🟢 |
| U20 | Instruksi "Ayo Mulai" saat no face | `index.html` / `main.js` | 🟢 |
| U21 | Camera frame border hijau untuk face detection | `main.css` | 🟢 |
| U22 | Margin layar 16dp di-enforce | `index.html` | 🟢 |
| U26 | Tombol kembali (back button) pojok kiri atas | `index.html` | 🟢 |
| U27 | Jarak antar komponen ≥ 16dp (bukan gap-3 = 12px) | `index.html` | 🟢 |
| U29 | Animated large checkmark icon untuk success | `main.js` / canvas | 🟢 |
| U30 | Orbiting Pulse animation di sekitar ikon sensor | `main.js` / canvas | 🟢 |
| U31 | Pulsing red arrow indicator saat wajah keluar | `main.js` / canvas | 🟢 |
| U14 | Camera vs mic denied — pesan dibedakan | `main.js` | 🟢 |
| U06 | Haptic feedback (`navigator.vibrate`) | `main.js` | 🟢 |
| G07 | Siluet oval garis putus-putus | Canvas | 🟢 |
| C05 | AGENTS.md syncing — ambil versi dualsense | `AGENTS.md` | 🟢 |
| C19 | Error screen CSS transition 700ms vs 500ms | `main.css` | 🟢 |
| C21 | Hardcoded "A" di `#vowel-indicator` — ganti empty string | `index.html` | 🟢 |
| C22 | Camera feed mirror `scaleX(-1)` | `main.css` | 🟢 |
| T16 | AudioContext tidak connect ke Destination | `audio.js` | 🟢 |
| U03 | Warna siluet oval per state (hijau/merah/abu) | Canvas | 🟢 |

**Wajar PoC (bisa skip):** T15 (memory monitoring), G11 (mascot), G12 (obstacle scaling), U15 (icon nav), U16 (history page), U17 (splash screen), U32 (background layers).

---

## ⏳ BELUM — Fase B (VocaTone, 22 item)

**Branch wajib:** `refactor/vocatone`
**Base:** `develop` + cherry-pick `54a5b07 02522f3`

### 🔴 Kritis (1 — 2 sudah di A1)

| # | Item | File |
|---|------|------|
| T02 | Vokal A threshold tunggal → pakai `lar_threshold.high` | `main.js` vocatone |
| ~~S35~~ | ✅ Selesai di A1 | — |
| ~~S45~~ | ✅ Selesai di A1 | — |

### 🟡 Sedang (8)

| # | Item | File |
|---|------|------|
| T21 | `lar_threshold` schema mismatch IndexedDB | `main.js` |
| T31 | Camera start error → user-facing feedback | `main.js` vocatone |
| G01 | Hapus inisialisasi kamera (VocaTone audio-only) | `main.js` vocatone |
| G08 | `_drawBackground()` warna #F8FAFC untuk fall/rise | VocaTone canvas |
| ~~T09~~ | ✅ Octave correction di A1 | — |
| S19 | Mic error `.catch()` buang error object — perbaiki | VocaTone main.js |
| S25 | Hapus dependensi kamera + FaceMesh (audio-only) | VocaTone main.js |
| S28 | Flash animasi "Berkedip" bukan static tint | VocaTone canvas |

### 🟢 Ringan (11 — 1 sudah di A1)

| # | Item | File |
|---|------|------|
| G06 | Stability timer 0.5s → min 1s | VocaTone game.js |
| G13 | Balloon color → bright/light blue | VocaTone canvas |
| G14 | Balloon movement → smooth acceleration | VocaTone canvas |
| U01 | Font vokal 72pt | VocaTone canvas |
| U02 | Error handling mic denied | VocaTone main.js |
| U05 | Silhouette guide saat no face | VocaTone canvas |
| U11 | Scaling 1.2x objek saat fonasi benar | VocaTone canvas |
| U23 | Objek membesar saat naik | VocaTone canvas |
| U25 | Siluet kalibrasi saat no face | VocaTone canvas |
| S03 | Objek hover di jalur tengah canvas | VocaTone canvas |
| ~~T25~~ | ✅ `f_max` single source of truth di A1 | — |

---

## ⏳ BELUM — Fase C (DualSense, 73 item)

**Branch wajib:** `refactor/dualsense`
**Base:** `develop` + cherry-pick `54a5b07 02522f3`

### 🔴 Kritis (4 — 12 sudah di A1)

| # | Item | File | Keterangan |
|---|------|------|-----------|
| T03 | Vokal I pakai `LAR ≤ low`, bukan spread ratio | `main.js` | Ganti `isMouthSpread` dengan `lar ≤ lar_threshold.low` |
| S04 | Bypass LAR_CHECK vokal /i/ | `gatekeeper.js` | Pastikan CAMERA_ACTIVE→LAR_CHECK→MIC_OPEN, bukan langsung MIC_OPEN |
| S09 | Vokal /i/ pakai LAR ≤ low | `main.js` | Sama dengan T03 |
| S12 | /i/ fallback monitor pakai LAR, bukan MouthWidth | `main.js` | Ganti `lastMouthWidth` dengan `lar` |

**Sudah di A1:** T01, T17, S01, S07, S08, S10, S11, S21, S27, S30, S32, S40 ✅

### 🟡 Sedang (42 item) — lihat `project_context/refactor_notes/refactor-todolist.md`
### 🟢 Ringan (15 item) — lihat `project_context/refactor_notes/refactor-todolist.md`

---

## 📋 Status File per Module

| File | Fase | Perubahan |
|------|------|-----------|
| `src/utils/gatekeeper.js` | A1 | **BARU** — GateKeeper class + STATES enum |
| `src/utils/vision.js` | A1+A2 | 2D Euclidean, FPS 20, object API, stopCamera, onNoFace, srcObject cleanup |
| `src/utils/audio.js` | A1+A2 | Resume, try/catch, Float64Array, octave correction, 44.1kHz, RMS kalibrasi |
| `src/utils/db.js` | A2 | Tambah `getDefaultProfile()` |
| `src/utils/constants.js` | — | ✅ Tidak berubah (sudah sesuai blueprint) |
| `src/main.js` | A1+A2 | State machine, crosshair, flash feedback, profile |
| `src/styles/main.css` | A1 | Tambah `flash-*` CSS classes |
| `index.html` | — | ✅ Belum diubah (untuk A3) |
| `vite.config.js` | A2 | Caching `.binarypb/.data`, StaleWhileRevalidate |
| `src/components/` | — | Kosong (VocaTone game.js belum ada) |

---

## 📎 Referensi

| Dokumen | Path |
|---------|------|
| Status per-item lengkap | `project_context/refactor_notes/refactor-todolist.md` |
| Progress task | `project_context/PROGRESS.md` |
| Scope boundary | `project_context/50_PERCENT_OF_MVP.md` |
| Catatan teknis Note-1 | `project_context/refactor_notes/refactor-note-1.md` |
| Catatan scope Note-2 | `project_context/refactor_notes/refactor-note-2.md` |

---

*Checkpoint dibuat: 17 Jul 2026 | Hash: 36e53b1 | Branch final: refactor/shared-foundation*
