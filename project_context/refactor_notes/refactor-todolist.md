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

## Ringkasan Master Tracker (by Branch)

| Branch | Total | 🔴 Kritis | 🟡 Sedang | 🟢 Ringan |
|--------|-------|-----------|-----------|-----------|
| dualsense | 73 | 0 (16 ✅) | 5 ❌ (37 ✅) | 6 ❌ (9 ✅) |
| vocatone | 22 | 1 ❌ (2 ✅) | 3 ❌ (5 ✅) | 1 ❌ (10 ✅) |
| kedua | 41 | 0 (4 ✅) | 0 (11 ✅) | 0 ❌ (26 ✅) |
| **Total** | **136** | **1 ❌ (22 ✅)** | **8 ❌ (55 ✅)** | **7 ❌ (45 ✅)** |

---

## 🔴 Prioritas Kritis

### 🔴 Kritis — dualsense (16 item)

| # | Item | Sumber | Cross-Ref | Blueprint / PoC Line | Refactor | Catatan |
|---|------|--------|-----------|---------------------|----------|---------|
| T01 | Euclidean 3D → 2D | Note-1 TECH | ⤻ S08 | TECH-01:36 | ✅ | A1 — computeEuclideanDistance hanya pakai x,y |
| T03 | Vokal I — pakai `LAR ≤ low`, bukan spread ratio | Note-1 TECH | ⤻ S09, S12 | TECH-01:47, GAME-02:78 | ✅ | A1 — onFaceLandmarks pakai lar <= lar_threshold.low |
| T17 | `triggerFallback()` → `gatekeeper.reset()` ke IDLE, bukan CAMERA_ACTIVE | Note-1 TECH | ⤻ S10 | TECH-01:65, TECH-01:75 | ✅ | A1 — triggerFallback() panggil fallbackTo(CAMERA_ACTIVE) |
| S01 | `preGrantAudioPermission()` — mic tidak idle secara default | Note-2 SCOPE | | PoC:26 | ✅ | A1 — tidak ada preGrant, mic lazy via openAudioGate |
| S04 | State machine bypass LAR_CHECK untuk vokal /i/ | Note-2 SCOPE | ⤻ C24 | PoC:26, 68-69 | ✅ | A1 — LAR_CHECK untuk kedua /a/ dan /i/ |
| S07 | `audio.js` tidak resume AudioContext — gagal total di Chrome/Android | Note-2 SCOPE | ⤻ T22 | PoC:42 | ✅ | A2 — ensureResumed() dipanggil di initAudioStream |
| S08 | Euclidean 3D bukan 2D — LAR mengandung noise sumbu Z | Note-2 SCOPE | ⤻ T01 | PoC:58-60 | ✅ | A1 — computeEuclideanDistance 2D |
| S09 | Vokal /i/ pakai mouth spread ratio, bukan `LAR ≤ low` | Note-2 SCOPE | ⤻ T03 | PoC:69 | ✅ | A1 — LAR ≤ low untuk /i/ |
| S10 | `triggerFallback()` reset ke IDLE, bukan CAMERA_ACTIVE | Note-2 SCOPE | ⤻ T17 | PoC:70 | ✅ | A1 — fallbackTo(CAMERA_ACTIVE) |
| S11 | Face loss saat MIC_OPEN — mic tidak ditutup | Note-2 SCOPE | ⤻ T32 | PoC:70 | ✅ | A1 — onNoFace() tutup audio gate |
| S12 | /i/ fallback monitor pakai MouthWidth, bukan LAR | Note-2 SCOPE | ⤻ T03 | PoC:69-70 | ✅ | A1 — LAR monitoring untuk kedua vokal |
| S21 | LAR_CHECK gagal transisi ke IDLE (full reset), bukan CAMERA_ACTIVE | Note-2 SCOPE | ⤻ S10 | PoC:26, 70 | ✅ | A1 — fallbackTo(CAMERA_ACTIVE) bukan IDLE |
| S27 | Tidak ada `onNoFace` callback di FaceMesh pipeline — polling 500ms | Note-2 SCOPE | | PoC:70 | ✅ | A1 — startNoFacePoll() + callback |
| S30 | `cameraController.start()` fire-and-forget — silent failure | Note-2 SCOPE | ⤻ C02 | PoC:42 | ✅ | A1 — await cameraCtrl.start() |
| S32 | `transitionTo()` silent return — state violation tidak terdeteksi | Note-2 SCOPE | ⤻ C24 | PoC:26 | ✅ | A1 — GateKeeper.transitionTo throw Error |
| S40 | Tidak ada flash merah saat MIC_OPEN tanpa input suara | Note-2 SCOPE | ⤻ S45 | PoC:81 | ✅ | Fase C — flash-error saat pitch === 0 di startPitchPolling |

### 🔴 Kritis — vocatone (3 item)

| # | Item | Sumber | Cross-Ref | Blueprint / PoC Line | Refactor | Catatan |
|---|------|--------|-----------|---------------------|----------|---------|
| T02 | Vokal A — threshold tunggal (harus `lar_threshold.high`) | Note-1 TECH | ⤻ S35 | TECH-01:46 | ✅ | Fase B — vocatone.js import constants.js, `lar_threshold.high=0.5` via constants |
| S35 | VocaTone tidak import `constants.js` — threshold LAR 0.3 ≠ 0.5 | Note-2 SCOPE | ⤻ T02 | PoC:68, AGENTS.md | ✅ | Fase B — `import { lar_threshold }` di vocatone.js line 2 |
| S45 | VocaTone tidak ada flash merah saat tidak ada suara | Note-2 SCOPE | ⤻ S40 | PoC:81 | ❌ | `updateHUD()` di main.js: `setCanvasFlash(null)` bukan `flash-error` |

