# Developer Testing Checklist — V-NADA 50% PoC

**File hidup** — dicentang setiap kali testing, diupdate seiring perbaikan.

| Simbol | Arti |
|--------|------|
| `[ ]` | Belum diuji |
| `[~]` | Ditemukan isu (lihat catatan) |
| `[x]` | Lolos |

---

## A. Core Infrastructure

| # | Item | Langkah | Harapan | Status | Catatan |
|---|------|---------|---------|--------|---------|
| A1 | PWA Install | Klik ⋮ → Install V-NADA | Muncul prompt install, app terinstal | [ ] | Bisa diinstal di HP |
| A2 | Offline Load | Set offline (DevTools Network), refresh | Halaman termuat penuh, Console bersih | [ ] | Bisa jalan offline setelah deploy |
| A3 | Module Selection | Klik VocaTone & Dual-Sense | Masing-masing berpindah tampilan | [ ] | Bisa masuk ke masing-masing halaman |
| A4 | Back Button | Di VocaTone/Dual-Sense, klik ← (btn-back) | Kembali ke module select, cleanup | [ ] | Back button berfungsi |
| A5 | Service Worker | Application → Service Workers | Status "Activated and running" | [ ] | |
| A6 | Manifest Icons | Application → Manifest | Ikon 192x192, 512x512 terdaftar | [ ] | |

---

## B. VocaTone Module

| # | Item | Langkah | Harapan | Status | Catatan |
|---|------|---------|---------|--------|---------|
| B1 | Mic Permission | Pilih VocaTone | Chrome minta izin mic, canvas tampil | [ ] | |
| B2 | Balloon Idle | Diam 5 detik, tidak bersuara | Balloon di posisi bawah, tidak naik | [ ] | |
| B3 | Balloon Rise | Phonasikan "aaa..." stabil | Balloon naik kontinu | [ ] | |
| B4 | Balloon Hover | Phonasikan stabil 150–350 Hz ≥1 dtk | Balloon melayang di tengah | [ ] | |
| B5 | Balloon Fall | Berhenti bersuara | Balloon turun (gravitasi) | [ ] | |
| B6 | Pitch Display | Phonasikan nada berbeda | Nilai Hz di feedback panel berubah | [ ] | |
| B7 | Noise Floor Gate | Bisik pelan (RMS < 0.01) | Balloon tidak bergerak, status tetap "Idle" | [ ] | |
| B8 | Status Toggle | Suara aktif ↔ hentikan | Status "Listening" ↔ "Idle" | [ ] | |
| B9 | Stop & Cleanup | Klik "Stop" | Canvas hilang, mic mati | [ ] | |

---

## C. Dual-Sense — Camera & FaceMesh

