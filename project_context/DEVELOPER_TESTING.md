# Developer Testing Checklist — V-NADA 50% PoC (Current Branch: vocatone/dualsense)

**File hidup** — dicentang setiap kali testing, diupdate seiring perbaikan.

| Simbol | Arti |
|--------|------|
| `[ ]` | Belum diuji |
| `[~]` | Ditemukan isu (lihat catatan) |
| `[x]` | Lolos |

---

## A. Core Infrastructure (PWA & Routing)

| # | Item | Langkah | Harapan | Status | Catatan |
|---|------|---------|---------|--------|---------|
| A1 | PWA Install | Klik ⋮ → Install V-NADA | Muncul prompt install, app terinstal | [x] | Bisa diinstal di HP |
| A2 | Offline Load | Set offline (DevTools Network), refresh | Halaman termuat penuh, Console bersih | [~] | Halaman termuat penuh, tidak bisa cek console karena testing manual dilakukan di HP |
| A3 | Module Selection | Klik VocaTone & Dual-Sense di dashboard | Masing-masing berpindah tampilan | [x] | Bisa masuk ke masing-masing halaman |
| A4 | Back Button | Di VocaTone/Dual-Sense, klik ← (btn-back) | Kembali ke module select, cleanup penuh | [~] | Tombol kembali berfungsi, tidak tau ter-cleanup atau tidak (karena di HP, tidak tau cara ceknya) |
| A5 | Service Worker | Application → Service Workers | Status "Activated and running" | [ ] | Tidak paham dengan item ini |
| A6 | Manifest Icons | Application → Manifest | Ikon 192x192, 512x512 terdaftar | [ ] | Tidak paham dengan item ini |

---

## B. VocaTone Module (Audio-Only)

| # | Item | Langkah | Harapan | Status | Catatan |
|---|------|---------|---------|--------|---------|
| B1 | Mic Permission | Pilih VocaTone → Klik "Mulai" | Chrome minta izin mic, canvas tampil | [x] | Sesuai harapan |
| B2 | Box Idle | Diam 5 detik, tidak bersuara | Kotak 40×40 px di posisi bawah, tidak naik | [x] | Sesuai harapan |
| B3 | Box Rise | Phonasikan "aaa..." stabil | Kotak naik kontinu ke atas | [~] | Saat "aaa..." stabil: canvas hijau, progress bar penuh, pitch 135-143 Hz, box mengambang stabil TIDAK naik kontinu. Saat suara putus-putus "a..aa..aa", box naik kontinu sampai atas. Semakin cepat "aa..aa", semakin cepat naik. "ciiit..." box melesat. |
| B4 | Box Hover | Phonasikan stabil 150–350 Hz ≥500 ms | Kotak melayang di tengah (sinusoidal drift ±0.5px) | [x] | Saat fonasi "aaa..." stabil, box melayang stabil (naik turun kecil) |
| B5 | Box Fall | Berhenti bersuara | Kotak turun (gravitasi: 1.5px/frame², max 8px/frame) | [x] | Sesuai harapan |
| B6 | Pitch Display | Phonasikan nada berbeda | Nilai Hz di panel "Pitch (Hz)" berubah real-time | [x] | Angka pitch tetap sama untuk A/I/U/E/O jika suara stabil |
| B7 | Noise Floor Gate | Bisik pelan (RMS < 0.01) | Kotak tidak bergerak, status "Idle" | [~] | Status selalu active walaupun diam total maupun bersuara. Bisik sangat rendah (hampir berbisik): box melayang stabil (canvas hijau). Berbisik total (desusan): box terangkat secuil lalu jatuh + flash kuning |
| B8 | Status Toggle | Suara aktif ↔ hentikan | Status "Active" ↔ "Idle" / "No Mic" | [~] | Bersuara atau tidak, status selalu 'active' |
| B9 | Stop & Cleanup | Klik "Stop" | Canvas hilang, mic mati, AudioContext closed | [x] | Status berubah jadi 'idle', canvas juga hilang |
| B10 | Shrill Warning | Nada > 350 Hz (f_max) | Background canvas kuning (20% opacity), status "Naik" | [x] | Saat suara di atas 350 Hz canvas jadi warna kuning |
| B11 | Stable Background | Pitch stabil 150–350 Hz ≥500ms | Background canvas hijau (20% opacity), status "Stabil" | [x] | Sesuai harapan |
| B12 | 20 FPS Throttle | Performance tab record 5 detik | Tidak ada frame drop >50ms (20 FPS cap) | [ ] | Tidak tau caranya cek fps, apalagi di HP |

---

## C. Dual-Sense — Camera & FaceMesh