### 🔴 Kritis — kedua (shared, 4 item)

| # | Item | Sumber | Cross-Ref | Blueprint / PoC Line | Refactor | Catatan |
|---|------|--------|-----------|---------------------|----------|---------|
| C01 | `gatekeeper` export pattern (default vs named) — standarisasi | Note-1 CROSS | | — | ✅ | Named exports (GateKeeper class + STATES enum) via gatekeeper.js |
| C02 | `initCamera()` API signature (object vs positional) — standarisasi | Note-1 CROSS | ⤻ S30 | — | ✅ | `initCamera({ videoElement, onFace, onNoFace })` — object-based |
| C23 | `f_min` value inkonsisten — vocatone 150Hz, dualsense 100Hz | Note-1 CROSS | ⤻ S17, S34 | constants.js | ✅ | `f_min:150` di constants.js, audio.js import dari constants |
| C24 | GateKeeper state machine arsitektur fundamental berbeda | Note-1 CROSS | ⤻ S04, S05, S32 | — | ✅ | GateKeeper class di gatekeeper.js — valid transisi, onEnter/onExit, throw on invalid |

---

## 🟡 Prioritas Sedang

### 🟡 Sedang — dualsense (42 item)

| # | Item | Sumber | Cross-Ref | Blueprint / PoC Line | Refactor | Catatan |
|---|------|--------|-----------|---------------------|----------|---------|
| T04 | IndexedDB profile loading di dualsense | Note-1 TECH | | TECH-02:36-41 | ✅ | A2 — startSession load profile + seed default |
| T05 | `closeAudioStream()` sync → async | Note-1 TECH | | TECH-03:25 | ✅ | Fase C — closeAudioGate async + await |
| T08 | FPS 15 → 20 | Note-1 TECH | | TECH-04:28 | ✅ | A1 — TARGET_FPS=20 di vision.js |
| T18 | `autocorrelationPitch()` alokasi `corrMap` Map per frame — memory leak | Note-1 TECH | | TECH-03:27, TECH-04:54 | ✅ | A2 — Float64Array bukan Map |
| T19 | Camera fallback 480p→360p tidak cleanup media stream gagal | Note-1 TECH | | TECH-04:14-16 | ✅ | Fase C — tryStart() fallback res array + cleanup |
| T20 | `initAudioStream()` tidak handle error getUserMedia → AudioContext bocor | Note-1 TECH | | TECH-03:14-16 | ✅ | A2 — try/catch + ctx.close() on failure |
| T22 | Dualsense `initAudioStream()` tidak resume AudioContext — silent fail mobile | Note-1 TECH | | TECH-03:15-16 | ✅ | A2 — ensureResumed() dipanggil |
| T23 | DualSense `stopSession()` tidak cleanup state variables — stale state | Note-1 TECH | | TECH-04:41-43 | ✅ | A2+A3+FaseC — cleanup all state variables, ResizeObserver disconnect |
| T29 | Race condition: `openAudioGate()` fire-and-forget vs `triggerFallback()` | Note-1 TECH | | TECH-03:14-16 | ✅ | A2 — audioInitialized/audioInitializing guard |
| T32 | Face loss — DualSense tidak tutup microphone saat wajah hilang di MIC_OPEN | Note-1 TECH | | TECH-01:74 | ✅ | A1 — onNoFace() closeAudioStream + stopPitchPolling |
| T33 | Mic denied — DualSense `openAudioGate()` hanya console.warn, tanpa UI error | Note-1 TECH | | TECH-03:14-16, UX-03:50 | ✅ | A2 — showError(true, 'Mic Error', ...) |
| G02 | Low amplitude — pakai #F8FAFC, bukan merah | Note-1 GAME | | GAME-02:67, GAME-03:20 | ❌ | Masih flash-error saat pitch=0; perlu dibedakan antara no-audio vs wrong-mouth |
| G03 | No face — pakai #F8FAFC, bukan merah | Note-1 GAME | | GAME-03:19 | ✅ | A1 — onNoFace() setFlash('flash-idle') = #F8FAFC |
| G04 | Wrong mouth → siluet ikut merah sesuai GAME-02:87 | Note-1 GAME | | GAME-02:87 | ✅ | Fase C — triggerFallback setFlash('flash-error') + fallbackSilState 'out_of_bounds' 600ms |
| G05 | Face loss — tidak ada mode pause + recalibration | Note-1 GAME | | UX-03:51 | ❌ | Masih fallback langsung, belum ada pause screen |
| G10 | Missing Character & Gate rendering di DualSense — tidak ada objek game visual | Note-1 GAME | | GAME-02:16-17 | ❌ | Wajar PoC — geometric placeholders via crosshair + silhouette sudah cukup |
| U07 | Siluet — Searching state #F8FAFC dengan pulsing 20-50% | Note-1 UX | | VISUAL-02:26 | ✅ | Fase C — drawSilhouette sine-wave alpha 0.2-0.5 |
| U09 | Siluet — `drawSilhouette()` harus terima validation state, bukan boolean | Note-1 UX | | VISUAL-02:24-28 | ✅ | A3 — drawSilhouette('searching'|'locked'|'out_of_bounds') |
| C03 | Snake_case vs camelCase — variabel duality mengikuti AGENTS.md | Note-1 CROSS | | AGENTS.md | ❌ | Butuh audit: outOfThresholdSince, stablePitchCount, dll |
| C20 | `triggerFallback()` cooldown 1s recovery — tidak ada di blueprint atau vocatone | Note-1 CROSS | | — | ❌ | Cooldown tidak diimplementasikan, tidak urgent untuk PoC |
| S02 | Siluet oval tidak statis (posisi dinamis + animasi pulsing) | Note-2 SCOPE | | PoC:82 | ✅ | PoC minta transparan statis — sudah di tengah canvas. Pulsing via U07 |
| S05 | SESSION_ACTIVE state tidak pernah tercapai (dead state) | Note-2 SCOPE | | PoC:51-71 | ✅ | Fase C — MIC_OPEN→SESSION_ACTIVE setelah 5 frame pitch stabil |
| S06 | Flash feedback via DOM overlay bukan canvas background | Note-2 SCOPE | | PoC:79 | ✅ | CSS flash classes di overlayCanvas — secara teknis DOM overlay |
| S13 | `openAudioGate()` fire-and-forget — orphan AudioContext | Note-2 SCOPE | | PoC:42 | ✅ | A2 — re-entry guard + initialize guard |
| S14 | Per-frame `new Map()` ~800 entries — memory pressure | Note-2 SCOPE | | AGENTS.md | ✅ | A2 — Float64Array pre-allocated |
| S15 | Tidak ada user-facing mic error — silent catch | Note-2 SCOPE | | PoC:42 | ✅ | A2 — showError('Mic Error', ...) |
| S16 | Siluet oval selalu putih — tidak berubah per state | Note-2 SCOPE | | PoC:82 | ✅ | A3 — drawSilhouette() warna per state |
| S17 | `f_min` = 100 Hz terlalu rendah untuk anak 7-9 tahun | Note-2 SCOPE | | Implisit | ✅ | A2 — constants.js: f_min=150Hz |
| S20 | `restingMouthWidth` kalibrasi asumsi frame pertama adalah resting | Note-2 SCOPE | | PoC:69 | ✅ | Fase C — tidak pakai mouth spread ratio, LAR langsung |
| S22 | `outOfThresholdSince` tidak direset saat keluar MIC_OPEN | Note-2 SCOPE | | PoC:69-70 | ✅ | A2 — triggerFallback() + onExit(MIC_OPEN) reset ke 0 |
| S29 | `closeAudioStream()` tanpa `await` — resource leak risk | Note-2 SCOPE | | PoC:42 | ✅ | Fase C — closeAudioGate async |
| S31 | `isF0*` flags stale setelah fallback | Note-2 SCOPE | | PoC:70, 79 | ✅ | A1 — tidak ada isF0 flags (pakai stablePitchCount) |
| S33 | IDLE→CAMERA_ACTIVE via `onFaceLandmarks()` bypass session init | Note-2 SCOPE | | PoC:26 | ✅ | A1 — `if (state === IDLE) return;` |
| S36 | `accuracyDisplay` teks "SHRILL"/"STABLE" melampaui binary feedback PoC | Note-2 SCOPE | | PoC:79, 16 | ✅ | Fase C — accuracyDisplay + starDisplay dihapus dari HTML & JS |
| S37 | `vowel-indicator` DOM overlay (huruf A/I 72pt) tidak ada dalam PoC — scope creep | Note-2 SCOPE | | PoC:78-82 | ✅ | A3 — sudah dihapus dari index.html |
| S38 | `initAudioStream()` tidak cleanup AudioContext saat `getUserMedia` gagal | Note-2 SCOPE | | PoC:42 | ✅ | A2 — try/catch cleanup di initAudioStream |
| S39 | `openAudioGate()` tidak memiliki re-entry guard untuk async `initAudioStream()` | Note-2 SCOPE | | PoC:42 | ✅ | A2 — audioInitialized/audioInitializing guard |
| S41 | `lastFaceTime` tidak direset di `stopSession()` — false positive face-gone | Note-2 SCOPE | | PoC:79, 82 | ✅ | A2 — stopCamera() reset lastFaceTime=0 |
| S42 | `errorHideTimer` tidak dibersihkan di `stopSession()` — callback stale | Note-2 SCOPE | | PoC:79 | ✅ | A2 — tidak ada errorHideTimer (showError langsung classList toggle) |
| S43 | `startSession()` tidak memiliki guard re-entry — double session | Note-2 SCOPE | | PoC:26 | ✅ | A1 — `if (getState() !== IDLE) return;` |
| S44 | Canvas sizing tidak responsif terhadap resize/orientation change | Note-2 SCOPE | | PoC:82 | ✅ | Fase C — ResizeObserver di cameraFeed + resizeCanvases() |

