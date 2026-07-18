# CHECKPOINT — V-NADA Refactor Sprint 1 (Fase B)

**Branch saat ini:** `refactor/vocatone`
**Base:** `origin/develop` + cherry-pick `54a5b07` `02522f3`
**Total Progress:** 10/29 PROGRESS.md tasks | 49/136 refactor-todolist items ✅ (+19 baru fase B)

---

## ⚠️ ATURAN BRANCH — BACA INI DAHULU SEBELUM BEKERJA ⚠️

**SETIAP FASE HARUS DI BRANCH MASING-MASING. JANGAN CAMPUR.**

| Fase | Isi | Branch Wajib | Base Branch | Status |
|------|-----|-------------|-------------|--------|
| A1 | 🔴 Shared Foundation | `refactor/shared-foundation` | `develop` | ✅ Selesai |
| A2 | 🟡 Shared Foundation | `refactor/shared-foundation` | `develop` | ✅ Selesai |
| A3 | 🟢 Shared Foundation | `refactor/shared-A3` | `develop` | ✅ Selesai |
| B | VocaTone (22 item) | `refactor/vocatone` | `develop` | ✅ **Selesai** |
| C | DualSense (73 item) | `refactor/dualsense` | `develop` | ⏳ Belum |

---

## ✅ SUDAH SELESAI (49 item — 19 baru di B)

### 🔴 Kritis (A1) — 4 item
C01, C02, C23, C24 ✅

### 🟡 Sedang (A2) — 11 item
T11-T14, T26-T30, G09, U28, S34 ✅

### 🟢 Ringan (A3) — 15 item
T16, G07, U03-U04, U06, U12, U14, U20-U22, U26-U27, U29-U31, C05, C19, C21, C22 ✅

### 🔴🟡🟢 VocaTone (B) — 19 item ✅

| Item | Status | Keterangan |
|------|--------|------------|
| T02 | ✅ | `lar_threshold.high` dari constants.js |
| T09 | ✅ | Octave correction (A1) |
| T21 | ✅ | `lar_threshold` schema object dari constants |
| T25 | ✅ | `f_min`/`f_max` single source (A1) |
| T31 | ✅ | Mic error user-facing via showError() |
| G01 | ✅ | Zero camera/FaceMesh — audio-only |
| G06 | ✅ | Stability timer STABILITY_MS = 1000 (1s) |
| G08 | ✅ | drawBackground() fill #F8FAFC |
| G13 | ✅ | Balloon bright blue #60A5FA + gradient |
| G14 | ✅ | Smooth acceleration (FALL_ACCEL + RISE_SPEED) |
| S03 | ✅ | Balloon hover center (Y 0.25-0.75) saat stabil |
| S19 | ✅ | Mic error try/catch → onError callback |
| S25 | ✅ | No camera/FaceMesh dependency |
| S28 | ✅ | CSS @keyframes blink-success/blink-warning |
| S35 | ✅ | constants.js import (A1) |
| S45 | ✅ | Flash merah (A1) |
| U01 | ✅ | ctx.font = 'bold 72pt Montserrat' |
| U02 | ✅ | Mic denied → user-facing error |
| U05/U25 | ✅ | drawSilhouette() dashed oval guide |
| U11/U23 | ✅ | targetScale = 1.2 saat voice/rising |
| S35 | ✅ | constants.js import |

---

## ⏳ BELUM — Fase C (DualSense, 73 item)

**Branch wajib:** `refactor/dualsense`
**Base:** `develop` + cherry-pick `54a5b07` `02522f3`

### 🔴 Kritis (4)
T03, S04, S09, S12

### 🟡 Sedang (42)
Lihat `project_context/refactor_notes/refactor-todolist.md`

### 🟢 Ringan (15)
Lihat `project_context/refactor_notes/refactor-todolist.md`

---

## 📋 Status File per Module

| File | Fase | Perubahan |
|------|------|-----------|
| `src/utils/gatekeeper.js` | A1 | GateKeeper class + STATES enum |
| `src/utils/vision.js` | A1+A2 | 2D Euclidean, FPS 20, object API, stopCamera |
| `src/utils/audio.js` | A1+A2+B | Resume, try/catch, Float64Array, octave, 44.1kHz, RMS, connect destination (T16) |
| `src/utils/db.js` | A2 | `getDefaultProfile()` |
| `src/utils/constants.js` | — | Tidak berubah |
| `src/games/vocatone.js` | B | **BARU** — VocaTone game class, audio-only balloon game |
| `src/main.js` | B | Simplified for VocaTone, no camera, wires VocaTone class |
| `src/styles/main.css` | A3+B | flash-* classes, blink keyframes |
| `index.html` | B | Restructured for VocaTone (no camera, vowel "A") |
| `vite.config.js` | A2 | Caching `.binarypb/.data`, StaleWhileRevalidate |

---

## 📎 Referensi

| Dokumen | Path |
|---------|------|
| Status per-item lengkap | `project_context/refactor_notes/refactor-todolist.md` |
| Progress task | `project_context/PROGRESS.md` |
| Scope boundary | `project_context/50_PERCENT_OF_MVP.md` |

---

*Checkpoint dibuat: 18 Jul 2026 | Branch final: refactor/vocatone*
