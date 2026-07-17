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
- [ ] **A2.2** — Pipeline Kamera → FaceMesh → LAR → Gate
- [ ] **A2.3** — Fallback Visual + Reset State

---

## B. Modul 1 — VocaTone Engine (3 fitur → 8 task)

### B3 — Web Audio Autocorrelation (3 task)
- [ ] **B3.1** — Inisialisasi Audio Pipeline
- [ ] **B3.2** — Implementasi Autokorelasi
- [ ] **B3.3** — Output f0 ke Modul Pemanggil

### B4 — Noise Floor Gate (2 task)
- [ ] **B4.1** — Hitung RMS dari Time Domain
- [ ] **B4.2** — Integrasi Gate Logic

### B5 — Single-Game Placeholder (3 task)
- [ ] **B5.1** — Setup Canvas + Game Loop
- [ ] **B5.2** — Fisika Objek: Naik / Stabil / Turun
- [ ] **B5.3** — Render Objek + HUD

---

## C. Modul 2 — Dual-Sense Engine (4 fitur → 10 task)

### C6 — MediaPipe Face Mesh (3 task)
- [ ] **C6.1** — Setup Stream Kamera Depan
- [ ] **C6.2** — Ekstraksi 4 Landmark Bibir
- [ ] **C6.3** — Throttling Frame Rate

### C7 — Euclidean & Lip Aspect Ratio (2 task)
- [ ] **C7.1** — Fungsi Jarak Euclidean
- [ ] **C7.2** — Fungsi Lip Aspect Ratio

### C8 — Logika Validasi /a/ dan /i/ (3 task)
- [x] **C8.1** — Tentukan Threshold LAR
- [ ] **C8.2** — Validasi /a/
- [ ] **C8.3** — Validasi /i/

### C9 — Instant Fallback (2 task)
- [ ] **C9.1** — Monitor LAR Loop
- [ ] **C9.2** — Reset State + Visual Error

---

## D. UI/UX Zero-Audio Interface (2 fitur → 5 task)

### D10 — Binary Visual Feedback Matrix (3 task)
- [ ] **D10.1** — Flash Hijau (Success)
- [ ] **D10.2** — Flash Kuning (Hypernasal)
- [ ] **D10.3** — Flash Merah (Error/Idle)

### D11 — Mouth Silhouette Calibration (2 task)
- [ ] **D11.1** — Render Oval Transparan
- [ ] **D11.2** — Posisi Oval Ikut Wajah

---

## Ringkasan

| Kategori | Fitur | Task | Selesai |
|----------|-------|------|---------|
| A — Core Tech | 2 | 6 | 4 / 6 |
| B — VocaTone | 3 | 8 | 0 / 8 |
| C — Dual-Sense | 4 | 10 | 1 / 10 |
| D — UI/UX | 2 | 5 | 0 / 5 |
| **Total** | **11** | **29** | **5 / 29** |