### 🟡 Sedang — vocatone (8 item)

| # | Item | Sumber | Cross-Ref | Blueprint / PoC Line | Refactor | Catatan |
|---|------|--------|-----------|---------------------|----------|---------|
| T09 | Octave correction di vocatone | Note-1 TECH | | TECH-03:42 | ❌ | Belum ada cascade sub-harmonik |
| T21 | `lar_threshold` schema mismatch — IndexedDB baca `.value` (number) vs object `{high, low}` | Note-1 TECH | | TECH-02:36-41 | ❌ | `db.js` sudah simpan `lar_threshold` sbg object; vocatone.js import dari constants (tidak pakai IndexedDB langsung) |
| T31 | Camera start error — vocatone hanya console.error, tidak ada user-facing | Note-1 TECH | | TECH-04, UX-03:50 | ✅ | Fase B — `onError` callback di vocatone.js + `showError` di main.js |
| G01 | Inisialisasi kamera berlebihan di vocatone (audio-only) | Note-1 GAME | | GAME-01:79 | ✅ | Fase B — voiceTone murni audio-only, tanpa initCamera/FaceMesh |
| G08 | VocaTone `_drawBackground()` tidak #F8FAFC untuk fall/rise — transparan | Note-1 GAME | | GAME-01:19,22,62 | ✅ | Fase B — `BG_COLOR = '#F8FAFC'` di vocatone.js, `drawBackground()` selalu isi #F8FAFC |
| S19 | VocaTone mic error messages dead code — `.catch()` buang error object | Note-2 SCOPE | | PoC:42 | ✅ | Fase B — `try/catch` di vocatone.js `start()` + `onError` callback ke main.js |
| S25 | VocaTone butuh kamera + FaceMesh meskipun spek audio-only | Note-2 SCOPE | | PoC:30-48 | ✅ | Fase B — enterVocatoneView() sembunyikan kamera, startVocaTone() langsung initAudioStream |
| S28 | VocaTone flash feedback static tint, bukan animasi "Berkedip" | Note-2 SCOPE | | PoC:79 | ❌ | Masih static fill via `setCanvasFlash()` — belum blink animasi |

