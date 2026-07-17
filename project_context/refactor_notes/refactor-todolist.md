# Refactor To-Do List — V-NADA Sprint 1

**Tujuan:** Checklist terpadu untuk memperbaiki seluruh ketidaksinkronan antara branch `feature/vocatone` & `feature/dualsense` terhadap Technical Blueprint (Note 1) dan 50% PoC Scope Boundary (Note 2).

**Sumber:**
- [refactor-note-1.md](./refactor-note-1.md) — 91 temuan (T33, G14, U32, C12) terhadap 15 dokumen blueprint
- [refactor-note-2.md](./refactor-note-2.md) — 45 temuan (S01–S45) terhadap 50_PERCENT_OF_MVP.md

**Total item:** 136

---

## Cara Penggunaan

| Kolom | Arti |
|-------|------|
| **Refactor** | `❌` Belum / `🔄` Sedang / `✅` Selesai / `➖` Tidak relevan |
| **Prioritas** | `🔴 Kritis` / `🟡 Sedang` / `🟢 Ringan` |
| **Catatan** | Commit hash / keputusan desain / cross-ref ke item lain |

### Aturan:
1. Saat mulai memperbaiki, ubah `❌` → `🔄` dan isi **Catatan** dengan rencana.
2. Setelah selesai, ubah `🔄` → `✅` dan tulis commit hash.
3. Item duplikat antar Note 1 & Note 2 ditandai dengan `⤻ lihat [item]`.
4. Update **Change Log** di bagian bawah setiap kali ada perubahan.

---

## Ringkasan Master Tracker

| Kategori | Total | 🔴 Kritis | 🟡 Sedang | 🟢 Ringan |
|----------|-------|-----------|-----------|-----------|
| TECH (T01–T33) | 33 | 4 | 22 | 7 |
| GAME (G01–G14) | 14 | 0 | 8 | 6 |
| UX/VISUAL (U01–U32) | 32 | 0 | 4 | 28 |
| CROSS (C01–C24) | 12 | 4 | 2 | 6 |
| SCOPE (S01–S45) | 45 | 15 | 25 | 5 |
| **Total** | **136** | **23** | **61** | **52** |

---

## 🔴 Prioritas Kritis

| # | Item | Affected Branch | Sumber | Cross-Ref | Blueprint / PoC Line | Refactor | Catatan |
|---|------|----------------|--------|-----------|---------------------|----------|---------|
| T01 | Euclidean 3D → 2D | dualsense | Note-1 TECH | ⤻ S08 | TECH-01:36 | ❌ | |
| T02 | Vokal A — threshold tunggal (harus `lar_threshold.high`) | vocatone | Note-1 TECH | ⤻ S35 | TECH-01:46 | ❌ | |
| T03 | Vokal I — pakai `LAR ≤ low`, bukan spread ratio | dualsense | Note-1 TECH | ⤻ S09, S12 | TECH-01:47, GAME-02:78 | ❌ | |
| T17 | `triggerFallback()` → `gatekeeper.reset()` ke IDLE, bukan CAMERA_ACTIVE | dualsense | Note-1 TECH | ⤻ S10 | TECH-01:65, TECH-01:75 | ❌ | |
| C01 | `gatekeeper` export pattern (default vs named) — standarisasi | kedua | Note-1 CROSS | | — | ❌ | |
| C02 | `initCamera()` API signature (object vs positional) — standarisasi | kedua | Note-1 CROSS | ⤻ S30 | — | ❌ | |
| C23 | `f_min` value inkonsisten — vocatone 150Hz, dualsense 100Hz | kedua | Note-1 CROSS | ⤻ S17, S34 | constants.js | ❌ | |
| C24 | GateKeeper state machine arsitektur fundamental berbeda | kedua | Note-1 CROSS | ⤻ S04, S05, S32 | — | ❌ | |
| S01 | `preGrantAudioPermission()` — mic tidak idle secara default | dualsense | Note-2 SCOPE | | PoC:26 | ❌ | |
| S04 | State machine bypass LAR_CHECK untuk vokal /i/ | dualsense | Note-2 SCOPE | ⤻ C24 | PoC:26, 68-69 | ❌ | |
| S07 | `audio.js` tidak resume AudioContext — gagal total di Chrome/Android | dualsense | Note-2 SCOPE | ⤻ T22 | PoC:42 | ❌ | |
| S08 | Euclidean 3D bukan 2D — LAR mengandung noise sumbu Z | dualsense | Note-2 SCOPE | ⤻ T01 | PoC:58-60 | ❌ | |
| S09 | Vokal /i/ pakai mouth spread ratio, bukan `LAR ≤ low` | dualsense | Note-2 SCOPE | ⤻ T03 | PoC:69 | ❌ | |
| S10 | `triggerFallback()` reset ke IDLE, bukan CAMERA_ACTIVE | dualsense | Note-2 SCOPE | ⤻ T17 | PoC:70 | ❌ | |
| S11 | Face loss saat MIC_OPEN — mic tidak ditutup | dualsense | Note-2 SCOPE | ⤻ T32 | PoC:70 | ❌ | |
| S12 | /i/ fallback monitor pakai MouthWidth, bukan LAR | dualsense | Note-2 SCOPE | ⤻ T03 | PoC:69-70 | ❌ | |
| S21 | LAR_CHECK gagal transisi ke IDLE (full reset), bukan CAMERA_ACTIVE | dualsense | Note-2 SCOPE | ⤻ S10 | PoC:26, 70 | ❌ | |
| S27 | Tidak ada `onNoFace` callback di FaceMesh pipeline — polling 500ms | dualsense | Note-2 SCOPE | | PoC:70 | ❌ | |
| S30 | `cameraController.start()` fire-and-forget — silent failure | dualsense | Note-2 SCOPE | ⤻ C02 | PoC:42 | ❌ | |
| S32 | `transitionTo()` silent return — state violation tidak terdeteksi | dualsense | Note-2 SCOPE | ⤻ C24 | PoC:26 | ❌ | |
| S35 | VocaTone tidak import `constants.js` — threshold LAR 0.3 ≠ 0.5 | vocatone | Note-2 SCOPE | ⤻ T02 | PoC:68, AGENTS.md | ❌ | |
| S40 | Tidak ada flash merah saat MIC_OPEN tanpa input suara | dualsense | Note-2 SCOPE | ⤻ S45 | PoC:81 | ❌ | |
| S45 | VocaTone tidak ada flash merah saat tidak ada suara | vocatone | Note-2 SCOPE | ⤻ S40 | PoC:81 | ❌ | |

