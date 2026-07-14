# Backlog Task — 50% Proof of Concept (PoC)

**11 Fitur → 29 Task.** Berdasarkan `50_PERCENT_OF_MVP.md`.

---

## A. Core Tech & Infrastruktur Luring (2 fitur → 6 task)

### A1 — PWA Core Skeleton (3 task)

| Kode | Task | Deskripsi |
|------|------|-----------|
| A1.1 | Inisialisasi Project Vite + Tailwind | Scaffold project Vite vanilla JS, instal & konfig Tailwind CSS via PostCSS, setup struktur folder `src/`, `public/`. |
| A1.2 | Setup Service Worker | Buat `sw.js`, daftarkan via `navigator.serviceWorker.register()`, cache static assets (JS/CSS/HTML), uji offline mode. |
| A1.3 | Konfigurasi Manifest + Icon | Generate icon 192x192 & 512x512 (placeholder), buat `manifest.json`, link di `<head>` HTML. |

### A2 — Sequential Validation Engine / Gate Keeper (3 task)

| Kode | Task | Deskripsi |
|------|------|-----------|
| A2.1 | Bangun State Machine | Definisikan enum state (`IDLE`, `CAMERA_ACTIVE`, `LAR_CHECK`, `MIC_OPEN`, `SESSION_ACTIVE`), implementasi class `GateKeeper` dengan method transisi. |
| A2.2 | Pipeline Kamera -> FaceMesh -> LAR -> Gate | Stream kamera depan -> MediaPipe FaceMesh -> hitung LAR -> decision logic buka/tutup mic. |
| A2.3 | Fallback Visual + Reset State | Jika LAR gagal di tengah sesi, tutup mic, tampilkan error visual, reset state ke IDLE. |

---

## B. Modul 1 — VocaTone Engine (3 fitur -> 8 task)

### B3 — Web Audio Autocorrelation (3 task)

| Kode | Task | Deskripsi |
|------|------|-----------|
| B3.1 | Inisialisasi Audio Pipeline | Buat AudioContext, getUserMedia, AnalyserNode dengan FFT size 2048. |
| B3.2 | Implementasi Autokorelasi | Normalized time-domain autocorrelation, cari argmax lag dalam rentang 50-800 Hz, konversi ke f0 = sampleRate / lag. |
| B3.3 | Output f0 ke Modul Pemanggil | Return f0 dalam Hz (atau null jika tak terdeteksi) siap dikonsumsi komponen lain. |

### B4 — Noise Floor Gate (2 task)

| Kode | Task | Deskripsi |
|------|------|-----------|
| B4.1 | Hitung RMS dari Time Domain | Ambil Float32Array via `getFloat32TimeDomainData()`, hitung root mean square. |
| B4.2 | Integrasi Gate Logic | Jika RMS < 0.01, skip autokorelasi; return early untuk hemat CPU. |

### B5 — Single-Game Placeholder (3 task)

| Kode | Task | Deskripsi |
|------|------|-----------|
| B5.1 | Setup Canvas + Game Loop | Inisialisasi Canvas 2D, requestAnimationFrame loop dengan throttle 15-20 FPS. |
| B5.2 | Fisika Objek: Naik / Stabil / Turun | Naik (suara terdeteksi), stabil layang (f0 konstan di rentang target), gravitasi turun (diam / no input). |
| B5.3 | Render Objek + HUD | Render kotak placeholder, tampilkan f0 real-time & status di Canvas. |

---

## C. Modul 2 — Dual-Sense Engine (4 fitur -> 10 task)

### C6 — MediaPipe Face Mesh (3 task)

| Kode | Task | Deskripsi |
|------|------|-----------|
| C6.1 | Setup Stream Kamera Depan | Akses kamera depan resolusi 360p/480p square, loading MediaPipe WASM + FaceMesh model. |
| C6.2 | Ekstrak 4 Landmark Bibir | Parse landmark index 13 (top), 14 (bottom), 78 (left), 308 (right) dari `onResults()` callback, output objek `{top, bottom, left, right}`. |
| C6.3 | Throttling Frame Rate | Debounce requestAnimationFrame agar eksekusi FaceMesh maksimal 15-20 FPS. |

### C7 — Euclidean & Lip Aspect Ratio (2 task)

| Kode | Task | Deskripsi |
|------|------|-----------|
| C7.1 | Fungsi Jarak Euclidean | `d(p, q) = sqrt((px - qx)^2 + (py - qy)^2)` sebagai pure function. |
| C7.2 | Fungsi Lip Aspect Ratio | `LAR = d(P_top, P_bottom) / d(P_left, P_right)`, output nilai real-time. |

### C8 — Logika Validasi /a/ dan /i/ (3 task)

| Kode | Task | Deskripsi |
|------|------|-----------|
| C8.1 | Tentukan Threshold LAR | Tetapkan konstanta LAR_threshold_A (>= threshold) dan LAR_threshold_I (<= threshold_low) dari hasil kalibrasi manual. |
| C8.2 | Validasi /a/ | Jika LAR >= threshold_A -> buka Audio Gate, mode /a/. Tampilkan indikator visual "A". |
| C8.3 | Validasi /i/ | Jika LAR <= threshold_I -> buka Audio Gate, mode /i/. Tampilkan indikator visual "I". |

### C9 — Instant Fallback (2 task)

| Kode | Task | Deskripsi |
|------|------|-----------|
| C9.1 | Monitor LAR Loop | Pantau LAR setiap frame; jika drop di bawah threshold saat mic aktif -> trigger force close mic. |
| C9.2 | Reset State + Visual Error | Set state ke IDLE, tampilkan flash merah di Canvas, sembunyikan objek VocaTone. |

---

## D. UI/UX Zero-Audio Interface (2 fitur -> 5 task)

### D10 — Binary Visual Feedback Matrix (3 task)

| Kode | Task | Deskripsi |
|------|------|-----------|
| D10.1 | Flash Hijau (Success) | Canvas background berkedip hijau (#22C55E) saat LAR valid + f0 stabil 150-350 Hz. |
| D10.2 | Flash Kuning (Hypernasal) | Canvas background berkedip kuning (#EAB308) saat LAR valid tapi f0 > 350 Hz. |
| D10.3 | Flash Merah (Error/Idle) | Canvas background berkedip merah (#EF4444) saat LAR invalid / no face / low amplitude. |

### D11 — Mouth Silhouette Calibration (2 task)

| Kode | Task | Deskripsi |
|------|------|-----------|
| D11.1 | Render Oval Transparan | Gambar bentuk oval dengan opacity 30% di canvas overlay sebagai reference mouth shape. |
| D11.2 | Posisi Oval Ikut Wajah | Update posisi oval berdasarkan midpoint 4 landmark bibir agar tetap sejajar dengan wajah user. |

---

## Ringkasan

| Kategori | Fitur | Task |
|----------|-------|------|
| A — Core Tech | 2 | 6 |
| B — VocaTone | 3 | 8 |
| C — Dual-Sense | 4 | 10 |
| D — UI/UX | 2 | 5 |
| **Total** | **11** | **29** |