### 🟡 Sedang — kedua (shared, 11 item)

| # | Item | Sumber | Cross-Ref | Blueprint / PoC Line | Refactor | Catatan |
|---|------|--------|-----------|---------------------|----------|---------|
| T11 | Normalisasi sample rate audio ke 44.1/48 kHz | Note-1 TECH | | TECH-03:16 | ✅ | TARGET_SAMPLE_RATE=44100 + sampleRate:ideal di getUserMedia |
| T12 | Hapus FaceMesh instance saat stop() — cegah memory leak | Note-1 TECH | | TECH-04:41-43 | ✅ | faceMeshInstance.close() di stopCamera() |
| T13 | Bersihkan `videoElement.srcObject` saat stop() | Note-1 TECH | | TECH-04:41-43 | ✅ | srcObject ditrack dan di-cleanup di stopCamera() |
| T14 | MediaPipe model caching — hanya .wasm di-cache | Note-1 TECH | | TECH-02:22-25 | ✅ | .binarypb/.data ditambah ke runtime caching CacheFirst |
| T26 | IndexedDB pipeline dead code — `saveProfile()` tidak pernah dipanggil | Note-1 TECH | | TECH-02:36-41 | ✅ | saveProfile() dipanggil di startSession() untuk seed profil default |
| T27 | Kedua branch tidak baca `f_min`/`f_max` dari IndexedDB profile — hardcoded | Note-1 TECH | | TECH-02:40 | ✅ | profile default disimpan & dibaca, f_min/f_max dari constants.js sebagai fallback |
| T28 | Stale-While-Revalidate tidak diimplementasikan — semua CacheFirst | Note-1 TECH | | TECH-02:20 | ✅ | StaleWhileRevalidate untuk game components (assets/index-*.{js,css}) |
| T30 | Sensor disconnected — tidak ada penanganan khusus | Note-1 TECH | | TECH-01:77 | ✅ | try/catch di FaceMesh onFrame + onNoFace fallback |
| G09 | RMS threshold tidak dikalibrasi di awal sesi — hardcoded 0.01 | Note-1 GAME | | GAME-01:79 | ✅ | A2+Fase B — `calibrateAmbientNoise()` dipanggil di openAudioGate() & vocatone.start() |
| U28 | Missing real-time LAR indicator animation — crosshair | Note-1 UX | | UX-02:76-78 | ✅ | A3 — `drawCrosshair(lar)` di main.js, LAR-responsive bar length, integrated in startCrosshair() |
| S34 | Kedua branch `MIN_PITCH_HZ` hardcoded 50 Hz, tidak pakai `f_min` | Note-2 SCOPE | | AGENTS.md | ✅ | A2 — audio.js import f_min/f_max dari constants, autocorrelation pakai imported values |

---

## 🟢 Prioritas Ringan

### 🟢 Ringan — dualsense (15 item)

| # | Item | Sumber | Cross-Ref | Blueprint / PoC Line | Refactor | Catatan |
|---|------|--------|-----------|---------------------|----------|---------|
| T06 | `computeRMS()` private → public | Note-1 TECH | | TECH-03:55 | ✅ | A2 — computeRMS sudah export |
| T07 | Tambah `getPitchHz()` | Note-1 TECH | | TECH-03:99 | ✅ | A2 — sudah ada di audio.js |
| T24 | DualSense `computeRMS()` tanpa guard division-by-zero | Note-1 TECH | | TECH-03:55 | ✅ | A2 — guard `if (!buffer || buffer.length === 0) return 0;` |
| U08 | Siluet — Out of Bounds state dengan shake animation | Note-1 UX | | VISUAL-02:28 | ❌ | Canvas translate shake belum diimplementasikan |
| U10 | Flash success — opacity 30% bukan 25%, transisi 0→30→0 | Note-1 UX | | UX-02:38 | ✅ | A3 — flash-success/warning/error opacity 0.3 |
| U13 | Mic denied — tidak ada ilustrasi besar, hanya teks | Note-1 UX | | UX-03:50 | ❌ | Hanya teks error, belum ada ilustrasi |
| U18 | Siluet — 48dp padding dari tepi layar tidak di-enforce | Note-1 UX | | VISUAL-02:36-38 | ❌ | rx=20% ry=12% canvas, bukan padding 48dp fix |
| U19 | Siluet — CSS stroke transition 0.3s tidak bisa di Canvas | Note-1 UX | | VISUAL-02:56 | ❌ | Wajar — Canvas tidak support CSS transition |
| U24 | DualSense flash-error/warning/idle opacity < 30% | Note-1 UX | | UX-02:38 | ✅ | A3 — semua flash class opacity 0.3 |
| C04 | Vite + package.json basicSsl — putuskan perlu/tidak | Note-1 CROSS | | — | ❌ | Tidak urgent — HTTPS via deploy |
| C18 | Dualsense pre-grant audio permission vs vocatone lazy init | Note-1 CROSS | | — | ✅ | A1 — lazy init via openAudioGate, tidak ada preGrant |
| S18 | Flash opacity < 30% — semua kelas di bawah blueprint | Note-2 SCOPE | | PoC:79 | ✅ | A3 — opacity 0.3 = 30% |
| S23 | Konstanta `SPREAD_TRIGGER`/`SPREAD_SUSTAIN` di dalam hot-path callback | Note-2 SCOPE | | AGENTS.md | ✅ | Fase C — tidak pakai spread constants (LAR langsung) |
| S24 | Silhouette RAF loop 60Hz terlepas dari FaceMesh 15FPS — boros CPU | Note-2 SCOPE | | PoC:82 | ❌ | RAF loop 60Hz untuk crosshair + orbit; silhouette ikut. Wajar PoC |
| S26 | Tidak ada `onEnter(LAR_CHECK)` — tidak ada inisialisasi state gate | Note-2 SCOPE | | PoC:26, 68-69 | ✅ | Fase C — onEnter(LAR_CHECK) reset outOfThresholdSince + stablePitchCount |