---

## 🟡 Prioritas Sedang

| # | Item | Affected Branch | Sumber | Blueprint / PoC Line | Refactor | Catatan |
|---|------|----------------|--------|---------------------|----------|---------|
| T04 | IndexedDB profile loading di dualsense | dualsense | Note-1 TECH | TECH-02:36-41 | ❌ | |
| T05 | `closeAudioStream()` sync → async | dualsense | Note-1 TECH | TECH-03:25 | ❌ | |
| T08 | FPS 15 → 20 | dualsense | Note-1 TECH | TECH-04:28 | ❌ | |
| T09 | Octave correction di vocatone | vocatone | Note-1 TECH | TECH-03:42 | ❌ | |
| T11 | Normalisasi sample rate audio ke 44.1/48 kHz | kedua | Note-1 TECH | TECH-03:16 | ❌ | |
| T12 | Hapus FaceMesh instance saat stop() — cegah memory leak | kedua | Note-1 TECH | TECH-04:41-43 | ❌ | |
| T13 | Bersihkan `videoElement.srcObject` saat stop() | kedua | Note-1 TECH | TECH-04:41-43 | ❌ | |
| T14 | MediaPipe model caching — hanya .wasm di-cache | kedua | Note-1 TECH | TECH-02:22-25 | ❌ | |
| T18 | `autocorrelationPitch()` alokasi `corrMap` Map per frame — memory leak | dualsense | Note-1 TECH | TECH-03:27, TECH-04:54 | ❌ | |
| T19 | Camera fallback 480p→360p tidak cleanup media stream gagal | dualsense | Note-1 TECH | TECH-04:14-16 | ❌ | |
| T20 | `initAudioStream()` tidak handle error getUserMedia → AudioContext bocor | dualsense | Note-1 TECH | TECH-03:14-16 | ❌ | |
| T21 | `lar_threshold` schema mismatch — IndexedDB baca `.value` (number) vs object `{high, low}` | vocatone | Note-1 TECH | TECH-02:36-41 | ❌ | |
| T22 | Dualsense `initAudioStream()` tidak resume AudioContext — silent fail mobile | dualsense | Note-1 TECH | TECH-03:15-16 | ❌ | |
| T23 | DualSense `stopSession()` tidak cleanup state variables — stale state | dualsense | Note-1 TECH | TECH-04:41-43 | ❌ | |
| T26 | IndexedDB pipeline dead code — `saveProfile()` tidak pernah dipanggil | kedua | Note-1 TECH | TECH-02:36-41 | ❌ | |
| T27 | Kedua branch tidak baca `f_min`/`f_max` dari IndexedDB profile — hardcoded | kedua | Note-1 TECH | TECH-02:40 | ❌ | |
| T28 | Stale-While-Revalidate tidak diimplementasikan — semua CacheFirst | kedua | Note-1 TECH | TECH-02:20 | ❌ | |
| T29 | Race condition: `openAudioGate()` fire-and-forget vs `triggerFallback()` | dualsense | Note-1 TECH | TECH-03:14-16 | ❌ | |
| T30 | Sensor disconnected — tidak ada penanganan khusus | kedua | Note-1 TECH | TECH-01:77 | ❌ | |
| T31 | Camera start error — vocatone hanya console.error, tidak ada user-facing | vocatone | Note-1 TECH | TECH-04, UX-03:50 | ❌ | |
| T32 | Face loss — DualSense tidak tutup microphone saat wajah hilang di MIC_OPEN | dualsense | Note-1 TECH | TECH-01:74 | ❌ | |
| T33 | Mic denied — DualSense `openAudioGate()` hanya console.warn, tanpa UI error | dualsense | Note-1 TECH | TECH-03:14-16, UX-03:50 | ❌ | |
| G01 | Inisialisasi kamera berlebihan di vocatone (audio-only) | vocatone | Note-1 GAME | GAME-01:79 | ❌ | |
| G02 | Low amplitude — pakai #F8FAFC, bukan merah | dualsense | Note-1 GAME | GAME-02:67, GAME-03:20 | ❌ | |
| G03 | No face — pakai #F8FAFC, bukan merah | dualsense | Note-1 GAME | GAME-03:19 | ❌ | |
| G04 | Wrong mouth → siluet ikut merah sesuai GAME-02:87 | dualsense | Note-1 GAME | GAME-02:87 | ❌ | |
| G05 | Face loss — tidak ada mode pause + recalibration | dualsense | Note-1 GAME | UX-03:51 | ❌ | |
| G08 | VocaTone `_drawBackground()` tidak #F8FAFC untuk fall/rise — transparan | vocatone | Note-1 GAME | GAME-01:19,22,62 | ❌ | |
| G09 | RMS threshold tidak dikalibrasi di awal sesi — hardcoded 0.01 | kedua | Note-1 GAME | GAME-01:79 | ❌ | |
| G10 | Missing Character & Gate rendering di DualSense — tidak ada objek game visual | dualsense | Note-1 GAME | GAME-02:16-17 | ❌ | |
| U03 | Warna siluet oval: Hijau/Merah sesuai state | dualsense | Note-1 UX | VISUAL-02:27-28 | ❌ | |
| U07 | Siluet — Searching state #F8FAFC dengan pulsing 20-50% | dualsense | Note-1 UX | VISUAL-02:26 | ❌ | |
| U09 | Siluet — `drawSilhouette()` harus terima validation state, bukan boolean | dualsense | Note-1 UX | VISUAL-02:24-28 | ❌ | |
| U28 | Missing real-time LAR indicator animation — crosshair | kedua | Note-1 UX | UX-02:76-78 | ❌ | |
| C03 | Snake_case vs camelCase — variabel duality mengikuti AGENTS.md | dualsense | Note-1 CROSS | AGENTS.md | ❌ | |
| C20 | `triggerFallback()` cooldown 1s recovery — tidak ada di blueprint atau vocatone | dualsense | Note-1 CROSS | | ❌ | |
| S02 | Siluet oval tidak statis (posisi dinamis + animasi pulsing) | dualsense | Note-2 SCOPE | PoC:82 | ❌ | |
| S05 | SESSION_ACTIVE state tidak pernah tercapai (dead state) | dualsense | Note-2 SCOPE | PoC:51-71 | ❌ | |
| S06 | Flash feedback via DOM overlay bukan canvas background | dualsense | Note-2 SCOPE | PoC:79 | ❌ | |
| S13 | `openAudioGate()` fire-and-forget — orphan AudioContext | dualsense | Note-2 SCOPE | PoC:42 | ❌ | |
| S14 | Per-frame `new Map()` ~800 entries — memory pressure | dualsense | Note-2 SCOPE | AGENTS.md | ❌ | |
| S15 | Tidak ada user-facing mic error — silent catch | dualsense | Note-2 SCOPE | PoC:42 | ❌ | |
| S16 | Siluet oval selalu putih — tidak berubah per state | dualsense | Note-2 SCOPE | PoC:82 | ❌ | |
| S17 | `f_min` = 100 Hz terlalu rendah untuk anak 7-9 tahun | dualsense | Note-2 SCOPE | Implisit | ❌ | |
| S19 | VocaTone mic error messages dead code — `.catch()` buang error object | vocatone | Note-2 SCOPE | PoC:42 | ❌ | |
| S20 | `restingMouthWidth` kalibrasi asumsi frame pertama adalah resting | dualsense | Note-2 SCOPE | PoC:69 | ❌ | |
| S22 | `outOfThresholdSince` tidak direset saat keluar MIC_OPEN | dualsense | Note-2 SCOPE | PoC:69-70 | ❌ | |
| S25 | VocaTone butuh kamera + FaceMesh meskipun spek audio-only | vocatone | Note-2 SCOPE | PoC:30-48 | ❌ | |
| S28 | VocaTone flash feedback static tint, bukan animasi "Berkedip" | vocatone | Note-2 SCOPE | PoC:79 | ❌ | |
| S29 | `closeAudioStream()` tanpa `await` — resource leak risk | dualsense | Note-2 SCOPE | PoC:42 | ❌ | |
| S31 | `isF0*` flags stale setelah fallback | dualsense | Note-2 SCOPE | PoC:70, 79 | ❌ | |
| S33 | IDLE→CAMERA_ACTIVE via `onFaceLandmarks()` bypass session init | dualsense | Note-2 SCOPE | PoC:26 | ❌ | |
| S34 | Kedua branch `MIN_PITCH_HZ` hardcoded 50 Hz, tidak pakai `f_min` | kedua | Note-2 SCOPE | AGENTS.md | ❌ | |
| S36 | `accuracyDisplay` teks "SHRILL"/"STABLE" melampaui binary feedback PoC | dualsense | Note-2 SCOPE | PoC:79, 16 | ❌ | |
| S37 | `vowel-indicator` DOM overlay (huruf A/I 72pt) tidak ada dalam PoC — scope creep | dualsense | Note-2 SCOPE | PoC:78-82 | ❌ | |
| S38 | `initAudioStream()` tidak cleanup AudioContext saat `getUserMedia` gagal | dualsense | Note-2 SCOPE | PoC:42 | ❌ | |
| S39 | `openAudioGate()` tidak memiliki re-entry guard untuk async `initAudioStream()` | dualsense | Note-2 SCOPE | PoC:42 | ❌ | |
| S41 | `lastFaceTime` tidak direset di `stopSession()` — false positive face-gone | dualsense | Note-2 SCOPE | PoC:79, 82 | ❌ | |
| S42 | `errorHideTimer` tidak dibersihkan di `stopSession()` — callback stale | dualsense | Note-2 SCOPE | PoC:79 | ❌ | |
| S43 | `startSession()` tidak memiliki guard re-entry — double session | dualsense | Note-2 SCOPE | PoC:26 | ❌ | |
| S44 | Canvas sizing tidak responsif terhadap resize/orientation change | dualsense | Note-2 SCOPE | PoC:82 | ❌ | |

