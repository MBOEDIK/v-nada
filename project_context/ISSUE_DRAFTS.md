# Draft Deskripsi Issue — GitHub Backlog 50% PoC

Berisi seluruh draft issue hasil breakdown dari `BACKLOG_50.md`.

---

## A1.1 — Inisialisasi Project Vite + Tailwind

**Deskripsi Teknis:**

Scaffold project Vite dengan template vanilla JavaScript sebagai fondasi SPA V-NADA. Setup PostCSS + Tailwind CSS dengan color tokens sesuai blueprint VISUAL-01 (`primary: #0D47A1`, `success: #22C55E`, `danger: #EF4444`, `warning: #EAB308`, `bg-light: #FFFFFF`) dan font family `Montserrat` (heading) + `Inter` (body). Struktur folder mengikuti arsitektur Offline-First SPA: `src/utils/` (business logic), `src/components/` (modul UI), `src/styles/` (global CSS + Tailwind directives), `public/` (static assets). Entry point `index.html` di root dengan viewport `user-scalable=no` dan skeleton dasar (camera-view, feedback-panel, controls, error-screen). Semua konfigurasi ESLint + custom plugin `eslint-plugin-vnada` sudah terintegrasi. Project harus dapat dijalankan via `npm run dev` dan di-build via `npm run build` tanpa error.

**File Target:**
- `package.json` (dependencies & scripts)
- `vite.config.js` (Vite config + VitePWA plugin)
- `postcss.config.js` (PostCSS: tailwindcss + autoprefixer)
- `tailwind.config.js` (custom colors, fonts)
- `index.html` (entry point, skeleton UI)
- `src/main.js` (module entry, imports)
- `src/styles/main.css` (Tailwind directives + @font-face)
- `.eslintrc.cjs`, `.eslintignore` (linting rules)
- `tools/eslint-plugin-vnada/` (custom rules: `no-node-modules`, `enforce-snake-case`, `enforce-lar-indices`, `enforce-fat-finger`, `enforce-audio-params`)
- `scripts/validate-architecture.mjs` (architecture gate script)

**Subtasks:**
- [ ] Scaffold Vite vanilla JS dan instal dependencies (`vite`, `tailwindcss`, `postcss`, `autoprefixer`, `vite-plugin-pwa`, `eslint`, `@mediapipe/camera_utils`, `@mediapipe/face_mesh`)
- [ ] Konfigurasi PostCSS dengan plugin `tailwindcss` + `autoprefixer`
- [ ] Setup `tailwind.config.js` dengan custom colors (primary, success, danger, warning, bg-light) dan font family (Montserrat heading, Inter body)
- [ ] Setup `vite.config.js` dengan plugin `VitePWA` (registerType: autoUpdate, manifest, workbox CacheFirst untuk static-resources & mediapipe-models)
- [ ] Buat structure folder: `src/utils/`, `src/components/`, `src/styles/`, `public/assets/`, `public/fonts/`, `public/mediapipe/`
- [ ] Buat `index.html` dengan skeleton UI: header branding, camera-view (`<video>` + `<canvas>` overlay), feedback-panel (LAR, Pitch, Accuracy, Stars), controls (Start/Stop buttons fat-finger 60x60dp), error-screen overlay
- [ ] Buat `src/styles/main.css` dengan `@tailwind base/components/utilities` + `@font-face` untuk Montserrat & Inter (font-display: swap)
- [ ] Buat `src/main.js` sebagai entry module yang import CSS dan utility modules
- [ ] Integrasi & verifikasi custom ESLint plugin `eslint-plugin-vnada` dengan 5 rules
- [ ] Buat `scripts/validate-architecture.mjs` sebagai hard-gate arsitektur (cegah Node.js backend modules)
- [ ] Verifikasi `npm run dev` berjalan tanpa error
- [ ] Verifikasi `npm run build` menghasilkan output di `dist/`
- [ ] Verifikasi `npm run lint` lolos tanpa pelanggaran
- [ ] Verifikasi `npm run validate` lolos arsitektur gate