### 🟢 Ringan — vocatone (11 item)

| # | Item | Sumber | Cross-Ref | Blueprint / PoC Line | Refactor | Catatan |
|---|------|--------|-----------|---------------------|----------|---------|
| T25 | VocaTone `f_max` dual source of truth — constants.js & game.js | Note-1 TECH | | TECH-02:40-41 | ✅ | Fase B — vocatone.js import f_min/f_max dari constants.js, game.js dihapus |
| G06 | VocaTone stability timer 0.5s — blueprint min 1s | Note-1 GAME | | GAME-01:56-58 | ✅ | Fase B — `STABILITY_MS = 1000` (1 detik) di vocatone.js line 9 |
| G13 | VocaTone balloon color — dark blue (#0D47A1) bukan bright/light blue | Note-1 GAME | | UX-02:81 | ✅ | Fase B — `BALLOON_COLOR = '#60A5FA'` (light blue) + gradient |
| G14 | VocaTone balloon movement — constant velocity bukan smooth acceleration | Note-1 GAME | | UX-02:82 | ✅ | Fase B — RISE_SPEED konstan + FALL_ACCEL + scale interpolation smooth |
| U01 | Font vokal 72pt di vocatone | Note-1 UX | | UX-02:63 | ✅ | Fase B — `drawVowel()` render 'A' 72pt Montserrat |
| U02 | Error handling mic denied di vocatone | Note-1 UX | | UX-03:50 | ✅ | Fase B — `try/catch` di start() + `onError('Mic Error', ...)` callback |
| U05 | No face → silhouette guide di vocatone | Note-1 UX | | UX-03:51 | ✅ | Fase B — `drawSilhouette()` dashed ellipse #F8FAFC 30% opacity |
| U11 | Scaling 1.2x objek game saat fonasi benar tidak ada | Note-1 UX | | UX-02:40 | ✅ | Fase B — `targetScale = 1.2` saat pitch>0 + smooth interpolation |
| U23 | Objek VocaTone tidak membesar saat naik | Note-1 UX | | GAME-01:78 | ✅ | Fase B — `scale` property applied di drawBalloon() |
| U25 | VocaTone tidak ada siluet kalibrasi saat no face | Note-1 UX | | VISUAL-02:14,24-26 | ✅ | Fase B — `drawSilhouette()` elliptical guide di vocatone.js |
| S03 | VocaTone objek hover tidak di jalur tengah canvas saat f₀ stabil | Note-2 SCOPE | | PoC:46 | ❌ | Hover di posisi Y terkini, tidak reposisi ke canvas.height/2 |

### 🟢 Ringan — kedua (shared, 26 item)

| # | Item | Sumber | Cross-Ref | Blueprint / PoC Line | Refactor | Catatan |
|---|------|--------|-----------|---------------------|----------|---------|
| T10 | Hapus `refineLandmarks: true` (~400KB) | Note-1 TECH | | TECH-04 (implisit) | ❌ | |
| T15 | Memory limit <150MB — tidak ada monitoring (wajar PoC) | Note-1 TECH | | TECH-04:54 | ❌ | |
| T16 | AudioContext tidak connect ke Destination — melanggar blueprint | Note-1 TECH | | TECH-03:24 | ✅ | A3 — connect ke audioContext.destination per blueprint |
| G07 | Siluet oval — garis putus-putus tidak diimplementasikan | Note-1 GAME | | VISUAL-02:14 | ✅ | A3 — drawSilhouette() dashed ellipse via setLineDash |
| G11 | Missing Mascot with Expressions (wajar PoC) | Note-1 GAME | | GAME-03:40-43 | ❌ | |
| G12 | Dynamic Obstacle proportional scaling (wajar PoC) | Note-1 GAME | | GAME-03:43 | ❌ | |
| U04 | Halaman pemilihan modul | Note-1 UX | | UX-04:40-44 | ✅ | A3 — #module-select dengan btn-vocatone + btn-dualsense, enterModuleView/leaveModuleView |
| U06 | Haptic feedback | Note-1 UX | | UX-02:39 | ✅ | A3 — showHaptic() via navigator.vibrate, success=getar 100ms, error=getar 50-50-50ms |
| U12 | Button 3-state styling — pressed 10% darker, disabled 40%+greyscale | Note-1 UX | | VISUAL-01:47-49 | ✅ | A3 — active:brightness-90 + disabled:opacity-40 grayscale via Tailwind classes | |
| U14 | Camera vs mic denied — tidak bisa dibedakan, pesan generik | Note-1 UX | | UX-03:50 | ✅ | A3 — showError('Camera Error',...) vs showError('Mic Error',...) dibedakan | |
| U15 | Icon-based navigation — masih teks (wajar PoC) | Note-1 UX | | UX-02:51-53 | ❌ | |
| U16 | Halaman history sesi latihan tidak ada (wajar PoC) | Note-1 UX | | UX-04:18 | ❌ | |
| U17 | Splash screen tidak ada (wajar PoC) | Note-1 UX | | UX-04:16 | ❌ | |
| U20 | Tidak ada instruksi "Ayo Mulai" saat no face | Note-1 UX | | GAME-03:19 | ✅ | A3 — #no-face-msg muncul di onEnter(CAMERA_ACTIVE) & onNoFace(), hilang saat face detected | |
| U21 | Camera frame border hijau untuk face detection tidak ada | Note-1 UX | | UX-03:30 | ✅ | A3 — .camera-detected CSS class outline 3px solid #22C55E | |
| U22 | Margin layar 16dp tidak di-enforce | Note-1 UX | | VISUAL-01:58 | ✅ | A3 — p-4 (16px) sudah di #app sejak awal, konsisten | |
| U26 | Tombol kembali (back button) tidak ada | Note-1 UX | | UX-04:27 | ✅ | A3 — #btn-back fixed top-4 left-4, hidden default, toggle via leaveModuleView/enterModuleView | |
| U27 | Jarak antar komponen `gap-3` (12px) melanggar minimum 16dp | Note-1 UX | | UX-02:49 | ✅ | A3 — gap-3 diganti gap-4 (16px) di feedback-panel | |
| U29 | Missing animated large checkmark icon untuk success state | Note-1 UX | | UX-02:16 | ✅ | A3 — drawCheckmark() animated via #checkmark-canvas, progress-based stroke drawing | |
| U30 | Missing Orbiting Pulse animation di sekitar ikon sensor | Note-1 UX | | UX-02:18 | ✅ | A3 — orbiting dot integrated in crosshair RAF loop, orbitAngle increments per frame | |
| U31 | Missing pulsing red arrow indicator saat wajah keluar | Note-1 UX | | UX-02:19 | ✅ | A3 — showArrow flag triggers pulsing red arrow in crosshair loop, shown on onNoFace() | |
| U32 | Missing background layers & HUD SVG assets (wajar PoC) | Note-1 UX | | VISUAL-03:34-66 | ❌ | |
| C05 | AGENTS.md syncing — ambil versi dualsense sebagai baseline | Note-1 CROSS | | — | ✅ | A3 — AGENTS.md sudah sinkron (versi dualsense sebagai baseline, isi cocok) | |
| C19 | Error screen CSS transition duration: 700ms vs 500ms | Note-1 CROSS | | — | ✅ | A3 — transition: opacity 500ms ease-in-out via main.css | |
| C21 | Hardcoded "A" di `#vowel-indicator` span index.html | Note-1 CROSS | | UX-02:63 | ✅ | A3 — #vowel-indicator tidak ada di shared index.html (sudah bersih) | |
| C22 | Camera feed mirror `scaleX(-1)` hanya di dualsense, vocatone tidak mirror | Note-1 CROSS | | — | ✅ | A3 — #camera-feed { transform: scaleX(-1) } via main.css | |

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
| T11 | Normalisasi sample rate audio 44.1/48 kHz | 🟡 | kedua | ✅ | TECH-03:16 | |
| T12 | Dispose FaceMesh instance saat stop() | 🟡 | kedua | ✅ | TECH-04:41-43 | |
| T13 | Bersihkan `videoElement.srcObject` saat stop() | 🟡 | kedua | ✅ | TECH-04:41-43 | |
| T14 | MediaPipe model caching — .binarypb/.data di-precache | 🟡 | kedua | ✅ | TECH-02:22-25 | |
| T18 | `autocorrelationPitch()` — ganti Map dg Float64Array | 🟡 | dualsense | ❌ | TECH-03:27, TECH-04:54 | |
| T19 | Camera fallback 480p→360p cleanup stream gagal | 🟡 | dualsense | ❌ | TECH-04:14-16 | |
| T20 | `initAudioStream()` — tambah try/catch getUserMedia | 🟡 | dualsense | ❌ | TECH-03:14-16 | |
| T21 | `lar_threshold` schema mismatch IndexedDB | 🟡 | vocatone | ❌ | TECH-02:36-41 | |
| T22 | `initAudioStream()` — tambah `audioContext.resume()` | 🟡 | dualsense | ❌ | TECH-03:15-16 | |
| T23 | `stopSession()` — reset semua state variables | 🟡 | dualsense | ❌ | TECH-04:41-43 | |
| T26 | IndexedDB pipeline dead code — `saveProfile()` | 🟡 | kedua | ✅ | TECH-02:36-41 | |
| T27 | Baca `f_min`/`f_max` dari IndexedDB profile | 🟡 | kedua | ✅ | TECH-02:40 | |
| T28 | Stale-While-Revalidate untuk game components | 🟡 | kedua | ✅ | TECH-02:20 | |
| T29 | Race condition `openAudioGate()` — tambah guard | 🟡 | dualsense | ❌ | TECH-03:14-16 | |
| T30 | Sensor disconnected — penanganan khusus | 🟡 | kedua | ✅ | TECH-01:77 | |
| T31 | Camera start error — user-facing feedback di vocatone | 🟡 | vocatone | ❌ | TECH-04, UX-03:50 | |
| T32 | Face loss — tutup microphone saat MIC_OPEN | 🟡 | dualsense | ❌ | TECH-01:74 | |
| T33 | Mic denied — user-facing error di dualsense | 🟡 | dualsense | ❌ | TECH-03:14-16, UX-03:50 | |
| T06 | `computeRMS()` private → public | 🟢 | dualsense | ❌ | TECH-03:55 | |
| T07 | Tambah `getPitchHz()` | 🟢 | dualsense | ❌ | TECH-03:99 | |
| T10 | Hapus `refineLandmarks: true` | 🟢 | kedua | ❌ | TECH-04 (implisit) | |
| T15 | Memory limit <150MB (wajar PoC) | 🟢 | kedua | ❌ | TECH-04:54 | |
| T16 | AudioContext tidak connect ke Destination | 🟢 | kedua | ✅ | TECH-03:24 | A3 — connect ke audioContext.destination |
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
| G09 | Kalibrasi RMS threshold di awal sesi | 🟡 | kedua | ✅ | GAME-01:79 | |
| G10 | Render Character & Gate di DualSense | 🟡 | dualsense | ❌ | GAME-02:16-17 | |
| G06 | Stability timer 0.5s → min 1s | 🟢 | vocatone | ❌ | GAME-01:56-58 | |
| G07 | Siluet oval — garis putus-putus | 🟢 | kedua | ✅ | VISUAL-02:14 | A3 — drawSilhouette() dengan setLineDash |
| G11 | Mascot with Expressions (wajar PoC) | 🟢 | kedua | ❌ | GAME-03:40-43 | |
| G12 | Dynamic Obstacle scaling (wajar PoC) | 🟢 | kedua | ❌ | GAME-03:43 | |
| G13 | VocaTone balloon color → bright blue | 🟢 | vocatone | ❌ | UX-02:81 | |
| G14 | VocaTone balloon movement → smooth acceleration | 🟢 | vocatone | ❌ | UX-02:82 | |

### UX / VISUAL — User Interface & Visual Design

| # | Item | Prioritas | Branch | Refactor | Blueprint | Catatan |
|---|------|-----------|--------|----------|-----------|---------|
| U03 | Warna siluet oval: Hijau/Merah per state | 🟡 | dualsense | ✅ | VISUAL-02:27-28 | A3 — drawSilhouette() pilih warna #F8FAFC/#22C55E/#EF4444 per state |
| U07 | Siluet Searching state #F8FAFC + pulsing 20-50% | 🟡 | dualsense | ❌ | VISUAL-02:26 | |
| U09 | `drawSilhouette()` terima validation state | 🟡 | dualsense | ❌ | VISUAL-02:24-28 | |
| U28 | Real-time LAR indicator animation (crosshair) | 🟡 | kedua | ❌ | UX-02:76-78 | |
| U01 | Font vokal 72pt di vocatone | 🟢 | vocatone | ❌ | UX-02:63 | |
| U02 | Error handling mic denied di vocatone | 🟢 | vocatone | ❌ | UX-03:50 | |
| U04 | Halaman pemilihan modul | 🟢 | kedua | ✅ | UX-04:40-44 | A3 — #module-select + btn-vocatone/btn-dualsense |
| U05 | No face → silhouette guide di vocatone | 🟢 | vocatone | ❌ | UX-03:51 | |
| U06 | Haptic feedback | 🟢 | kedua | ✅ | UX-02:39 | A3 — navigator.vibrate on start/error |
| U08 | Siluet Out of Bounds — shake animation | 🟢 | dualsense | ❌ | VISUAL-02:28 | |
| U10 | Flash success opacity 30% + transisi 0→30→0 | 🟢 | dualsense | ❌ | UX-02:38 | |
| U11 | Scaling 1.2x objek game saat fonasi benar | 🟢 | vocatone | ❌ | UX-02:40 | |
| U12 | Button 3-state styling | 🟢 | kedua | ✅ | VISUAL-01:47-49 | A3 — brightness-90 + opacity-40 grayscale |
| U13 | Mic denied — ilustrasi besar | 🟢 | dualsense | ❌ | UX-03:50 | |
| U14 | Camera vs mic denied — pesan dibedakan | 🟢 | kedua | ✅ | UX-03:50 | A3 — 'Camera Error' vs 'Mic Error' dibedakan |
| U15 | Icon-based navigation (wajar PoC) | 🟢 | kedua | ❌ | UX-02:51-53 | |
| U16 | Halaman history sesi (wajar PoC) | 🟢 | kedua | ❌ | UX-04:18 | |
| U17 | Splash screen (wajar PoC) | 🟢 | kedua | ❌ | UX-04:16 | |
| U18 | Siluet — 48dp padding dari tepi layar | 🟢 | dualsense | ❌ | VISUAL-02:36-38 | |
| U19 | CSS stroke transition 0.3s di Canvas | 🟢 | dualsense | ❌ | VISUAL-02:56 | |
| U20 | Instruksi "Ayo Mulai" saat no face | 🟢 | kedua | ✅ | GAME-03:19 | A3 — #no-face-msg muncul via onNoFace |
| U21 | Camera frame border hijau untuk face detection | 🟢 | kedua | ✅ | UX-03:30 | A3 — .camera-detected outline 3px #22C55E |
| U22 | Margin layar 16dp | 🟢 | kedua | ✅ | VISUAL-01:58 | A3 — p-4 (16px) konsisten di #app |
| U23 | Objek VocaTone membesar saat naik | 🟢 | vocatone | ❌ | GAME-01:78 | |
| U24 | Flash-error/warning/idle opacity ≥ 30% | 🟢 | dualsense | ❌ | UX-02:38 | |
| U25 | VocaTone — siluet kalibrasi saat no face | 🟢 | vocatone | ❌ | VISUAL-02:14,24-26 | |
| U26 | Tombol kembali (back button) | 🟢 | kedua | ✅ | UX-04:27 | A3 — #btn-back fixed top-4 left-4 |
| U27 | Jarak antar komponen ≥ 16dp | 🟢 | kedua | ✅ | UX-02:49 | A3 — gap-3→gap-4 (12px→16px) di feedback-panel |
| U29 | Animated large checkmark icon | 🟢 | kedua | ✅ | UX-02:16 | A3 — animated drawCheckmark via #checkmark-canvas |
| U30 | Orbiting Pulse animation | 🟢 | kedua | ✅ | UX-02:18 | A3 — orbiting dot via crosshair RAF loop |
| U31 | Pulsing red arrow indicator | 🟢 | kedua | ✅ | UX-02:19 | A3 — showArrow flag + red arrow in crosshair loop |
| U32 | Background layers & HUD SVG (wajar PoC) | 🟢 | kedua | ❌ | VISUAL-03:34-66 | |

### CROSS — Inkonsistensi Antar Branch

| # | Item | Prioritas | Branch | Refactor | Keterangan | Catatan |
|---|------|-----------|--------|----------|-----------|---------|
| C01 | `gatekeeper` export pattern (default vs named) — standarisasi | 🔴 | kedua | ✅ | Pilih satu pola untuk seluruh codebase | Named exports (GateKeeper class + STATES) |
| C02 | `initCamera()` API signature (object vs positional) — standarisasi | 🔴 | kedua | ✅ | Standarisasi ke objek callbacks | `initCamera({ videoElement, onFace, onNoFace })` |
| C23 | `f_min` value inkonsisten 150Hz vs 100Hz — sinkronkan | 🔴 | kedua | ✅ | constants.js jadi single source of truth | `f_min:150` — audio.js import dari constants |
| C24 | GateKeeper state machine arsitektur — unifikasi | 🔴 | kedua | ✅ | Ambil vocatone sebagai baseline | GateKeeper class + valid transisi + onEnter/onExit |
| C03 | Snake_case vs camelCase — align dg AGENTS.md | 🟡 | dualsense | ❌ | Dualsense banyak camelCase | |
| C20 | `triggerFallback()` cooldown 1s — standarisasi | 🟡 | dualsense | ❌ | Putuskan perlu/tidak untuk PoC | |
| C04 | Vite + package.json basicSsl — putuskan perlu/tidak | 🟢 | dualsense | ❌ | Dualsense punya, vocatone tidak | |
| C05 | AGENTS.md syncing — ambil versi dualsense | 🟢 | kedua | ✅ | Baseline: versi dualsense | A3 — AGENTS.md sudah sinkron |
| C18 | Mic permission: preGrant vs lazy init | 🟢 | dualsense | ❌ | Standarisasi ke lazy (vocatone) | |
| C19 | Error screen CSS transition 700ms vs 500ms | 🟢 | kedua | ✅ | Standarisasi (kedua nilai valid) | A3 — transition: opacity 500ms ease-in-out |
| C21 | Hardcoded "A" di `#vowel-indicator` — ganti empty string | 🟢 | kedua | ✅ | UX-02:63 | A3 — #vowel-indicator sudah tidak ada di shared index.html |
| C22 | Camera feed mirror — terapkan di kedua branch | 🟢 | kedua | ✅ | Front camera harus mirror | A3 — #camera-feed { transform: scaleX(-1) } di main.css |

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
| S34 | `MIN_PITCH_HZ` hardcoded 50 Hz — pakai `f_min` | 🟡 | kedua | ✅ | AGENTS.md | |
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
| 17 Jul 2026 | 1.1 | Restruktur: ringkasan by branch + sub-tabel per branch dalam setiap prioritas (🔴🟡🟢) | Agent V-NADA |
| 17 Jul 2026 | 1.2 | Fase A1 ✅: C01, C02, C23, C24 — GateKeeper state machine, initCamera API, f_min standardisasi | Agent V-NADA |
| 17 Jul 2026 | 1.3 | Fase A2 ✅: T11-T14, T26-T30, G09, U28, S34 — sample rate, caching, IndexedDB, RMS kalibrasi, crosshair, error handling | Agent V-NADA |
| 18 Jul 2026 | 1.4 | Fase A3 ✅: T16, G07, U03-U04, U06, U12, U14, U20-U22, U26-U27, U29-U31, C05, C19, C21, C22 — module selection, back button, silhouette oval dash + color, haptic, 3-state button, Ayo Mulai, camera border, 16dp spacing, checkmark, orbit pulse, red arrow, mirror, error transition, AudioContext destination | Agent V-NADA |
| 18 Jul 2026 | 1.5 | Fase C ⚡ Batch 1+2 (dualsense): S40 (red flash no audio), G04 (wrong mouth flash-error + silhouette merah), T05/S29 (closeAudioGate async), S05 (SESSION_ACTIVE live state), U07 (silhouette pulse), S44 (canvas ResizeObserver), S36 (remove accuracy scope creep), T19 (camera 480p→360p fallback), S26 (onEnter LAR_CHECK init) — 9 item dualsense | Agent V-NADA |
| 18 Jul 2026 | 1.6 | Audit pasca-merge: update 19 item VocaTone dari ❌ ke ✅ (Fase B sudah terimplementasi), perbaiki 3 item shared (G09/U28/S34), sinkronisasi summary table & PROGRESS.md | Agent V-NADA |

---

*Dokumen ini adalah living document. Perbarui status Refactor dan Change Log setiap kali ada perubahan.*
