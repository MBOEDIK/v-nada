# Refactor Note 1 — Ketidaksinkronan Branch Remote vs Technical Blueprint

**Keterangan:** Catatan refaktor ini khusus mendokumentasikan seluruh ketidaksinkronan antara branch `origin/feature/vocatone` (commit `a79e24e`) dan `origin/feature/dualsense` (commit `2194a33`) terhadap **semua 15 dokumen** di `project_context/technical_blueprint/`. Total 103 temuan (T33, G14, U32, C24).

**Dibuat:** 17 Juli 2026
**Evaluator:** Agent V-NADA (DeepSeek V4 Flash)
****

---

## Cara Menggunakan Dokumen Ini

Setiap temuan memiliki 3 kolom pelacakan:

| Kolom | Arti |
|-------|------|
| **Refactor** | `❌` Belum diperbaiki / `🔄` Sedang diperbaiki / `✅` Selesai |
| **Prioritas** | `🔴 Kritis` / `🟡 Sedang` / `🟢 Ringan` |
| **Catatan** | Commit hash / keputusan desain / catatan perubahan |

### Cara memperbarui:
1. Saat mulai memperbaiki suatu item, ubah **Refactor** dari `❌` ke `🔄` dan isi **Catatan** dengan rencana.
2. Setelah selesai, ubah **Refactor** ke `✅` dan tulis commit hash di **Catatan**.
3. Jika menemukan temuan baru, gunakan template di [Lampiran B](#lampiran-b-template-temuan-baru).
4. Setiap perubahan update **Change Log** di [Lampiran C](#lampiran-c-change-log).

---

## Daftar Isi

1. [Master Synchronization Checklist](#master-synchronization-checklist)
2. [TECH-01 — Sequential Validation Logic](#2-tech-01--sequential-validation-logic)
3. [TECH-02 — Data Architecture & Offline-First](#3-tech-02--data-architecture--offline-first)
4. [TECH-03 — Audio Signal Processing](#4-tech-03--audio-signal-processing)
5. [TECH-04 — Camera Frame Optimization](#5-tech-04--camera-frame-optimization)
6. [GAME-01 — VocaTone GDD (Balon Udara)](#6-game-01--vocatone-gdd-balon-udara)
7. [GAME-02 — Dual-Sense GDD (Penghancur Gerbang)](#7-game-02--dual-sense-gdd-penghancur-gerbang)
8. [GAME-03 — Binary Visual Feedback Matrix](#8-game-03--binary-visual-feedback-matrix)
9. [GAME-04 — Reward System](#9-game-04--reward-system)
10. [UX-01/02/03/04 — UX Blueprint](#10-ux-01020304--ux-blueprint)
11. [VISUAL-01/02/03 — Visual Blueprint](#11-visual-010203--visual-blueprint)
12. [Rangkuman Kepatuhan](#12-rangkuman-kepatuhan)
13. [Inkonsistensi Langsung Antar Kedua Branch](#13-inkonsistensi-langsung-antar-kedua-branch)
14. [Lampiran](#lampiran)

---

## Master Synchronization Checklist

> **Cara pakai:** Ganti `[ ]` dengan `[x]` saat item selesai diperbaiki. Pastikan juga mengupdate detail di bagian terkait.

### TECH Blueprint

| # | Item | Prioritas | Refactor | Blueprint | PIC |
|---|------|-----------|----------|-----------|-----|
| T01 | Euclidean 3D → 2D (dualsense) | 🔴 | [ ] | TECH-01:36 | |
| T02 | Vokal A — threshold tunggal (vocatone) | 🔴 | [ ] | TECH-01:46 | |
| T03 | Vokal I — pakai LAR ≤ low, bukan spread ratio (dualsense) | 🔴 | [ ] | TECH-01:47, GAME-02:78 | |
| T04 | IndexedDB profile loading di dualsense | 🟡 | [ ] | TECH-02:36-41 | |
| T05 | `closeAudioStream()` sync → async (dualsense) | 🟡 | [ ] | TECH-03:25 | |
| T06 | `computeRMS()` private → public (dualsense) | 🟢 | [ ] | TECH-03:55 | |
| T07 | Tambah `getPitchHz()` (dualsense) | 🟢 | [ ] | TECH-03:99 | |
| T08 | FPS 15 → 20 (dualsense) | 🟡 | [ ] | TECH-04:28 | |
| T09 | Octave correction di vocatone | 🟡 | [ ] | TECH-03:42 | |
| T10 | Hapus `refineLandmarks: true` (vocatone & dualsense) | 🟢 | [ ] | TECH-04 (implisit) | |
| T11 | Normalisasi sample rate audio ke 44.1/48 kHz (kedua branch) | 🟡 | [ ] | TECH-03:16 | |
| T12 | Hapus FaceMesh instance saat stop() — cegah memory leak (kedua branch) | 🟡 | [ ] | TECH-04:41-43 | |
| T13 | Bersihkan `videoElement.srcObject` saat stop() (kedua branch) | 🟡 | [ ] | TECH-04:41-43 | |
| T14 | MediaPipe model caching — hanya .wasm, .binarypb/.data tidak di-precache (kedua branch) | 🟡 | [ ] | TECH-02:22-25 | |
| T15 | Memory limit <150MB — tidak ada monitoring (kedua branch, wajar PoC) | 🟢 | [ ] | TECH-04:54 | |
| T16 | AudioContext tidak connect ke Destination — melanggar blueprint (kedua branch) | 🟢 | [ ] | TECH-03:24 | |
| T17 | `triggerFallback()` → `gatekeeper.reset()` ke IDLE, bukan CAMERA_ACTIVE (dualsense) | 🔴 | [ ] | TECH-01:65, TECH-01:75 | |
| T18 | `autocorrelationPitch()` alokasi `corrMap` Map per frame — memory leak (dualsense) | 🟡 | [ ] | TECH-03:27, TECH-04:54 | |
| T19 | Camera fallback 480p→360p tidak cleanup media stream gagal (dualsense) | 🟡 | [ ] | TECH-04:14-16 | |
| T20 | `initAudioStream()` tidak handle error getUserMedia → AudioContext bocor (dualsense) | 🟡 | [ ] | TECH-03:14-16 | |
| T21 | `lar_threshold` schema mismatch — IndexedDB baca `.value` (number) tapi blueprint object `{high, low}` (vocatone) | 🟡 | [ ] | TECH-02:36-41 | |
| T22 | Dualsense `initAudioStream()` tidak resume AudioContext — mobile Chrome bisa silent fail | 🟡 | [ ] | TECH-03:15-16 | |
| T23 | DualSense `stopSession()` tidak cleanup state variables — potensi stale state saat restart | 🟡 | [ ] | TECH-04:41-43 | |
| T24 | DualSense `computeRMS()` tanpa guard division-by-zero — buffer kosong → NaN | 🟢 | [ ] | TECH-03:55 | |
| T25 | VocaTone `f_max` dual source of truth — constants.js & game.js (code smell) | 🟢 | [ ] | TECH-02:40-41 | |
| T26 | IndexedDB pipeline dead code — `saveProfile()` tidak pernah dipanggil di kedua branch | 🟡 | [ ] | TECH-02:36-41 | |
| T27 | Kedua branch tidak baca `f_min`/`f_max` dari IndexedDB profile — hardcoded semua | 🟡 | [ ] | TECH-02:40 | |
| T28 | Stale-While-Revalidate tidak diimplementasikan untuk game components — semua CacheFirst | 🟡 | [ ] | TECH-02:20 | |
| T29 | Race condition: `openAudioGate()` fire-and-forget vs `triggerFallback()` — orphaned AudioContext (dualsense) | 🟡 | [ ] | TECH-03:14-16 | |
| T30 | Sensor disconnected — tidak ada penanganan khusus di kedua branch; vocatone hard reset campur aduk dengan face loss, dualsense tidak bedakan | 🟡 | [ ] | TECH-01:77 | |
| T31 | Camera start error — vocatone hanya console.error, tidak ada user-facing error; dualsense punya showCameraError() | 🟡 | [ ] | TECH-04, UX-03:50 | |
| T32 | Face loss — DualSense tidak tutup microphone saat wajah hilang di MIC_OPEN; VocaTone hard reset matikan kamera (seharusnya Visual Validation) | 🟡 | [ ] | TECH-01:74 | |
| T33 | Mic denied — DualSense openAudioGate() hanya console.warn, tidak ada user-facing error; showCameraError() hanya untuk camera, bukan mic | 🟡 | [ ] | TECH-03:14-16, UX-03:50 | |

### GAME Blueprint

| # | Item | Prioritas | Refactor | Blueprint | PIC |
|---|------|-----------|----------|-----------|-----|
| G01 | Inisialisasi kamera berlebihan di vocatone (audio-only) | 🟡 | [ ] | GAME-01:79 | |
| G02 | Low amplitude — pakai #F8FAFC, bukan merah (dualsense) | 🟡 | [ ] | GAME-02:67, GAME-03:20 | |
| G03 | No face — pakai #F8FAFC, bukan merah (dualsense) | 🟡 | [ ] | GAME-03:19 | |
| G04 | Wrong mouth → siluet ikut merah sesuai GAME-02:87 (dualsense) | 🟡 | [ ] | GAME-02:87 | |
| G05 | Face loss — tidak ada mode pause + recalibration (dualsense) | 🟡 | [ ] | UX-03:51 | |
| G06 | VocaTone stability timer 0.5s — blueprint min 1s (vocatone) | 🟢 | [ ] | GAME-01:56-58 | |
| G07 | Siluet oval — garis putus-putus tidak diimplementasikan (kedua branch) | 🟢 | [ ] | VISUAL-02:14 | |
| G08 | VocaTone `_drawBackground()` tidak #F8FAFC untuk fall/rise — canvas transparan, bg-gray-900 tampak | 🟡 | [ ] | GAME-01:19,22,62 | |
| G09 | RMS threshold tidak dikalibrasi di awal sesi — hardcoded 0.01 tanpa sampling ambient noise | 🟡 | [ ] | GAME-01:79 | |
| G10 | Missing Character & Gate rendering di DualSense — tidak ada objek game visual | 🟡 | [ ] | GAME-02:16-17 | |
| G11 | Missing Mascot with Expressions — hanya flash warna, tidak ada karakter ekspresif (wajar PoC) | 🟢 | [ ] | GAME-03:40-43 | |
| G12 | Dynamic Obstacle proportional scaling based on LAR proximity — ukuran rintangan tidak mengecil proporsional saat LAR mendekati threshold (kedua branch) | 🟢 | [ ] | GAME-03:43 | |
| G13 | VocaTone balloon color — dark blue (#0D47A1) bukan bright/light blue (biru muda) seperti spesifikasi UX-02:81 | 🟢 | [ ] | UX-02:81 | |
| G14 | VocaTone balloon movement — constant velocity (RISE_SPEED=2) bukan smooth acceleration seperti spesifikasi UX-02:82 | 🟢 | [ ] | UX-02:82 | |

### UX / VISUAL Blueprint

| # | Item | Prioritas | Refactor | Blueprint | PIC |
|---|------|-----------|----------|-----------|-----|
| U01 | Font vokal 72pt di vocatone | 🟢 | [ ] | UX-02:63 | |
| U02 | Error handling mic denied di vocatone | 🟢 | [ ] | UX-03:50 | |
| U03 | Warna siluet oval: Hijau/Merah sesuai state (dualsense) | 🟡 | [ ] | VISUAL-02:27-28 | |
| U04 | Halaman pemilihan modul (kedua branch) | 🟢 | [ ] | UX-04:40-44 | |
| U05 | No face → silhouette guide di vocatone | 🟢 | [ ] | UX-03:51 | |
| U06 | Haptic feedback (kedua branch) | 🟢 | [ ] | UX-02:39 | |
| U07 | Siluet — Searching state #F8FAFC dengan pulsing 20-50% (dualsense) | 🟡 | [ ] | VISUAL-02:26 | |
| U08 | Siluet — Out of Bounds state dengan shake animation (dualsense) | 🟢 | [ ] | VISUAL-02:28 | |
| U09 | Siluet — drawSilhouette() harus terima validation state, bukan boolean (dualsense) | 🟡 | [ ] | VISUAL-02:24-28 | |
| U10 | Flash success — opacity 30% bukan 25%, transisi 0→30→0 (dualsense) | 🟢 | [ ] | UX-02:38 | |
| U11 | Scaling 1.2x objek game saat fonasi benar tidak ada (vocatone) | 🟢 | [ ] | UX-02:40 | |
| U12 | Button 3-state styling — pressed 10% darker, disabled 40%+greyscale tidak ada (kedua branch) | 🟢 | [ ] | VISUAL-01:47-49 | |
| U13 | Mic denied — tidak ada ilustrasi besar, hanya teks (dualsense) | 🟢 | [ ] | UX-03:50 | |
| U14 | Camera vs mic denied — tidak bisa dibedakan, pesan generik (kedua branch) | 🟢 | [ ] | UX-03:50 | |
| U15 | Icon-based navigation — masih teks, tidak pakai piktogram (kedua branch, wajar PoC) | 🟢 | [ ] | UX-02:51-53 | |
| U16 | Halaman history sesi latihan tidak ada (kedua branch, wajar PoC) | 🟢 | [ ] | UX-04:18 | |
| U17 | Splash screen tidak ada (kedua branch, wajar PoC) | 🟢 | [ ] | UX-04:16 | |
| U18 | Siluet — 48dp padding dari tepi layar tidak di-enforce (dualsense) | 🟢 | [ ] | VISUAL-02:36-38 | |
| U19 | Siluet — CSS stroke transition 0.3s tidak bisa diimplementasi di Canvas (dualsense) | 🟢 | [ ] | VISUAL-02:56 | |
| U20 | Tidak ada instruksi "Ayo Mulai" saat no face (kedua branch) | 🟢 | [ ] | GAME-03:19 | |
| U21 | Camera frame border hijau untuk face detection tidak ada (kedua branch) | 🟢 | [ ] | UX-03:30 | |
| U22 | Margin layar 16dp tidak di-enforce (kedua branch) | 🟢 | [ ] | VISUAL-01:58 | |
| U23 | Objek VocaTone tidak membesar saat naik (vocatone) | 🟢 | [ ] | GAME-01:78 | |
| U24 | DualSense flash-error/warning/idle opacity < 30% — melanggar UX-02:38 | 🟢 | [ ] | UX-02:38 | |
| U25 | VocaTone tidak ada siluet kalibrasi saat no face — tidak ada independent loop seperti dualsense | 🟢 | [ ] | VISUAL-02:14,24-26 | |
| U26 | Tombol kembali (back button) tidak ada — tidak ada ikon panah kiri di pojok kiri atas | 🟢 | [ ] | UX-04:27 | |
| U27 | Jarak antar komponen `gap-3` (12px) melanggar minimum 16dp | 🟢 | [ ] | UX-02:49 | |
| U28 | Missing real-time LAR indicator animation — tidak ada garis vertikal/horizontal crosshair | 🟡 | [ ] | UX-02:76-78 | |
| U29 | Missing animated large checkmark icon (`ikon centang besar animasi`) untuk success state — hanya flash hijau, tanpa ikon centang (kedua branch) | 🟢 | [ ] | UX-02:16 | |
| U30 | Missing Orbiting Pulse animation di sekitar ikon mikrofon/kamera saat MediaPipe processing — tidak ada animasi pemrosesan sensor (kedua branch) | 🟢 | [ ] | UX-02:18 | |
| U31 | Missing pulsing red arrow indicator saat wajah keluar area kamera atau anak berhenti bersuara — berbeda dari U08 shake silhouette (kedua branch) | 🟢 | [ ] | UX-02:19 | |
| U32 | Missing background layers & HUD SVG assets dari VISUAL-03 — tidak ada `bg_layer_sky`, `bg_layer_mountains`, `img_obs_cloud_mon`, `ic_ui_star_gold`, `ic_nav_home_default`, `ic_ui_cam_frame`, `ic_ui_progress_bar`, `img_ui_feedback_bin` (kedua branch, wajar PoC) | 🟢 | [ ] | VISUAL-03:34-66 | |

### Cross-Branch (Inkonsistensi Langsung)

| # | Item | Prioritas | Refactor | Keterangan | PIC |
|---|------|-----------|----------|-----------|-----|
| C01 | `gatekeeper` export pattern (default vs named) | 🔴 | [ ] | Harus distandarisasi | |
| C02 | `initCamera()` API signature (object vs positional) | 🔴 | [ ] | Harus distandarisasi | |
| C03 | Snake_case vs camelCase (dualsense) | 🟡 | [ ] | Duality variables mengikuti AGENTS.md | |
| C04 | Vite + package.json basicSsl (dualsense) | 🟢 | [ ] | Putuskan perlu/tidak untuk PoC | |
| C05 | AGENTS.md syncing | 🟢 | [ ] | Ambil versi dualsense sebagai baseline | |
| C18 | Dualsense pre-grant audio permission (`preGrantAudioPermission()`) vs vocatone lazy init | 🟢 | [ ] | Desain inkonsisten; dualsense minta izin mic sebelum LAR_CHECK | |
| C19 | Error screen CSS transition duration: 700ms (vocatone) vs 500ms (dualsense) | 🟢 | [ ] | UX-02:38 kedua nilai dalam rentang 500-800ms, tapi inkonsisten | |
| C20 | `triggerFallback()` di dualsense punya cooldown 1s recovery — tidak ada di blueprint atau vocatone | 🟡 | [ ] | `larValidSince` + 1000ms lockout sebelum fallbackMode null | |
| C21 | Hardcoded "A" di `#vowel-indicator` span index.html (kedua branch) | 🟢 | [ ] | UX-02:63; harus empty string, bukan hardcoded "A" | |
| C22 | Camera feed mirror `scaleX(-1)` hanya di dualsense, vocatone tidak mirror | 🟢 | [ ] | UX requirement front camera; vocatone tampil non-mirror | |
| C23 | `f_min` value inkonsisten — vocatone 150Hz, dualsense 100Hz (commit 07dfdf4) | 🔴 | [ ] | constants.js; game.js punya DEFAULT_F_MIN=150 sendiri | |
| C24 | GateKeeper state machine arsitektur fundamental berbeda — transisi, mode, hook, error handling | 🔴 | [ ] | Valid transitions architecture berbeda total | |

---

## 2. TECH-01 — Sequential Validation Logic

**Dokumen:** `project_context/technical_blueprint/tech-01.md` (Versi 3)

### 2.1 Indeks Landmark

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | `FACEMESH_LIPS = { top: 13, bottom: 14, left: 78, right: 308 }` |
| `feature/dualsense` | ✅ | Indeks sama |

### 2.2 Euclidean Distance — 2D vs 3D 🔴 T01

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **Catatan:**

Blueprint (`tech-01.md:36`): `d(p, q) = √((px − qx)² + (py − qy)²)` — **hanya sumbu X dan Y**.

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `(p.x - q.x)² + (p.y - q.y)²` | ✅ **2D — SESUAI** |
| `feature/dualsense` | `(p.x - q.x)² + (p.y - q.y)² + (p.z - q.z)²` | ❌ **3D — MELANGGAR** |

**Dampak:** Semua kalkulasi LAR di dualsense mengandung error sistematik dari sumbu-Z MediaPipe yang noise tinggi. LAR menjadi tidak akurat untuk validasi /a/ dan /i/.

**Lokasi kode:**
- `feature/vocatone`: `src/utils/vision.js` — inline 2D (tidak ada fungsi terpisah)
- `feature/dualsense`: `src/utils/vision.js:29` — `computeEuclideanDistance(p, q)` pakai 3D

### 2.3 Rumus LAR

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | `vertical / horizontal` — cocok |
| `feature/dualsense` | ✅ | `vertical / horizontal` — cocok (tapi pakai 3D) |

### 2.4 Transisi Vokal A 🔴 T02

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | Hanya threshold tunggal `0.3`. Tidak ada `lar_threshold.high`. Tidak bisa bedakan vokal A. |
| `feature/dualsense` | ✅ | `lar_threshold.high = 0.5` di `constants.js`. `lastLar >= 0.5` → LAR_CHECK/MIC_OPEN. |

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **Catatan:** vocatone perlu diubah dari threshold tunggal ke threshold high (≥0.5) untuk A dan low (≤0.2) untuk I.

### 2.5 Transisi Vokal I 🔴 T03

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | **Tidak diimplementasikan sama sekali.** |
| `feature/dualsense` | ❌ | **Menyimpang.** Pakai mouth spread ratio: `spread > 1.3 && LAR middle` — bukan `LAR ≤ low` per blueprint. |

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **Catatan:** dualsense perlu diubah dari mouth spread ratio ke `LAR ≤ lar_threshold.low (0.2)`. vocatone perlu implementasi Vowel I dari awal.

**Lokasi kode:** `feature/dualsense`: `src/main.js:226-227` — `isMiddleLar && isMouthSpread`

### 2.6 Instant Fallback

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | `executeFallback()` — LAR debounce 300ms, close mic, error, state → CAMERA_ACTIVE. Juga `executeHardReset()` jika wajah hilang. |
| `feature/dualsense` | ✅ | `triggerFallback(mode)` — LAR monitor 300ms, close mic, flash merah, reset state. |

### 2.7 Debounce/Throttle

| Branch | Detail | Status |
|--------|--------|--------|
| `feature/vocatone` | `LAR_DEBOUNCE_MS = 300` — timer-based | ✅ |
| `feature/dualsense` | `outOfThresholdSince` — performance.now() comparison, 300ms | ✅ |

### 2.8 Matriks Penanganan Kegagalan

| Skenario | Blueprint | `vocatone` | `dualsense` |
|----------|-----------|-----------|-------------|
| Wajah tidak terdeteksi | Tutup mic, siluet | ❌ Error screen saja, no siluet | ⚠️ Error + flash-idle, oval ✅ |
| LAR di bawah threshold | Hentikan ekstraksi, merah | ✅ executeFallback + merah | ✅ triggerFallback + merah |
| Amplitudo < noise floor | Mic tetap terbuka, #F8FAFC | ✅ default grey | ❌ flash-idle (merah) bukan abu-abu 🟡 G02 |
| Koneksi sensor terputus | Reset pipeline, peringatan | ✅ executeHardReset | ⚠️ Hard reset sebagian |

### 2.9 Fallback State Machine — IDLE vs CAMERA_ACTIVE 🔴 T17

---

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **Blueprint:** TECH-01:65, TECH-01:75
- **Catatan:**

Blueprint (TECH-01:65): "Jika selama pemrosesan audio nilai LAR aktual turun di bawah ambang batas (siswa mengubah posisi mulut), sensor mikrofon akan segera ditutup otomatis."
Matriks Exception (TECH-01:75): "LAR di bawah ambang batas → Hentikan ekstraksi frekuensi; indikator merah → **Visual Validation**."

**Visual Validation** berarti kamera tetap aktif memonitor LAR (state CAMERA_ACTIVE). Dualsense melanggar ini dengan mereset ke IDLE.

| Branch | Implementasi Fallback | Status |
|--------|----------------------|--------|
| `feature/vocatone` | `executeFallback()` → `gatekeeper.fallbackTo(CAMERA_ACTIVE)` — kamera tetap jalan ✅ | ✅ **SESUAI** |
| `feature/dualsense` | `triggerFallback()` → `gatekeeper.reset()` → IDLE — state machine terhenti ❌ | ❌ **MELANGGAR** |

**Dampak:** Setelah fallback di dualsense, gatekeeper berada di IDLE. Meskipun kamera fisik masih berjalan, state machine butuh recovery path: `fallbackMode` lockout 1s → baru bisa IDLE → CAMERA_ACTIVE. Selama lockout 1s, input user diabaikan meskipun bentuk mulut sudah benar.

**Detail lockout `fallbackMode`:**
- `triggerFallback(mode)` set `fallbackMode = 'A'` atau `'I'`
- Di `onFaceLandmarks`, transisi IDLE→CAMERA_ACTIVE dicegah oleh `fallbackMode !== 'A'` / `fallbackMode !== 'I'`
- Hanya setelah user mempertahankan bentuk mulut benar selama 1000ms (`larValidSince > 1000`), `fallbackMode = null`
- Baru setelah itu state bisa naik ke CAMERA_ACTIVE lagi

**Lokasi kode:**
- `feature/dualsense`: `src/main.js` — `triggerFallback()` dan `larValidSince` recovery logic
- `feature/vocatone`: `src/main.js` — `executeFallback()` langsung ke CAMERA_ACTIVE tanpa lockout

### 2.10 Sensor Disconnected — Tidak Ada Penanganan Khusus 🟡 T30

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-01:77
- **Catatan:**

Blueprint Exception Matrix (TECH-01:77): "Koneksi sensor terputus → Reset pipeline, tampilkan peringatan sistem."

Kedua branch tidak memiliki mekanisme untuk mendeteksi atau menangani kasus sensor terputus secara terpisah:

- Vocatone: `executeHardReset()` mencampur aduk penanganan sensor disconnect dengan face loss biasa (Condition B). Jika MediaPipe error connection, hard reset dijalankan persis sama seperti saat wajah tidak terdeteksi — user tidak diberi informasi apakah kamera bermasalah atau hanya posisi wajah yang salah.

- Dualsense: Tidak ada penanganan eksplisit untuk sensor disconnection. `triggerFallback()` hanya dipicu oleh LAR drop (Condition A), `faceGone` hanya deteksi `lastFaceTime > NO_FACE_TIMEOUT` via monitor interval — tidak ada penanganan untuk MediaPipe error atau stream disconnect.

Perbedaan dari temuan existing:
- **G05**: Face loss → pause + recalibration (UX-03:51) — spesifik untuk wajah hilang di tengah sesi, bukan sensor disconnect
- **T12/T13**: Resource cleanup saat stop() — setelah sesi berakhir, bukan saat sensor tiba-tiba putus
- **T19**: Camera fallback 480p→360p — error saat inisialisasi, bukan saat runtime

| Branch | Implementasi Sensor Disconnect | Status |
|--------|------------------------------|--------|
| `feature/vocatone` | `executeHardReset()` dipanggil dari `onNoFace()` callback — tidak bedakan MediaPipe error vs face loss | ❌ **Campur aduk** |
| `feature/dualsense` | Tidak ada — hanya `NO_FACE_TIMEOUT` 1500ms di monitor loop, tidak ada error handler untuk FaceMesh disconnect | ❌ **Tidak ada** |

**Lokasi kode:**
- `feature/vocatone`: `src/main.js` — `executeHardReset()` dan `onNoFace()`
- `feature/dualsense`: `src/main.js` — `startMonitor()` interval deteksi faceGone

---

## 3. TECH-02 — Data Architecture & Offline-First

**Dokumen:** `project_context/technical_blueprint/tech-02.md` (Versi 2)

### 3.1 Service Worker

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | `navigator.serviceWorker.register('/sw.js')` |
| `feature/dualsense` | ✅ | Sama |

### 3.2 IndexedDB — Tabel Profil Pengguna 🟡 T04

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Catatan:**

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | `import { getProfile } from './utils/db.js'` — dipanggil, threshold dari IndexedDB |
| `feature/dualsense` | ❌ | **Import db.js dihapus.** Threshold hardcoded dari `constants.js`. Tidak loading profil IndexedDB. |

### 3.2a Schema `lar_threshold` — Mismatch IndexedDB vs Blueprint 🟡 T21

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-02:36-41
- **Catatan:**

Blueprint dan `constants.js` mendefinisikan `lar_threshold` sebagai **object** `{high: 0.5, low: 0.2}` untuk membedakan vokal A dan I (TECH-02:39). Namun vocatone membaca dari IndexedDB dengan syntax `profile.lar_threshold?.value` (mengharapkan **number** tunggal), dan fallback `DEFAULT_LAR_THRESHOLD = 0.3` juga single number.

| Branch | Akses `lar_threshold` | Status |
|--------|----------------------|--------|
| `feature/vocatone` | `profile.lar_threshold?.value ?? DEFAULT_LAR_THRESHOLD` (number 0.3) — **salah format** ❌ | Tidak bisa bedakan A/I |
| `feature/dualsense` | Langsung dari `constants.js` — `{high: 0.5, low: 0.2}` (object) ✅ | Tidak pakai IndexedDB |

**Dampak:** Jika IndexedDB menyimpan `lar_threshold` dalam format object `{high: 0.5, low: 0.2}` (sesuai blueprint), akses `?.value` return `undefined` → fallback ke `0.3`. Vocatone kehilangan kemampuan membedakan vokal A dan I bahkan dengan profil IndexedDB yang benar.

**Lokasi kode:**
- `feature/vocatone`: `src/main.js:114` — `threshold = profile.lar_threshold?.value ?? DEFAULT_LAR_THRESHOLD`
- `feature/vocatone`: `src/utils/constants.js:1` — `{high: 0.5, low: 0.2}` (ada tapi tidak diimpor main.js)

### 3.3 IndexedDB — Tabel Log Sesi Latihan

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ Post-PoC ✅ |
| `feature/dualsense` | ❌ Post-PoC ✅ |

### 3.4 100% Client-Side

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ✅ Zero server code |
| `feature/dualsense` | ✅ Zero server code |

### 3.5 MediaPipe Model Caching 🟡 T14

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-02:22-25
- **Catatan:**

Blueprint mensyaratkan penyimpanan model weights MediaPipe Face Mesh di Cache Storage API. Kedua branch mengimplementasikan VitePWA dengan `globPatterns` yang hanya mencakup `.wasm` via runtime caching, tetapi **tidak mencakup file `.binarypb` dan `.data`** yang merupakan file bobot model sebenarnya.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ⚠️ | `.wasm` di-cache (CacheFirst), `.binarypb` dan `.data` tidak di-precache |
| `feature/dualsense` | ⚠️ | Sama |

**Dampak:** File model MediaPipe harus di-download setiap kali sesi dimulai jika tidak ada di browser cache default, menambah latensi inisialisasi dan konsumsi kuota.

**Lokasi kode:**
- `feature/vocatone`: `vite.config.js` — `workbox.globPatterns` dan `runtimeCaching`
- `feature/dualsense`: `vite.config.js` — pola identik

### 3.6 Service Worker — Stale-While-Revalidate untuk Game Components 🟡 T28

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-02:20
- **Catatan:**

Blueprint TECH-02:20 secara eksplisit mensyaratkan: *"Fetch Interception: Menggunakan strategi **Cache-First untuk aset statis** dan **Stale-While-Revalidate untuk komponen antarmuka permainan yang dinamis**."*

Kedua branch menggunakan `CacheFirst` untuk **semua** pola `runtimeCaching` — tidak ada satupun yang menggunakan `StaleWhileRevalidate`. Game components (canvas, HUD, session logic) dilayani dengan strategi CacheFirst yang menyebabkan pengguna selalu mendapat versi lama jika game bundle diperbarui di tengah sesi. Berbeda dengan T14 yang fokus pada MediaPipe model caching, T28 ini spesifik menargetkan strategi fetch untuk komponen game dinamis.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | `runtimeCaching` hanya `CacheFirst` untuk script/style + wasm; tidak ada `StaleWhileRevalidate` |
| `feature/dualsense` | ❌ | Sama — identik dengan vocatone |

**Lokasi kode:**
- `feature/vocatone`: `vite.config.js` — `runtimeCaching` array, semua handler `CacheFirst`
- `feature/dualsense`: `vite.config.js` — pola identik

---

## 4. TECH-03 — Audio Signal Processing

**Dokumen:** `project_context/technical_blueprint/tech-03.md` (Versi 2)

### 4.1 AudioContext — Tidak ke Destination 🟢 T16

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** TECH-03:24
- **Catatan:**

Blueprint (TECH-03:24): "Aliran audio dihubungkan dari Source Node ke AnalyserNode sebelum akhirnya diteruskan ke Destination (biasanya dalam mode senyap)." Kedua branch hanya `source.connect(analyserNode)` tanpa koneksi ke `destination`. VocaTone bahkan menyertakan komentar safety: "CRITICAL SAFETY RULE: NEVER connect analyserNode → audioContext.destination". Meskipun secara teknis lebih aman (mencegah feedback loop), ini tetap menyimpang dari spesifikasi blueprint.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | `source.connect(analyserNode)` — tidak ke destination |
| `feature/dualsense` | ❌ | `source.connect(analyserNode)` — tidak ke destination |

### 4.2 FFT Size

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ✅ 2048 |
| `feature/dualsense` | ✅ 2048 |

### 4.3 Float32Array Buffer

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ✅ `getFloatTimeDomainData(dataArray)` |
| `feature/dualsense` | ✅ Sama |

### 4.4 Algoritma Autokorelasi

| Branch | Normalisasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `correlation / energy` — R(τ)/R(0) | ✅ |
| `feature/dualsense` | `correlation / energy` via `corrMap` | ✅ |

### 4.5 Octave Error Correction 🟡 T09

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | Tidak ada octave correction. Murni peak picking → Hz. |
| `feature/dualsense` | ✅ | Cascade check sub-harmonik 2x-4x threshold 0.85. |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Catatan:** Perlu port octave correction dari dualsense ke vocatone.

### 4.6 Rentang Pencarian

| Branch | MIN | MAX | Status |
|--------|-----|-----|--------|
| `feature/vocatone` | 50 | 800 | ✅ |
| `feature/dualsense` | 50 | 800 | ✅ |

### 4.7 RMS Noise Floor Gate

| Branch | Threshold | Status |
|--------|-----------|--------|
| `feature/vocatone` | `NOISE_FLOOR_RMS = 0.01` (export let) | ✅ |
| `feature/dualsense` | `NOISE_FLOOR_RMS = 0.01` (const) | ✅ |

### 4.8 `closeAudioStream()` — async vs sync 🟡 T05

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Catatan:**

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `async` — `await ctx.close()`, null sebelum close, verifikasi 'closed' | ✅ Proper cleanup |
| `feature/dualsense` | `sync` — `audioContext.close()` tanpa await | ❌ **Potensi memory leak** — AudioContext.close() async tidak di-await |

### 4.9 `getPitchHz()` Convenience Getter 🟢 T07

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | `getPitchHz()` — extractPitch null→0 untuk game |
| `feature/dualsense` | ❌ | Tidak ada |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Catatan:**

### 4.10 Visibility `computeRMS()` 🟢 T06

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ✅ `export function computeRMS(buffer)` |
| `feature/dualsense` | ❌ `function computeRMS(buffer)` — private |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan

### 4.11 Bandpass Filter

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ⚠️ | Di `game.js` (stability ±10%), bukan di `audio.js` |
| `feature/dualsense` | ✅ | `startPitchPolling()` — cek f0 > f_max → shrill, f0 >= f_min → in-range |

### 4.12 Per-Frame Map Allocation di Autocorrelation 🟡 T18

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-03:27, TECH-04:54, AGENTS.md Memory Constraints
- **Catatan:**

Dualsense `autocorrelationPitch()` membuat object `Map` baru setiap kali dipanggil:

```javascript
const corrMap = new Map();
for (let lag = minLag; lag <= maxLag; lag++) {
  correlation /= energy;
  corrMap.set(lag, correlation); // ← ~800 entries per frame
}
// ... later used for octave correction lookup ...
const subCorr = corrMap.get(subLag);
```

Pada sample rate 44.1 kHz, range lag 55-882 menghasilkan ~828 entry per Map. Dengan `extractPitch()` dipanggil ~20x/detik, ini berarti ~16.560 alokasi Map entry per detik — tekanan GC signifikan pada perangkat low-end.

Vocatone tidak memiliki octave correction dan tidak mengalokasikan objek apa pun di hot path.

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | Zero allocation — korelasi langsung, peak picking, return Hz | ✅ Optimal |
| `feature/dualsense` | `const corrMap = new Map()` — alokasi per frame, GC pressure | ❌ **BOROS MEMORI** |

**Dampak:** Pada perangkat low-end (<150MB), alokasi Map berulang (~800 entries × 20 FPS) menyebabkan GC pause yang bisa mengganggu kelancaran `requestAnimationFrame` dan proses real-time audio.

**Akar masalah:** Octave correction membutuhkan akses acak ke nilai korelasi lag-lag sebelumnya. Alternatif: simpan dalam `Float64Array` index-based lookup (zero allocation).

**Lokasi kode:**
- `feature/dualsense`: `src/utils/audio.js:57` — `const corrMap = new Map()`
- `feature/vocatone`: `src/utils/audio.js` — tidak ada Map allocation

### 4.13 `initAudioStream()` — Error Handling & AudioContext Leak 🟡 T20

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-03:14-16
- **Catatan:**

Dualsense `initAudioStream()` membuat `AudioContext` baru sebelum `getUserMedia()`, tetapi tidak membungkus `getUserMedia()` dalam `try/catch`. Jika getUserMedia gagal (izin ditolak, tidak ada mic), AudioContext yang sudah dibuat tidak pernah di-close. Vocatone mengimplementasikan error handling yang benar.

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `try/catch` — `await ctx.close()` + null-kan semua referensi + pesan error spesifik per jenis kegagalan | ✅ Proper cleanup |
| `feature/dualsense` | `initAudioStream()` — `audioContext = new AudioContext()` lalu `await navigator.mediaDevices.getUserMedia()` tanpa try/catch | ❌ **AudioContext dangling** |

**Dampak:** Setiap kali sesi gagal karena izin mic ditolak, satu AudioContext baru bocor. Dalam sesi start/stop berulang, akumulasi AudioContext bisa menyebabkan browser memori membengkak dan throttle oleh Chrome.

**Lokasi kode:**
- `feature/vocatone`: `src/utils/audio.js:79-113` — try/catch penuh dengan error handling terstruktur
- `feature/dualsense`: `src/utils/audio.js:12-16` — `initAudioStream()` tanpa try/catch

### 4.14 AudioContext — Tidak Resume Autoplay Policy 🟡 T22

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-03:15-16
- **Catatan:**

Blueprint: "Membuat objek AudioContext sebagai lingkungan pemrosesan utama dan menginisialisasi `MediaStreamAudioSourceNode` untuk mengalirkan data audio."

Dualsense `initAudioStream()` membuat `AudioContext` tanpa memeriksa atau menangani state 'suspended' akibat browser autoplay policy. Pada Chrome Android, AudioContext yang dibuat di luar rentang user gesture (1 detik) tetap dalam state 'suspended'. Tanpa `audioContext.resume()`, `analyserNode.getFloatTimeDomainData()` akan mengembalikan data diam (silence), menyebabkan `extractPitch()` selalu return null.

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `if (audioContext.state === 'suspended') { await audioContext.resume(); }` | ✅ Resume eksplisit |
| `feature/dualsense` | Tidak ada resume — AudioContext dibiarkan di state awal | ❌ **Bisa silent fail** |

**Dampak:** Pada perangkat mobile dengan autoplay policy ketat, microphone menyala tapi ekstraksi pitch tidak pernah menghasilkan nilai valid. User melihat tidak ada respons terhadap suara mereka.

**Akar masalah:** Dualsense memisahkan `startSession()` (click → gesture) dari `initAudioStream()` (async via state machine `onEnter(MIC_OPEN)`). Gesture context hilang sebelum AudioContext dibuat.

**Lokasi kode:**
- `feature/vocatone`: `src/utils/audio.js:109-111` — resume eksplisit
- `feature/dualsense`: `src/utils/audio.js:12-16` — `initAudioStream()` tanpa resume

### 4.15 Sample Rate Standardization 🟡 T11

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-03:16
- **Catatan:**

Blueprint mensyaratkan normalisasi sample rate perangkat ke 44.1 kHz atau 48 kHz untuk konsistensi kalkulasi f0 antar perangkat. Kedua branch melewatkan `audioContext.sampleRate` langsung ke algoritma autokorelasi tanpa resampling.

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `const sample_rate = audioContext.sampleRate` — langsung dipakai | ❌ **Tidak dinormalisasi** |
| `feature/dualsense` | `const sampleRate = audioContext.sampleRate` — langsung dipakai | ❌ **Tidak dinormalisasi** |

**Dampak:** Formula `f0 = sampleRate / bestLag` menghasilkan nilai Hz berbeda di perangkat 22.050 Hz vs 48.000 Hz untuk sinyal akustik yang sama. Error sistematik pada deteksi pitch lintas perangkat.

**Lokasi kode:**
- `feature/vocatone`: `src/utils/audio.js:181-182`
- `feature/dualsense`: `src/utils/audio.js:77-78`

### 4.16 `stopSession()` — Tidak Cleanup State Variables 🟡 T23

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-04:41-43 (implisit resource cleanup)
- **Catatan:**

DualSense `stopSession()` tidak mereset state variables kritis yang bisa menyebabkan perilaku stale pada sesi restart:

| Variable | Nilai Awal (untuk sesi baru) | Resetted di stopSession? |
|----------|------------------------------|--------------------------|
| `lastFaceTime` | `0` | ❌ Tidak |
| `lastLar` | `0` | ❌ Tidak |
| `lastMouthWidth` | `0` | ❌ Tidak |
| `restingMouthWidth` | `Infinity` (di startSession) | ❌ Tidak |
| `outOfThresholdSince` | `0` | ❌ Tidak |
| `fallbackMode` | `null` | ❌ Tidak (hanya gatekeeper reset) |
| `larValidSince` | `0` | ❌ Tidak |
| `faceEverDetected` | `false` (di startSession) | ❌ Tidak |
| `mouthData` | `null` (di startSession) | ❌ Tidak |

Sebagai perbandingan, VocaTone `stopSession()` mereset `audio_initializing`, `lar_fallback_timer`, `no_face_timer`, `session_active`, dan memanggil `gatekeeper.reset()` dengan lebih lengkap.

**Dampak:** Start→stop→start sesi DualSense: stale `lastFaceTime` bisa menyebabkan deteksi "face gone" palsu karena `NO_FACE_TIMEOUT = 1500ms` dihitung dari `lastFaceTime` session sebelumnya. `fallbackMode` yang tidak di-reset langsung memblokir transisi IDLE→CAMERA_ACTIVE.

| Branch | Implementasi stopSession() | Status |
|--------|--------------------------|--------|
| `feature/vocatone` | Reset: `audio_initializing=false`, `cancelLarDebounce()`, `resetNoFaceTimer()`, `hideError()`, `gatekeeper.reset()`, `updateLar(0)`, `updatePitch(0)` | ✅ Proper cleanup |
| `feature/dualsense` | Hanya reset: `sessionActive=false`, `isF0InRange/Stable/Shrill=false`, `clearAllFlash()`. Tidak reset `lastFaceTime`, `lastLar`, `lastMouthWidth`, `outOfThresholdSince`, `fallbackMode`, `larValidSince` | ❌ **Tidak lengkap** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:474-492` — `stopSession()` incomplete cleanup

### 4.17 `computeRMS()` — Tanpa Guard Division-by-Zero 🟢 T24

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** TECH-03:55
- **Catatan:**

Blueprint mensyaratkan RMS noise floor gate. DualSense `computeRMS()` tidak memiliki guard untuk buffer kosong (`buffer.length === 0`), yang menyebabkan `Math.sqrt(0 / 0)` = `NaN`. VocaTone mengimplementasikan guard `if (!n) { return 0; }`.

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `if (!n) { return 0; }` — guard eksplisit | ✅ Safe |
| `feature/dualsense` | `sum / buffer.length` — jika length=0 → NaN tanpa guard | ❌ **Rentan NaN** |

**Lokasi kode:**
- `feature/vocatone`: `src/utils/audio.js:206-208` — guard `if (!n) return 0`
- `feature/dualsense`: `src/utils/audio.js:38-44` — `computeRMS()` tanpa guard

### 4.18 `f_max` Dual Source of Truth di VocaTone 🟢 T25

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** TECH-02:40-41
- **Catatan:**

`f_max` didefinisikan di dua tempat berbeda di VocaTone. Kedua nilai sama (`350`) tapi ini duplicate constant yang melanggar DRY. Jika suatu saat `f_max` diubah di satu file, nilai di file lain tidak sinkron. Temuan ini melengkapi C23 yang hanya mendokumentasikan `f_min`.

| Lokasi | Nilai | Digunakan oleh |
|--------|-------|---------------|
| `src/utils/constants.js:3` | `export const f_max = 350` | main.js |
| `src/components/game.js:47` | `const DEFAULT_F_MAX = 350` | game.js sendiri |

| Branch | `f_max` Lokasi | Duplikasi? |
|--------|----------------|------------|
| `feature/vocatone` | `constants.js:3` (350) + `game.js:47` (350) | ✅ Nilai sama, tapi **code smell** |
| `feature/dualsense` | `constants.js:3` (350) — tunggal | ✅ Single source of truth |

**Lokasi kode:**
- `feature/vocatone`: `src/utils/constants.js:3` — `f_max = 350`; `src/components/game.js:47` — `DEFAULT_F_MAX = 350`

### 4.19 IndexedDB Pipeline Dead Code — `saveProfile()` Tidak Pernah Dipanggil 🟡 T26

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-02:36-41
- **Catatan:**

Perluasan dari T21. `db.js` mengekspor fungsi `saveProfile()`, tetapi tidak ada satu pun consumer yang menggunakannya di kedua branch. Ini berarti:

1. IndexedDB selalu kosong untuk `user_profiles` store.
2. `getProfile()` selalu return `null`.
3. VocaTone: `threshold` selalu fallback ke `DEFAULT_LAR_THRESHOLD = 0.3`.
4. Seluruh pipeline IndexedDB profile adalah **dead code** yang tidak pernah dieksekusi.

| Branch | `saveProfile` dipanggil? | `getProfile` return? | threshold aktual |
|--------|-------------------------|---------------------|-----------------|
| `feature/vocatone` | ❌ Tidak pernah | `null` (selalu) | `0.3` (fallback) |
| `feature/dualsense` | ❌ Tidak pernah (bahkan tidak import `db.js`) | N/A | `0.5`/`0.2` (hardcoded) |

**Implikasi:** Temuan T04, T21, dan sebagian kepatuhan TECH-02 menjadi moot — IndexedDB profile system adalah dead code yang tidak berfungsi.

**Lokasi kode:**
- `feature/vocatone`: `src/utils/db.js:24-32` — `saveProfile()` didefinisikan tapi tidak dipanggil
- `feature/vocatone`: `src/main.js:310-313` — `getProfile()` dipanggil tapi selalu return `null`

### 4.20 Kedua Branch Tidak Baca `f_min`/`f_max` dari IndexedDB Profile 🟡 T27

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-02:40
- **Catatan:**

Perluasan dari C23. Blueprint TECH-02:40 mendefinisikan `f_min` dan `f_max` sebagai **per-user profile field** di IndexedDB, bukan hardcoded constant. Kedua branch melanggar ini.

VocaTone `startSession()` membaca `lar_threshold` dari profile (`main.js:310-313`) tetapi **mengabaikan** `f_min`/`f_max` dari profile yang sama. DualSense tidak loading profile sama sekali.

Lebih kritis: DualSense `f_min = 100` Hz (commit `07dfdf4`) tidak sesuai untuk target user 7-9 tahun yang f0-nya 250-400 Hz — nilai 100 Hz masuk range vocal fry dewasa.

| Branch | `f_min` | Sumber | Dibaca dari Profile? | Sesuai Target Usia? |
|--------|---------|--------|---------------------|-------------------|
| `feature/vocatone` | 150 | `game.js:46` hardcoded | ❌ Tidak | ✅ (150 Hz masih reasonable) |
| `feature/dualsense` | 100 | `constants.js:2` hardcoded | ❌ Tidak (`db.js` tidak diimpor) | ❌ (100 Hz = range vocal fry dewasa) |

**Lokasi kode:**
- `feature/vocatone`: `src/main.js:310-318` — hanya baca `lar_threshold`, abaikan `f_min`/`f_max`
- `feature/dualsense`: `src/utils/constants.js:2` — `f_min = 100` hardcoded

### 4.21 Race Condition: `openAudioGate()` Fire-and-Forget vs `triggerFallback()` — Orphaned AudioContext 🟡 T29

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-03:14-16
- **Catatan:**

DualSense `gatekeeper.onEnter(STATES.MIC_OPEN)` memanggil `openAudioGate()` sebagai **fire-and-forget** tanpa `await`. Jika `triggerFallback()` dieksekusi **sebelum** `initAudioStream()` menyelesaikan async chain:

1. `onEnter(MIC_OPEN)` → `openAudioGate()` → `initAudioStream()` mulai (async, pending)
2. LAR turun → `triggerFallback(mode)` dipanggil
3. `closeAudioGate()` → `audioInitialized` masih `false` → **no-op**
4. `gatekeeper.reset()` → `onExit(MIC_OPEN)` → `closeAudioGate()` → **no-op lagi**
5. `initAudioStream()` **resolves** → `audioInitialized = true` ← **AUDIOCONTEXT ORPHANED**
6. AudioContext + MediaStream tetap hidup di memori tanpa cleanup — kebocoran resource permanen

Berbeda dari T20 (error handling getUserMedia tanpa try/catch) dan T22 (tidak resume AudioContext) — T29 secara spesifik menargetkan race condition async fire-and-forget.

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | ✅ `initAudioStream()` dipanggil via `await` + `audio_initializing` flag cegah concurrent call | ✅ Aman |
| `feature/dualsense` | ❌ `openAudioGate()` fire-and-forget tanpa guard concurrent; `triggerFallback()` bisa orphan-kan AudioContext sebelum promise resolve | ❌ **Rawan race** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:171-175` — `gatekeeper.onEnter(MIC_OPEN)` → `openAudioGate()` tanpa `await`
- `feature/dualsense`: `src/main.js:146-150` — `openAudioGate()` — tidak ada `audio_initializing` flag
- `feature/dualsense`: `src/main.js:229-240` — `triggerFallback()` — `closeAudioGate()` sebelum promise resolve
- `feature/vocatone`: `src/main.js:172-186` — `if (!audio_initialized && !audio_initializing)` guard cegah race

---

## 5. TECH-04 — Camera Frame Optimization

**Dokumen:** `project_context/technical_blueprint/tech-04.md` (Versi 2)

### 5.1 Resolusi Kamera

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | Coba 480×480, fallback 360×360 | ✅ |
| `feature/dualsense` | Coba 480×480, fallback 360×360 | ✅ |

### 5.2 Target FPS 🟡 T08

| Branch | FPS | Interval | Status |
|--------|-----|----------|--------|
| `feature/vocatone` | 20 | 50ms | ✅ Dalam rentang 15-20 |
| `feature/dualsense` | 15 | ~66.67ms | ⚠️ Di batas bawah, tidak optimal |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Catatan:** Standarisasi ke 20 FPS.

### 5.3 Frame-Skipping

| Branch | Threshold | Status |
|--------|-----------|--------|
| `feature/vocatone` | `INFERENCE_SLOW_MS = 60` | ✅ |
| `feature/dualsense` | `latency > 60` | ✅ |

### 5.4 Auto-Cropping ROI

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ Tidak diimplementasikan (wajar PoC) |
| `feature/dualsense` | ❌ Tidak diimplementasikan (wajar PoC) |

### 5.5 WebGL Context Management

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ⚠️ Otomatis via MediaPipe, tanpa manajemen eksplisit |
| `feature/dualsense` | ⚠️ Sama |

### 5.6 `refineLandmarks` 🟢 T10

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ⚠️ `refineLandmarks: true` | ~400KB ekstra — tidak perlu untuk 4 landmark bibir |
| `feature/dualsense` | ⚠️ `refineLandmarks: true` | ~400KB ekstra — tidak perlu untuk 4 landmark bibir |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Catatan:**

### 5.7 Memory Garbage Collection 🟡 T12, T13

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-04:41-43
- **Catatan:**

Blueprint mensyaratkan prosedur otomatis: hapus buffer gambar, lepas tekstur WebGL, destroy objek video frame lama. Kedua branch tidak memenuhi spesifikasi ini.

**5.7.1 FaceMesh Instance — Tidak Pernah Dispose 🟡 T12**

Instance `FaceMesh`/`face_mesh` di-scope di dalam `initCamera()` dan **tidak pernah dipanggil `.dispose()` atau `.close()`**. WebGL textures dan model memory bocor setiap siklus start/stop.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | `face_mesh` variabel lokal di `initCamera()`, tidak ada `.close()` di `stop()` |
| `feature/dualsense` | ❌ | `faceMesh` variabel lokal di `initCamera()`, tidak ada `.close()` di `stop()` |

**Lokasi kode:**
- `feature/vocatone`: `src/utils/vision.js` — `initCamera()` membuat `new FaceMesh({...})`, `stop()` hanya `camera_instance.stop()`
- `feature/dualsense`: `src/utils/vision.js` — pola identik

**5.7.2 Video srcObject — Tidak Dibersihkan 🟡 T13**

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ⚠️ | Dibersihkan hanya di fallback kamera, bukan di `stop()` utama |
| `feature/dualsense` | ❌ | Tidak ada pembersihan `videoElement.srcObject` sama sekali |

**Dampak:** Referensi `MediaStream` persist di DOM setelah sesi berakhir, berpotensi menyebabkan memory leak pada sesi start/stop berulang.

**Lokasi kode:**
- `feature/vocatone`: `src/utils/vision.js` — `stop()` tidak null-kan `videoElement.srcObject`
- `feature/dualsense`: `src/utils/vision.js` — `stop()` tidak null-kan `videoElement.srcObject`

### 5.8 Camera Fallback — Media Stream Cleanup 🟡 T19

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-04:14-16
- **Catatan:**

Saat resolusi 480×480 gagal dan harus fallback ke 360×360, kedua branch memiliki pendekatan berbeda dalam cleanup stream yang gagal. Vocatone membersihkan `videoElement.srcObject` sebelum retry; dualsense tidak.

| Branch | Implementasi Fallback | Status |
|--------|----------------------|--------|
| `feature/vocatone` | `createCameraWithFallback()` — cleanup `videoElement.srcObject.getTracks().forEach(t => t.stop())` + `srcObject = null` sebelum retry | ✅ Cleanup proper |
| `feature/dualsense` | `initCamera()` — wrapped `camera.start()` override tanpa cleanup stream 480p yang gagal | ❌ **Tidak cleanup** |

**Dampak:** Stream kamera 480p yang gagal tetap hidup di memori meskipun tidak digunakan, menyebabkan kebocoran resource MediaStream dan potensi konflik hardware kamera.

**Lokasi kode:**
- `feature/vocatone`: `src/utils/vision.js` — `createCameraWithFallback()`: cleanup stream gagal
- `feature/dualsense`: `src/utils/vision.js:64-83` — `initCamera()`: wrapped `camera.start` tanpa `videoElement.srcObject = null`

### 5.9 Memory Limit <150MB 🟢 T15

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** TECH-04:54
- **Catatan:**

Blueprint (TECH-04:54): "Memory Limit < 150 MB — Alokasi untuk proses Computer Vision." Kedua branch tidak memiliki mekanisme monitoring atau pembatasan memori. Tidak ada `performance.memory`, heap allocation tracking, atau garbage collection paksa. Wajar untuk lingkup PoC — tidak ada aksi refaktor yang diperlukan saat ini.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ⚠️ | Tidak ada monitoring memori (wajar PoC) |
| `feature/dualsense` | ⚠️ | Sama |

### 5.10 Camera Start Error — No User-Facing Feedback di VocaTone 🟡 T31

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-04 (implisit), UX-03:50
- **Catatan:**

Blueprint UX-03:50 mensyaratkan: "Jika akses kamera/mikrofon ditolak, sistem menampilkan ilustrasi besar yang mengarahkan pengguna (atau pendamping) ke pengaturan izin di peramban."

DualSense mengimplementasikan `showCameraError()` yang membedakan `NotAllowedError` vs error lain dan menampilkan pesan user-facing di `#error-screen`. VocaTone hanya melakukan `console.error()` di blok `catch` — tidak ada pesan error yang tampil ke user. Jika kamera gagal di awal sesi, user melihat layar hitam tanpa informasi apa pun.

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `startSession()`: `camera_controller.start()` di `try/catch` — hanya `console.error()` | ❌ **Tidak ada user feedback** |
| `feature/dualsense` | `showCameraError(err)` — membedakan permission denied vs error lain, tampilkan di `#error-screen` | ✅ Proper user feedback |

**Dampak:** User VocaTone tidak tahu mengapa kamera tidak menyala. Tidak ada panduan untuk mengaktifkan izin kamera. Sesi gagal diam-diam.

**Lokasi kode:**
- `feature/vocatone`: `src/main.js:301-305` — `try { await camera_controller.start(); } catch (err) { console.error(...) }`
- `feature/dualsense`: `src/main.js:48-57` — `showCameraError()` function

### 5.11 Face Loss — Mic Tidak Ditutup di MIC_OPEN (DualSense) 🟡 T32

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-01:74
- **Catatan:**

Blueprint Exception Matrix (TECH-01:74): *"Wajah tidak terdeteksi → **Tutup gerbang audio**; tampilkan panduan siluet. Status Pemulihan: **Visual Validation**."*

Visual Validation berarti kamera tetap aktif memonitor wajah (CAMERA_ACTIVE), bukan shutdown total. Kedua branch melanggar aspek berbeda dari spesifikasi ini:

**DualSense** — `startMonitor()` mendeteksi `faceGone > 1500ms`:
1. ✅ Menampilkan `flash-idle` + error screen "No Face Detected"
2. ❌ **Tidak memanggil `closeAudioGate()`** — microphone tetap terbuka
3. ❌ `startPitchPolling()` terus berjalan (state masih MIC_OPEN) — CPU & baterai terbuang
4. ❌ Tidak ada transisi state ke IDLE/CAMERA_ACTIVE — gatekeeper macet di MIC_OPEN

**VocaTone** — `onNoFace()` di active zone:
1. ✅ `closeAudioStream()` — microphone ditutup (sesuai blueprint)
2. ❌ `camera_controller.stop()` — kamera juga dimatikan (violasi: harus Visual Validation / CAMERA_ACTIVE)
3. ❌ `gatekeeper.reset()` → IDLE (harus CAMERA_ACTIVE agar tetap monitoring)

| Branch | Implementasi Face Loss | Status |
|--------|----------------------|--------|
| `feature/vocatone` | `executeHardReset()` — tutup mic ✅, tapi matikan kamera ❌, reset ke IDLE ❌ | ❌ Terlalu agresif |
| `feature/dualsense` | `startMonitor()` faceGone — hanya error + idle flash; mic tetap terbuka ❌, polling lanjut ❌ | ❌ Tidak tutup mic |

**Dampak DualSense:** Jika anak menjauh dari kamera saat sedang bersuara, microphone tetap merekam ±30 detik (hingga `NO_FACE_TIMEOUT` × monitor interval) tanpa validasi LAR. Data audio yang diproses tidak valid, dan baterai terbuang percuma. Potensi privasi: mic tetap aktif tanpa pengawasan visual.

**Dampak VocaTone:** Anak harus menekan Start lagi setiap kali wajah hilang — disruptif untuk pengalaman terapi.

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:320-340` — `startMonitor()` faceGone block, tidak ada `closeAudioGate()` atau `gatekeeper.transitionTo(IDLE)`
- `feature/vocatone`: `src/main.js:172-186` — `executeHardReset()` matikan kamera + reset ke IDLE

### 5.12 Mic Error Handling — DualSense openAudioGate() Silent Fail 🟡 T33

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** TECH-03:14-16, UX-03:50
- **Catatan:**

Blueprint TECH-03:14-16 mensyaratkan: *"Menggunakan fungsi `navigator.mediaDevices.getUserMedia({ audio: true, video: false })` untuk meminta akses sensor mikrofon secara aman."* Blueprint UX-03:50 mensyaratkan: *"Jika akses kamera/mikrofon ditolak, sistem menampilkan ilustrasi besar yang mengarahkan pengguna ke pengaturan izin di peramban."*

DualSense memiliki dua jalur mic initialization dengan error handling berbeda:

**Jalur 1 — `preGrantAudioPermission()` (startSession):**
```javascript
async function preGrantAudioPermission() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach(t => t.stop());
  } catch (_) {}  // ❌ Siluman — error ditelan tanpa feedback
}
```

**Jalur 2 — `openAudioGate()` (via gatekeeper MIC_OPEN enter):**
```javascript
async function openAudioGate() {
  if (audioInitialized) {return;}
  try {
    await initAudioStream();  // ❌ initAudioStream() di audio.js tanpa try/catch
    audioInitialized = true;
  } catch (err) {
    console.warn('[Audio] Mic unavailable, visual-only mode:', err.message);  // ❌ Hanya console
  }
}
```

Kedua jalur ini gagal memberikan user-facing error saat mic ditolak. `showCameraError()` yang dipuji oleh temuan U02 hanya dipanggil dari `initCamera()` callback — **hanya untuk camera error**, bukan microphone error.

**Perbandingan:**

| Branch | Implementasi Mic Error Feedback | Status |
|--------|-------------------------------|--------|
| `feature/vocatone` | `initAudioStream()` try/catch penuh dengan pesan error spesifik per jenis kegagalan (`NotAllowedError`, `NotFoundError`, `NotReadableError`) + `throw` | ✅ Error terstruktur (tapi hanya console.error, tidak user-facing — lihat U02) |
| `feature/dualsense` | `preGrantAudioPermission()`: `catch (_) {}` — silent fail ❌; `openAudioGate()`: `console.warn()` — hanya developer log ❌ | ❌ **Tidak ada user feedback** |

**Catatan: Koreksi temuan U02:** U02 sebelumnya menyatakan DualSense ✅ menangani mic denied dengan `showCameraError()`. Ini keliru — `showCameraError()` hanya untuk camera error. Mic error di dualsense tidak menampilkan apa pun ke user.

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:60-65` — `preGrantAudioPermission()` silent catch
- `feature/dualsense`: `src/main.js:71-78` — `openAudioGate()` hanya console.warn
- `feature/dualsense`: `src/utils/audio.js:12-16` — `initAudioStream()` tanpa try/catch, AudioContext bocor jika getUserMedia gagal

---

## 6. GAME-01 — VocaTone GDD (Balon Udara)

**Dokumen:** `project_context/technical_blueprint/game-01.md` (Versi 2)

### 6.1 3-Phase Physics

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | Rise/Hover/Fall engine |
| `feature/dualsense` | ❌ N/A | |

### 6.2 Toleransi Stabilitas ±10%

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ✅ `FREQ_TOLERANCE = 0.1` |
| `feature/dualsense` | ❌ N/A |

### 6.3 Background Hijau (#22C55E)

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ✅ `BG_STABLE = 'rgba(34,197,94,0.2)'` |
| `feature/dualsense` | ❌ N/A |

### 6.4 Background Abu-abu (#F8FAFC)

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ **Canvas transparan, bg-gray-900 (#111827) tampak** — lihat G08 |
| `feature/dualsense` | ❌ N/A |

### 6.5 Objek Placeholder

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ Kotak 40×40px #0D47A1 |
| `feature/dualsense` | ❌ N/A |

### 6.6 VocaTone Tidak Butuh Kamera 🟡 G01

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ⚠️ **Kelebihan** | Inisialisasi kamera + FaceMesh + gatekeeper TIDAK diperlukan untuk modul audio-only. Alokasi memori sia-sia. |
| `feature/dualsense` | ✅ N/A | |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Catatan:** Pisahkan inisialisasi kamera dari `startSession()` VocaTone. Hanya inisialisasi jika modul Dual-Sense dipilih.

### 6.7 Stabilitas Timer 0.5s vs Blueprint 1s 🟢 G06

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** GAME-01:56-58
- **Catatan:**

Blueprint: "Skor Minimal: berhasil mengeluarkan suara selama 1 detik. Skor Penuh (3 Bintang): Mampu mempertahankan suara konstan selama 3-5 detik." Implementasi vocatone menggunakan `STABLE_DURATION_MS = 500` (0.5 detik) sebagai threshold untuk transisi ke HOVER state. Ini setengah dari batas minimal blueprint.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ⚠️ | `STABLE_DURATION_MS = 500` — 0.5s, blueprint min 1s |
| `feature/dualsense` | ❌ N/A | |

**Lokasi kode:**
- `feature/vocatone`: `src/components/game.js:18` — `STABLE_DURATION_MS = 500`

### 6.8 Objek Placeholder Tidak Membesar Saat Naik 🟢 U23

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** GAME-01:78
- **Catatan:**

Blueprint (GAME-01:78): "Buat aset Balon Udara yang ekspresif (misal: balon sedikit membesar saat naik)." VocaTone menggunakan persegi panjang statis 40×40px (`OBJ_W = 40, OBJ_H = 40`) tanpa transformasi skala — tidak ada `ctx.scale()`, `ctx.transform()`, atau perubahan dimensi saat objek naik (RISE phase) atau hover.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | `ctx.fillRect(x, this.positionY, OBJ_W, OBJ_H)` — ukuran tetap, tidak ada scaling |
| `feature/dualsense` | ❌ N/A | |

**Lokasi kode:**
- `feature/vocatone`: `src/components/game.js:263-268` — `_drawObject()` tanpa scaling

### 6.9 Background Fall/Rise — Bukan #F8FAFC 🟡 G08

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** GAME-01:19, GAME-01:22, GAME-01:62
- **Catatan:**

Blueprint GAME-01 secara eksplisit menetapkan:
- **Line 19** (No Sound → Fall): `"Latar Belakang Layar: Abu-abu Muda (#F8FAFC)"`
- **Line 22** (Unstable → Fall): `"Latar Belakang Layar: Abu-abu Muda (#F8FAFC)"`
- **Line 62**: `"Latar Belakang Layar berwarna Abu-abu Muda (#F8FAFC) saat suara terputus-putus."`

Namun `_drawBackground()` di vocatone hanya mengisi background untuk **stable** (hijau) dan **shrill** (kuning). Untuk state **fall** (pitch=0) dan **rise** (pitch>0 tapi belum stabil), tidak ada `ctx.fillRect()` — canvas tetap transparan sehingga elemen parent `bg-gray-900` (hitam pekat) tampak.

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `_drawBackground()` hanya isi green untuk stable, yellow untuk shrill. Fall/rise: canvas transparan → bg-gray-900 (#111827) tampak | ❌ **BUKAN #F8FAFC** |
| `feature/dualsense` | N/A (tidak ada game canvas) | N/A |

**Koreksi Refactor Note:** Bagian **6.4 Background Abu-abu (#F8FAFC)** sebelumnya menyatakan `feature/vocatone: ✅ Default canvas grey`. Ini keliru — canvas game tidak memiliki default grey. Background yang tampak adalah `bg-gray-900` dari container `#camera-view`.

**Lokasi kode:**
- `feature/vocatone`: `src/components/game.js:301-312` — `_drawBackground()` tanpa #F8FAFC untuk fall/rise

### 6.10 RMS Threshold — Tidak Dikalibrasi di Awal Sesi 🟡 G09

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** GAME-01:79
- **Catatan:**

Blueprint GAME-01:79: *"Implementasikan Noise Floor Gate. Pastikan ambang batas RMS dikalibrasi di awal sesi untuk menghindari input suara lingkungan (ambient noise) yang memicu pergerakan balon."*

Kedua branch menggunakan nilai **hardcoded** `NOISE_FLOOR_RMS = 0.01` tanpa mekanisme kalibrasi adaptive. Tidak ada sampling ambient noise saat `startSession()`, tidak ada penyesuaian threshold berdasarkan kondisi lingkungan pengguna. Akibatnya, ruangan bising (misal: kelas SD dengan 20 anak) bisa menyebabkan false positive — balon bergerak tanpa fonasi yang valid. Temuan ini berbeda dari T26 (dead code IndexedDB) dan T27 (f_min/f_max hardcoded) — G09 secara spesifik menargetkan kalibrasi RMS ambient noise per sesi.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | `NOISE_FLOOR_RMS = 0.01` hardcoded; `extractPitch()` langsung `rms < 0.01` tanpa kalibrasi awal |
| `feature/dualsense` | ❌ | Sama — `NOISE_FLOOR_RMS = 0.01` hardcoded tanpa kalibrasi |

**Lokasi kode:**
- `feature/vocatone`: `src/utils/audio.js:18` — `export let NOISE_FLOOR_RMS = 0.01`
- `feature/dualsense`: `src/utils/audio.js:2` — `const NOISE_FLOOR_RMS = 0.01`

### 6.11 VocaTone Balloon Color — Dark Blue Bukan Bright Blue 🟢 G13

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan (wajar PoC placeholder)
- **Blueprint:** UX-02:81
- **Catatan:**

Blueprint UX-02:81 (Panduan Game Balon Udara): *"**Aset Balon:** Karakter balon udara harus memiliki warna cerah (misal: biru muda) yang kontras dengan latar belakang langit."*

VocaTone menggunakan `OBJ_FILL = '#0D47A1'` — **dark/primary blue**, bukan biru muda/bright. Meskipun ini wajar untuk placeholder geometri PoC, warna yang lebih terang akan memberikan kontras lebih baik terhadap background dan lebih sesuai dengan deskripsi "balon udara" yang ceria.

Perbedaan dari temuan existing:
- **U11**: Scaling 1.2x — tentang ukuran objek, bukan warna
- **U15**: Icon-based navigation — tentang piktogram navigasi, bukan aset game
- **U23**: Objek tidak membesar saat naik — tentang transformasi skala, bukan warna

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `OBJ_FILL = '#0D47A1'` — dark blue (primary token) | ⚠️ Tidak sesuai biru muda |
| `feature/dualsense` | N/A | N/A |

**Lokasi kode:**
- `feature/vocatone`: `src/components/game.js:37` — `OBJ_FILL = '#0D47A1'`

### 6.12 VocaTone Balloon Movement — Constant Velocity Bukan Smooth Acceleration 🟢 G14

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan (wajar PoC placeholder)
- **Blueprint:** UX-02:82
- **Catatan:**

Blueprint UX-02:82 (Panduan Game Balon Udara): *"**Logika Gerak:** Balon harus bergerak naik dengan akselerasi halus (smooth acceleration) saat input frekuensi (f₀) terdeteksi stabil, bukan gerakan kaku."*

VocaTone menggunakan constant velocity `RISE_SPEED = 2` px/frame tanpa akselerasi — objek naik dengan kecepatan tetap, bukan diperhalus dengan percepatan. Tidak ada easing function, velocity ramp, atau smoothing factor dalam perhitungan posisi Y.

Perbedaan dari temuan existing:
- **U23**: Objek tidak membesar saat naik — tentang scaling ukuran, bukan kelancaran gerak
- **G06**: Stability timer 0.5s vs 1s — tentang durasi, bukan physics

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `RISE_SPEED = 2` px/frame constant — posisiY decrement linear tanpa akselerasi | ⚠️ Tidak ada smooth acceleration |
| `feature/dualsense` | N/A | N/A |

**Lokasi kode:**
- `feature/vocatone`: `src/components/game.js:15` — `RISE_SPEED = 2`; `src/components/game.js:233` — `this.positionY -= RISE_SPEED` (linear)

---

## 7. GAME-02 — Dual-Sense GDD (Penghancur Gerbang)

**Dokumen:** `project_context/technical_blueprint/game-02.md` (Versi 2)

### 7.1 Sequential Validation

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ N/A |
| `feature/dualsense` | ✅ IDLE → CAMERA_ACTIVE → LAR_CHECK → MIC_OPEN |

### 7.2 Vokal A

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ N/A |
| `feature/dualsense` | ✅ `LAR >= 0.5` → MIC_OPEN (mode='A') |

### 7.3 Vokal I 🔴 T03

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ N/A | |
| `feature/dualsense` | ❌ **Menyimpang** | Mouth spread ratio, bukan `LAR ≤ low` |

Lihat [2.5 Transisi Vokal I](#25-transisi-vokal-i--t03) untuk detail.

### 7.4 Flash Sukses Hijau

| Branch | Status |
|--------|--------|
| `feature/dualsense` | ✅ `flash-success` 500ms timeout |

### 7.5 Flash Kuning Shrill

| Branch | Status |
|--------|--------|
| `feature/dualsense` | ✅ `flash-warning` continuous, mic tetap polling |

### 7.6 Low Amplitude — Abu-abu 🟡 G02

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Catatan:**

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/dualsense` | ❌ | flash-error (merah) muncul — bukan #F8FAFC. Sesuai blueprint, mic harus tetap terbuka + indikator abu-abu. |

### 7.7 Instant Fallback

| Branch | Status |
|--------|--------|
| `feature/dualsense` | ✅ `triggerFallback(mode)` — tutup mic, flash merah, reset ke IDLE |

### 7.8 Mouth Silhouette Calibration

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ Tidak ada |
| `feature/dualsense` | ✅ `drawSilhouette()` — oval putih 30%, pulse saat no face |

### 7.9 Wrong Mouth Shape → Siluet Juga Merah 🟡 G04

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** GAME-02:87
- **Catatan:**

Blueprint (GAME-02:87): "Layar memberikan indikator Merah (#EF4444) pada **area latar belakang dan siluet mulut**." Saat ini hanya background yang berubah merah via `flash-error`, siluet tetap putih.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/dualsense` | ❌ | `triggerFallback()` hanya add `flash-error` ke background; `drawSilhouette()` tidak tahu state LAR |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js` — `triggerFallback()` hanya flash background; `src/components/overlay.js` — `drawSilhouette()` hanya terima `isFaceDetected` boolean

### 7.10 Face Loss — Tidak Ada Mode Pause 🟡 G05

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** UX-03:51, TECH-01:74
- **Catatan:**

Blueprint (UX-03:51): "Jika MediaPipe kehilangan deteksi wajah di tengah sesi, permainan secara otomatis masuk ke mode pause dan menampilkan siluet kalibrasi ulang hingga wajah terdeteksi kembali."

Blueprint (TECH-01:74) menambahkan: "Wajah tidak terdeteksi → **Tutup gerbang audio**; tampilkan panduan siluet. Status Pemulihan: **Visual Validation**."

Pelanggaran spesifik per branch (lihat juga T32 untuk analisis lebih detail):

**VocaTone** — `executeHardReset()`:
- ✅ `closeAudioStream()` — mic ditutup (sesuai TECH-01:74)
- ❌ **Kamera dimatikan** — melanggar "Visual Validation" yang mengharuskan kamera tetap aktif
- ❌ **Hard reset ke IDLE** — seharusnya fallback ke CAMERA_ACTIVE

**DualSense** — `startMonitor()` faceGone:
- ✅ Kamera tetap jalan (Visual Validation terpenuhi)
- ✅ Siluet kalibrasi tampil (via `startSilhouetteLoop()`)
- ❌ **Microphone tidak ditutup** — `closeAudioGate()` tidak dipanggil
- ❌ **Polling pitch terus berjalan** — CPU terbuang
- ❌ **State macet di MIC_OPEN** — gatekeeper tidak di-reset

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | `onNoFace()` → `executeHardReset()` — shutdown total (mic ✅, kamera ❌), bukan pause |
| `feature/dualsense` | ❌ | `startMonitor()` — deteksi faceGone >1500ms → error + flash-idle; mic tetap terbuka ❌, state macet ❌ |

**Lokasi kode:**
- `feature/vocatone`: `src/main.js` — `onNoFace()` callback → `executeHardReset()`
- `feature/dualsense`: `src/main.js` — `startMonitor()` interval, deteksi faceGone tanpa closeAudioGate

### 7.11 Missing Character & Gate Rendering 🟡 G10

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** GAME-02:16-17
- **Catatan:**

Blueprint GAME-02 Core Game Loop (baris 16-17): *"Start: Sesi dimulai, **karakter berada di depan gerbang**."* Seluruh mekanik GAME-02 dibangun di atas metafora visual "karakter menghancurkan gerbang dengan suara" — Gate Interaction (gerbang bersinar), Success State (gerbang hancur), Shrill (gerbang bergetar).

Implementasi DualSense saat ini hanya merender siluet oval (via `drawSilhouette()`), flash overlay, dan teks error. **Tidak ada** rendering karakter, gerbang, atau elemen game apa pun di Canvas. Tidak ada class `GateAnimation`, tidak ada `ctx.drawImage()`, tidak ada file aset `img_gate_sonic` atau karakter (VISUAL-03:36,50).

Ini berbeda dari GAME-04 (Reward animation Post-PoC) karena karakter + gerbang adalah **core game mechanic** dari GAME-02, bukan fitur reward tambahan.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ N/A | Modul audio-only |
| `feature/dualsense` | ❌ **Tidak ada** | Hanya oval + flash; tidak ada karakter/gerbang di Canvas atau HTML |

**Lokasi kode:**
- `feature/dualsense`: `src/components/overlay.js` — hanya `drawSilhouette()` oval; tidak ada render karakter/gerbang
- `feature/dualsense`: `src/main.js` — `startSession()` tidak inisialisasi game canvas
- `feature/dualsense`: `index.html` — tidak ada `<canvas id="game-canvas">`

---

## 8. GAME-03 — Binary Visual Feedback Matrix

**Dokumen:** `project_context/technical_blueprint/game-03.md` (Versi 2)

### 8.1 Perfect State — #22C55E

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | `BG_STABLE` green 20% saat stabilityTimer ≥ 500ms |
| `feature/dualsense` | ✅ | `triggerFlash()` + `isF0InRange && isF0Stable` |

### 8.2 Misarticulation (Shrill) — #EAB308

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ✅ `BG_SHRILL` yellow 20% |
| `feature/dualsense` | ✅ `flash-warning` class |

### 8.3 Wrong Mouth Shape — #EF4444

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ N/A (audio-only) |
| `feature/dualsense` | ✅ `flash-error` + `triggerFallback()` |

### 8.4 No Face Detected — #F8FAFC 🟡 G03

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | `cameraView.style.backgroundColor = '#F8FAFC'` setelah 3s |
| `feature/dualsense` | ❌ | `flash-idle` — merah 15%, BUKAN abu-abu |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Catatan:** dualsense perlu ganti flash-idle (merah) → #F8FAFC.

### 8.5 Low Amplitude — #F8FAFC 🟡 G02

- **Refactor:** ❌ Belum (sama dengan [7.6](#76-low-amplitude--abu-abu-g02))

### 8.6 Mouth Silhouette Calibration

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ Tidak ada |
| `feature/dualsense` | ✅ Oval putih 30% opacity, pulsing saat no face |

### 8.7 Missing Mascot with Expressions 🟢 G11

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan (wajar PoC)
- **Blueprint:** GAME-03:40-43
- **Catatan:**

Blueprint GAME-03:39-43 (Panduan Desain Animasi): *"Mascot Expressions: Benar: Animasi melompat gembira dengan bintang-bintang kecil. Suara Melengking: Telinga maskot bergerak-gerak tidak nyaman. Bentuk Bibir Salah: Maskot menunjuk ke arah bibirnya sendiri."*

Seluruh matriks GAME-03 mendefinisikan respons visual berbasis **maskot** untuk setiap state game. Namun kedua branch hanya menggunakan perubahan **warna latar** (flash overlay / canvas fill) sebagai feedback — tidak ada maskot karakter dengan ekspresi.

Perbedaan dari temuan existing:
- **U20**: instruksi "Ayo Mulai" — hanya teks, bukan maskot
- **GAME-04**: Reward animation — animasi di akhir sesi, bukan maskot state feedback berkelanjutan
- **U11**: scaling 1.2x — scaling objek game, bukan karakter ekspresif

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | Hanya kotak 40×40px biru — tidak ada karakter/ekspresi |
| `feature/dualsense` | ❌ | Hanya oval + flash — tidak ada karakter/ekspresi |

**Lokasi kode:**
- `feature/vocatone`: `src/components/game.js:263-268` — `_drawObject()` hanya `fillRect`
- `feature/dualsense`: `src/components/overlay.js` — hanya oval; tidak ada fungsi gambar karakter

### 8.8 Dynamic Obstacle Proportional Scaling Berdasarkan LAR 🟢 G12

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan (wajar PoC)
- **Blueprint:** GAME-03:43
- **Catatan:**

Blueprint GAME-03 (Panduan Desain Animasi Performa Dinamis, baris 43): *"Dynamic Obstacles: Dalam Modul Dual-Sense, ukuran rintangan akan mengecil secara proporsional seiring dengan nilai LAR yang mendekati ambang batas target, memberikan indikasi kemajuan sebelum validasi akhir dilakukan."*

Ini adalah mekanik interaksi terpisah dari karakter/gerbang (G10) dan maskot (G11). Blueprint mensyaratkan bahwa saat user mendekati bentuk mulut yang benar (LAR mendekati `lar_threshold.high` untuk /a/ atau `lar_threshold.low` untuk /i/), ukuran rintangan di Canvas mengecil secara dinamis sebagai indikasi progres.

Kedua branch tidak mengimplementasikan mekanik ini:

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ N/A | Modul audio-only tanpa rintangan visual |
| `feature/dualsense` | ❌ Tidak ada | Tidak ada rendering rintangan/RoI scaling di Canvas |

Perbedaan dari G10 (Missing Character & Gate): G10 fokus pada ketiadaan objek game visual (karakter + gerbang) sebagai core mechanic. G12 secara spesifik menargetkan mekanik interaksi progresif berupa perubahan ukuran rintangan proporsional terhadap LAR — yang merupakan fitur GAME-03:43 yang berbeda.

**Lokasi kode:**
- `feature/dualsense`: `src/components/overlay.js` — hanya `drawSilhouette()`, tidak ada fungsi render rintangan

---

## 9. GAME-04 — Reward System

**Dokumen:** `project_context/technical_blueprint/game-04.md` (Versi 3)

| Item | `vocatone` | `dualsense` |
|------|-----------|-------------|
| Scoring 3 bintang | ❌ Post-PoC ✅ | ❌ Post-PoC ✅ |
| Presisi LAR | ❌ Post-PoC ✅ | ❌ Post-PoC ✅ |
| Stabilitas f0 | ❌ Post-PoC ✅ | ❌ Post-PoC ✅ |
| Durasi fonasi | ❌ Post-PoC ✅ | ❌ Post-PoC ✅ |
| Reward animation | ❌ Post-PoC ✅ | ❌ Post-PoC ✅ |

✅ Kedua branch benar menunda. Tidak ada aksi refaktor.

---

## 10. UX-01/02/03/04 — UX Blueprint

### 10.1 UX-02: Flash Duration

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ⚠️ | Background fill 20% (tint statis, bukan flash) |
| `feature/dualsense` | ✅ | `flash-success` 500ms, opacity 15-25% |

### 10.2 UX-02: Haptic Feedback 🟢 U06

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ Tidak ada |
| `feature/dualsense` | ❌ Tidak ada |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan

### 10.3 UX-02: Fat-Finger Min 60×60dp

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ✅ `min-w-[60px] min-h-[60px]` |
| `feature/dualsense` | ✅ `min-w-[60px] min-h-[60px]` |

### 10.4 GAME-03: Instruksi "Ayo Mulai" Tidak Ada 🟢 U20

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** GAME-03:19
- **Catatan:**

Blueprint (GAME-03:19): "No Face Detected → Layar Netral: #F8FAFC (Abu-abu Muda) | Maskot dalam kondisi 'Idle/Tidur'; **Instruksi 'Ayo Mulai' muncul di layar**."

Kedua branch tidak menampilkan teks "Ayo Mulai" saat wajah tidak terdeteksi. Vocatone hanya mengubah background, dualsense menampilkan error "No Face Detected" (bukan ajakan).

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `cameraView.style.backgroundColor = '#F8FAFC'` — hanya ubah warna | ❌ Tidak ada teks |
| `feature/dualsense` | `showError(true, 'No Face Detected', 'Please position...')` — pesan error | ❌ Bukan "Ayo Mulai" |

**Lokasi kode:**
- `feature/vocatone`: `src/main.js:67` — `cameraView.style.backgroundColor = '#F8FAFC'`
- `feature/dualsense`: `src/main.js:293` — `showError(true, 'No Face Detected', ...)`

### 10.4a Camera Frame Border — Face Detection 🟢 U21

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** UX-03:30
- **Catatan:**

Blueprint (UX-03:30): "Bingkai kamera berubah **Hijau** saat wajah terdeteksi MediaPipe Face Mesh."

Kedua branch tidak mengimplementasikan border/frame color change pada camera view. Vocatone mengubah `cameraView.style.backgroundColor` menjadi #F8FAFC saat no face, dualsense menggunakan `#flash-overlay` full-screen dengan warna merah. Tidak ada elemen border hijau di sekitar video feed.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | Tidak ada border frame; background color change saja |
| `feature/dualsense` | ❌ | Tidak ada border frame; full overlay flash system — bukan border |

**Lokasi kode:**
- `feature/vocatone`: `src/main.js:90` — `cameraView.style.backgroundColor = '#F8FAFC'`
- `feature/dualsense`: `src/main.js` — `flashOverlay.classList.add('flash-idle')` — overlay merah, bukan border hijau

### 10.4b Margin Layar 16dp Tidak Di-enforce 🟢 U22

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** VISUAL-01:58
- **Catatan:**

Blueprint (VISUAL-01:58): "Margin Layar: Minimum 16dp pada sisi kiri dan kanan."

Kedua branch menggunakan `flex flex-col items-center justify-center` pada `#app` container yang melakukan center alignment tetapi tidak memberikan margin kiri/kanan eksplisit. Konten bisa menempel ke tepi layar pada perangkat dengan rasio aspek ekstrem. Fat-finger `min-w-[60px]` sudah di-enforce pada tombol tapi margin container tidak.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | Tidak ada `mx-4` atau margin horizontal; hanya flex centering |
| `feature/dualsense` | ❌ | Sama |

**Lokasi kode:**
- `feature/vocatone`: `index.html:13` — `id="app" class="flex flex-col items-center justify-center"`
- `feature/dualsense`: `index.html:13` — class identik

### 10.5 UX-02: Font Vokal 72pt 🟢 U01

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ Tidak ada |
| `feature/dualsense` | ✅ `font-size:72pt` bold hitam di `#vowel-indicator` |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan

### 10.5 UX-03: No Face → Silhouette Guide 🟢 U05

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ Hanya error screen |
| `feature/dualsense` | ✅ Oval + monitor error messages |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan

### 10.6 UX-03: Mic Izin Ditolak 🟢 U02

**KOREKSI:** Penilaian sebelumnya menyatakan DualSense ✅ menangani mic denied. Setelah audit kode, ditemukan bahwa `showCameraError()` hanya dipanggil untuk **camera error** (dari `initCamera()` callback), bukan microphone error. Mic error handling di DualSense terjadi via `preGrantAudioPermission()` (silent `catch (_) {}`) dan `openAudioGate()` (hanya `console.warn`). Lihat T33 untuk detail lengkap.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | Tidak ada user-facing error; `initAudioStream()` punya error handling terstruktur tapi hanya `console.error` |
| `feature/dualsense` | ❌ | Mic error: `preGrantAudioPermission()` silent catch + `openAudioGate()` console.warn — **tidak ada user feedback** (lihat T33) |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan

**Perluasan — Ilustrasi Besar 🟢 U13**

Blueprint (UX-03:50): "sistem menampilkan ilustrasi besar yang mengarahkan pengguna ke pengaturan izin di peramban." Dualsense hanya menampilkan teks + ⚠ icon, bukan ilustrasi besar. VocaTone tidak menampilkan apa-apa.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | Tidak ada user-facing error untuk mic denied |
| `feature/dualsense` | ⚠️ | Hanya ⚠ + teks, bukan ilustrasi besar |

**Perluasan — Camera vs Mic Denied Tidak Dibedakan 🟢 U14**

Blueprint menghendaki pesan spesifik untuk camera-denied vs mic-denied. Dualsense hanya cek `NotAllowedError` tanpa membedakan sensor mana yang ditolak.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | Tidak ada handling sama sekali |
| `feature/dualsense` | ⚠️ | Cek `NotAllowedError` saja, tidak bedakan kamera vs mikrofon |

### 10.7 UX-04: Home → Pilih Modul 🟢 U04

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ Langsung `startSession()` |
| `feature/dualsense` | ❌ Langsung `startSession()` |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan

**Perluasan — Halaman History Sesi 🟢 U16**

Blueprint (UX-04:18): Halaman "History" Level 2 untuk akses guru/orang tua ke ringkasan performa. Tidak ada di kedua branch. Wajar untuk lingkup PoC.

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ Tidak ada (wajar PoC) |
| `feature/dualsense` | ❌ Tidak ada (wajar PoC) |

**Perluasan — Splash Screen 🟢 U17**

Blueprint (UX-04:16): "Splash Screen" Level 1 dengan maskot animasi. Tidak ada di kedua branch. Wajar untuk lingkup PoC.

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ Tidak ada (wajar PoC) |
| `feature/dualsense` | ❌ Tidak ada (wajar PoC) |

### 10.8 UX-02: Flash Opacity Transisi 🟢 U10

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** UX-02:38
- **Catatan:**

Blueprint mensyaratkan: "Durasi Flash: 500ms - 800ms dengan opacity transisi dari 0% ke 30% lalu kembali ke 0%."

| Aspek | Blueprint | Implementasi (dualsense) | Status |
|-------|-----------|-------------------------|--------|
| Peak opacity | 30% | `opacity: 0.25` (25%) | ❌ Meleset 5% |
| Transition pattern | 0% → 30% → 0% | CSS `transition: opacity 300ms ease` + JS toggle class | ⚠️ 300ms ease tidak menjamin 0→30→0 linear |
| Flash duration | 500-800ms | `setTimeout` 500ms + CSS transition 300ms → total ~800ms | ✅ Dalam rentang |

**Lokasi kode:**
- `feature/dualsense`: `src/styles/main.css` — `.flash-success { opacity: 0.25; }` ; `src/main.js` — `triggerFlash()` timeout 500ms

### 10.9 UX-02: Scaling 1.2x Objek Game 🟢 U11

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** UX-02:40
- **Catatan:**

Blueprint (UX-02:40): "Scaling Efek: Objek atau karakter utama membesar 1.2x saat anak melafalkan suara dengan benar." VocaTone menggunakan objek kotak 40×40px statis — tidak ada transformasi skala (`ctx.scale`, `transform: scale`) pada kondisi fonasi benar.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | `OBJ_W = 40`, `OBJ_H = 40` — ukuran tetap, tidak ada scaling |
| `feature/dualsense` | ❌ N/A | Tidak ada game object |

**Lokasi kode:**
- `feature/vocatone`: `src/components/game.js:4-5` — konstanta objek, `_drawObject()` tanpa scaling

### 10.10 UX-02: Icon-Based Navigation 🟢 U15

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** UX-02:51-53
- **Catatan:**

Blueprint: "Gunakan piktogram: Ikon Rumah (Home) untuk kembali ke menu utama, Ikon Mikrofon besar untuk memulai sesi suara, Ikon Wajah/Bibir untuk memulai kalibrasi kamera." Kedua branch menggunakan tombol **teks** ("Start", "Stop") — tidak ada SVG icon, icon font, atau pictogram. Wajar untuk lingkup PoC.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | Tombol teks "Start" dan "Stop" |
| `feature/dualsense` | ❌ | Tombol teks "Start" dan "Stop" |

**Lokasi kode:**
- Kedua branch: `index.html` — `<button>` elements dengan teks

### 10.11 Flash Error/Warning/Idle — Opacity < 30% 🟢 U24

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** UX-02:38
- **Catatan:**

Blueprint UX-02:38 menetapkan opacity transisi 0% → **30%** → 0% untuk semua state flash (success, error, warning), bukan hanya success. Temuan U10 sudah mendokumentasikan `.flash-success` menggunakan `opacity: 0.25` (25%), tapi tiga state flash lainnya juga melanggar:

| CSS Class | Opacity Aktual | Blueprint | Selisih |
|-----------|---------------|-----------|---------|
| `.flash-success` | `0.25` (25%) | 30% | -5% ✅ (tercatat di U10) |
| `.flash-error` | `0.25` (25%) | 30% | -5% ❌ |
| `.flash-warning` | `0.20` (20%) | 30% | -10% ❌ |
| `.flash-idle` | `0.15` (15%) | 30% | -15% ❌ |

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | N/A | |
| `feature/dualsense` | ❌ | Semua flash class < 30% opacity |

**Lokasi kode:**
- `feature/dualsense`: `src/styles/main.css:29-47` — `.flash-success { opacity:0.25 }`, `.flash-error { opacity:0.25 }`, `.flash-warning { opacity:0.2 }`, `.flash-idle { opacity:0.15 }`

### 10.12 VocaTone — Tidak Ada Siluet Kalibrasi Saat No Face 🟢 U25

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** VISUAL-02:14, VISUAL-02:24-26
- **Catatan:**

Blueprint VISUAL-02:14-16 mensyaratkan siluet oval 30% opacity muncul di atas preview kamera. Meskipun U05 sudah mencatat bahwa vocatone tidak memiliki siluet saat no face, temuan baru ini mengungkap akar teknisnya: VocaTone `drawMouthOverlay()` di `vision.js` hanya dipanggil ketika **landmarks terdeteksi** di `face_mesh.onResults`. Saat wajah tidak terdeteksi, canvas overlay dibiarkan kosong.

DualSense punya `startSilhouetteLoop()` terpisah yang berjalan independen di RAF loop, menggambar siluet setiap frame berdasarkan timer-based face detection.

| Branch | Mekanisme Siluet Saat No Face | Status |
|--------|-----------------------------|--------|
| `feature/vocatone` | Tidak ada — `drawMouthOverlay()` hanya dipanggil saat landmarks terdeteksi | ❌ **Tidak ada siluet** |
| `feature/dualsense` | Ada — `startSilhouetteLoop()` independen + timer `lastFaceTime` | ✅ Sesuai |

**Lokasi kode:**
- `feature/vocatone`: `src/utils/vision.js:206-220` — hanya panggil `drawMouthOverlay()` di branch `if (landmarks)`
- `feature/dualsense`: `src/main.js:216-228` — `startSilhouetteLoop()` independen

### 10.13 UX-04: Tombol Kembali (Back Button) Tidak Ada 🟢 U26

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** UX-04:27
- **Catatan:**

Blueprint UX-04:27 (Wireflow Section 4.1): *"Tombol 'Kembali' menggunakan ikon panah kiri berukuran besar (minimal 60dp) yang diletakkan konsisten di pojok kiri atas."*

Kedua branch hanya memiliki tombol "Start" dan "Stop" di bagian bawah layar. Tidak ada tombol navigasi "Kembali" dengan ikon panah kiri di pojok kiri atas. Pengguna tidak bisa kembali ke halaman sebelumnya tanpa me-refresh browser. Temuan ini terpisah dari U15 (piktogram navigasi Home/Mic/Face) — U26 secara spesifik menargetkan elemen Back button dari UX-04:27 yang merupakan komponen navigasi terpisah.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | Tidak ada tombol kembali; hanya Start/Stop di bagian bawah |
| `feature/dualsense` | ❌ | Sama — tidak ada back button di pojok kiri atas |

**Lokasi kode:**
- `feature/vocatone`: `index.html` — `<section id="controls">` hanya Start + Stop
- `feature/dualsense`: `index.html` — `<section id="controls">` hanya Start + Stop

### 10.14 UX-02: Jarak Antar Komponen 12px Melanggar Minimum 16dp 🟢 U27

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** UX-02:49
- **Catatan:**

Blueprint UX-02:49: *"Jarak Antar Komponen (Padding): Minimum 16dp untuk mencegah accidental touch."*

Kedua branch menggunakan `gap-3` (Tailwind = 12px) pada `#feedback-panel` yang merupakan grid 2×2 berisi tombol LAR, Pitch, Accuracy, Stars. Jarak 12px ini **di bawah** minimum 16dp yang ditetapkan blueprint UX-02:49. Temuan U22 sudah mendokumentasikan margin layar 16dp (sisi kiri/kanan dari VISUAL-01:58), tetapi **tidak** mencakup jarak antar komponen internal (`gap`) yang memiliki spesifikasi terpisah di UX-02:49.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | `#feedback-panel` menggunakan `gap-3` (12px) — di bawah minimum 16dp |
| `feature/dualsense` | ❌ | Sama — `gap-3` (12px) |

**Lokasi kode:**
- `feature/vocatone`: `index.html` — `<section id="feedback-panel" class="grid grid-cols-2 gap-3">`
- `feature/dualsense`: `index.html` — class identik

### 10.15 UX-02: Missing Real-Time LAR Indicator Animation 🟡 U28

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Blueprint:** UX-02:76-78
- **Catatan:**

Blueprint UX-02 (Panduan Visual Siluet Mulut, baris 76-78): *"**Indikator LAR:** Buat animasi **garis vertikal dan horizontal** yang berubah warna secara **real-time** berdasarkan perhitungan Euclidean Lip Aspect Ratio (LAR) yang dideteksi MediaPipe."*

Ini adalah komponen visual **terpisah** dari siluet oval: sebuah crosshair yang terdiri dari garis vertikal dan horizontal dengan warna berubah real-time sesuai LAR. Kedua branch hanya menampilkan LAR sebagai **teks numerik** di `#lar-display`. Tidak ada implementasi garis LAR di Canvas overlay.

Perbedaan dari temuan existing:
- **U03/U07/U08/U09**: membahas **siluet oval** (VISUAL-02) — posisi wajah
- **U28**: membahas **LAR indicator crosshair** (UX-02:76-78) — rasio tinggi/lebar bibir secara visual

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | `drawMouthOverlay()` di `vision.js` — oval statis + segiempat bibir dinamis + titik landmark. Tidak ada garis LAR vertikal/horizontal. |
| `feature/dualsense` | ❌ | `drawSilhouette()` di `overlay.js` — oval dengan pulsing. Tidak ada garis LAR vertikal/horizontal. |

**Lokasi kode:**
- `feature/vocatone`: `src/utils/vision.js:148-184` — `drawMouthOverlay()` tanpa garis LAR
- `feature/dualsense`: `src/components/overlay.js:1-35` — `drawSilhouette()` tanpa garis LAR

### 10.16 UX-02: Missing Animated Checkmark Icon untuk Success State 🟢 U29

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** UX-02:16
- **Catatan:**

Blueprint UX-02 Matriks Substitusi Sensorik (baris 16): *"Berhasil/Benar → Flash layar Hijau (#22C55E), karakter game melompat gembira, **ikon centang besar animasi**."*

Kedua branch hanya mengimplementasikan **Flash Hijau** (U10/U24) untuk success state. Tidak ada ikon centang (`✓`) yang ditampilkan, apalagi dengan animasi. Vocatone menunjukkan teks "STABLE" di HUD accuracy display. Dualsense hanya mengubah warna background + flash.

| Branch | Implementasi Success Visual | Status |
|--------|--------------------------|--------|
| `feature/vocatone` | Background green + teks "STABLE" di HUD | ❌ Tidak ada checkmark icon |
| `feature/dualsense` | `flash-success` opacity 25% 500ms + `accuracyDisplay` teks "STABLE" | ❌ Tidak ada checkmark icon |

**Lokasi kode:**
- `feature/vocatone`: `src/components/game.js` — `_drawHUD()` hanya teks
- `feature/dualsense`: `src/main.js` — `triggerFlash()` hanya overlay warna; `accuracyDisplay.textContent = 'STABLE'`

### 10.17 UX-02: Missing Orbiting Pulse Animation di Sekitar Ikon Sensor 🟢 U30

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** UX-02:18
- **Catatan:**

Blueprint UX-02 Matriks Substitusi Sensorik (baris 18): *"Proses Sistem → Animasi **Orbiting Pulse** di sekitar ikon mikrofon/kamera yang menandakan MediaPipe sedang memproses wajah atau suara."*

Kedua branch tidak memiliki elemen ikon mikrofon/kamera di UI (U15), apalagi animasi pulsing orbital di sekitarnya. Tidak ada indikator visual bahwa MediaPipe sedang melakukan pemrosesan.

| Branch | Implementasi Processing Indicator | Status |
|--------|----------------------------------|--------|
| `feature/vocatone` | Tidak ada — game canvas langsung aktif saat session start | ❌ Tidak ada |
| `feature/dualsense` | Tidak ada — tidak ada ikon sensor; hanya silhouette + error screen | ❌ Tidak ada |

**Lokasi kode:**
- `feature/vocatone`: `index.html` — tidak ada elemen ikon mik/kamera
- `feature/dualsense`: `index.html` — tidak ada elemen ikon mik/kamera

### 10.18 UX-02: Missing Pulsing Red Arrow saat Face Exit / Silence 🟢 U31

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** UX-02:19
- **Catatan:**

Blueprint UX-02 Matriks Substitusi Sensorik (baris 19): *"Perhatian (Attention) → Getaran gawai (haptic feedback), **panah merah berdenyut** jika wajah keluar dari area kamera atau anak berhenti bersuara."*

Haptic feedback sudah tercatat di U06. Namun **panah merah berdenyut** (pulsing red arrow) yang menunjuk ke arah kamera/wajah tidak diimplementasikan di branch mana pun. Temuan U08 (Out of Bounds shake animation) membahas siluet bergetar — berbeda dari panah merah yang menunjuk secara spesifik ke area kamera.

| Branch | Implementasi Attention Indicator | Status |
|--------|--------------------------------|--------|
| `feature/vocatone` | Tidak ada — hanya error screen teks saat fallback | ❌ Tidak ada |
| `feature/dualsense` | Tidak ada — hanya `flash-idle` (merah 15%) + error screen teks | ❌ Tidak ada |

**Lokasi kode:**
- `feature/vocatone`: `index.html` + `main.js` — tidak ada elemen panah
- `feature/dualsense`: `index.html` + `main.js` — tidak ada elemen panah

---

## 11. VISUAL-01/02/03 — Visual Blueprint

### 11.1 VISUAL-01: Color Tokens

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ✅ #0D47A1, #22C55E, #EAB308 di game.js |
| `feature/dualsense` | ✅ #22C55E, #EAB308, #EF4444 di main.css |

### 11.2 VISUAL-01: Typography

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ✅ Inter di HUD |
| `feature/dualsense` | ✅ Tailwind font-heading/font-body |

### 11.3 VISUAL-02: Oval Opacity 30%

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ Tidak ada |
| `feature/dualsense` | ✅ `rgba(255,255,255,0.3)` |

### 11.4 VISUAL-02: Pulsing Effect

| Branch | Status |
|--------|--------|
| `feature/vocatone` | ❌ Tidak ada |
| `feature/dualsense` | ✅ `0.35 + 0.15 * Math.sin(Date.now()/500)` |

### 11.5 VISUAL-02: Warna State Siluet 🟡 U03

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/dualsense` | ❌ **Putih selalu** `rgba(255,255,255,0.3)` | Harus: Hijau saat Locked, Merah saat Out of Bounds |

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **Catatan:**

### 11.6 VISUAL-01: Button 3-State Styling 🟢 U12

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** VISUAL-01:47-49
- **Catatan:**

Blueprint mensyaratkan 3 state tombol: Default (elevasi rendah, solid), Active/Pressed (10% lebih gelap + haptic), Disabled (40% opacity + greyscale filter). Kedua branch hanya mengimplementasikan `active:scale-95` (Tailwind) — tidak ada perubahan warna 10% lebih gelap, tidak ada gaya disabled, tidak ada greyscale.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | `active:scale-95` — scale bukan darken; tidak ada CSS `:disabled` |
| `feature/dualsense` | ❌ | Sama |

**Lokasi kode:**
- Kedua branch: `index.html` — class `shadow-lg active:scale-95`; tidak ada aturan CSS untuk `:disabled`

### 11.7 VISUAL-03: Zero Asset Dependency

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ Kotak 40×40px canvas |
| `feature/dualsense` | ✅ Oval canvas |

### 11.8 VISUAL-02: Siluet — 3 State Behavioral 🟡 U07, 🟢 U08, 🟡 U09

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang (U07, U09) / 🟢 Ringan (U08)
- **Blueprint:** VISUAL-02:24-28
- **Catatan:**

Blueprint mensyaratkan **3 state** visual siluet dengan warna dan animasi spesifik:

| State | Warna | Animasi | Implementasi (dualsense) | Status |
|-------|-------|---------|-------------------------|--------|
| **Searching** | #F8FAFC | Pulsing 20% → 50% | Putih (`rgba(255,255,255)`), pulsing range 20-50% ✅, warna salah ❌ | ❌ **U07** |
| **Locked/Aligned** | #22C55E | Garis tebal statis | Putih selalu, `lineWidth=2` tetap | ❌ (U03 existing) |
| **Out of Bounds** | #EF4444 | Garis bergetar (shake) | Tidak ada | ❌ **U08** |

Akar masalah: `drawSilhouette(ctx, width, height, isFaceDetected, mouthData)` hanya menerima `isFaceDetected` boolean — tidak ada informasi state validasi LAR atau game state (**U09**).

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/dualsense` | ❌ | Hanya 2 state (face detected / no face), bukan 3 state sesuai blueprint |

**Lokasi kode:**
- `feature/dualsense`: `src/components/overlay.js` — `drawSilhouette()` signature dan implementasi; `src/main.js` — pemanggil hanya pass `isFaceDetected` boolean

### 11.9 VISUAL-02: Siluet — 48dp Padding 🟢 U18

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** VISUAL-02:36-38
- **Catatan:**

Blueprint: "Ukuran siluet menyesuaikan dengan rasio aspek layar (16:9 atau 4:3) dengan mempertahankan padding aman minimal 48dp dari tepi layar." Implementasi dualsense melakukan scaling dinamis berdasarkan canvas (`centerX=w/2, centerY=h/2, radiusX=w*0.15`) tetapi tidak meng-enforce batas padding 48dp — siluet bisa overflow di layar kecil.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/dualsense` | ⚠️ | Scaling dinamis ✅, padding 48dp tidak di-enforce ❌ |

**Lokasi kode:**
- `feature/dualsense`: `src/components/overlay.js` — `drawSilhouette()` tanpa clamping/margin

### 11.10 VISUAL-02: Siluet — Garis Putus-Putus 🟢 G07

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** VISUAL-02:14
- **Catatan:**

Blueprint (VISUAL-02:14): "Menggunakan bentuk oval transparan untuk area wajah dan **garis lengkung putus-putus** untuk area bibir sebagai titik fokus utama."

Kedua branch menggunakan `ctx.ellipse()` + `ctx.stroke()` dengan **garis kontinu/solid**. Tidak ada `ctx.setLineDash()` untuk efek putus-putus.

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | `drawMouthOverlay()` — `ctx.ellipse()` tanpa `setLineDash()` | ❌ Solid line |
| `feature/dualsense` | `drawSilhouette()` — `ctx.ellipse()` tanpa `setLineDash()` | ❌ Solid line |

**Lokasi kode:**
- `feature/vocatone`: `src/utils/vision.js` — `drawMouthOverlay()` method
- `feature/dualsense`: `src/components/overlay.js` — `drawSilhouette()` method

### 11.11 VISUAL-02: Siluet — CSS Stroke Transition 🟢 U19

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **Blueprint:** VISUAL-02:56
- **Catatan:**

Blueprint: "Terapkan transisi CSS `transition: stroke 0.3s ease-in-out` untuk perubahan warna saat berpindah state." Siluet dualsense di-render di **Canvas** (bukan SVG), sehingga CSS `stroke` transition tidak dapat diterapkan. Perubahan warna terjadi instan per-frame via `ctx.strokeStyle`. Jika blueprint menghendaki SVG, ini adalah architectural mismatch.

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/dualsense` | ⚠️ | Canvas-based — CSS stroke transition tidak bisa diimplementasi sebagaimana blueprint |

**Lokasi kode:**
- `feature/dualsense`: `src/components/overlay.js` — rendering via Canvas API, bukan SVG

### 11.12 VISUAL-03: Asset Inventory Tidak Diimplementasikan 🟢 U32

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan (wajar PoC)
- **Blueprint:** VISUAL-03:34-66
- **Catatan:**

Blueprint VISUAL-03 (Game Asset Inventory) mendefinisikan 10 aset spesifik yang harus ada dalam proyek:

| Nama Aset | Kategori | Format |
|-----------|----------|--------|
| `img_char_balon_udara` | Karakter | PNG |
| `ani_char_bubble` | Animasi | PNG |
| `bg_layer_sky` | Background | PNG |
| `bg_layer_mountains` | Background | PNG |
| `img_obs_cloud_mon` | Rintangan | PNG |
| `img_gate_sonic` | Target Gate | PNG |
| `ani_obs_destroy` | Animasi | PNG |
| `ic_ui_star_gold` | Icon | SVG |
| `ic_ui_cam_frame` | Silhouette | SVG |
| `ic_nav_home_default` | Navigasi | SVG |

**Tidak ada satu pun aset di atas yang ada** di kedua branch. Tidak ada file di folder `public/assets/` atau `src/assets/`. Semua rendering menggunakan Canvas API langsung (kotak biru 40×40 untuk vocatone, oval putih untuk dualsense).

Perbedaan dari temuan existing:
- **G10**: Missing Character & Gate rendering — spesifik implementasi Canvas, bukan aset file
- **G11**: Missing Mascot Expressions — spesifik karakter ekspresif, bukan aset sprite
- **U15**: Icon-based navigation — spesifik penggunaan piktogram, bukan file SVG
- **U16**: History page — halaman navigasi, bukan aset

Item ini 🟢 Ringan dan wajar untuk PoC karena `50_PERCENT_OF_MVP.md` menyatakan: "Seluruh grafis menggunakan objek geometri dasar HTML5 Canvas (placeholder style)."

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | Tidak ada file aset — semua render via Canvas (`game.js` `fillRect`) |
| `feature/dualsense` | ❌ | Tidak ada file aset — semua render via Canvas (`overlay.js` `ellipse`) |

**Lokasi kode:**
- `feature/vocatone`: `public/` — tidak ada folder assets; `src/components/game.js` — semua geometri hardcoded
- `feature/dualsense`: `public/` — tidak ada folder assets; `src/components/overlay.js` — semua geometri hardcoded

---

## 12. Rangkuman Kepatuhan

| Dokumen | Bobot | `feature/vocatone` | `feature/dualsense` |
|---------|-------|-------------------|-------------------|
| TECH-01 | ⭐⭐⭐ | 60% | 50% |
| TECH-02 | ⭐⭐ | 50% | 35% |
| TECH-03 | ⭐⭐⭐ | 85% | 68% |
| TECH-04 | ⭐⭐⭐ | 75% | 62% |
| GAME-01 | ⭐⭐⭐ | 75% | N/A |
| GAME-02 | ⭐⭐⭐ | N/A | 60% |
| GAME-03 | ⭐⭐ | 60% | 55% |
| GAME-04 | ⭐ | ✅ PoC | ✅ PoC |
| UX-01/02/03/04 | ⭐⭐ | 40% | 60% |
| VISUAL-01/02/03 | ⭐⭐ | 50% | 65% |
| **Rata-rata tertimbang** | | **62%** | **56%** |

**Catatan:** 6 temuan baru versi 12.0 (T30, G12, U29-U32) semuanya 🟢 Ringan atau 🟡 Sedang — tidak ada 🔴 Kritis. Tidak ada perubahan signifikan pada persentase kepatuhan karena semua temuan baru merupakan gap visual/asset yang wajar untuk lingkup PoC.

**Catatan v13.0:** 3 temuan baru (T31 🟡 Sedang, G13-G14 🟢 Ringan). T31 merupakan gap error handling di VocaTone. G13-G14 wajar untuk placeholder PoC. <br>Koreksi: C21 diperbaiki — vocatone juga memiliki hardcoded "A" di index.html, bukan hanya dualsense.

**Catatan v14.0:** 2 temuan baru + 2 koreksi (T32-T33 🟡 Sedang, koreksi U02, update G05). T32: DualSense tidak tutup mic saat face loss di MIC_OPEN + VocaTone salah matikan kamera (violasi TECH-01:74). T33: DualSense `openAudioGate()` silent fail untuk mic denied — tidak ada user-facing error. Koreksi U02: penilaian sebelumnya yang menyatakan dualsense ✅ menangani mic denied ternyata keliru — `showCameraError()` hanya untuk camera, bukan mic. Update G05: detail pelanggaran spesifik per branch ditambahkan. Total 103 temuan.

### 3 Pelanggaran Paling Kritis

| # | Branch | Pelanggaran | Blueprint | Status Refactor |
|---|--------|------------|-----------|-----------------|
| 🔴 1 | `dualsense` | Euclidean **3D** bukan 2D | TECH-01:36 | ❌ |
| 🔴 2 | `dualsense` | Vowel I pakai **mouth spread ratio**, bukan `LAR ≤ low` | TECH-01:47, GAME-02:78 | ❌ |
| 🔴 3 | `vocatone` | **Tidak membedakan vokal A/I**, threshold tunggal 0.3 | TECH-01:46-47 | ❌ |

---

## 13. Inkonsistensi Langsung Antar Kedua Branch

| # | Aspek | `feature/vocatone` | `feature/dualsense` | Prioritas | Refactor |
|---|-------|-------------------|-------------------|-----------|----------|
| C01 | `gatekeeper` export | `export default` | `export { gatekeeper, STATES }` | 🔴 Fatal | ❌ |
| C02 | `initCamera()` signature | Object callbacks | Positional args | 🔴 Fatal | ❌ |
| C03 | naming convention | ✅ snake_case | ❌ camelCase | 🟡 Sedang | ❌ |
| C04 | Vite config | Tanpa SSL | `basicSsl` + `https` | 🟢 Ringan | ❌ |
| C05 | `package.json` | Tanpa basicSsl | Dengan basicSsl | 🟢 Ringan | ❌ |
| C06 | `AGENTS.md` | Versi dasar | Diperluas | 🟢 Ringan | ❌ |
| C07 | `closeAudioStream()` | `async` + `await` | `sync` tanpa await | 🔴 Fatal | ❌ |
| C08 | `computeRMS()` | `export function` | private `function` | 🟡 Sedang | ❌ |
| C09 | `NOISE_FLOOR_RMS` | `export let` | `const` | 🟢 Ringan | ❌ |
| C10 | `getPitchHz()` | ✅ Ada | ❌ Tidak | 🟢 Ringan | ❌ |
| C11 | Octave correction | ❌ Tidak | ✅ Ada | 🟡 Sedang | ❌ |
| C12 | `refineLandmarks` | ✅ `true` | ✅ `true` | 🟢 Ringan | ✅ Konsisten |
| C13 | HUD Stability Bar | ✅ Ada | ❌ Tidak | 🟢 Ringan | ❌ |
| C14 | TARGET_FPS | 20 | 15 | 🟡 Sedang | ❌ |
| C15 | `f_min` constants | 150 | 100 | 🟢 Ringan | ❌ |
| C16 | `lar_threshold` source | Hardcoded 0.3 di main.js | Dari constants.js ✅ | 🟢 Ringan | ❌ |
| C17 | AudioContext destination | Tidak connect | Tidak connect | 🟢 Ringan | ❌ |

### Detail Inkonsistensi Tambahan

**C15 — `f_min`:**

| Branch | `f_min` | `f_max` |
|--------|---------|---------|
| `feature/vocatone` | `150` | `350` |
| `feature/dualsense` | `100` | `350` |

Nilai `f_min` berbeda (150 vs 100). Nilai 100Hz masuk range vocal fry dewasa, **tidak sesuai** untuk target user 7-9 tahun (f0 250-400Hz) — lihat T27. Perlu distandarisasi dan diambil dari IndexedDB profile.

**C18 — `preGrantAudioPermission()` — Dualsense eager vs Vocatone lazy:**

Dualsense memanggil `preGrantAudioPermission()` di awal `startSession()`, jauh sebelum LAR_CHECK. Ini menyebabkan:
- Mic permission prompt muncul bahkan untuk sesi yang mungkin tidak pernah masuk ke MIC_OPEN.
- Beda dengan vocatone yang hanya `initAudioStream()` setelah LAR_CHECK pass.
- Tidak ada keuntungan performa signifikan karena `getUserMedia({audio:true})` lalu `track.stop()` tidak meng-cache permission di semua browser.

| Branch | Implementasi | Detail |
|--------|-------------|--------|
| `feature/vocatone` | Lazy — `initAudioStream()` setelah LAR_CHECK pass ✅ | Izin mic hanya saat diperlukan |
| `feature/dualsense` | Eager — `preGrantAudioPermission()` di awal sesi ❌ | Prompt permission sebelum validasi visual |

**C19 — Error screen CSS transition duration mismatch:**

| Branch | CSS Class / Transition | Detail |
|--------|----------------------|--------|
| `feature/vocatone` | `transition-opacity duration-700` (700ms) ✅ | Dalam range UX-02:38 (500-800ms) |
| `feature/dualsense` | `transition: opacity 500ms ease` (500ms) ✅ | Dalam range, tapi inkonsisten |

Kedua nilai masih dalam rentang blueprint (500-800ms), namun inkonsisten antar branch. Saat unified code, perlu distandarisasi.

**C21 — Hardcoded "A" di `#vowel-indicator` span HTML (kedua branch):**

Kedua branch memiliki `#vowel-indicator` dengan `<span class="...">A</span>` — **hardcoded "A"** meskipun mode vokal belum ditentukan. Parent tersembunyi via class `hidden`, namun nilai default "A" di HTML menyesatkan jika ada flash layout sebelum JS runtime. Vocatone tidak menggunakan vowel indicator sama sekali (audio-only module), tapi elemen HTML tetap ada.

| Branch | HTML Default | Detail |
|--------|-------------|--------|
| `feature/vocatone` | ⚠️ | Span text `A` hardcoded — tidak dipakai (module audio-only) |
| `feature/dualsense` | ⚠️ | Span text `A` hardcoded, bukan empty string |

**C22 — Camera feed mirror transform hanya ada di dualsense:**

Dualsense CSS menerapkan `#camera-feed { transform: scaleX(-1); }` untuk mirror kamera depan (seperti bercermin). Vocatone tidak melakukan mirror, menyebabkan tampilan kamera non-mirror yang tidak natural untuk self-calibration.

| Branch | Implementasi | Detail |
|--------|-------------|--------|
| `feature/vocatone` | ❌ Tidak ada mirror | Non-mirror, tidak natural untuk user |
| `feature/dualsense` | ✅ `transform: scaleX(-1)` | Mirror — seperti bercermin |

**C23 — f_min inkonsisten antar branch (150Hz vs 100Hz):**

| Branch | f_min | Sumber | Detail |
|--------|-------|--------|--------|
| `feature/vocatone` | 150 Hz | `constants.js` + `game.js:DEFAULT_F_MIN` | Anak dengan f0 120Hz **ditolak** (stability check gagal) |
| `feature/dualsense` | 100 Hz | `constants.js` (commit `07dfdf4`) | Anak dengan f0 120Hz **diterima** (in range) |

Dualsense menurunkan f_min dari 150 ke 100 Hz via commit `07dfdf4` dengan pesan: "turunkan f_min dari 150 ke 100 Hz agar suara user masuk range". Vocatone tetap di 150 Hz. Ketidakcocokan ini menyebabkan perilaku validasi f0 berbeda secara fundamental antara kedua branch.

**Catatan tambahan:** Vocatone `game.js` memiliki konstanta `DEFAULT_F_MIN = 150` sendiri (tidak import dari `constants.js`), yang merupakan code smell — ada 2 sumber kebenaran untuk f_min.

**Blueprint:** TECH-02:40 — `f_min` seharusnya dari IndexedDB per-user profile, bukan hardcoded di kedua branch.

**C24 — GateKeeper state machine arsitektur fundamental berbeda:**

Kedua branch mengimplementasikan GateKeeper secara berbeda total — bukan hanya export pattern seperti C01, tetapi seluruh arsitektur transisi state, mode tracking, hook system, dan validasi.

| Aspek | `feature/vocatone` | `feature/dualsense` | Dampak |
|-------|-------------------|-------------------|--------|
| **Export** | `export default gatekeeper; export { STATES }` | `export { gatekeeper, STATES }` | C01 |
| **Valid transitions** | Strict: `CAMERA_ACTIVE → [LAR_CHECK]` (hanya forward) | Permissive: `CAMERA_ACTIVE → [LAR_CHECK, MIC_OPEN, IDLE]` (skip LAR_CHECK!) | Dualsense bisa bypass LAR_CHECK untuk /i/ |
| **Mode system** | ❌ Tidak ada | ✅ `#currentMode` + `{ mode: 'A'/'I' }` | Vocatone tidak bisa bedakan vokal di state machine |
| **Fallback method** | ✅ `fallbackTo(CAMERA_ACTIVE)` method terpisah | ❌ Tidak ada; pakai `reset()` + transisi ulang | Dualsense tidak punya recovery path khusus |
| **Error handling** | `throw new Error()` — hard fail | `console.warn()` — silent fail | Dualsense masking invalid transitions |
| **Hook storage** | `Map` dengan `{enter, exit}` object | `#onEnterCallbacks` / `#onExitCallbacks` plain object | Arsitektur internal berbeda |
| **State categories** | ✅ `ACTIVE_STATES` array (const) | ❌ Tidak ada kategori state | Dualsense tidak bedakan state aktif vs idle |
| **Transitions ke MIC_OPEN dari CAMERA_ACTIVE** | ❌ Tidak diizinkan | ✅ Diizinkan (`VALID_TRANSITIONS`) | Violasi blueprint sequential logic |
| **Transitions dari MIC_OPEN kembali ke CAMERA_ACTIVE** | ❌ Tidak diizinkan (hanya `SESSION_ACTIVE → IDLE`) | ✅ Diizinkan (permissive) | Dualsense lebih fleksibel tapi tidak sesuai blueprint |

**Lokasi kode:**
- `feature/vocatone`: `src/utils/gatekeeper.js` — strict state machine dengan `VALID_TRANSITIONS` ketat
- `feature/dualsense`: `src/utils/gatekeeper.js` — permissive state machine dengan 5+ transisi per state

**C20 — `triggerFallback()` 1s cooldown lockout (dualsense only):**

Dualsense memiliki mekanisme `larValidSince` yang mencegah state transition selama 1000ms setelah fallback, meskipun user sudah memperbaiki bentuk mulut. Vocatone tidak memiliki lockout — fallback langsung siap menerima input baru.

| Branch | Cooldown | Detail |
|--------|----------|--------|
| `feature/vocatone` | Tidak ada ✅ | `executeFallback()` → langsung CAMERA_ACTIVE |
| `feature/dualsense` | 1000ms lockout ❌ | `fallbackMode` prevent IDLE→CAMERA_ACTIVE |

**C16 — Source `lar_threshold`:**

| Branch | Sumber | Detail |
|--------|--------|--------|
| `feature/vocatone` | Hardcoded `DEFAULT_LAR_THRESHOLD = 0.3` di `main.js` | `constants.js` sudah ada dengan `{high:0.5, low:0.2}` tapi tidak diimpor |
| `feature/dualsense` | Impor dari `constants.js` ✅ | `lar_threshold.high = 0.5`, `lar_threshold.low = 0.2` |

---

## Lampiran

### Lampiran A: Glossary Status Ikon

| Ikon | Arti |
|------|------|
| ✅ | Sesuai blueprint / sudah benar |
| ❌ | Tidak sesuai / melanggar / belum diimplementasikan |
| ⚠️ | Perlu perhatian / menyimpang minor / tidak optimal |
| 🔴 Kritis | Menyebabkan kegagalan fungsional atau error sistematik |
| 🟡 Sedang | Menyimpang dari spesifikasi, butuh perbaikan |
| 🟢 Ringan | Bisa ditunda, tidak mengganggu fungsionalitas inti |
| N/A | Tidak relevan untuk branch tersebut |

### Lampiran B: Template Temuan Baru

Salin blok berikut untuk menambah temuan baru:

```markdown
### [Nomor] — [Judul Temuan] [Kode Prioritas] [Kode Item]

- **Refactor:** ❌ Belum
- **Prioritas:** [🔴 Kritis / 🟡 Sedang / 🟢 Ringan]
- **Blueprint:** [file.md:line]
- **Catatan:**

[Deskripsi temuan]

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | [status] | [detail] |
| `feature/dualsense` | [status] | [detail] |

**Lokasi kode:**
- `feature/vocatone`: [path]:[line]
- `feature/dualsense`: [path]:[line]
```

Setelah menambah, update [Master Synchronization Checklist](#master-synchronization-checklist) dengan baris baru.

### Lampiran C: Change Log

| Tanggal | Versi | Perubahan | Oleh |
|---------|-------|-----------|------|
| 17 Jul 2026 | 1.0 | Initial — evaluasi awal vocatone (a79e24e) vs dualsense (2194a33) vs 15 blueprint | Agent V-NADA |
| 17 Jul 2026 | 2.0 | Restruktur: tambah master checklist, tracking fields, template temuan baru, change log | Agent V-NADA |
| 17 Jul 2026 | 3.0 | Audit lanjutan: temukan 10 temuan baru (T11-T13, G04, U07-U10, C15-C16) dari blueprint yang belum tercatat — sample rate normalization, memory GC, silhouette 3-state, flash opacity, wrong mouth → silhouette red, f_min inconsistency | Agent V-NADA |
| 17 Jul 2026 | 4.0 | Audit final: temukan 18 temuan baru (T14-T16, G05-G06, U11-U19, C17) — MediaPipe caching, memory limit, AudioContext destination, pause mode, stability timer, scaling 1.2x, button states, mic illustration, camera/mic distinction, icon nav, history page, splash screen, silhouette padding, stroke transition. Koreksi section 4.1 dari ✅ ke ❌. Verifikasi fat-finger 60dp ✅. | Agent V-NADA |
| 17 Jul 2026 | 5.0 | Audit lanjutan — temukan 5 temuan baru (T17-T18, C18-C20): T17 `triggerFallback()` dualsense reset ke IDLE bukan CAMERA_ACTIVE (TECH-01); T18 `autocorrelationPitch()` alokasi `corrMap` per frame (TECH-03/AGENTS.md); C18 pre-grant audio permission eager; C19 error screen transition 700 vs 500ms; C20 fallback 1s cooldown lockout. | Agent V-NADA |
| 17 Jul 2026 | 6.0 | Audit lanjutan — temukan 7 temuan baru (T19-T21, G07, U20, C21-C22): T19 camera fallback dualsense tidak cleanup stream gagal (TECH-04); T20 initAudioStream() tanpa error handling → AudioContext leak (TECH-03); T21 lar_threshold schema mismatch IndexedDB (TECH-02); G07 siluet garis putus-putus tidak ada (VISUAL-02); U20 tidak ada instruksi "Ayo Mulai" (GAME-03); C21 hardcoded "A" di vowel-indicator; C22 camera mirror scaleX(-1) hanya di dualsense. | Agent V-NADA |
| 17 Jul 2026 | 7.0 | Audit final — temukan 3 temuan baru (T22, C23-C24): T22 dualsense `initAudioStream()` tidak resume AudioContext → mobile Chrome silent fail (TECH-03); C23 f_min inkonsisten 150Hz(vocatone) vs 100Hz(dualsense) (constants.js); C24 GateKeeper state machine arsitektur fundamental berbeda (VALID_TRANSITIONS, mode system, fallback method). Total 50 temuan. | Agent V-NADA |
| 17 Jul 2026 | 8.0 | Audit final — verifikasi ulang seluruh 15 blueprint vs implementasi branch. Temukan 3 temuan baru (U21-U23): U21 camera frame border hijau untuk face detection tidak ada (UX-03:30); U22 margin layar 16dp tidak di-enforce (VISUAL-01:58); U23 objek VocaTone tidak membesar saat naik (GAME-01:78). Total 53 temuan. | Agent V-NADA |
| 17 Jul 2026 | 9.0 | Audit deep-dive — temukan 8 temuan baru (T23-T27, G08, U24-U25): T23 DualSense `stopSession()` tidak cleanup state variables — potensi stale state restart (TECH-04); T24 DualSense `computeRMS()` tanpa guard division-by-zero (TECH-03); T25 VocaTone `f_max` dual source of truth constants.js vs game.js (TECH-02); T26 IndexedDB pipeline dead code — `saveProfile()` tidak pernah dipanggil (TECH-02); T27 kedua branch tidak baca `f_min`/`f_max` dari IndexedDB profile (TECH-02); G08 VocaTone `_drawBackground()` tidak #F8FAFC untuk fall/rise (GAME-01); U24 DualSense flash-error/warning/idle opacity < 30% (UX-02); U25 VocaTone tidak ada siluet kalibrasi saat no face — tidak ada independent loop (VISUAL-02). Koreksi section 6.4: vocatone ❌ bukan ✅. Total 61 temuan. | Agent V-NADA |
| 17 Jul 2026 | 10.0 | Audit final — perbandingan kode branch vs 15 blueprint. Temukan 4 temuan baru (T28, G09, U26-U27): T28 Stale-While-Revalidate tidak diimplementasikan untuk game components — semua CacheFirst (TECH-02:20); G09 RMS threshold tidak dikalibrasi di awal sesi — hardcoded 0.01 tanpa sampling ambient noise (GAME-01:79); U26 tombol kembali (back button) tidak ada — tidak ada ikon panah kiri di pojok kiri atas (UX-04:27); U27 jarak antar komponen `gap-3` (12px) melanggar minimum 16dp (UX-02:49). Total 65 temuan. | Agent V-NADA |
| 17 Jul 2026 | 11.0 | Audit kode mendalam — temukan 4 temuan baru (T29, G10-G11, U28): T29 Race condition `openAudioGate()` fire-and-forget vs `triggerFallback()` — orphaned AudioContext (TECH-03:14-16); G10 Missing Character & Gate rendering di DualSense — tidak ada objek game visual (GAME-02:16-17); G11 Missing Mascot with Expressions — hanya flash warna (GAME-03:40-43, wajar PoC); U28 Missing real-time LAR indicator animation — tidak ada garis vertikal/horizontal crosshair (UX-02:76-78). Total 69 temuan. | Agent V-NADA |
| 17 Jul 2026 | 12.0 | Audit blueprint lengkap — temukan 6 temuan baru (T30, G12, U29-U32): T30 Sensor disconnected handling tidak ada (TECH-01:77); G12 Dynamic obstacle proportional scaling berdasarkan LAR proximity tidak ada (GAME-03:43); U29 Missing animated checkmark icon untuk success state (UX-02:16); U30 Missing Orbiting Pulse animation di sekitar ikon sensor (UX-02:18); U31 Missing pulsing red arrow saat face exit/silence (UX-02:19); U32 Missing asset inventory dari VISUAL-03 — semua aset PNG/SVG tidak ada (wajar PoC). Total 75 temuan. | Agent V-NADA |
| 17 Jul 2026 | 13.0 | Audit kode final — temukan 3 temuan baru (T31, G13, G14): T31 VocaTone camera start error tidak ada user-facing feedback — hanya console.error (TECH-04, UX-03:50); G13 VocaTone balloon color — dark blue (#0D47A1) bukan bright/light blue (UX-02:81); G14 VocaTone balloon movement — constant velocity RISE_SPEED=2 bukan smooth acceleration (UX-02:82). Koreksi C21: vocatone juga hardcoded "A" di index.html. Total 101 temuan. | Agent V-NADA |
| 17 Jul 2026 | 14.0 | Audit kode mendalam vs 15 blueprint — temukan 2 temuan baru + 2 koreksi (T32-T33 🟡 Sedang, koreksi U02, update G05). T32: DualSense tidak tutup mic saat wajah hilang di MIC_OPEN — melanggar TECH-01:74 "Wajah tidak terdeteksi → Tutup gerbang audio"; VocaTone executeHardReset() salah matikan kamera (harus Visual Validation). T33: DualSense openAudioGate() silent fail untuk mic denied — preGrantAudioPermission() punya catch(_){} dan openAudioGate() hanya console.warn, tidak ada user-facing error; showCameraError() ternyata hanya untuk camera, bukan mic. Koreksi U02: penilaian dualsense ✅ mic error handling adalah keliru — diubah ke ❌. Update G05: detail pelanggaran spesifik per branch (mic tidak ditutup di dualsense, kamera dimatikan di vocatone). Total 103 temuan. | Agent V-NADA |

---

*Dokumen ini dihasilkan oleh Agent V-NADA pada 17 Juli 2026. Diperbarui secara berkala selama proses refactoring. Total 103 temuan terverifikasi.*