---

## 🟢 Prioritas Ringan

| # | Item | Affected Branch | Sumber | Blueprint / PoC Line | Refactor | Catatan |
|---|------|----------------|--------|---------------------|----------|---------|
| T06 | `computeRMS()` private → public | dualsense | Note-1 TECH | TECH-03:55 | ❌ | |
| T07 | Tambah `getPitchHz()` | dualsense | Note-1 TECH | TECH-03:99 | ❌ | |
| T10 | Hapus `refineLandmarks: true` (~400KB) | kedua | Note-1 TECH | TECH-04 (implisit) | ❌ | |
| T15 | Memory limit <150MB — tidak ada monitoring (wajar PoC) | kedua | Note-1 TECH | TECH-04:54 | ❌ | |
| T16 | AudioContext tidak connect ke Destination — melanggar blueprint | kedua | Note-1 TECH | TECH-03:24 | ❌ | |
| T24 | DualSense `computeRMS()` tanpa guard division-by-zero | dualsense | Note-1 TECH | TECH-03:55 | ❌ | |
| T25 | VocaTone `f_max` dual source of truth — constants.js & game.js | vocatone | Note-1 TECH | TECH-02:40-41 | ❌ | |
| G06 | VocaTone stability timer 0.5s — blueprint min 1s | vocatone | Note-1 GAME | GAME-01:56-58 | ❌ | |
| G07 | Siluet oval — garis putus-putus tidak diimplementasikan | kedua | Note-1 GAME | VISUAL-02:14 | ❌ | |
| G11 | Missing Mascot with Expressions (wajar PoC) | kedua | Note-1 GAME | GAME-03:40-43 | ❌ | |
| G12 | Dynamic Obstacle proportional scaling (wajar PoC) | kedua | Note-1 GAME | GAME-03:43 | ❌ | |
| G13 | VocaTone balloon color — dark blue (#0D47A1) bukan bright/light blue | vocatone | Note-1 GAME | UX-02:81 | ❌ | |
| G14 | VocaTone balloon movement — constant velocity bukan smooth acceleration | vocatone | Note-1 GAME | UX-02:82 | ❌ | |
| U01 | Font vokal 72pt di vocatone | vocatone | Note-1 UX | UX-02:63 | ❌ | |
| U02 | Error handling mic denied di vocatone | vocatone | Note-1 UX | UX-03:50 | ❌ | |
| U04 | Halaman pemilihan modul | kedua | Note-1 UX | UX-04:40-44 | ❌ | |
| U05 | No face → silhouette guide di vocatone | vocatone | Note-1 UX | UX-03:51 | ❌ | |
| U06 | Haptic feedback | kedua | Note-1 UX | UX-02:39 | ❌ | |
| U08 | Siluet — Out of Bounds state dengan shake animation | dualsense | Note-1 UX | VISUAL-02:28 | ❌ | |
| U10 | Flash success — opacity 30% bukan 25%, transisi 0→30→0 | dualsense | Note-1 UX | UX-02:38 | ❌ | |
| U11 | Scaling 1.2x objek game saat fonasi benar tidak ada | vocatone | Note-1 UX | UX-02:40 | ❌ | |
| U12 | Button 3-state styling — pressed 10% darker, disabled 40%+greyscale | kedua | Note-1 UX | VISUAL-01:47-49 | ❌ | |
| U13 | Mic denied — tidak ada ilustrasi besar, hanya teks | dualsense | Note-1 UX | UX-03:50 | ❌ | |
| U14 | Camera vs mic denied — tidak bisa dibedakan, pesan generik | kedua | Note-1 UX | UX-03:50 | ❌ | |
| U15 | Icon-based navigation — masih teks (wajar PoC) | kedua | Note-1 UX | UX-02:51-53 | ❌ | |
| U16 | Halaman history sesi latihan tidak ada (wajar PoC) | kedua | Note-1 UX | UX-04:18 | ❌ | |
| U17 | Splash screen tidak ada (wajar PoC) | kedua | Note-1 UX | UX-04:16 | ❌ | |
| U18 | Siluet — 48dp padding dari tepi layar tidak di-enforce | dualsense | Note-1 UX | VISUAL-02:36-38 | ❌ | |
| U19 | Siluet — CSS stroke transition 0.3s tidak bisa di Canvas | dualsense | Note-1 UX | VISUAL-02:56 | ❌ | |
| U20 | Tidak ada instruksi "Ayo Mulai" saat no face | kedua | Note-1 UX | GAME-03:19 | ❌ | |
| U21 | Camera frame border hijau untuk face detection tidak ada | kedua | Note-1 UX | UX-03:30 | ❌ | |
| U22 | Margin layar 16dp tidak di-enforce | kedua | Note-1 UX | VISUAL-01:58 | ❌ | |
| U23 | Objek VocaTone tidak membesar saat naik | vocatone | Note-1 UX | GAME-01:78 | ❌ | |
| U24 | DualSense flash-error/warning/idle opacity < 30% | dualsense | Note-1 UX | UX-02:38 | ❌ | |
| U25 | VocaTone tidak ada siluet kalibrasi saat no face | vocatone | Note-1 UX | VISUAL-02:14,24-26 | ❌ | |
| U26 | Tombol kembali (back button) tidak ada | kedua | Note-1 UX | UX-04:27 | ❌ | |
| U27 | Jarak antar komponen `gap-3` (12px) melanggar minimum 16dp | kedua | Note-1 UX | UX-02:49 | ❌ | |
| U29 | Missing animated large checkmark icon untuk success state | kedua | Note-1 UX | UX-02:16 | ❌ | |
| U30 | Missing Orbiting Pulse animation di sekitar ikon sensor | kedua | Note-1 UX | UX-02:18 | ❌ | |
| U31 | Missing pulsing red arrow indicator saat wajah keluar | kedua | Note-1 UX | UX-02:19 | ❌ | |
| U32 | Missing background layers & HUD SVG assets (wajar PoC) | kedua | Note-1 UX | VISUAL-03:34-66 | ❌ | |
| C04 | Vite + package.json basicSsl — putuskan perlu/tidak | dualsense | Note-1 CROSS | | ❌ | |
| C05 | AGENTS.md syncing — ambil versi dualsense sebagai baseline | — | Note-1 CROSS | | ❌ | |
| C18 | Dualsense pre-grant audio permission vs vocatone lazy init | dualsense | Note-1 CROSS | | ❌ | |
| C19 | Error screen CSS transition duration: 700ms vs 500ms | kedua | Note-1 CROSS | | ❌ | |
| C21 | Hardcoded "A" di `#vowel-indicator` span index.html | kedua | Note-1 CROSS | UX-02:63 | ❌ | |
| C22 | Camera feed mirror `scaleX(-1)` hanya di dualsense, vocatone tidak mirror | kedua | Note-1 CROSS | | ❌ | |
| S03 | VocaTone objek hover tidak di jalur tengah canvas saat f₀ stabil | vocatone | Note-2 SCOPE | PoC:46 | ❌ | |
| S18 | Flash opacity < 30% — semua kelas di bawah blueprint | dualsense | Note-2 SCOPE | PoC:79 | ❌ | |
| S23 | Konstanta `SPREAD_TRIGGER`/`SPREAD_SUSTAIN` di dalam hot-path callback | dualsense | Note-2 SCOPE | AGENTS.md | ❌ | |
| S24 | Silhouette RAF loop 60Hz terlepas dari FaceMesh 15FPS — boros CPU | dualsense | Note-2 SCOPE | PoC:82 | ❌ | |
| S26 | Tidak ada `onEnter(LAR_CHECK)` — tidak ada inisialisasi state gate | dualsense | Note-2 SCOPE | PoC:26, 68-69 | ❌ | |

---

## Per Kategori

### TECH — Audio, Camera, Data Architecture

| # | Item | Prioritas | Branch | Refactor | Blueprint | Catatan |
|---|------|-----------|--------|----------|-----------|---------|
| T01 | Euclidean 3D → 2D | 🔴 | dualsense | ❌ | TECH-01:36 | |
| T02 | Vokal A — threshold tunggal → `lar_threshold.high` | 🔴 | vocatone | ❌ | TECH-01:46 | |
| T03 | Vokal I — pakai `LAR ≤ low`, bukan spread ratio | 🔴 | dualsense | ❌ | TECH-01:47, GAME-02:78 | |
| T17 | `triggerFallback()` → CAMERA_ACTIVE, bukan IDLE | 🔴 | dualsense | ❌ | TECH-01:65,75 | |
| T04 | IndexedDB profile loading di dualsense | 🟡 | dualsense | ❌ | TECH-02:36-41 | |
| T05 | `closeAudioStream()` sync → async | 🟡 | dualsense | ❌ | TECH-03:25 | |
| T08 | FPS 15 → 20 | 🟡 | dualsense | ❌ | TECH-04:28 | |
| T09 | Octave correction di vocatone | 🟡 | vocatone | ❌ | TECH-03:42 | |
| T11 | Normalisasi sample rate audio 44.1/48 kHz | 🟡 | kedua | ❌ | TECH-03:16 | |
| T12 | Dispose FaceMesh instance saat stop() | 🟡 | kedua | ❌ | TECH-04:41-43 | |
| T13 | Bersihkan `videoElement.srcObject` saat stop() | 🟡 | kedua | ❌ | TECH-04:41-43 | |
| T14 | MediaPipe model caching — .binarypb/.data di-precache | 🟡 | kedua | ❌ | TECH-02:22-25 | |
| T18 | `autocorrelationPitch()` — ganti Map dg Float64Array | 🟡 | dualsense | ❌ | TECH-03:27, TECH-04:54 | |
| T19 | Camera fallback 480p→360p cleanup stream gagal | 🟡 | dualsense | ❌ | TECH-04:14-16 | |
| T20 | `initAudioStream()` — tambah try/catch getUserMedia | 🟡 | dualsense | ❌ | TECH-03:14-16 | |
| T21 | `lar_threshold` schema mismatch IndexedDB | 🟡 | vocatone | ❌ | TECH-02:36-41 | |
| T22 | `initAudioStream()` — tambah `audioContext.resume()` | 🟡 | dualsense | ❌ | TECH-03:15-16 | |
| T23 | `stopSession()` — reset semua state variables | 🟡 | dualsense | ❌ | TECH-04:41-43 | |
| T26 | IndexedDB pipeline dead code — `saveProfile()` | 🟡 | kedua | ❌ | TECH-02:36-41 | |
| T27 | Baca `f_min`/`f_max` dari IndexedDB profile | 🟡 | kedua | ❌ | TECH-02:40 | |
| T28 | Stale-While-Revalidate untuk game components | 🟡 | kedua | ❌ | TECH-02:20 | |
| T29 | Race condition `openAudioGate()` — tambah guard | 🟡 | dualsense | ❌ | TECH-03:14-16 | |
| T30 | Sensor disconnected — penanganan khusus | 🟡 | kedua | ❌ | TECH-01:77 | |
| T31 | Camera start error — user-facing feedback di vocatone | 🟡 | vocatone | ❌ | TECH-04, UX-03:50 | |
| T32 | Face loss — tutup microphone saat MIC_OPEN | 🟡 | dualsense | ❌ | TECH-01:74 | |
| T33 | Mic denied — user-facing error di dualsense | 🟡 | dualsense | ❌ | TECH-03:14-16, UX-03:50 | |
| T06 | `computeRMS()` private → public | 🟢 | dualsense | ❌ | TECH-03:55 | |
| T07 | Tambah `getPitchHz()` | 🟢 | dualsense | ❌ | TECH-03:99 | |
| T10 | Hapus `refineLandmarks: true` | 🟢 | kedua | ❌ | TECH-04 (implisit) | |
| T15 | Memory limit <150MB (wajar PoC) | 🟢 | kedua | ❌ | TECH-04:54 | |
| T16 | AudioContext tidak connect ke Destination | 🟢 | kedua | ❌ | TECH-03:24 | |
| T24 | `computeRMS()` — tambah guard division-by-zero | 🟢 | dualsense | ❌ | TECH-03:55 | |
| T25 | `f_max` — single source of truth dari constants.js | 🟢 | vocatone | ❌ | TECH-02:40-41 | |

### GAME — VocaTone & Dual-Sense Game Design

| # | Item | Prioritas | Branch | Refactor | Blueprint | Catatan |
|---|------|-----------|--------|----------|-----------|---------|
| G01 | Hapus inisialisasi kamera di vocatone (audio-only) | 🟡 | vocatone | ❌ | GAME-01:79 | |
| G02 | Low amplitude → #F8FAFC, bukan merah | 🟡 | dualsense | ❌ | GAME-02:67, GAME-03:20 | |
| G03 | No face → #F8FAFC, bukan merah | 🟡 | dualsense | ❌ | GAME-03:19 | |
| G04 | Wrong mouth → siluet merah | 🟡 | dualsense | ❌ | GAME-02:87 | |
| G05 | Face loss — pause + recalibration mode | 🟡 | dualsense | ❌ | UX-03:51 | |
| G08 | `_drawBackground()` fall/rise → #F8FAFC | 🟡 | vocatone | ❌ | GAME-01:19,22,62 | |
| G09 | Kalibrasi RMS threshold di awal sesi | 🟡 | kedua | ❌ | GAME-01:79 | |
| G10 | Render Character & Gate di DualSense | 🟡 | dualsense | ❌ | GAME-02:16-17 | |
| G06 | Stability timer 0.5s → min 1s | 🟢 | vocatone | ❌ | GAME-01:56-58 | |
| G07 | Siluet oval — garis putus-putus | 🟢 | kedua | ❌ | VISUAL-02:14 | |
| G11 | Mascot with Expressions (wajar PoC) | 🟢 | kedua | ❌ | GAME-03:40-43 | |
| G12 | Dynamic Obstacle scaling (wajar PoC) | 🟢 | kedua | ❌ | GAME-03:43 | |
| G13 | VocaTone balloon color → bright blue | 🟢 | vocatone | ❌ | UX-02:81 | |
| G14 | VocaTone balloon movement → smooth acceleration | 🟢 | vocatone | ❌ | UX-02:82 | |

### UX / VISUAL — User Interface & Visual Design

| # | Item | Prioritas | Branch | Refactor | Blueprint | Catatan |
|---|------|-----------|--------|----------|-----------|---------|
| U03 | Warna siluet oval: Hijau/Merah per state | 🟡 | dualsense | ❌ | VISUAL-02:27-28 | |
| U07 | Siluet Searching state #F8FAFC + pulsing 20-50% | 🟡 | dualsense | ❌ | VISUAL-02:26 | |
| U09 | `drawSilhouette()` terima validation state | 🟡 | dualsense | ❌ | VISUAL-02:24-28 | |
| U28 | Real-time LAR indicator animation (crosshair) | 🟡 | kedua | ❌ | UX-02:76-78 | |
| U01 | Font vokal 72pt di vocatone | 🟢 | vocatone | ❌ | UX-02:63 | |
| U02 | Error handling mic denied di vocatone | 🟢 | vocatone | ❌ | UX-03:50 | |
| U04 | Halaman pemilihan modul | 🟢 | kedua | ❌ | UX-04:40-44 | |
| U05 | No face → silhouette guide di vocatone | 🟢 | vocatone | ❌ | UX-03:51 | |
| U06 | Haptic feedback | 🟢 | kedua | ❌ | UX-02:39 | |
| U08 | Siluet Out of Bounds — shake animation | 🟢 | dualsense | ❌ | VISUAL-02:28 | |
| U10 | Flash success opacity 30% + transisi 0→30→0 | 🟢 | dualsense | ❌ | UX-02:38 | |
| U11 | Scaling 1.2x objek game saat fonasi benar | 🟢 | vocatone | ❌ | UX-02:40 | |
| U12 | Button 3-state styling | 🟢 | kedua | ❌ | VISUAL-01:47-49 | |
| U13 | Mic denied — ilustrasi besar | 🟢 | dualsense | ❌ | UX-03:50 | |
| U14 | Camera vs mic denied — pesan dibedakan | 🟢 | kedua | ❌ | UX-03:50 | |
| U15 | Icon-based navigation (wajar PoC) | 🟢 | kedua | ❌ | UX-02:51-53 | |
| U16 | Halaman history sesi (wajar PoC) | 🟢 | kedua | ❌ | UX-04:18 | |
| U17 | Splash screen (wajar PoC) | 🟢 | kedua | ❌ | UX-04:16 | |
| U18 | Siluet — 48dp padding dari tepi layar | 🟢 | dualsense | ❌ | VISUAL-02:36-38 | |
| U19 | CSS stroke transition 0.3s di Canvas | 🟢 | dualsense | ❌ | VISUAL-02:56 | |
| U20 | Instruksi "Ayo Mulai" saat no face | 🟢 | kedua | ❌ | GAME-03:19 | |
| U21 | Camera frame border hijau untuk face detection | 🟢 | kedua | ❌ | UX-03:30 | |
| U22 | Margin layar 16dp | 🟢 | kedua | ❌ | VISUAL-01:58 | |
| U23 | Objek VocaTone membesar saat naik | 🟢 | vocatone | ❌ | GAME-01:78 | |
| U24 | Flash-error/warning/idle opacity ≥ 30% | 🟢 | dualsense | ❌ | UX-02:38 | |
| U25 | VocaTone — siluet kalibrasi saat no face | 🟢 | vocatone | ❌ | VISUAL-02:14,24-26 | |
| U26 | Tombol kembali (back button) | 🟢 | kedua | ❌ | UX-04:27 | |
| U27 | Jarak antar komponen ≥ 16dp | 🟢 | kedua | ❌ | UX-02:49 | |
| U29 | Animated large checkmark icon | 🟢 | kedua | ❌ | UX-02:16 | |
| U30 | Orbiting Pulse animation | 🟢 | kedua | ❌ | UX-02:18 | |
| U31 | Pulsing red arrow indicator | 🟢 | kedua | ❌ | UX-02:19 | |
| U32 | Background layers & HUD SVG (wajar PoC) | 🟢 | kedua | ❌ | VISUAL-03:34-66 | |

### CROSS — Inkonsistensi Antar Branch

| # | Item | Prioritas | Refactor | Keterangan | Catatan |
|---|------|-----------|----------|-----------|---------|
| C01 | `gatekeeper` export pattern (default vs named) — standarisasi | 🔴 | ❌ | Pilih satu pola untuk seluruh codebase | |
| C02 | `initCamera()` API signature (object vs positional) — standarisasi | 🔴 | ❌ | Standarisasi ke objek callbacks | |
| C23 | `f_min` value inkonsisten 150Hz vs 100Hz — sinkronkan | 🔴 | ❌ | constants.js jadi single source of truth | |
| C24 | GateKeeper state machine arsitektur fundamental — unifikasi | 🔴 | ❌ | Ambil vocatone sebagai baseline | |
| C03 | Snake_case vs camelCase — align dg AGENTS.md | 🟡 | ❌ | Dualsense banyak camelCase | |
| C20 | `triggerFallback()` cooldown 1s — standarisasi | 🟡 | ❌ | Putuskan perlu/tidak untuk PoC | |
| C04 | Vite + package.json basicSsl — putuskan perlu/tidak | 🟢 | ❌ | Dualsense punya, vocatone tidak | |
| C05 | AGENTS.md syncing — ambil versi dualsense | 🟢 | ❌ | Baseline: versi dualsense | |
| C18 | Mic permission: preGrant vs lazy init | 🟢 | ❌ | Standarisasi ke lazy (vocatone) | |
| C19 | Error screen CSS transition 700ms vs 500ms | 🟢 | ❌ | Standarisasi (kedua nilai valid) | |
| C21 | Hardcoded "A" di `#vowel-indicator` — ganti empty string | 🟢 | ❌ | UX-02:63 | |
| C22 | Camera feed mirror — terapkan di kedua branch | 🟢 | ❌ | Front camera harus mirror | |

### SCOPE — Kepatuhan 50% PoC Boundary

| # | Item | Prioritas | Branch | Refactor | PoC Line | Catatan |
|---|------|-----------|--------|----------|----------|---------|
| S01 | `preGrantAudioPermission()` — mic idle by default | 🔴 | dualsense | ❌ | 26 | |
| S04 | Bypass LAR_CHECK untuk vokal /i/ | 🔴 | dualsense | ❌ | 26, 68-69 | |
| S07 | `audio.js` tidak resume AudioContext | 🔴 | dualsense | ❌ | 42 | |
| S08 | Euclidean 3D bukan 2D | 🔴 | dualsense | ❌ | 58-60 | |
| S09 | Vokal /i/ pakai mouth spread ratio | 🔴 | dualsense | ❌ | 69 | |
| S10 | `triggerFallback()` reset ke IDLE | 🔴 | dualsense | ❌ | 70 | |
| S11 | Face loss saat MIC_OPEN — mic tidak ditutup | 🔴 | dualsense | ❌ | 70 | |
| S12 | /i/ fallback monitor pakai MouthWidth | 🔴 | dualsense | ❌ | 69-70 | |
| S21 | LAR_CHECK gagal → IDLE (full reset) | 🔴 | dualsense | ❌ | 26, 70 | |
| S27 | Tidak ada `onNoFace` callback — polling 500ms | 🔴 | dualsense | ❌ | 70 | |
| S30 | `cameraController.start()` fire-and-forget | 🔴 | dualsense | ❌ | 42 | |
| S32 | `transitionTo()` silent return — throw Error | 🔴 | dualsense | ❌ | 26 | |
| S35 | VocaTone tidak import constants.js — threshold 0.3 ≠ 0.5 | 🔴 | vocatone | ❌ | 68, AGENTS.md | |
| S40 | Flash merah saat MIC_OPEN tanpa suara | 🔴 | dualsense | ❌ | 81 | |
| S45 | Flash merah saat tidak ada suara di vocatone | 🔴 | vocatone | ❌ | 81 | |
| S02 | Siluet oval tidak statis (posisi + pulsing) | 🟡 | dualsense | ❌ | 82 | |
| S05 | SESSION_ACTIVE dead state — tidak pernah ditransisikan | 🟡 | dualsense | ❌ | 51-71 | |
| S06 | Flash feedback via DOM overlay, bukan canvas | 🟡 | dualsense | ❌ | 79 | |
| S13 | `openAudioGate()` fire-and-forget — orphan AudioContext | 🟡 | dualsense | ❌ | 42 | |
| S14 | Per-frame `new Map()` ~800 entries — memory pressure | 🟡 | dualsense | ❌ | AGENTS.md | |
| S15 | Tidak ada user-facing mic error | 🟡 | dualsense | ❌ | 42 | |
| S16 | Siluet oval selalu putih — tidak berubah per state | 🟡 | dualsense | ❌ | 82 | |
| S17 | `f_min` = 100 Hz terlalu rendah untuk anak 7-9 tahun | 🟡 | dualsense | ❌ | Implisit | |
| S19 | VocaTone mic error dead code — `.catch()` buang error | 🟡 | vocatone | ❌ | 42 | |
| S20 | `restingMouthWidth` kalibrasi asumsi frame pertama | 🟡 | dualsense | ❌ | 69 | |
| S22 | `outOfThresholdSince` tidak direset saat keluar MIC_OPEN | 🟡 | dualsense | ❌ | 69-70 | |
| S25 | VocaTone butuh kamera + FaceMesh padahal audio-only | 🟡 | vocatone | ❌ | 30-48 | |
| S28 | Flash feedback static tint, bukan animasi "Berkedip" | 🟡 | vocatone | ❌ | 79 | |
| S29 | `closeAudioStream()` tanpa `await` | 🟡 | dualsense | ❌ | 42 | |
| S31 | `isF0*` flags stale setelah fallback | 🟡 | dualsense | ❌ | 70, 79 | |
| S33 | IDLE→CAMERA_ACTIVE via `onFaceLandmarks()` bypass session init | 🟡 | dualsense | ❌ | 26 | |
| S34 | `MIN_PITCH_HZ` hardcoded 50 Hz — pakai `f_min` | 🟡 | kedua | ❌ | AGENTS.md | |
| S36 | `accuracyDisplay` teks "SHRILL"/"STABLE" — scope creep | 🟡 | dualsense | ❌ | 79, 16 | |
| S37 | `vowel-indicator` DOM overlay huruf A/I 72pt — scope creep | 🟡 | dualsense | ❌ | 78-82 | |
| S38 | `initAudioStream()` tidak cleanup AudioContext saat mic gagal | 🟡 | dualsense | ❌ | 42 | |
| S39 | `openAudioGate()` tidak memiliki re-entry guard | 🟡 | dualsense | ❌ | 42 | |
| S41 | `lastFaceTime` tidak direset di `stopSession()` | 🟡 | dualsense | ❌ | 79, 82 | |
| S42 | `errorHideTimer` tidak dibersihkan di `stopSession()` | 🟡 | dualsense | ❌ | 79 | |
| S43 | `startSession()` tidak memiliki guard re-entry | 🟡 | dualsense | ❌ | 26 | |
| S44 | Canvas sizing tidak responsif — tambah ResizeObserver | 🟡 | dualsense | ❌ | 82 | |
| S03 | VocaTone objek hover tidak di tengah canvas saat f₀ stabil | 🟢 | vocatone | ❌ | 46 | |
| S18 | Flash opacity < 30% — semua kelas di bawah blueprint | 🟢 | dualsense | ❌ | 79 | |
| S23 | Konstanta `SPREAD_TRIGGER`/`SPREAD_SUSTAIN` di hot-path | 🟢 | dualsense | ❌ | AGENTS.md | |
| S24 | Silhouette RAF loop 60Hz terlepas dari FaceMesh 15FPS | 🟢 | dualsense | ❌ | 82 | |
| S26 | Tidak ada `onEnter(LAR_CHECK)` | 🟢 | dualsense | ❌ | 26, 68-69 | |

---

## Lampiran

### A. Glossary Status Ikon

| Ikon | Arti |
|------|------|
| ✅ | Sesuai / sudah diperbaiki |
| ❌ | Belum diperbaiki |
| 🔄 | Sedang diperbaiki |
| 🔴 Kritis | Melanggar scope boundary — fitur wajib PoC tidak berfungsi |
| 🟡 Sedang | Menyimpang dari spesifikasi, butuh perbaikan |
| 🟢 Ringan | Bisa ditunda, tidak mengganggu fungsionalitas inti |
| ⤻ | Cross-reference ke item lain |
| ➖ | Tidak relevan / wajar PoC |

### B. Change Log

| Tanggal | Versi | Perubahan | Oleh |
|---------|-------|-----------|------|
| 17 Jul 2026 | 1.0 | Initial — konsolidasi 91 temuan Note 1 + 45 temuan Note 2 = 136 item | Agent V-NADA |

---

*Dokumen ini adalah living document. Perbarui status Refactor dan Change Log setiap kali ada perubahan.*
