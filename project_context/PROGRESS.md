# Progress Tracker — 50% Proof of Concept (PoC)

**Sumber:** `BACKLOG_50.md` — 11 Fitur → 29 Task.

> **Pointer:** Seluruh draft issue teknis, deskripsi implementasi, subtasks, dan Definition of Done untuk setiap task di bawah ini dirinci di `project_context\ISSUE_DRAFTS.md`. Lihat file tersebut untuk spesifikasi lengkap per-task.

---

## A. Core Tech & Infrastruktur Luring (2 fitur → 6 task)

### A1 — PWA Core Skeleton (3 task)
- [x] **A1.1** — Inisialisasi Project Vite + Tailwind
- [x] **A1.2** — Setup Service Worker
- [x] **A1.3** — Konfigurasi Manifest + Icon

### A2 — Sequential Validation Engine / Gate Keeper (3 task)
- [x] **A2.1** — Bangun State Machine (GateKeeper class: valid transisi, onEnter/onExit, throw on invalid)
- [x] **A2.2** — Pipeline Kamera → FaceMesh → LAR → Gate (vision.js + main.js integrasi state machine)
- [x] **A2.3** — Fallback Visual + Reset State

---

## B. Modul 1 — VocaTone Engine (3 fitur → 8 task)

### B3 — Web Audio Autocorrelation (3 task)
- [x] **B3.1** — Inisialisasi Audio Pipeline
- [x] **B3.2** — Implementasi Autokorelasi
- [x] **B3.3** — Output f0 ke Modul Pemanggil

### B4 — Noise Floor Gate (2 task)
- [x] **B4.1** — Hitung RMS dari Time Domain
- [x] **B4.2** — Integrasi Gate Logic

### B5 — Single-Game Placeholder (3 task)
- [x] **B5.1** — Setup Canvas + Game Loop
- [x] **B5.2** — Fisika Objek: Naik / Stabil / Turun
- [x] **B5.3** — Render Objek + HUD

---

## C. Modul 2 — Dual-Sense Engine (4 fitur → 10 task)

### C6 — MediaPipe Face Mesh (3 task)
- [x] **C6.1** — Setup Stream Kamera Depan (initCamera object API + stopCamera cleanup)
- [x] **C6.2** — Ekstraksi 4 Landmark Bibir (FACEMESH_LIPS + computeLipAspectRatio)
- [x] **C6.3** — Throttling Frame Rate (20 FPS throttle + RAF timing)

### C7 — Euclidean & Lip Aspect Ratio (2 task)
- [x] **C7.1** — Fungsi Jarak Euclidean (2D computeEuclideanDistance — sumbu X/Y only)
- [x] **C7.2** — Fungsi Lip Aspect Ratio (vertical/horizontal ratio)

### C8 — Logika Validasi /a/ dan /i/ (3 task)
- [x] **C8.1** — Tentukan Threshold LAR
- [x] **C8.2** — Validasi /a/ (via GateKeeper LAR_CHECK mode 'A')
- [x] **C8.3** — Validasi /i/ (via GateKeeper LAR_CHECK mode 'I')

### C9 — Instant Fallback (2 task)
- [x] **C9.1** — Monitor LAR Loop (onFaceLandmarks continuous LAR monitoring)
- [x] **C9.2** — Reset State + Visual Error (triggerFallback → flash-error + silhouette merah)

---

## D. UI/UX Zero-Audio Interface (2 fitur → 5 task)

### D10 — Binary Visual Feedback Matrix (3 task)
- [x] **D10.1** — Flash Hijau (flash-success via setFlash)
- [x] **D10.2** — Flash Kuning (flash-warning via setFlash, f₀ > f_max)
- [x] **D10.3** — Flash Merah (flash-error via setFlash, no audio input / wrong mouth)

### D11 — Mouth Silhouette Calibration (2 task)
- [x] **D11.1** — Render Oval Transparan (drawSilhouette dengan ellipse dashed)
- [ ] **D11.2** — Posisi Oval Ikut Wajah (masih di tengah canvas, belum ikut landmark midpoint)

---

## Ringkasan

| Kategori | Fitur | Task | Selesai |
|----------|-------|------|---------|
| A — Core Tech | 2 | 6 | 6 / 6 |
| B — VocaTone | 3 | 8 | 8 / 8 |
| C — Dual-Sense | 4 | 10 | 9 / 10 |
| D — UI/UX | 2 | 5 | 4 / 5 |
| **Total** | **11** | **29** | **27 / 29** |