| # | Item | Langkah | Harapan | Status | Catatan |
|---|------|---------|---------|--------|---------|
| C1 | Camera Permission | Pilih Dual-Sense → Klik "Start" | Chrome minta izin kamera, video tampil | [x] | Sesuai harapan |
| C2 | Video Mirror | Lambaikan tangan kanan | Video bercermin (horizontal flip) | [x] | Sesuai harapan |
| C3 | Silhouette Oval | Wajah terdeteksi | Oval putus-putus ikuti posisi mulut (30% opacity) | [~] | Oval mengikuti mulut hanya secara vertikal, secara horizontal ovalnya mengikuti tapi seakan2 tercermin (tidak sesuai dengan mulut secara horizontal). Oval tidak putus-putus, opasitas sesuai. |
| C4 | No Face Detected | Tutup kamera / palingkan wajah | Silhouette hilang, bg abu-abu (#F8FAFC) | [~] | Silhouette hilang, tapi tidak ada bg abu2, yang ada hanyalah layar full merah dengan pesan 'No Face Detected' |
| C5 | LAR Display | Buka / tutup mulut | Nilai LAR di panel berubah real-time (2 desimal) | [x] | Sesuai harapan |
| C6 | Frame Rate | Performance tab record 5 detik | Tidak ada frame drop >50ms (20 FPS cap) | [ ] | Tidak tau cara cek fps (di HP) |
| C7 | Camera Resolution | Inspect video element | Square 480×480 atau 360×360 (fallback) | [ ] | Tidak tau cara cek resolusi kamera (karena pake HP) |
| C8 | Stop & Cleanup | Klik "Stop" | Video feed mati, kamera off, gatekeeper reset | [x] | Sesuai harapan |

---

## D. Dual-Sense — Mode /a/ (Vowel A)

| # | Item | Langkah | Harapan | Status | Catatan |
|---|------|---------|---------|--------|---------|
| D1 | LAR ≥ 0.5 (buka mulut) | Buka mulut lebar | Indikator "A" hijau muncul, gerbang mik terbuka | [~] | Muncul indikator "A", tapi tidak melihat gerbang mik terbuka secara visual tapi suaraku terdeteksi karena angka pitch muncul |
| D2 | Mic Opens | Setelah LAR valid | Mic aktif, pitch mulai terdeteksi | [x] | Sesuai harapan |
| D3 | Phonasi /a/ + LAR benar | Buka mulut + "aaa..." stabil | Flash hijau (#22C55E), accuracy "STABLE" | [x] | Sesuai harapan |
| D4 | Shrill Warning (f₀ > 350 Hz) | Suara tinggi melengking | Flash kuning (#EAB308), accuracy "SHRILL" | [x] | Sesuai harapan |
| D5 | Mouth Closed mid-phonasi | Tutup mulut saat fonasi | Flash merah, error screen, mic mati instan | [x] | Sesuai harapan |
| D6 | Instant Fallback | Ganti bentuk mulut (buka→meringis) | Error screen, flash merah, mic tutup <300ms | [~] | Saat berganti dari buka "A" ke meringis, flash merah muncul beberapa saat lalu menghilang, kemudian huruf "I" muncul |
| D7 | Recovery from Fallback | Setelah fallback, buka mulut lagi ≥1 detik | Error hilang, siap deteksi ulang | [x] | Sesuai harapan |

---

## E. Dual-Sense — Mode /i/ (Vowel I)

| # | Item | Langkah | Harapan | Status | Catatan |
|---|------|---------|---------|--------|---------|
| E1 | LAR ≤ 0.2 + Spread (meringis) | Meringis / menyungging bibir | Indikator "I" biru muncul, gerbang mik terbuka | [~] | Muncul indikator "I", tapi tidak melihat gerbang mik terbuka secara visual tapi suaraku terdeteksi karena angka pitch muncul |
| E2 | Mic Opens | Setelah LAR + spread valid | Mic aktif, pitch mulai terdeteksi | [x] | Sesuai harapan |
| E3 | Phonasi /i/ + LAR benar | Meringis + "iii..." stabil | Flash hijau, accuracy "STABLE" | [x] | Sesuai harapan |
| E4 | Mid-session mouth change | Fonasi /i/ → buka mulut jadi /a/ | Fallback, flash merah, mic mati | [~] | Saat berganti dari fonasi "i" ke "a", flash merah muncul beberapa saat lalu menghilang, kemudian huruf "A" muncul |
| E5 | State reset after fallback | Fallback → klik reset / buka mulut | Kembali siap, silhouette muncul | [x] | Sesuai harapan |
| E6 | Mouth Width Tracking | Meringis perlahan | Nilai lebar mulut di console/log berubah | [ ] | Tidak bisa buka console karena di HP |
| E7 | Resting Width Calibration | Mulai sesi, diam 2 detik | `restingMouthWidth` termuat, spread trigger relative | [ ] | Tidak paham dengan item ini |

---

## F. Visual Feedback & Edge Cases

| # | Item | Langkah | Harapan | Status | Catatan |
|---|------|---------|---------|--------|---------|
| F1 | Crosshair Animation | Dual-Sense aktif | Crosshair animasi di tengah overlay | [ ] | *Belum diimplementasikan* |
| F2 | Checkmark Animation | Validasi sukses (hijau) | Checkmark animasi muncul | [ ] | *Belum diimplementasikan* |
| F3 | Error Screen | Fallback terjadi | Fullscreen overlay merah + ikon + pesan | [x] | Sesuai harapan |
| F4 | Haptic Success | Sukses → vibrasi 100ms | Perangkat bergetar (Sensors → Vibrate) | [ ] | *Belum diimplementasikan* |
| F5 | Haptic Error | Fallback → vibrasi [50,50,50] | Perangkat bergetar 3x cepat | [ ] | *Belum diimplementasikan* |
| F6 | Fast Module Switching | Ganti module 5x cepat | Tidak error, Console bersih | [ ] | Tidak bisa cek console karena di HP |
| F7 | Low Light | Redupkan cahaya ruangan | FaceMesh masih deteksi wajah | [x] | Sesuai harapan |
| F8 | Multi-tap "Mulai" | Tap tombol Mulai 5x cepat | Tidak ada multiple instance | [ ] | Tidak bisa cek karena pakai HP |
| F9 | Console Check | Sepanjang sesi | Console: 0 error, 0 warning | [ ] | Tidak bisa cek karena pakai HP |
| F10 | Mobile Touch Target | Tap setiap tombol di viewport mobile 360px | Semua target ≥60×60 dp | [~] | Semua tombol mudah diklik, tapi tidak tau berapa ukuran tombolnya karena pakai HP |
| F11 | Orientation Lock | Rotasi landscape | App tetap portrait (atau handle gracefully) | [x] | Tetap portrait |
| F12 | Flash Idle (No Face) | Tidak ada wajah >1.5 detik | Flash abu-abu (#F8FAFC) pulsing | [~] | Tidak pernah melihat flash abu-abu, selalu merah jika wajah tidak terdeteksi |
| F13 | LAR Color Coding | LAR ≥ 0.5 (A) / middle+spread (I) | LAR display hijau; warning kuning; idle biru | [~] | Sesuai harapan, kecuali ketika idle angka LARnya tetap biru |
| F14 | Vowel Indicator | Mode A / I aktif | Overlay besar "A" / "I" di tengah kamera | [x] | Sesuai harapan |

---

## G. Technical Constraints (50% PoC Scope)

| # | Item | Verifikasi | Status | Catatan |
|---|------|------------|--------|---------|
| G1 | Zero Server Dependency | Network tab: 0 request ke API/backend | [ ] | Tidak bisa verifikasi karena pakai HP |
| G2 | IndexedDB Deferred | `db.js` ada tapi tidak dipakai di flow utama | [ ] | Tidak bisa verifikasi karena pakai HP |
| G3 | Star Rating Deferred | Star display statis (★★★), tidak persisten | [~] | Bintang selalu statis, tidak pernah berubah visualnya dalam keadaan apapun |
| G4 | Vowels U/E/O Deferred | Hanya A & I diimplementasikan | [x] | Sesuai harapan |
| G5 | Asset Animations Deferred | Placeholder geometris (kotak, oval, flash) | [x] | Sesuai harapan |
| G6 | Memory <150MB | Performance tab: JS heap <150MB | [ ] | Tidak bisa verifikasi karena pakai HP |
| G7 | FFT Size 2048 | `audio.js` const `FFT_SIZE = 2048` | [ ] | Tidak bisa verifikasi karena pakai HP |
| G8 | Noise Floor 0.025 | `NOISE_FLOOR_RMS = 0.025` | [ ] | Tidak bisa verifikasi karena pakai HP |
| G9 | Snake_case Variables | `user_id`, `lar_threshold`, `f_min`, `f_max`, `session_id`, `timestamp`, `module_type`, `lar_accuracy`, `f0_stability`, `star_score` | [ ] | Tidak bisa verifikasi karena pakai HP |

---

## Ringkasan

| Suite | Total Item | [x] | [~] | [ ] |
|-------|-----------|-----|-----|-----|
| A — Core Infra | 6 | 2 | 2 | 2 |
| B — VocaTone | 12 | 7 | 4 | 1 |
| C — Cam & FaceMesh | 8 | 4 | 2 | 2 |
| D — Mode /a/ | 7 | 5 | 2 | 0 |
| E — Mode /i/ | 7 | 4 | 2 | 1 |
| F — Visual & Edge | 14 | 4 | 5 | 5 |
| G — Technical Constraints | 9 | 2 | 1 | 6 |
| **Total** | **63** | **28** | **18** | **17** |

---

## Log Testing

| Tanggal | Perangkat | Browser | Versi App | Penguji | Temuan Baru | Status Akhir |
|---------|-----------|---------|-----------|---------|-------------|--------------|
| 2026-07-18 | Android HP | Chrome Mobile | main (merged vocatone/dualsense) | Developer | Multiple issues found (see notes) | Fixes applied, awaiting retest |