**Definition of Done:**
1. `npm run dev` memunculkan halaman V-NADA di localhost dengan skeleton UI lengkap
2. `npm run build` menghasilkan folder `dist/` dengan bundle JS + CSS terkompresi
3. `npm run lint` melaporkan 0 error dan 0 warning
4. `npm run validate` melaporkan "V-NADA architecture validation passed"
5. Tailwind color tokens dan font family berfungsi di halaman (header biru #0D47A1, body font Inter)
6. Semua fat-finger target size (min-w-[60px] min-h-[60px]) teraplikasi pada tombol Start/Stop
7. Tidak ada satupun import dari Node.js backend modules (`fs`, `path`, `express`, dll.)

**Depends on:** — (Task foundational, tidak ada dependensi issue lain)

---

## A1.2 — Setup Service Worker

**Deskripsi Teknis:**

Implementasi Service Worker untuk kapabilitas offline-first V-NADA. Strategi caching mengikuti blueprint TECH-02: **Cache-First** untuk aset statis (JS, CSS, HTML, font, icon) dan **Stale-While-Revalidate** untuk komponen dinamis. Model AI MediaPipe (.wasm, .data, .binarypb) disimpan di Cache Storage API terpisah (`mediapipe-models`) agar siap pakai tanpa unduh ulang. Service Worker didaftarkan via `navigator.serviceWorker.register()` dari entry module. Siklus hidup Service Worker mencakup: **Install** (pre-cache aset inti), **Activate** (bersihkan cache versi lama), **Fetch** (intercept request dan serve dari cache). Verifikasi offline dipastikan dengan mematikan server dev dan memastikan halaman tetap termuat dari cache.

**File Target:**
- `vite.config.js` (workbox globPatterns & runtimeCaching rules)
- `src/main.js` (registrasi Service Worker via `navigator.serviceWorker.register()`)
- `dist/sw.js` (auto-generated oleh vite-plugin-pwa)
- `dist/registerSW.js` (auto-generated oleh vite-plugin-pwa)

**Subtasks:**
- [ ] Konfigurasi `vite-plugin-pwa` di `vite.config.js` dengan strategi `CacheFirst` untuk aset statis (`**/*.{js,css,html,ico,png,svg,webp,woff2}`)
- [ ] Tambah `runtimeCaching` untuk model MediaPipe dengan pola `/.*\.wasm.*/` menggunakan handler `CacheFirst` dan cacheName `mediapipe-models`
- [ ] Registrasi Service Worker di `src/main.js` via `navigator.serviceWorker.register()` dengan scope `/`
- [ ] Verifikasi Service Worker terdaftar di browser (DevTools → Application → Service Workers)
- [ ] Verifikasi aset statis (JS, CSS, HTML) tercache di Cache Storage (`static-resources`)
- [ ] Verifikasi file .wasm MediaPipe tercache di Cache Storage (`mediapipe-models`)
- [ ] Uji offline mode: matikan server dev, refresh halaman → halaman harus tetap tampil utuh dari cache
- [ ] Verifikasi tidak ada request gagal saat offline di DevTools Network tab

**Definition of Done:**
1. `navigator.serviceWorker.register()` sukses tanpa error di console browser
2. Semua aset statis (JS, CSS, HTML, font .woff2) tersedia di Cache Storage `static-resources`
3. Semua model file MediaPipe (.wasm, .data, .js, .binarypb) tersedia di Cache Storage `mediapipe-models`
4. Halaman V-NADA tetap berfungsi penuh dalam mode offline (server mati)
5. Di DevTools Network tab, semua request menampilkan status `(from ServiceWorker)` saat offline
6. Tidak ada satupun request yang gagal (status merah) saat pengujian offline

**Depends on:** A1.1

---

## A1.3 — Konfigurasi Manifest + Icon

**Deskripsi Teknis:**

Siapkan aset PWA manifest dan icon untuk memenuhi kriteria *installable* PWA di Android Chrome. Buat placeholder icon berupa SVG/PNG monokrom solid warna `primary (#0D47A1)` dalam dua ukuran: 192x192 px (untuk splash screen) dan 512x512 px (untuk install badge). Konfigurasi `manifest.json` (atau via `vite-plugin-pwa` di `vite.config.js`) dengan properti: `name: "V-NADA"`, `short_name: "VNADA"`, `description: "Visual Networked Audio & Digital Articulation"`, `start_url: "/"`, `display: "standalone"`, `orientation: "portrait"`, `theme_color: "#0D47A1"`, `background_color: "#FFFFFF"`, dan daftar icons yang mengacu ke file di `public/icons/`. Link manifest di `<head>` index.html via `<link rel="manifest" href="/manifest.webmanifest">`.

**File Target:**
- `public/icons/icon-192x192.png` (placeholder icon 192x192)
- `public/icons/icon-512x512.png` (placeholder icon 512x512)
- `vite.config.js` (manifest config object di VitePWA plugin)
- `index.html` (link manifest)
- `dist/manifest.webmanifest` (auto-generated output)

**Subtasks:**
- [ ] Generate placeholder icon 192x192 px warna solid `#0D47A1` simpan ke `public/icons/icon-192x192.png`
- [ ] Generate placeholder icon 512x512 px warna solid `#0D47A1` simpan ke `public/icons/icon-512x512.png`
- [ ] Konfigurasi objek `manifest` di plugin `VitePWA` pada `vite.config.js`: name, short_name, description, start_url, display (standalone), orientation (portrait), theme_color (#0D47A1), background_color (#FFFFFF), icons (192 & 512)
- [ ] Verifikasi `<link rel="manifest" href="/manifest.webmanifest">` ada di `<head>` `index.html`
- [ ] Jalankan `npm run build` dan verifikasi `dist/manifest.webmanifest` tergenerate dengan properti lengkap
- [ ] Uji install prompt di browser Android: buka halaman → harus muncul "Add to Home Screen"
- [ ] Verifikasi icon tampil benar di splash screen dan home screen Android

**Definition of Done:**
1. File `public/icons/icon-192x192.png` dan `icon-512x512.png` exist
2. `npm run build` menghasilkan `dist/manifest.webmanifest` dengan properti name, short_name, icons, theme_color, background_color, display, orientation
3. Browser DevTools → Application → Manifest menampilkan semua properti valid tanpa warning
4. Install prompt "Add to Home Screen" muncul di Android Chrome
5. Aplikasi terinstall sebagai PWA dengan icon dan splash screen yang benar

**Depends on:** A1.1

---

## A2.1 — Bangun State Machine

**Deskripsi Teknis:**

Implementasi class `GateKeeper` sebagai *Sequential Validation Engine* yang mengatur pipeline multimodal sesuai diagram TECH-01 dan TECH-02. Mendefinisikan 5 state diskrit:

| State | Deskripsi |
|---|---|
| `IDLE` | Awal aplikasi, semua sensor mati. Tombol Start siap ditekan. |
| `CAMERA_ACTIVE` | Kamera depan aktif streaming, MediaPipe FaceMesh mulai deteksi, LAR belum tervalidasi. |
| `LAR_CHECK` | Sistem menghitung LAR dari 4 landmark bibir (13, 14, 78, 308) dan membandingkan dengan `lar_threshold`. |
| `MIC_OPEN` | LAR sudah valid, gerbang audio terbuka, microphone aktif, ekstraksi f0 berjalan. |
| `SESSION_ACTIVE` | Sesi latihan penuh berjalan: LAR valid + audio streaming + binary visual feedback aktif. |

Setiap transisi state wajib melalui method eksplisit `transitionTo(state)` yang mengecek validitas transisi (state guard) dan menjalankan callback `onEnter`/`onExit`. Instant fallback dari `SESSION_ACTIVE`/`MIC_OPEN` ke `IDLE` terjadi jika LAR actual drop di bawah threshold (C9 — Instant Fallback).

**File Target:**
- `src/utils/gatekeeper.js` (class `GateKeeper` dengan state machine)

**Subtasks:**
- [ ] Definisikan enum/constant states: `IDLE`, `CAMERA_ACTIVE`, `LAR_CHECK`, `MIC_OPEN`, `SESSION_ACTIVE`
- [ ] Implementasi class `GateKeeper` dengan properti `#currentState` (private field)
- [ ] Implementasi method `getState()` mengembalikan state saat ini
- [ ] Implementasi method `transitionTo(targetState)` dengan validasi transisi (hanya state maju yang valid: IDLE→CAMERA_ACTIVE→LAR_CHECK→MIC_OPEN→SESSION_ACTIVE, dan instant fallback ke IDLE dari state mana pun)
- [ ] Implementasi callback hooks `onEnter(state)` dan `onExit(state)` untuk side effects (start/stop kamera, mic, canvas)
- [ ] Implementasi method `reset()` untuk mengembalikan ke `IDLE` dari state mana pun
- [ ] Implementasi method `canTransitionTo(targetState)` untuk pengecekan tanpa eksekusi
- [ ] Export instance singleton `gatekeeper` dari module

**Definition of Done:**
1. Import `gatekeeper` dari `src/utils/gatekeeper.js` tanpa error
2. `gatekeeper.getState()` mengembalikan `IDLE` setelah inisialisasi
3. `gatekeeper.transitionTo('CAMERA_ACTIVE')` berhasil mengubah state ke `CAMERA_ACTIVE`
4. `gatekeeper.transitionTo('IDLE')` dari state mana pun mereset ke awal
5. Transisi invalid (misal `CAMERA_ACTIVE` → `SESSION_ACTIVE` tanpa lewat `LAR_CHECK`) melempar error atau ditolak
6. Callback `onEnter` terpanggil setiap kali masuk state baru

**Depends on:** A1.1

---

## A2.2 — Pipeline Kamera → FaceMesh → LAR → Gate

**Deskripsi Teknis:**

Integrasi pipeline kamera depan dengan MediaPipe FaceMesh untuk menghasilkan nilai LAR real-time dan menggerakkan decision logic GateKeeper. Alur sesuai diagram TECH-01: stream kamera dimensi square 360p/480p (resolusi dibatasi via `getUserMedia` constraints) → FaceMesh WASM dijalankan via WebGL → ekstraksi 4 landmark bibir (indeks 13, 14, 78, 308) → hitung LAR via Euclidean distance → bandingkan dengan `lar_threshold` → jika LAR ≥ threshold, panggil `gatekeeper.transitionTo('LAR_CHECK')` yang membuka gerbang audio. Frame rate dibatasi 15-20 FPS sesuai TECH-04 dengan time-debounce + frame-skipping jika latency ≥ 60ms. Video stream ditampilkan di `<video id="camera-feed">` dan hasil deteksi digambar di `<canvas id="overlay-canvas">`.

**File Target:**
- `src/utils/vision.js` (FaceMesh init, landmark parsing, LAR compute)
- `src/utils/gatekeeper.js` (integrasi transisi state)
- `src/main.js` (orchestrasi pipeline, callback `onFaceLandmarks`)
- `public/mediapipe/face_mesh.js` (MediaPipe loader)
- `public/mediapipe/face_mesh_solution_wasm_bin.wasm` (WASM binary)
- `public/mediapipe/face_mesh.binarypb` (model graph)

**Subtasks:**
- [ ] Inisialisasi MediaPipe FaceMesh dengan `locateFile` mengarah ke `/mediapipe/`
- [ ] Setup `Camera` utility dari `@mediapipe/camera_utils` dengan resolusi `{ width: 480, height: 480 }` (square) — fallback ke 360p jika 480p tidak didukung
- [ ] Implementasi callback `onResults(results)` yang mem-parsing `results.multiFaceLandmarks[0]` dan mengekstrak 4 indeks: 13 (top), 14 (bottom), 78 (left), 308 (right)
- [ ] Implementasi throttle/FPS limiter: variabel `lastFrameTime`, skip jika `now - lastFrameTime < 50ms` (≈20 FPS)
- [ ] Implementasi frame-skipping: hitung latency proses, jika ≥ 60ms skip frame berikutnya
- [ ] Integrasi dengan `GateKeeper`: jika state `CAMERA_ACTIVE` dan LAR ≥ threshold, panggil `transitionTo('LAR_CHECK')` → trigger buka mic
- [ ] Render hasil deteksi di overlay canvas (gambar landmark points + mouth silhouette)
- [ ] Tampilkan LAR value real-time di `#lar-display`
- [ ] Jika wajah tidak terdeteksi (no face), state tetap `CAMERA_ACTIVE` dan background abu-abu (#F8FAFC)

**Definition of Done:**
1. Stream kamera depan muncul di `<video id="camera-feed">` dengan resolusi square ≤ 480p
2. MediaPipe FaceMesh sukses memuat (WASM + model) tanpa error
3. 4 landmark bibir (13, 14, 78, 308) terekstrak dari `onResults` callback
4. Nilai LAR terupdate real-time di `#lar-display` saat wajah terdeteksi
5. Saat LAR ≥ threshold, state machine bertransisi dari `CAMERA_ACTIVE` ke `LAR_CHECK` / `MIC_OPEN`
6. Frame rate tidak melebihi 20 FPS (devtools Performance tab)
7. Jika wajah tidak terdeteksi > 3 detik, state tetap `CAMERA_ACTIVE` tanpa error crash
8. Overlay canvas menampilkan landmark mulut (optional dots)

**Depends on:** A2.1

---

## A2.3 — Fallback Visual + Reset State

**Deskripsi Teknis:**

Implementasi mekanisme *Instant Fallback* sesuai diagram TECH-01 dan GAME-02: jika selama sesi aktif (state `SESSION_ACTIVE` atau `MIC_OPEN`) MediaPipe mendeteksi pergeseran koordinat bibir yang menyebabkan LAR actual turun di bawah `lar_threshold`, sistem harus (1) menutup gerbang audio secara instan (mic OFF, hentikan ekstraksi f0), (2) menampilkan layar error visual berupa flash merah (#EF4444) dengan pesan "Mouth Closed — Please open your mouth to begin" di elemen `#error-screen`, (3) mereset state machine ke `IDLE` (atau `CAMERA_ACTIVE` untuk langsung merekam ulang). Layar error bertahan sampai user memperbaiki posisi mulut (LAR kembali ≥ threshold) dan sistem otomatis kembali ke pipeline visual. Jika LAR drop di bawah threshold tapi wajah masih terdeteksi, mic ditutup tapi kamera tetap aktif (transisi ke `CAMERA_ACTIVE`). Jika wajah hilang total, reset penuh ke `IDLE`.

**File Target:**
- `src/main.js` (logic gate LAR monitoring, showError, closeAudioStream)
- `src/utils/gatekeeper.js` (method `reset()` dan `transitionTo` untuk fallback path)
- `src/utils/audio.js` (method `closeAudioStream()`)
- `index.html` (elemen `#error-screen` sudah ada — pastikan class `hidden` toggle)

**Subtasks:**
- [ ] Di `onFaceLandmarks` callback: jika `sessionActive = true` dan `lar < threshold`, panggil `gatekeeper.reset()` → state kembali ke `IDLE` atau `CAMERA_ACTIVE`
- [ ] Panggil `closeAudioStream()` untuk menutup mic dan hentikan AudioContext
- [ ] Toggle class `hidden` pada `#error-screen` → tampilkan overlay merah dengan teks peringatan
- [ ] Pasang CSS transisi opacity pada `#error-screen` agar flash tidak terlalu abrupt (500-800ms)
- [ ] Setelah error screen muncul, sistem tetap menjalankan FaceMesh (kamera tetap hidup) untuk monitoring LAR
- [ ] Jika LAR kembali ≥ threshold, sembunyikan `#error-screen` (tambah class `hidden`), lanjut ke pipeline normal
- [ ] Implementasi debounce 300ms untuk mencegah flicker saat LAR fluktuasi di sekitar threshold
- [ ] Jika wajah tidak terdeteksi sama sekali (no face landmarks), reset ke `IDLE` penuh dan hentikan kamera (opsional: tahan `CAMERA_ACTIVE`)

**Definition of Done:**
1. Saat LAR drop di bawah threshold mid-session, error screen merah (#EF4444) muncul dalam < 100ms
2. Audio stream berhenti (mic mati) — dicek via `audioContext.state === 'closed'`
3. State machine kembali ke `CAMERA_ACTIVE` (kamera tetap hidup) atau `IDLE`
4. Saat LAR kembali ≥ threshold, error screen otomatis hilang dan pipeline visual kembali berjalan
5. Flash error tidak flicker (debounce 300ms mencegah rapid toggling)
6. Jika wajah hilang total, reset penuh ke `IDLE` (kamera mati, semua sensor off)

**Depends on:** A2.2

---

## B3.1 — Inisialisasi Audio Pipeline

**Deskripsi Teknis:**

Bangun pipeline Web Audio API untuk menangkap dan menganalisis suara dari mikrofon perangkat secara real-time sesuai blueprint TECH-03. Inisialisasi `AudioContext` sebagai lingkungan pemrosesan utama, minta akses mikrofon via `navigator.mediaDevices.getUserMedia({ audio: true })`, buat `MediaStreamAudioSourceNode` dari stream mikrofon, sambungkan ke `AnalyserNode` dengan `fftSize = 2048` (atau 4096 untuk resolusi lebih tinggi), dan alokasikan buffer `Float32Array` sepanjang `fftSize` untuk menampung data domain waktu. Pastikan sampling rate dinormalisasi (44.1 kHz / 48 kHz). Audio *tidak* disambungkan ke `destination` (speaker) untuk mencegah feedback loop yang membingungkan anak. Semua state variabel (`audioContext`, `analyserNode`, `mediaStream`, `dataArray`) di-scope module agar aman dari garbage collection. Sediakan method `closeAudioStream()` untuk membersihkan resource saat sesi berakhir.

**File Target:**
- `src/utils/audio.js` (init, state variables, close)

**Subtasks:**
- [ ] Buat variabel module-level: `let audioContext = null`, `let analyserNode = null`, `let mediaStream = null`, `let dataArray = null`
- [ ] Implementasi `initAudioStream()`: buat `AudioContext`, panggil `getUserMedia({ audio: true })`, buat `source = context.createMediaStreamSource(stream)`, buat `analyser = context.createAnalyser()`, set `analyser.fftSize = 2048`, hubungkan `source → analyser` (JANGAN ke destination), alokasi `dataArray = new Float32Array(fftSize)`
- [ ] Implementasi `closeAudioStream()`: hentikan semua track `mediaStream.getTracks()`, close `audioContext`, nullkan semua referensi
- [ ] Pastikan `AudioContext` dibuat dalam state `suspended` dan di-`resume()` saat mic aktif (atasi autoplay policy browser)
- [ ] Handle error `getUserMedia` (izin ditolak, no mic) dengan error message yang jelas

**Definition of Done:**
1. `initAudioStream()` berhasil membuat `AudioContext` dan `AnalyserNode`
2. `analyserNode.fftSize === 2048` (terverifikasi via console)
3. `dataArray` adalah `Float32Array` dengan `length === 2048`
4. `closeAudioStream()` menghentikan semua track dan menutup `AudioContext` (cek `context.state === 'closed'`)
5. Tidak ada suara terpancar dari speaker (tidak ada koneksi ke `destination`)
6. Error handling: jika mic ditolak, function melempar error yang tertangkap tanpa crash

**Depends on:** A2.3

---

## B3.2 — Implementasi Autokorelasi

**Deskripsi Teknis:**

Implementasi algoritma *Normalized Time-Domain Autocorrelation* untuk ekstraksi fundamental frequency (f0) dari buffer audio domain waktu sesuai blueprint TECH-03. Fungsi menerima `Float32Array` (dari `AnalyserNode.getFloat32TimeDomainData()`) dan `sampleRate`, lalu menghitung fungsi autokorelasi `R(τ) = Σ x(t) · x(t + τ)` untuk rentang lag yang bersesuaian dengan frekuensi 50–800 Hz (mencakup spektrum suara anak 7-9 tahun). Hasil autokorelasi dinormalisasi dengan energi sinyal (`R(0)`) agar menghasilkan nilai antara -1 dan 1. Puncak tertinggi (argmax) dalam rentang lag valid dipilih sebagai periode sinyal, lalu dikonversi ke Hertz via `f0 = sampleRate / lag`. Jika tidak ada puncak yang signifikan (korelasi < threshold 0.3), kembalikan `null` (tidak terdeteksi). Fungsi diimplementasikan sebagai *pure function* tanpa side effects agar mudah di-test.

**File Target:**
- `src/utils/audio.js` (fungsi `autocorrelationPitch()` — update dengan normalisasi)

**Subtasks:**
- [ ] Implementasi `normalizedAutocorrelation(buffer, sampleRate)`: hitung `R(0)` sebagai energi total, loop lag dari `minLag` (sampleRate/800) hingga `maxLag` (sampleRate/50), hitung `R(τ)` dan normalisasi `R(τ) / R(0)`
- [ ] Cari argmax correlation dalam rentang lag, pastikan melewati local maxima di awal (lag kecil yang hanya merepresentasikan noise frekuensi tinggi)
- [ ] Terapkan threshold korelasi minimal 0.3: jika `maxCorrelation < 0.3` return `null` (bukan 0) untuk membedakan "no pitch" vs "pitch = 0 Hz"
- [ ] Konversi `bestLag` ke f0: `f0 = sampleRate / bestLag`
- [ ] Pastikan fungsi tidak memodifikasi buffer asli (immutable)
- [ ] Export fungsi sebagai named export

**Definition of Done:**
1. `normalizedAutocorrelation(sineBuffer, 44100)` dengan sinyal sine 440 Hz mengembalikan ~440 Hz (toleransi ±1 Hz)
2. `normalizedAutocorrelation(noiseBuffer, 44100)` mengembalikan `null` (korelasi < 0.3)
3. Rentang pencarian sesuai 50–800 Hz: lag minimum = `floor(44100/800) ≈ 55`, lag maksimum = `ceil(44100/50) = 882`
4. Nilai korelasi yang dikembalikan berada dalam rentang [-1, 1] setelah normalisasi
5. Fungsi tidak memiliki side effects (tidak mengubah state global, tidak memanggil DOM)

**Depends on:** B3.1

---

## B3.3 — Output f0 ke Modul Pemanggil

**Deskripsi Teknis:**

Membungkus pipeline autokorelasi ke dalam fungsi publik `extractPitch()` yang menjadi *single entry point* bagi komponen lain (VocaTone game loop, main.js orchestrator) untuk mendapatkan nilai f0 terkini. Fungsi ini mengambil data domain waktu dari `AnalyserNode.getFloat32TimeDomainData()` ke dalam `dataArray`, menghitung RMS untuk noise floor gate (jika RMS < 0.01 return 0 — sesuai AGENTS.md), lalu menjalankan autokorelasi. Output berupa angka f0 dalam Hz (jika terdeteksi) atau `null` (jika tidak terdeteksi / noise). Fungsi harus aman dipanggil berkali-kali dalam frame loop tanpa destruktif terhadap state audio. Sediakan juga `getPitchHz()` sebagai convenience getter dan pastikan konsumen (main.js, game module) dapat mengimpor dan memanggil `extractPitch()` tanpa setup tambahan.

**File Target:**
- `src/utils/audio.js` (fungsi `extractPitch()` dan `getPitchHz()`)

**Subtasks:**
- [ ] Implementasi `extractPitch()`: ambil data domain waktu via `analyserNode.getFloat32TimeDomainData(dataArray)`, hitung RMS, jika RMS < 0.01 return `null`, jika lolos panggil `normalizedAutocorrelation(dataArray, sampleRate)`
- [ ] Implementasi `getPitchHz()` sebagai wrapper yang return 0 untuk `null` (konsumen lama) — opsional
- [ ] Pastikan `extractPitch()` bisa dipanggil dari `requestAnimationFrame` loop tanpa overhead alokasi memori baru (pakai `dataArray` yang sudah ada)
- [ ] Export `extractPitch` sebagai named export
- [ ] Update `src/main.js` untuk menggunakan `extractPitch()` — jika return `null`, display "--" di `#pitch-display`; jika angka, display `"${Math.round(value)} Hz"`

**Definition of Done:**
1. `extractPitch()` mengembalikan `null` saat microphone non-aktif atau RMS < 0.01
2. `extractPitch()` mengembalikan angka > 0 dalam Hz saat ada suara valid
3. `extractPitch()` aman dipanggil 60 kali/detik tanpa memory leak (cek heap snapshot)
4. `#pitch-display` menampilkan "--" saat `null`, menampilkan angka Hz saat terdeteksi
5. Tidak ada error di console saat `extractPitch()` dipanggil sebelum `initAudioStream()`

**Depends on:** B3.2

---

## B4.1 — Hitung RMS dari Time Domain

**Deskripsi Teknis:**

Implementasi fungsi `computeRMS(buffer)` untuk menghitung *Root Mean Square* dari buffer audio domain waktu (`Float32Array`) sebagai indikator amplitudo volume suara sesuai blueprint TECH-03. Rumus RMS: `sqrt(Σ x[i]² / N)` untuk `i = 0..N-1`. Fungsi digunakan sebagai noise floor gate: jika RMS < 0.01, suara dianggap sebagai bising lingkungan dan autokorelasi dilewati untuk menghemat CPU perangkat low-end. Implementasi harus efisien — single pass loop tanpa alokasi array baru — dan beroperasi pada buffer apa pun (tidak harus `dataArray` global) agar bisa di-test dengan data sintetis.

**File Target:**
- `src/utils/audio.js` (fungsi `computeRMS()`)

**Subtasks:**
- [ ] Implementasi `computeRMS(buffer)` — iterasi setiap elemen, akumulasi `sum += buffer[i] * buffer[i]`, return `Math.sqrt(sum / buffer.length)`
- [ ] Pastikan fungsi handle `Float32Array` maupun `Array` biasa
- [ ] Pastikan fungsi handle buffer kosong (length 0) → return 0
- [ ] Gunakan loop `for` standar (bukan `reduce`) untuk performa maksimal di JS engine V8
- [ ] Export sebagai named export

**Definition of Done:**
1. `computeRMS([0.5, 0.5, 0.5, 0.5])` mengembalikan 0.5
2. `computeRMS(new Float32Array([0, 0, 0, 0]))` mengembalikan 0
3. `computeRMS([])` mengembalikan 0 (edge case)
4. Eksekusi RMS pada buffer 2048 sampel selesai dalam < 0.05ms (performance.now)
5. Fungsi tidak memodifikasi buffer input

**Depends on:** B3.1

---

## B4.2 — Integrasi Gate Logic

**Deskripsi Teknis:**

Integrasikan `computeRMS()` ke dalam pipeline `extractPitch()` sebagai *Noise Floor Gate* sesuai flowchart TECH-03. Sebelum menjalankan autokorelasi (yang komputasinya mahal), sistem mengecek RMS dari buffer domain waktu. Jika `RMS < threshold` (default `0.01`), fungsi langsung return `null` tanpa menyentuh algoritma autokorelasi sama sekali — menghemat CPU dan mencegah deteksi pitch palsu dari bising lingkungan (AC, kipas, suara latar). Threshold RMS disimpan sebagai konstanta `NOISE_FLOOR_RMS = 0.01` dan diexport agar bisa dikalibrasi per pengguna di masa depan (via IndexedDB profile). Logic gate ini adalah lapisan pertama dari dua lapisan filter: (1) Noise Floor Gate → (2) Autocorrelation Pitch.

**File Target:**
- `src/utils/audio.js` (integrasi di `extractPitch()`, konstanta `NOISE_FLOOR_RMS`)

**Subtasks:**
- [ ] Definisikan `export const NOISE_FLOOR_RMS = 0.01` sebagai threshold default
- [ ] Di `extractPitch()`, setelah `getFloat32TimeDomainData()`, panggil `computeRMS(dataArray)` — jika `< NOISE_FLOOR_RMS`, return `null` segera tanpa autokorelasi
- [ ] Pastikan return early tidak menyebabkan memory leak (buffer tetap reusable untuk frame berikutnya)
- [ ] Export konstanta agar bisa di-override oleh profile user dari IndexedDB (persiapan A2 / GateKeeper)
- [ ] Update konsumen (main.js) untuk tidak memperbarui UI pitch saat return `null` (display "--")

**Definition of Done:**
1. Saat microphone mendeteksi hanya noise (tiup, diam), `extractPitch()` return `null` tanpa menjalankan loop autokorelasi
2. Saat suara jelas (vokal A/I), RMS > 0.01 dan autokorelasi berjalan normal
3. `NOISE_FLOOR_RMS` dapat diimpor dan diubah nilainya dari module lain
4. Performance test: panggil `extractPitch()` 1000 kali dengan noise → waktu eksekusi total < 5ms (karena return early tanpa autokorelasi)
5. Tidak ada error atau warning di console saat gate aktif

**Depends on:** B4.1

---

## B5.1 — Setup Canvas + Game Loop

**Deskripsi Teknis:**

Inisialisasi Canvas 2D untuk rendering game VocaTone (single-game placeholder) sesuai blueprint GAME-01. Buat elemen `<canvas id="game-canvas">` di index.html atau复用 `#overlay-canvas` untuk mode VocaTone (audio-only, tanpa kamera). Implementasi game loop via `requestAnimationFrame` dengan throttle 15-20 FPS (sama seperti TECH-04 untuk konsistensi performa). Game loop membedakan 3 fase: (1) **Naik** — suara terdeteksi (pitch > 0), objek bergerak naik (Y berkurang), (2) **Stabil/Hover** — f0 stabil di rentang target, objek melayang di ketinggian, (3) **Turun** — tidak ada suara (null/0), objek turun akibat gravitasi simulasi (Y bertambah). Canvas di-resize mengikuti container (aspect ratio 1:1 atau 9:16 portrait). Background di-clear setiap frame dengan warna solid (default #F8FAFC atau sesuai binary feedback).

**File Target:**
- `index.html` (tambah `<canvas id="game-canvas">` di section camera-view atau standalone)
- `src/components/game.js` (module baru: init, game loop, state update, render)
- `src/main.js` (orchestrasi: start/stop game loop via GateKeeper state)

**Subtasks:**
- [ ] Buat file `src/components/game.js` dengan class `VocaToneGame`
- [ ] Inisialisasi Canvas 2D: ambil elemen `<canvas>`, set `width/height` sesuai container
- [ ] Implementasi `startLoop()`: `requestAnimationFrame(loop)` dengan throttle timestamp — skip jika `now - lastFrame < 50ms` (20 FPS)
- [ ] Implementasi `stopLoop()`: cancelAnimationFrame, reset state
- [ ] Di dalam loop: clear canvas, update posisi Y objek berdasarkan input pitch, render objek placeholder (rectangle/simple shape)
- [ ] Logika pergerakan: `y -= riseSpeed` jika pitch > 0, `y += gravity` jika pitch null/0, `y -= hoverOffset` jika stabil (sesuai durasi)
- [ ] Clamp posisi Y agar tidak keluar bounds canvas (0 hingga canvas.height)
- [ ] Export `VocaToneGame` untuk digunakan di main.js

**Definition of Done:**
1. Canvas muncul di halaman dengan ukuran sesuai container (aspect ratio terjaga)
2. Game loop berjalan pada ~20 FPS (diverifikasi via `performance.now` di DevTools)
3. Objek placeholder (kotak) bergerak naik saat ada input pitch > 0
4. Objek turun perlahan (gravitasi) saat tidak ada input suara
5. Objek tidak keluar dari batas atas/bawah canvas
6. `stopLoop()` menghentikan semua animasi dan membersihkan resource
7. Tidak ada memory leak — heap size stabil setelah 60 detik running

**Depends on:** B4.2

---

## B5.2 — Fisika Objek: Naik / Stabil / Turun

**Deskripsi Teknis:**

Implementasi 3 state pergerakan vertikal objek placeholder di Canvas sesuai mekanika GAME-01. Sistem mengubah posisi Y objek berdasarkan input audio dari `extractPitch()`:

1. **Naik (Rising):** Saat `extractPitch()` mengembalikan nilai > 0 (suara terdeteksi), objek bergerak naik secara konstan — koordinat Y berkurang dengan kecepatan `riseSpeed = 2 px/frame` (dapat dikalibrasi).
2. **Stabil / Hovering:** Jika f0 konsisten dalam rentang target `[f_min, f_max]` selama ≥ 500ms (toleransi variasi ±10%), objek melayang di posisi Y saat ini tanpa perubahan signifikan — memberikan reward visual stabilitas.
3. **Turun (Falling):** Saat `extractPitch()` return null (tidak ada suara / noise / RMS < 0.01), objek turun akibat gravitasi simulasi — koordinat Y bertambah dengan percepatan `gravity = 1.5 px/frame²` (semakin lama diam semakin cepat turun, capped di `maxFallSpeed = 8 px/frame`).

Parameter kecepatan didefinisikan sebagai konstanta di awal module agar mudah dikalibrasi. Posisi Y di-clamp di `[0, canvas.height - objectSize]`.

**File Target:**
- `src/components/game.js` (class `VocaToneGame` — method `updatePhysics()`)

**Subtasks:**
- [ ] Implementasi method `updatePhysics(pitchHz)`: tentukan state berdasarkan pitch, update `velocityY` dan `positionY`
- [ ] State **Naik**: jika `pitchHz > 0`, set `velocityY = -riseSpeed` (negatif = naik), reset `fallTimer = 0`
- [ ] State **Stabil**: jika `pitchHz` dalam `[f_min, f_max]` selama > 500ms, set `velocityY = 0` (hover), increment `stabilityTimer`
- [ ] State **Turun**: jika `pitchHz === null`, increment `fallTimer`, hitung `velocityY = min(gravity * fallTimer, maxFallSpeed)`, reset `stabilityTimer`
- [ ] Clamp `positionY` agar tidak < 0 atau > `canvas.height - objectSize`
- [ ] Definisikan konstanta: `RISE_SPEED`, `GRAVITY`, `MAX_FALL_SPEED`, `STABLE_DURATION_MS`, `FREQ_TOLERANCE`

**Definition of Done:**
1. Objek bergerak naik (Y berkurang) secara smooth saat pitch > 0 terdeteksi
2. Objek berhenti naik dan melayang saat f0 stabil di rentang target ≥ 500ms
3. Objek turun (Y bertambah) dengan percepatan saat tidak ada input suara
4. Kecepatan turun dibatasi oleh `maxFallSpeed` (tidak infinite acceleration)
5. Objek tidak menembus batas atas (Y < 0) atau batas bawah (Y > canvas.height)
6. Parameter fisika dapat diubah tanpa mengubah logika inti

**Depends on:** B5.1

---

## B5.3 — Render Objek + HUD

**Deskripsi Teknis:**

Render objek placeholder dan HUD (*Heads-Up Display*) di Canvas 2D untuk VocaTone single-game sesuai GAME-01. Objek placeholder berupa rectangle solid berwarna `primary (#0D47A1)` ukuran 40x40 px yang posisi Y-nya dikendalikan oleh `updatePhysics()`. HUD menampilkan informasi real-time yang di-*overlay* di Canvas: frekuensi f0 dalam Hz (pojok kiri atas), status pergerakan (Naik/Stabil/Turun — pojok kanan atas), dan indikator stabilitas (progress bar atau lingkaran di pojok kanan bawah). Gunakan `requestAnimationFrame` loop yang sudah ada di B5.1; pisahkan method `render(ctx)` dari `update(pitch)`. Background Canvas diberi warna solid sesuai binary feedback state (default #F8FAFC, berubah menjadi #22C55E saat stabil, #EAB308 saat shrill).

**File Target:**
- `src/components/game.js` (method `render()`, `drawHUD()`, `drawObject()`)
- `src/styles/main.css` (styling canvas wrapper jika perlu)

**Subtasks:**
- [ ] Implementasi `drawObject(ctx)`: gambarkan rectangle 40x40 px di posisi `(canvas.width/2 - 20, positionY)` dengan fill `#0D47A1` dan stroke `#FFFFFF` 2px
- [ ] Implementasi `drawHUD(ctx, pitchHz, state)`: render teks f0 kiri atas (`font: 'bold 16px Inter'`, `fillStyle: '#333'`), status kanan atas ("Naik" / "Stabil" / "Turun"), progress bar stabilitas di kanan bawah
- [ ] Implementasi `render(ctx)`: panggil `clearRect` seluruh canvas, set background sesuai `bgColor` state, gambar objek, gambar HUD
- [ ] Update `backgroundFill` berdasarkan state: suara naik → `#F8FAFC`, stabil → `#22C55E` (opacity 20%), turun → `#F8FAFC`
- [ ] Pastikan teks HUD terbaca dengan kontras cukup (dark text on light background)
- [ ] Jangan render HUD jika game loop belum start (guard clause)

**Definition of Done:**
1. Rectangle biru #0D47A1 muncul di Canvas dan bergerak sesuai fisika B5.2
2. Teks f0 ter-update real-time di pojok kiri atas Canvas (contoh: "245 Hz")
3. Label status "Naik" / "Stabil" / "Turun" muncul di pojok kanan atas
4. Background Canvas berubah warna sesuai state suara (hijau redup saat stabil)
5. HUD tidak berkedip/bergetar (posisi fixed, update per frame tanpa layout shift)
6. Semua teks menggunakan font Inter dengan ukuran readable (min 14px)

**Depends on:** B5.2

---

## C6.1 — Setup Stream Kamera Depan

**Deskripsi Teknis:**

Akses kamera depan perangkat dengan resolusi square 360p/480p via `navigator.mediaDevices.getUserMedia()` sesuai blueprint TECH-04. Inisialisasi `MediaPipe FaceMesh` dengan `locateFile` pointing ke `/mediapipe/` untuk load WASM + model graph secara offline dari Cache Storage. Setup `@mediapipe/camera_utils Camera` utility untuk streaming frame dari `<video>` element ke FaceMesh setiap frame. Konfigurasi FaceMesh: `maxNumFaces: 1`, `refineLandmarks: true`, `minDetectionConfidence: 0.5`, `minTrackingConfidence: 0.5`. Frame hasil deteksi dilempar ke callback `onResults()` yang akan diintegrasikan dengan pipeline LAR. Fallback resolusi: jika 480p tidak support, turun ke 360p. Video stream ditampilkan di `<video id="camera-feed">` sebagai mirror image (CSS `transform: scaleX(-1)`).

**File Target:**
- `src/utils/vision.js` (fungsi `initCamera()`)
- `index.html` (elemen `<video id="camera-feed">`)
- `public/mediapipe/` (WASM, JS loader, model graph files)

**Subtasks:**
- [ ] Import `FaceMesh` dari `@mediapipe/face_mesh` dan `Camera` dari `@mediapipe/camera_utils`
- [ ] Implementasi `initCamera(videoElement, onResults)`: buat instance `FaceMesh` dengan `locateFile`, set options, pasang `onResults` callback, buat instance `Camera` dengan `width: 480, height: 480`, return camera instance
- [ ] Pastikan `locateFile` mengarah ke `/mediapipe/` (folder public) agar WASM termuat dari Cache Storage (offline)
- [ ] Tambahkan CSS `transform: scaleX(-1)` pada `#camera-feed` untuk mirror kamera depan
- [ ] Handle error `getUserMedia` (izin kamera ditolak) → tampilkan pesan error di UI
- [ ] Export fungsi `initCamera`

**Definition of Done:**
1. Kamera depan aktif dan stream muncul di `<video>` element
2. FaceMesh WASM + model termuat tanpa error (cek DevTools Network tab — status 200 dari Cache)
3. `onResults` callback terpanggil setiap kali FaceMesh selesai memproses frame
4. Video tampil mirror (seperti cermin) — diverifikasi dengan gerakan tangan
5. Jika izin kamera ditolak, UI menampilkan pesan error informatif tanpa crash
6. Resolusi stream square (diverifikasi via `video.videoWidth === video.videoHeight`)

**Depends on:** A2.2

---

## C6.2 — Ekstraksi 4 Landmark Bibir

**Deskripsi Teknis:**

Parse hasil deteksi `FaceMesh` dari `onResults()` callback untuk mengekstrak 4 landmark bibir inti sesuai blueprint TECH-01 dan AGENTS.md:

| Nama | Indeks | Deskripsi |
|---|---|---|
| `P_top` | 13 | Titik tengah bibir atas |
| `P_bottom` | 14 | Titik tengah bibir bawah |
| `P_left` | 78 | Sudut kiri bibir |
| `P_right` | 308 | Sudut kanan bibir |

Setiap landmark memiliki properti `{x, y, z}` dalam koordinat normalized [0,1]. Output berupa objek `{top, bottom, left, right}` yang siap dikonsumsi oleh fungsi Euclidean distance dan LAR. Ekstraksi dilakukan di dalam callback `onResults(results.multiFaceLandmarks[0])` dengan guard clause jika `results.multiFaceLandmarks` kosong (no face detected → return early).

**File Target:**
- `src/utils/vision.js` (constant `FACEMESH_LIPS`, parsing di callback)

**Subtasks:**
- [ ] Definisikan konstan `FACEMESH_LIPS = { top: 13, bottom: 14, left: 78, right: 308 }` sebagai named export
- [ ] Di callback `onResults`, akses `landmarks[index]` untuk masing-masing titik
- [ ] Jika `results.multiFaceLandmarks` kosong atau undefined, return early tanpa proses
- [ ] Pastikan koordinat yang diekstrak adalah normalized (0-1) agar resolution-independent
- [ ] Export `FACEMESH_LIPS` untuk keperluan testing dan dokumentasi

**Definition of Done:**
1. `FACEMESH_LIPS.top === 13`, `FACEMESH_LIPS.bottom === 14`, `FACEMESH_LIPS.left === 78`, `FACEMESH_LIPS.right === 308`
2. Objek `{ top: {x,y,z}, bottom: {x,y,z}, left: {x,y,z}, right: {x,y,z} }` terekstrak dari setiap frame valid
3. Jika wajah tidak terdeteksi, callback tidak melempar error (guard clause)
4. Nilai koordinat x,y dalam rentang [0,1] (normalized)

**Depends on:** C6.1

---

## C6.3 — Throttling Frame Rate

**Deskripsi Teknis:**

Implementasi throttling frame rate untuk pipeline FaceMesh agar tidak membebani CPU/GPU perangkat low-end sesuai blueprint TECH-04. Target frame rate 15-20 FPS dengan dua mekanisme: (1) **Time-Debounce**: variabel `lastFrameTime` dicatat, frame berikutnya dieksekusi hanya jika `now - lastFrameTime >= FRAME_INTERVAL` (≈50-66ms), (2) **Frame-Skipping**: hitung latency pemrosesan setiap frame, jika latency ≥ 60ms, skip frame berikutnya untuk mencegah memory pressure. Throttling diterapkan di `onResults` callback (sebelum parsing landmark) dan di `Camera` `onFrame` (sebelum `faceMesh.send()`). Frame rate ideal: 15 FPS untuk perangkat low-end, 20 FPS untuk perangkat menengah.

**File Target:**
- `src/utils/vision.js` (fungsi `throttleFrame()`, konstanta `TARGET_FPS`, `FRAME_INTERVAL`)

**Subtasks:**
- [ ] Definisikan `TARGET_FPS = 15` dan `FRAME_INTERVAL = 1000 / TARGET_FPS` (~66.67ms)
- [ ] Implementasi fungsi `throttleFrame(timestamp)`: jika `timestamp - lastFrameTime < FRAME_INTERVAL` return false, jika lolos update `lastFrameTime` dan return true
- [ ] Panggil `throttleFrame(performance.now())` di awal `onResults` callback — jika false, return early tanpa parsing landmark
- [ ] Implementasi frame-skipping: variabel `skipNextFrame = false`, jika latency > 60ms set `skipNextFrame = true`, reset setelah satu frame di-skip
- [ ] Pastikan throttle tidak menghalangi frame pertama (inisialisasi)

**Definition of Done:**
1. Frame rate FaceMesh tidak melebihi 20 FPS (diverifikasi via hitungan detik / performance.now)
2. `throttleFrame` me-return false untuk panggilan dalam interval < FRAME_INTERVAL
3. Frame-skipping aktif jika latency deteksi > 60ms
4. Perangkat low-end (simulasi CPU throttle) tetap responsif tanpa lag accumulating

**Depends on:** C6.2

---

## C7.1 — Fungsi Jarak Euclidean

**Deskripsi Teknis:**

Implementasi pure function `computeEuclideanDistance(p, q)` untuk menghitung jarak Euclidean antara dua titik landmark 3D sesuai rumus blueprint TECH-01:

```
d(p, q) = √((p.x - q.x)² + (p.y - q.y)² + (p.z - q.z)²)
```

Fungsi menerima dua objek `{x, y, z}` dengan koordinat number, mengembalikan float ≥ 0. Implementasi dalam 2D (x, y) sudah cukup untuk perhitungan LAR — komponen z disertakan untuk akurasi. Fungsi harus *pure*: tidak ada side effects, tidak memodifikasi input, dapat di-test secara unit dengan nilai presisi tertentu.

**File Target:**
- `src/utils/vision.js` (fungsi `computeEuclideanDistance()`)

**Subtasks:**
- [ ] Implementasi `computeEuclideanDistance(p, q)` — hitung selisih kuadrat di setiap sumbu (x, y, z), jumlahkan, return `Math.sqrt(sum)`
- [ ] Tambahkan guard clause jika p atau q null/undefined → return 0
- [ ] Export sebagai named export

**Definition of Done:**
1. `computeEuclideanDistance({x:0,y:0,z:0}, {x:3,y:4,z:0})` mengembalikan 5 (triple Pythagoras)
2. `computeEuclideanDistance({x:1,y:1,z:1}, {x:1,y:1,z:1})` mengembalikan 0 (titik identik)
3. Fungsi tidak memodifikasi objek p atau q (immutable)
4. Fungsi menghasilkan output yang konsisten untuk input yang sama (deterministik)

**Depends on:** C6.2

---

## C7.2 — Fungsi Lip Aspect Ratio

**Deskripsi Teknis:**

Implementasi pure function `computeLipAspectRatio(landmarks)` untuk menghitung rasio bukaan mulut sesuai blueprint TECH-01:

```
LAR = d(P_top, P_bottom) / d(P_left, P_right)
```

Fungsi menerima array 468 landmark FaceMesh, mengekstrak 4 indeks dari `FACEMESH_LIPS` (13, 14, 78, 308), menghitung jarak vertikal (top→bottom) dan horizontal (left→right) via `computeEuclideanDistance()`, lalu membagi keduanya. Guard clause: jika `horizontal === 0` return 0 (mencegah division by zero). Nilai LAR ≥ threshold menandakan mulut terbuka (vokal A), nilai LAR kecil menandakan mulut tertutup/meringis (vokal I).

**File Target:**
- `src/utils/vision.js` (fungsi `computeLipAspectRatio()`)

**Subtasks:**
- [ ] Implementasi `computeLipAspectRatio(landmarks)`: ambil `landmarks[13]`, `landmarks[14]`, `landmarks[78]`, `landmarks[308]` dari array
- [ ] Hitung `vertical = computeEuclideanDistance(top, bottom)`
- [ ] Hitung `horizontal = computeEuclideanDistance(left, right)`
- [ ] Return `vertical / horizontal` (guard jika horizontal === 0 return 0)
- [ ] Export sebagai named export

**Definition of Done:**
1. `computeLipAspectRatio(mockLandmarks)` dengan mulut terbuka lebar mengembalikan nilai > 0.5
2. `computeLipAspectRatio(mockLandmarks)` dengan mulut tertutup mengembalikan nilai < 0.2
3. Tidak ada division by zero (horizontal = 0 → return 0)
4. Fungsi pure: output hanya bergantung pada input landmarks

**Depends on:** C7.1

---

## C8.1 — Tentukan Threshold LAR

**Deskripsi Teknis:**

Tetapkan konstanta threshold LAR untuk validasi vokal kontras A dan I sesuai blueprint GAME-02 dan 50_PERCENT_OF_MVP.md. Dua ambang batas:

| Threshold | Nilai Default | Deskripsi |
|---|---|---|
| `lar_threshold.high` | 0.5 | LAR ≥ high → vokal A (mulut menganga) |
| `lar_threshold.low` | 0.2 | LAR ≤ low → vokal I (bibir melebar) |

Nilai default ditentukan dari kalibrasi manual yang dapat di-override oleh profil pengguna dari IndexedDB (TECH-02 — `user_profile.lar_threshold`). Objek `lar_threshold` memiliki struktur `{ high: Number, low: Number }`. Disimpan sebagai konstanta di module config/constants dan diexport untuk digunakan oleh GateKeeper dan validasi.

**File Target:**
- `src/utils/constants.js` (file baru: objek `lar_threshold`)
- `src/utils/vision.js` (import threshold untuk komparasi LAR)
- `src/utils/db.js` (override threshold dari profil IndexedDB)

**Subtasks:**
- [ ] Buat file `src/utils/constants.js` dengan `export const lar_threshold = { high: 0.5, low: 0.2 }`
- [ ] Tambahkan `export const f_min = 150` dan `export const f_max = 350` (rentang frekuensi target sesuai MVP)
- [ ] Pastikan semua module mengimpor threshold dari satu source of truth (`constants.js`)
- [ ] Siapkan logic override: jika `getProfile(userId)` mengembalikan `lar_threshold`, gunakan nilai tersebut

**Definition of Done:**
1. `lar_threshold.high` terdefinisi dan dapat diimpor dari `constants.js`
2. `lar_threshold.low` terdefinisi dan dapat diimpor dari `constants.js`
3. Nilai default high = 0.5, low = 0.2
4. GateKeeper dapat mengakses threshold untuk decision logic
5. Profile dari IndexedDB dapat meng-override nilai default

**Depends on:** C7.2

---

## C8.2 — Validasi /a/

**Deskripsi Teknis:**

Implementasi logika validasi untuk vokal /a/ sesuai blueprint GAME-02 dan 50_PERCENT_OF_MVP.md. Jika LAR actual ≥ `lar_threshold.high`, sistem: (1) mengirim sinyal ke GateKeeper untuk transisi `LAR_CHECK → MIC_OPEN` (buka gerbang audio), (2) menampilkan indikator visual huruf "A" besar di tengah layar (font Montserrat bold 72pt warna hitam #000000 — sesuai UX-02), (3) mengaktifkan audio pipeline (initAudioStream + extractPitch). Selama mode /a/, LAR tetap dimonitor; jika turun di bawah threshold, instant fallback (C9). Jika f0 dalam rentang `[f_min, f_max]` dan stabil, tampilkan binary feedback hijau (#22C55E).

**File Target:**
- `src/main.js` (logic gate A: `if (lar >= lar_threshold.high)`)
- `src/utils/gatekeeper.js` (transisi ke MIC_OPEN dengan mode 'A')
- `index.html` (elemen `#vowel-indicator` untuk display huruf A)

**Subtasks:**
- [ ] Di `onFaceLandmarks`, setelah hitung LAR, bandingkan dengan `lar_threshold.high`
- [ ] Jika `LAR >= high`, panggil `gatekeeper.transitionTo('MIC_OPEN', { mode: 'A' })`
- [ ] Tampilkan indikator "A" di tengah layar (font bold 72pt, warna #000000) via elemen atau overlay canvas
- [ ] Aktifkan audio pipeline hanya jika state `MIC_OPEN` dan mode 'A'
- [ ] Jika LAR turun di bawah `high` saat mode A, trigger fallback ke IDLE

**Definition of Done:**
1. Saat mulut menganga lebar (LAR ≥ 0.5), indikator "A" muncul di layar
2. Audio gate terbuka dan microphone aktif
3. Pitch (f0) mulai terdeteksi dan ditampilkan di HUD
4. Jika mulut tertutup, mode A berhenti dan mic mati

**Depends on:** C8.1

---

## C8.3 — Validasi /i/

**Deskripsi Teknis:**

Implementasi logika validasi untuk vokal /i/ sesuai blueprint GAME-02 dan 50_PERCENT_OF_MVP.md. Jika LAR actual ≤ `lar_threshold.low`, sistem: (1) mengirim sinyal ke GateKeeper untuk transisi `LAR_CHECK → MIC_OPEN` (buka gerbang audio), (2) menampilkan indikator visual huruf "I" besar di tengah layar (font Montserrat bold 72pt warna hitam #000000), (3) mengaktifkan audio pipeline. Berbeda dengan /a/ yang mulut terbuka lebar, /i/ dicapai dengan meringis (bibir melebar horizontal). Sama seperti /a/, LAR tetap dimonitor; jika naik di atas `lar_threshold.low` (mulut terbuka), instant fallback.

**File Target:**
- `src/main.js` (logic gate I: `if (lar <= lar_threshold.low)`)
- `src/utils/gatekeeper.js` (transisi ke MIC_OPEN dengan mode 'I')
- `index.html` (elemen `#vowel-indicator` untuk display huruf I)

**Subtasks:**
- [ ] Di `onFaceLandmarks`, setelah hitung LAR, bandingkan dengan `lar_threshold.low`
- [ ] Jika `LAR <= low`, panggil `gatekeeper.transitionTo('MIC_OPEN', { mode: 'I' })`
- [ ] Tampilkan indikator "I" di tengah layar (font bold 72pt, warna #000000)
- [ ] Aktifkan audio pipeline hanya jika state `MIC_OPEN` dan mode 'I'
- [ ] Jika LAR naik di atas `low` saat mode I, trigger fallback ke IDLE

**Definition of Done:**
1. Saat bibir melebar horizontal (LAR ≤ 0.2), indikator "I" muncul di layar
2. Audio gate terbuka dan microphone aktif
3. Pitch (f0) mulai terdeteksi dan ditampilkan di HUD
4. Jika LAR naik (mulut terbuka), mode I berhenti dan mic mati

**Depends on:** C8.1

---

## C9.1 — Monitor LAR Loop

**Deskripsi Teknis:**

Implementasi monitoring loop LAR yang berjalan terus-menerus selama sesi aktif, bahkan saat mic sudah terbuka (state `MIC_OPEN` / `SESSION_ACTIVE`). Setiap frame dari FaceMesh, sistem menghitung LAR dan membandingkan dengan threshold yang sesuai dengan mode vokal saat ini (A: `lar_threshold.high`, I: `lar_threshold.low`). Jika LAR keluar dari batas threshold, sistem harus segera menutup mic — ini adalah *Instant Fallback* sesuai TECH-01. Monitoring dilakukan di `onFaceLandmarks` callback utama (main.js) dengan pengecekan: jika `sessionActive = true` dan `audioInitialized = true` dan `lar` tidak memenuhi threshold mode saat ini → panggil `closeAudioStream()` + `gatekeeper.reset()`. Gunakan variabel `currentMode` ('A' / 'I') untuk menentukan threshold mana yang dipakai.

**File Target:**
- `src/main.js` (monitoring LAR loop di `onFaceLandmarks`)
- `src/utils/gatekeeper.js` (method `getMode()` untuk mengetahui mode vokal aktif)

**Subtasks:**
- [ ] Di `onFaceLandmarks`, setelah hitung LAR, tambahkan pengecekan khusus saat `audioInitialized === true`
- [ ] Jika `currentMode === 'A'`, threshold pakai `lar_threshold.high` — trigger jika LAR turun di bawahnya
- [ ] Jika `currentMode === 'I'`, threshold pakai `lar_threshold.low` — trigger jika LAR naik di atasnya
- [ ] Jika kondisi fallback terpenuhi: (1) `closeAudioStream()`, (2) `gatekeeper.reset()`, (3) set `audioInitialized = false`
- [ ] Jangan trigger fallback untuk fluktuasi minor — gunakan debounce 300ms (LAR harus out-of-threshold selama 300ms)
- [ ] Log ke console untuk debugging: `[LAR Monitor] Fallback triggered: LAR=${lar}, threshold=${threshold}`

**Definition of Done:**
1. Saat mic aktif (mode A) dan LAR turun di bawah `high` > 300ms, mic mati dan state reset
2. Saat mic aktif (mode I) dan LAR naik di atas `low` > 300ms, mic mati dan state reset
3. Fluktuasi singkat (< 300ms) tidak memicu false positive fallback
4. Console log mencatat setiap fallback yang terjadi

**Depends on:** C8.3

---

## C9.2 — Reset State + Visual Error

**Deskripsi Teknis:**

Setelah fallback terpicu (C9.1), sistem harus menjalankan reset state dan menampilkan visual error sesuai blueprint GAME-02 dan TECH-01. Urutan: (1) tutup AudioContext dan hentikan semua track mic, (2) transisi state machine dari `MIC_OPEN`/`SESSION_ACTIVE` ke `IDLE` atau `CAMERA_ACTIVE`, (3) tampilkan overlay error merah (#EF4444) dengan teks peringatan sesuai mode: "Mouth closed — Open your mouth wide for A" (jika mode A) atau "Mouth open — Narrow your lips for I" (jika mode I), (4) sembunyikan indikator vokal (huruf A/I), (5) setelah 2 detik atau saat LAR kembali valid, sembunyikan error screen dan kembali ke pipeline visual. Flash merah menggunakan CSS transition opacity 500ms agar tidak menyilaukan.

**File Target:**
- `src/main.js` (fungsi `triggerFallback()`, `showError()`, `resetSession()`)
- `index.html` (elemen `#error-screen` dan `#error-message` dinamis)
- `src/styles/main.css` (transisi CSS untuk error screen)

**Subtasks:**
- [ ] Implementasi `triggerFallback(mode)`: atur teks pesan error sesuai mode, panggil `showError(true)`, `closeAudioStream()`, `gatekeeper.reset()`
- [ ] Pesan error: mode A → "Open your mouth wide for A", mode I → "Narrow your lips for I"
- [ ] Tampilkan `#error-screen` dengan background merah #EF4444 dan teks putih kontras
- [ ] Setelah fallback, kamera tetap hidup (FaceMesh tetap monitoring LAR)
- [ ] Jika LAR kembali valid, sembunyikan error screen otomatis setelah 1 detik stabil
- [ ] CSS: `#error-screen { transition: opacity 500ms ease; }`

**Definition of Done:**
1. Error screen merah (#EF4444) muncul saat fallback terpicu
2. Teks error spesifik sesuai mode (A/I)
3. Audio stream berhenti (mic mati) — AudioContext.state === 'closed'
4. Error screen hilang otomatis saat LAR kembali valid selama 1 detik
5. Transisi opacity 500ms halus (tidak abrupt show/hide)

**Depends on:** C9.1

---

## D10.1 — Flash Hijau (Success)

**Deskripsi Teknis:**

Implementasi binary visual feedback hijau (#22C55E) sebagai indikator keberhasilan sesuai UX-02 dan VISUAL-01. Flash hijau diaktifkan saat dua kondisi terpenuhi: (1) LAR valid sesuai threshold (mode A atau I), (2) f0 stabil dalam rentang `[f_min, f_max]` (150-350 Hz). Flash berupa overlay semi-transparan hijau di atas canvas dengan `opacity: 20-30%` yang muncul selama 500-800ms dengan CSS transition `opacity 300ms ease-in-out`. Overlay hijau menandakan artikulasi + fonasi benar. Implementasi menggunakan elemen `<div id="flash-overlay">` yang di-toggle class `flash-success` — atau langsung mewarnai background Canvas di frame render game.

**File Target:**
- `index.html` (elemen `#flash-overlay` atau modifikasi `#feedback-panel`)
- `src/styles/main.css` (class `.flash-success` dengan background #22C55E + transisi)
- `src/main.js` (trigger flash berdasarkan kondisi LAR + f0)

**Subtasks:**
- [ ] Buat elemen `<div id="flash-overlay" class="fixed inset-0 pointer-events-none z-40 opacity-0 transition-opacity duration-300"></div>` di index.html
- [ ] CSS: `.flash-success { background-color: #22C55E; opacity: 0.25; }` + transisi
- [ ] Di main.js, tentukan kondisi: `larValid === true && f0Stable === true && f0InRange === true` → trigger flash hijau
- [ ] Flash bertahan 500ms lalu fade out (setTimeout hapus class setelah 500ms)
- [ ] Jangan trigger flash baru jika flash sebelumnya masih aktif (debounce/guard)

**Definition of Done:**
1. Overlay hijau (#22C55E) muncul selama 500ms saat LAR valid + f0 dalam rentang
2. Overlay menggunakan opacity 25% sehingga elemen di bawahnya tetap terlihat
3. Fade in/out smooth via CSS transition (300ms)
4. Tidak ada flash flicker (guard clause mencegah trigger berulang)
5. Overlay tidak menghalangi interaksi (pointer-events: none)

**Depends on:** C8.3

---

## D10.2 — Flash Kuning (Hypernasal)

**Deskripsi Teknis:**

Implementasi binary visual feedback kuning (#EAB308) sebagai indikator peringatan *hypernasal* / shrill sesuai UX-02 dan 50_PERCENT_OF_MVP.md. Flash kuning diaktifkan saat LAR valid (bentuk mulut benar) tetapi f0 > f_max (350 Hz) — suara terlalu melengking. Berbeda dengan flash hijau, flash kuning bersifat persist selama kondisi shrill masih aktif (bukan sekali flash). Overlay kuning dengan `opacity: 20%` muncul di atas canvas dan bertahan sampai f0 turun ke rentang normal atau LAR invalid. Jika f0 turun kembali ke rentang normal, overlay kuning diganti dengan hijau atau dihapus. Microphone tetap aktif selama mode shrill (audio gate tidak ditutup).

**File Target:**
- `index.html` (elemen `#flash-overlay` — reuse dari D10.1)
- `src/styles/main.css` (class `.flash-warning` dengan background #EAB308)
- `src/main.js` (trigger flash kuning: `larValid && f0 > f_max`)

**Subtasks:**
- [ ] CSS: `.flash-warning { background-color: #EAB308; opacity: 0.2; }` + transisi
- [ ] Di main.js, kondisi: `larValid === true && f0 > f_max` → set overlay ke kuning
- [ ] Flash kuning bersifat *continuous*: overlay tetap kuning selama f0 > f_max (jangan setTimeout)
- [ ] Jika f0 turun ke ≤ f_max, hapus class `flash-warning` (kembali ke transparan atau hijau jika stabil)
- [ ] Pastikan kuning tidak tumpang tindih dengan hijau (hanya satu warna aktif dalam satu waktu)

**Definition of Done:**
1. Overlay kuning (#EAB308) muncul terus-menerus saat f0 > 350 Hz
2. Overlay menggunakan opacity 20%
3. Overlay kuning otomatis hilang saat f0 turun ke ≤ 350 Hz
4. Microphone tetap aktif selama mode shrill (audio tidak dihentikan)
5. Transisi warna smooth antara kuning ↔ transparan/hijau (300ms)

**Depends on:** D10.1

---

## D10.3 — Flash Merah (Error/Idle)

**Deskripsi Teknis:**

Implementasi binary visual feedback merah (#EF4444) sebagai indikator error / invalid sesuai UX-02 dan TECH-01. Flash merah diaktifkan saat salah satu kondisi: (1) tidak ada wajah terdeteksi (no face), (2) LAR invalid (tidak memenuhi threshold A atau I), (3) low amplitude (RMS < 0.01) setelah mic aktif — di handle oleh C9.2. Flash merah bersifat *continuous* selama kondisi error masih ada, mirip D10.2. Overlay merah dengan `opacity: 20%` di atas canvas. Jika kondisi error terjadi saat sesi aktif (mid-session), flash merah disertai dengan tampilan `#error-screen` (C9.2) yang lebih tegas. Untuk kondisi idle (no face sejak awal), overlay merah redup saja tanpa error screen.

**File Target:**
- `index.html` (elemen `#flash-overlay` — reuse)
- `src/styles/main.css` (class `.flash-error` dengan background #EF4444)
- `src/main.js` (trigger flash merah: `!larValid || noFace || lowAmplitude`)

**Subtasks:**
- [ ] CSS: `.flash-error { background-color: #EF4444; opacity: 0.2; }` + transisi
- [ ] Di main.js, kondisi: `larValid === false || noFace === true` → set overlay ke merah
- [ ] Flash merah bersifat continuous selama kondisi error masih true
- [ ] Jika kondisi kembali normal (wajah terdeteksi + LAR valid), hapus class `flash-error`
- [ ] Bedakan flash merah idle (no face, opacity 15%) vs flash merah error (LAR invalid, opacity 25%)
- [ ] Pastikan prioritas warna: merah > kuning > hijau (error override warning override success)

**Definition of Done:**
1. Overlay merah (#EF4444) muncul saat tidak ada wajah terdeteksi atau LAR invalid
2. Opasitas berbeda: 15% untuk no face, 25% untuk LAR invalid
3. Overlay merah otomatis hilang saat wajah terdeteksi dan LAR valid
4. Prioritas warna benar: merah override kuning dan hijau
5. Saat mid-session fallback, error screen (C9.2) tampil bersama flash merah

**Depends on:** D10.2

---

## D11.1 — Render Oval Transparan

**Deskripsi Teknis:**

Render mouth silhouette berupa bentuk oval transparan di canvas overlay sebagai panduan kalibrasi posisi wajah sesuai blueprint VISUAL-02. Oval digambar di `#overlay-canvas` dengan properti: stroke `#FFFFFF` (putih), stroke width 2px, opacity 30%, filled transparent. Posisi oval di tengah canvas secara default (sebelum wajah terdeteksi). Ukuran oval proporsional: width ≈ 30% dari canvas width, height ≈ 20% dari canvas height (rasio wajah manusia). Saat tidak ada wajah terdeteksi, oval memiliki efek *pulsing* (opacity berubah 20% → 50% dengan CSS animasi) untuk menarik perhatian anak agar menempatkan wajah di area yang benar.

**File Target:**
- `src/components/overlay.js` (file baru: fungsi `renderMouthSilhouette()`)
- `src/main.js` (panggil render silhouette di game loop/RAF)
- `src/styles/main.css` (CSS animation untuk pulse effect)

**Subtasks:**
- [ ] Buat fungsi `drawSilhouette(ctx, width, height, isFaceDetected)`: gambar oval di tengah canvas
- [ ] Oval: `ctx.beginPath()`, `ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)`, `ctx.strokeStyle = 'rgba(255,255,255,0.3)'`, `ctx.lineWidth = 2`
- [ ] Jika `!isFaceDetected`, aktifkan pulse: opacity oscillate antara 0.2 dan 0.5 menggunakan `Math.sin(Date.now() / 500)`
- [ ] Jika face detected, stroke solid opacity 0.3 tanpa pulse
- [ ] Panggil `drawSilhouette` setiap frame dari game loop (setelah clear canvas)
- [ ] Pastikan oval tidak tumpang tindih dengan HUD atau landmark dots

**Definition of Done:**
1. Oval putih transparan muncul di tengah canvas overlay sebagai panduan wajah
2. Ukuran oval proporsional (lebar ≈ 30% canvas, tinggi ≈ 20% canvas)
3. Pulse animation saat wajah belum terdeteksi (opacity 0.2↔0.5)
4. Oval menjadi statis saat wajah sudah terdeteksi
5. Oval tidak mengganggu rendering HUD atau landmark lainnya

**Depends on:** C6.2

---

## D11.2 — Posisi Oval Ikut Wajah

**Deskripsi Teknis:**

Update posisi oval mouth silhouette secara dinamis mengikuti midpoint dari 4 landmark bibir (indeks 13, 14, 78, 308) sesuai blueprint VISUAL-02. Midpoint dihitung sebagai rata-rata koordinat x dan y dari keempat landmark: `centerX = (p13.x + p14.x + p78.x + p308.x) / 4`, `centerY` analog. Ukuran oval (radiusX, radiusY) juga disesuaikan proporsional dengan jarak horizontal dan vertikal landmark agar oval tetap *fit* di sekitar mulut user. Jika wajah tidak terdeteksi, oval kembali ke posisi default (tengah canvas) dengan pulse effect. Update posisi dilakukan setiap frame di `onFaceLandmarks` callback.

**File Target:**
- `src/components/overlay.js` (update `drawSilhouette()` untuk menerima koordinat dinamis)
- `src/utils/vision.js` (export fungsi `getMouthMidpoint(landmarks)`)
- `src/main.js` (pass midpoint dari landmarks ke overlay)

**Subtasks:**
- [ ] Implementasi `getMouthMidpoint(landmarks)`: hitung rata-rata x,y dari landmark 13,14,78,308
- [ ] Update `drawSilhouette(ctx, cx, cy, rx, ry)` untuk menerima posisi dan ukuran dinamis
- [ ] Hitung `rx = horizontalDistance / 2 + padding` dan `ry = verticalDistance / 2 + padding` agar oval membungkus area mulut
- [ ] Jika `!isFaceDetected`, gunakan posisi default (tengah canvas) dan ukuran default
- [ ] Panggil fungsi ini setiap frame setelah landmarks terekstrak

**Definition of Done:**
1. Oval bergerak mengikuti posisi mulut user secara real-time
2. Ukuran oval proporsional dengan bukaan mulut user saat itu (tidak fixed)
3. Saat wajah tidak terdeteksi, oval kembali ke tengah canvas dengan pulse
4. Tidak ada lag/jitter — posisi update setiap frame FaceMesh
5. Oval tetap dalam batas canvas (tidak keluar area)

**Depends on:** D11.1