| # | Item | Langkah | Harapan | Status | Catatan |
|---|------|---------|---------|--------|---------|
| C1 | Camera Permission | Pilih Dual-Sense | Chrome minta izin kamera, video tampil | [ ] | |
| C2 | Video Mirror | Lambaikan tangan kanan | Video bercermin (horizontal flip) | [ ] | |
| C3 | Silhouette Oval | Wajah terdeteksi | Oval putus-putus ikuti posisi mulut | [ ] | |
| C4 | No Face Detected | Tutup kamera / palingkan wajah | Silhouette hilang, bg abu-abu (#F8FAFC) | [ ] | |
| C5 | LAR Display | Buka / tutup mulut | Nilai LAR di panel berubah real-time | [ ] | |
| C6 | Frame Rate | Performance tab record 5 dtk | Tidak ada frame drop >16ms (20 FPS) | [ ] | |
| C7 | Stop & Cleanup | Klik "Stop" | Video feed mati, kamera off | [ ] | |

---

## D. Dual-Sense — Mode /a/ Validation

| # | Item | Langkah | Harapan | Status | Catatan |
|---|------|---------|---------|--------|---------|
| D1 | LAR ≥ 0.5 (buka mulut) | Buka mulut lebar | Indikator "A" hijau, gerbang mik terbuka | [ ] | |
| D2 | Mic Opens | Setelah LAR valid | Mic aktif, pitch mulai terdeteksi | [ ] | |
| D3 | Phonasi /a/ + LAR benar | Buka mulut + "aaa..." stabil | Flash hijau (#22C55E) | [ ] | |
| D4 | Shrill Warning (f₀ > 350 Hz) | Suara tinggi melengking | Flash kuning (#EAB308) | [ ] | |
| D5 | Mouth Closed mid-phonasi | Tutup mulut saat fonasi | Flash merah, mic mati | [ ] | |
| D6 | Instant Fallback | Ganti bentuk mulut (buka→meringis) | Error screen, flash merah, mic tutup instan | [ ] | |

---

## E. Dual-Sense — Mode /i/ Validation

| # | Item | Langkah | Harapan | Status | Catatan |
|---|------|---------|---------|--------|---------|
| E1 | Switch to mode /i/ | Pilih Dual-Sense mode /i/ | Silhouette muncul, LAR reset | [ ] | |
| E2 | LAR ≤ 0.2 (meringis) | Meringis / menyungging bibir | Indikator "I" biru, gerbang mik terbuka | [ ] | |
| E3 | Phonasi /i/ + LAR benar | Meringis + "iii..." stabil | Flash hijau | [ ] | |
| E4 | Mid-session mouth change | Fonasi /i/ → buka mulut jadi /a/ | Fallback, flash merah, mic mati | [ ] | |
| E5 | State reset after fallback | Fallback → klik reset | Kembali siap, silhouette muncul | [ ] | |

---

## F. Visual Feedback & Edge Cases

| # | Item | Langkah | Harapan | Status | Catatan |
|---|------|---------|---------|--------|---------|
| F1 | Crosshair Animation | Dual-Sense aktif | Crosshair animasi di tengah overlay | [ ] | |
| F2 | Checkmark Animation | Validasi sukses (hijau) | Checkmark animasi muncul | [ ] | |
| F3 | Error Screen | Fallback terjadi | Fullscreen overlay merah + ikon + pesan | [ ] | |
| F4 | Haptic Success | Sukses → vibrasi 100ms | Perangkat bergetar (Sensors → Vibrate) | [ ] | |
| F5 | Haptic Error | Fallback → vibrasi [50,50,50] | Perangkat bergetar 3x cepat | [ ] | |
| F6 | Fast Module Switching | Ganti module 5x cepat | Tidak error, Console bersih | [ ] | |
| F7 | Low Light | Redupkan cahaya ruangan | FaceMesh masih deteksi wajah | [ ] | |
| F8 | Multi-tap "Mulai" | Tap tombol Mulai 5x cepat | Tidak ada multiple instance | [ ] | |
| F9 | Console Check | Sepanjang sesi | Console: 0 error, 0 warning | [ ] | |
| F10 | Mobile Touch Target | Tap setiap tombol di viewport mobile 360px | Semua target ≥60x60 dp | [ ] | |
| F11 | Orientation Lock | Rotasi landscape | App tetap portrait (atau handle gracefully) | [ ] | |

---

## Ringkasan

| Suite | Total Item | [x] | [~] | [ ] |
|-------|-----------|-----|-----|-----|
| A — Core Infra | 6 | | | |
| B — VocaTone | 9 | | | |
| C — Cam & FaceMesh | 7 | | | |
| D — Mode /a/ | 6 | | | |
| E — Mode /i/ | 5 | | | |
| F — Visual & Edge | 11 | | | |
| **Total** | **44** | | | |

---

## Log Testing

| Tanggal | Perangkat | Browser | Versi App | Penguji | Temuan Baru | Status Akhir |
|---------|-----------|---------|-----------|---------|-------------|--------------|
| | | | | | | |
