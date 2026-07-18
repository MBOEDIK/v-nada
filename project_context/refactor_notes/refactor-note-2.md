# Refactor Note 2 — Ketidaksinkronan Branch Remote vs 50% PoC Scope Boundary

**Keterangan:** Catatan refaktor ini mendokumentasikan seluruh ketidaksinkronan antara branch `origin/feature/vocatone` (commit `a79e24e`) dan `origin/feature/dualsense` (commit `2194a33`) terhadap dokumen **`project_context/50_PERCENT_OF_MVP.md`** — batasan ruang lingkup Proof of Concept 50%.

**Pembeda dari Refactor Note 1:** Note 1 mengaudit kepatuhan terhadap 15 dokumen *technical blueprint* (spesifikasi detail implementasi). Note 2 mengaudit kepatuhan terhadap *scope boundary* — apakah fitur yang sudah dikodekan masih dalam pagar 50% PoC (*Zero Asset Dependency, Placeholder Geometry, Core Logic Only*) dan apakah fitur wajib PoC sudah terpenuhi. Temuan di Note 2 adalah temuan yang **belum tercatat** di Note 1.

**Dibuat:** 17 Juli 2026
**Evaluator:** Agent V-NADA (DeepSeek V4 Flash)

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

1. [Master Scope Boundary Checklist](#master-scope-boundary-checklist)
2. [SCOPE-01 — Lingkup Batasan & Target Reduksi](#2-scope-01--lingkup-batasan--target-reduksi)
3. [SCOPE-02 — Core Tech & Infrastruktur Luring](#3-scope-02--core-tech--infrastruktur-luring)
4. [SCOPE-03 — Modul 1: VocaTone Engine](#4-scope-03--modul-1-vocatone-engine)
5. [SCOPE-04 — Modul 2: Dual-Sense Engine](#5-scope-04--modul-2-dual-sense-engine)
6. [SCOPE-05 — UI/UX Pengganti Sensorik](#6-scope-05--uiux-pengganti-sensorik)
7. [Inkonsistensi Langsung Antar Kedua Branch](#7-inkonsistensi-langsung-antar-kedua-branch)
8. [Rangkuman Kepatuhan 50% PoC](#8-rangkuman-kepatuhan-50-poc)
9. [Lampiran](#lampiran)

---

## Master Scope Boundary Checklist

> **Cara pakai:** Ganti `[ ]` dengan `[x]` saat item selesai diperbaiki. Pastikan juga mengupdate detail di bagian terkait.

### SCOPE Blueprint

| # | Item | Prioritas | Refactor | PoC Line | PIC |
|---|------|-----------|----------|----------|-----|
| S01 | Dualsense preGrantAudioPermission() — mic tidak idle secara default | 🔴 | [ ] | 26 | |
| S02 | Dualsense siluet oval tidak statis (posisi dinamis + animasi pulsing) | 🟡 | [ ] | 82 | |
| S03 | VocaTone objek tidak melayang di jalur tengah canvas saat f₀ stabil | 🟢 | [ ] | 46 | |
| S04 | Dualsense state machine bypass LAR_CHECK untuk vokal /i/ (langsung CAMERA_ACTIVE → MIC_OPEN) | 🔴 | [ ] | 26, 68-69 | |
| S05 | Dualsense SESSION_ACTIVE state tidak pernah tercapai (dead state) | 🟡 | [ ] | 51-71 | |
| S06 | Dualsense flash feedback via DOM overlay bukan canvas background | 🟡 | [ ] | 79 | |
| S07 | Dualsense audio.js tidak resume AudioContext — gagal total di Chrome/Android | 🔴 | [ ] | 42 | |
| S08 | Dualsense Euclidean 3D bukan 2D — LAR mengandung noise sumbu Z | 🔴 | [ ] | 58-60 | |
| S09 | Dualsense vokal /i/ pakai mouth spread ratio, bukan `LAR ≤ low` | 🔴 | [ ] | 69 | |
| S10 | Dualsense triggerFallback() reset ke IDLE, bukan CAMERA_ACTIVE | 🔴 | [ ] | 70 | |
| S11 | Dualsense face loss saat MIC_OPEN — mic tidak ditutup | 🔴 | [ ] | 70 | |
| S12 | Dualsense /i/ fallback monitor pakai MouthWidth, bukan LAR | 🔴 | [ ] | 69-70 | |
| S13 | Dualsense openAudioGate() fire-and-forget — orphan AudioContext | 🟡 | [ ] | 42 | |
| S14 | Dualsense per-frame new Map() ~800 entries — memory pressure | 🟡 | [ ] | AGENTS.md | |
| S15 | Dualsense tidak ada user-facing mic error — silent catch | 🟡 | [ ] | 42 | |
| S16 | Dualsense siluet oval selalu putih — tidak berubah per state | 🟡 | [ ] | 82 | |
| S17 | Dualsense f_min = 100 Hz terlalu rendah untuk anak 7-9 tahun | 🟡 | [ ] | Implisit | |
| S18 | Dualsense flash opacity < 30% — semua kelas di bawah blueprint | 🟢 | [ ] | 79 | |
| S19 | VocaTone mic error messages dead code — `.catch()` buang error object | 🟡 | [ ] | 42 | |
| S20 | Dualsense restingMouthWidth kalibrasi asumsi frame pertama adalah resting | 🟡 | [ ] | 69 | |
| S21 | Dualsense LAR_CHECK gagal transisi ke IDLE (full reset), bukan CAMERA_ACTIVE | 🔴 | [ ] | 26, 70 | |
| S22 | Dualsense outOfThresholdSince tidak direset saat keluar MIC_OPEN | 🟡 | [ ] | 69-70 | |
| S23 | Dualsense konstanta SPREAD_TRIGGER/SPREAD_SUSTAIN di dalam hot-path callback | 🟢 | [ ] | AGENTS.md | |
| S24 | Dualsense silhouette RAF loop 60Hz terlepas dari FaceMesh 15FPS — boros CPU | 🟢 | [ ] | 82 | |
| S25 | VocaTone butuh kamera + FaceMesh meskipun spek audio-only (tanpa kamera) | 🟡 | [ ] | 30-48 | |
| S26 | Dualsense tidak ada `onEnter(LAR_CHECK)` — tidak ada inisialisasi state gate | 🟢 | [ ] | 26, 68-69 | |
| S27 | Dualsense tidak ada `onNoFace` callback di FaceMesh pipeline — face loss hanya via polling 500ms | 🔴 | [ ] | 70 | |
| S28 | VocaTone flash feedback static tint, bukan animasi "Berkedip" sesuai PoC | 🟡 | [ ] | 79 | |
| S29 | Dualsense `closeAudioStream()` tanpa `await` — resource leak risk | 🟡 | [ ] | 42 | |
| S30 | Dualsense `cameraController.start()` fire-and-forget — silent failure | 🔴 | [ ] | 42 | |
| S31 | Dualsense `isF0Shrill`/`isF0Stable` flags stale setelah fallback | 🟡 | [ ] | 70, 79 | |
| S32 | Dualsense `transitionTo()` silent return — state violation tidak terdeteksi | 🔴 | [ ] | 26 | |
| S33 | Dualsense IDLE→CAMERA_ACTIVE via `onFaceLandmarks()` bypass session init | 🟡 | [ ] | 26 | |
| S34 | Kedua branch `MIN_PITCH_HZ` hardcoded 50 Hz, tidak pakai `f_min` dari constants | 🟡 | [ ] | AGENTS.md | |
| S35 | VocaTone tidak import constants.js — threshold LAR 0.3 ≠ 0.5 (spec) | 🔴 | [ ] | 68, AGENTS.md | |
| S36 | Dualsense `accuracyDisplay` teks "SHRILL"/"STABLE" melampaui spesifikasi binary feedback PoC | 🟡 | [ ] | 79, 16 | |
| S37 | Dualsense `vowel-indicator` DOM overlay (huruf A/I raksasa) tidak ada dalam PoC — scope creep | 🟡 | [ ] | 78-82 | |
| S38 | Dualsense `initAudioStream()` tidak cleanup AudioContext saat `getUserMedia` gagal | 🟡 | [ ] | 42 | |
| S39 | Dualsense `openAudioGate()` tidak memiliki re-entry guard untuk async `initAudioStream()` | 🟡 | [ ] | 42 | |
| S40 | Dualsense tidak ada flash merah saat MIC_OPEN tanpa suara | 🔴 | [ ] | 81 | |
| S41 | Dualsense `lastFaceTime` tidak direset di `stopSession()` — false positive face-gone | 🟡 | [ ] | 79, 82 | |
| S42 | Dualsense `errorHideTimer` tidak dibersihkan di `stopSession()` | 🟡 | [ ] | 79 | |
| S43 | Dualsense `startSession()` tidak memiliki guard re-entry | 🟡 | [ ] | 26 | |
| S44 | Dualsense canvas sizing tidak responsif terhadap resize/orientation change | 🟡 | [ ] | 82 | |
| S45 | VocaTone tidak ada flash merah saat tidak ada suara | 🔴 | [ ] | 81 | |
 
---

## 2. SCOPE-01 — Lingkup Batasan & Target Reduksi

**Dokumen:** `project_context/50_PERCENT_OF_MVP.md` (Baris 10–18)

### 2.1 Target Pengguna — Simulasi Klinis Anak Tunarungu Berat

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | Tidak ada kode spesifik target pengguna — wajar PoC |
| `feature/dualsense` | ✅ | Tidak ada kode spesifik target pengguna — wajar PoC |

### 2.2 Pembatasan Fonetik — Hanya Vokal A dan I

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ❌ | Threshold tunggal `DEFAULT_LAR_THRESHOLD = 0.3` — tidak bisa bedakan A/I (tercatat di Note 1 T02) |
| `feature/dualsense` | ❌ | Vokal I pakai mouth spread ratio, bukan `LAR ≤ low` (tercatat di Note 1 T03) |

Kedua temuan sudah tercatat di Note 1 (T02, T03). Tidak ada temuan baru.

### 2.3 IndexedDB & Halaman Riwayat — Ditunda Sepenuhnya

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ⚠️ | `db.js` memiliki definisi store + `openDB()` + `getProfile()`/`saveProfile()` — infrastruktur IndexedDB sudah ada, melanggar "ditunda sepenuhnya" (tercatat di Note 1 T26) |
| `feature/dualsense` | ✅ | Tidak import `db.js` — tidak ada kode IndexedDB |

Tercatat di Note 1 T26 sebagai dead code. Bukan temuan baru.

### 2.4 Zero Asset Dependency — Placeholder Geometry Only

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | Semua rendering via Canvas `fillRect` — tidak ada PNG/SVG game assets |
| `feature/dualsense` | ✅ | Semua rendering via Canvas `ellipse` — tidak ada PNG/SVG game assets |

Font woff2 dan icon PWA adalah infrastruktur, bukan game assets — dalam batas wajar.

---

## 3. SCOPE-02 — Core Tech & Infrastruktur Luring

**Dokumen:** `project_context/50_PERCENT_OF_MVP.md` (Baris 21–27)

### 3.1 PWA Core Skeleton — Instalasi & Offline Loading

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | Service worker + manifest + font preload |
| `feature/dualsense` | ✅ | Sama |

### 3.2 Sequential Validation Engine (Gate Keeper)

**Baris 26:** *"Pipa logika pemrograman yang mengunci sensor mikrofon agar berstatus mati (idle) secara default dan baru membuka aliran data audio jika kamera depan sukses memvalidasi struktur motorik bibir."*

#### S01 — Dualsense `preGrantAudioPermission()` Melanggar "Mic Idle by Default" 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:26
- **Catatan:**

Prinsip inti Sequential Validation Engine adalah **mic idle secara default** — mikrofon baru aktif setelah kamera memvalidasi bentuk bibir. Dualsense melanggar ini dengan memanggil `getUserMedia({audio: true})` di awal `startSession()` via `preGrantAudioPermission()`, **jauh sebelum LAR_CHECK** atau validasi wajah.

```javascript
// src/main.js:60-65 — dualsense
async function preGrantAudioPermission() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach(t => t.stop());
  } catch (_) {}
}
```

Fungsi ini dipanggil di baris pertama `startSession()`, sebelum gatekeeper transisi ke CAMERA_ACTIVE dan sebelum kamera menyala:

```javascript
// src/main.js:463 — dualsense startSession()
preGrantAudioPermission();
```

**Perbandingan dengan Vocatone (✅ sesuai):** Vocatone hanya memanggil `initAudioStream()` setelah LAR_CHECK pass — mic benar-benar idle sampai validasi visual selesai.

**Dampak:**
1. Prompt izin mikrofon muncul sebelum pengguna melihat kamera — pengalaman membingungkan.
2. Melanggar spesifikasi inti Gate Keeper di dokumen 50% PoC.
3. Pengguna bisa memberikan izin mic tanpa perlu validasi LAR terlebih dahulu.

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | Lazy — `initAudioStream()` hanya setelah LAR_CHECK pass | ✅ Sesuai PoC |
| `feature/dualsense` | Eager — `preGrantAudioPermission()` di `startSession()` sebelum validasi visual apa pun | ❌ **Melanggar** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:60-65` — `preGrantAudioPermission()`
- `feature/dualsense`: `src/main.js:463` — pemanggilan `preGrantAudioPermission()`

**Catatan:** Temuan ini berbeda dari C18 di Note 1 yang mendokumentasikan eager vs lazy sebagai inkonsistensi antar branch. S01 secara spesifik menargetkan pelanggaran terhadap **prinsip scope boundary** 50% PoC: mic WAJIB idle secara default.

---

## 4. SCOPE-03 — Modul 1: VocaTone Engine

**Dokumen:** `project_context/50_PERCENT_OF_MVP.md` (Baris 30–48)

### 4.1 Web Audio Autocorrelation — Pitch Extraction Offline

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | Autocorrelation + noise gate — sesuai PoC |
| `feature/dualsense` | (N/A) | | (tercatat di Note 1) |

### 4.2 Noise Floor Gate — RMS > 0.01

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | `NOISE_FLOOR_RMS = 0.01` dengan guard |
| `feature/dualsense` | (N/A) | | (tercatat di Note 1) |

### 4.3 Single-Game Placeholder — Objek Kotak

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | Kotak 40×40px, Canvas rendering. Sesuai "placeholder geometry". |

### 4.4 Rise on Sound — Konstan Naik

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | `RISE_SPEED = 2` constant velocity, `positionY -= RISE_SPEED` |

### 4.5 Hover on Stable f₀ — Melayang di Jalur Tengah Canvas 🟢 S03

**Baris 46:** *"Jika frekuensi dasar (f₀) konstan dalam target wicara normal: Objek kotak bertahan stabil melayang di **jalur tengah canvas**."*

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **PoC Line:** 50_PERCENT_OF_MVP.md:46
- **Catatan:**

50% PoC secara eksplisit mensyaratkan objek melayang di **"jalur tengah canvas"** (middle of canvas) saat f₀ stabil. Implementasi Vocatone saat ini:

```javascript
// src/components/game.js — HOVER phase
const isHovering = this.stabilityTimer >= STABLE_DURATION_MS && pitchHz > 0;
if (isHovering) {
  this.velocityY = 0;
  const t = performance.now() * 0.002;
  this.positionY += Math.sin(t) * 0.5;  // micro-drift di posisi manapun
}
```

Objek hover di **posisi Y berapa pun** yang dicapai saat stabilitas tercapai — bisa di dekat batas atas, tengah, atau manapun. Tidak ada logika yang memposisikan objek ke `canvas.height / 2` saat transisi ke HOVER.

Sebagai perbandingan, spesifikasi PoC menghendaki objek secara eksplisit melayang di **jalur tengah** — memberikan target visual yang jelas bagi anak bahwa fonasi sudah benar dan stabil.

| Branch | Implementasi | Status |
|--------|-------------|--------|
| `feature/vocatone` | Hover di posisi Y terkini dengan micro-drift `sin(t) * 0.5` — tidak ada reposisi ke tengah canvas | ❌ **Menyimpang** |
| `feature/dualsense` | (N/A) | N/A |

**Lokasi kode:**
- `feature/vocatone`: `src/components/game.js:228-234` — HOVER phase tanpa reposisi ke tengah canvas
- `feature/vocatone`: `src/components/game.js:13` — `this.positionY` diinisialisasi ke `canvas.height - OBJ_H` (bawah)

### 4.6 Fall on Silence — Gravitasi Turun

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ✅ | `GRAVITY = 1.5`, fall timer, terminal velocity `MAX_FALL_SPEED = 8` |

---

## 5. SCOPE-04 — Modul 2: Dual-Sense Engine

**Dokumen:** `project_context/50_PERCENT_OF_MVP.md` (Baris 51–71)

### 5.1 MediaPipe Face Mesh — 4 Landmark Bibir

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/dualsense` | ✅ | `FACEMESH_LIPS = { top: 13, bottom: 14, left: 78, right: 308 }` |

### 5.2 Euclidean Distance — 2D Only

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/dualsense` | ❌ | 3D: `(p.x-q.x)² + (p.y-q.y)² + (p.z-q.z)²` | (tercatat di Note 1 T01) |

### 5.3 Lip Aspect Ratio (LAR) — vertical / horizontal

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/dualsense` | ⚠️ | Rumus benar, tapi pakai Euclidean 3D | (tercatat di Note 1) |

### 5.4 Validasi Huruf A — LAR ≥ LAR_threshold_A

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/dualsense` | ✅ | `lastLar >= lar_threshold.high` → MIC_OPEN (mode='A') |

### 5.5 Validasi Huruf I — LAR ≤ Threshold_Low

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/dualsense` | ❌ | Mouth spread ratio, bukan `LAR ≤ low` | (tercatat di Note 1 T03) |

### 5.6 Instant Fallback — Mic Tutup Saat LAR Drop

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/dualsense` | ❌ | `triggerFallback()` reset ke IDLE, bukan CAMERA_ACTIVE | (tercatat di Note 1 T17) |

---

#### S04 — Dualsense State Machine: Bypass LAR_CHECK untuk Vokal /i/ (Pelanggaran Sequential Validation Gate) 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:26, 68-69
- **Catatan:**

Prinsip Sequential Validation Engine (PoC line 26) dan validasi vokal (line 68-69) mensyaratkan alur ketat: **Camera → LAR_CHECK → MIC_OPEN → f0**. Dualsense melanggar ini dengan mengizinkan transisi **CAMERA_ACTIVE → MIC_OPEN** secara langsung untuk vokal /i/, melewati state LAR_CHECK sepenuhnya.

**Akar masalah — Gatekeeper VALID_TRANSITIONS:**

```javascript
// src/utils/gatekeeper.js:11 — dualsense
[STATES.CAMERA_ACTIVE]: [STATES.LAR_CHECK, STATES.MIC_OPEN, STATES.IDLE],
```

`MIC_OPEN` tercantum sebagai transisi yang valid dari `CAMERA_ACTIVE` — ini seharusnya hanya `LAR_CHECK` (dan `IDLE` untuk hard reset). Akibatnya, onFaceLandmarks dapat memanggil:

```javascript
// src/main.js — dualsense onFaceLandmarks()
if (currentState === STATES.CAMERA_ACTIVE) {
  if (lastLar >= lar_threshold.high && fallbackMode !== 'A') {
    gatekeeper.transitionTo(STATES.LAR_CHECK, { mode: 'A' });  // ✅ via LAR_CHECK
  } else if (isMiddleLar && isMouthSpread && fallbackMode !== 'I') {
    gatekeeper.transitionTo(STATES.MIC_OPEN, { mode: 'I' });   // ❌ SKIP LAR_CHECK!
  }
}
```

Untuk vokal /i/, transisi langsung ke MIC_OPEN terjadi tanpa melalui LAR_CHECK — artinya LAR tidak melalui *gate* validasi diskrit sebelum mikrofon terbuka. Nilai tengah LAR (middle) sudah dianggap cukup tanpa verifikasi lanjutan.

**Dampak:**
1. Mikrofon terbuka untuk /i/ tanpa melalui state LAR_CHECK — melanggar arsitektur gatekeeper sequential yang didefinisikan PoC.
2. Tidak ada validasi LAR eksplisit terpisah untuk /i/ — keputusan buka mic diambil berdasarkan kombinasi isMiddleLar + isMouthSpread tanpa gate tersendiri.
3. Inkosisten dengan alur /a/ yang benar melewati LAR_CHECK.

| Branch | Path ke MIC_OPEN untuk /i/ | Status |
|--------|---------------------------|--------|
| `feature/vocatone` | N/A — hanya vokal tunggal | N/A |
| `feature/dualsense` | CAMERA_ACTIVE → **MIC_OPEN** (skip LAR_CHECK) | ❌ **Melanggar** |

**Lokasi kode:**
- `feature/dualsense`: `src/utils/gatekeeper.js:11` — `VALID_TRANSITIONS` mengizinkan CAMERA_ACTIVE → MIC_OPEN
- `feature/dualsense`: `src/main.js` — `onFaceLandmarks()` transisi langsung CAMERA_ACTIVE → MIC_OPEN untuk /i/

---

#### S05 — Dualsense SESSION_ACTIVE State Tidak Pernah Tercapai (Dead State) 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:51-71
- **Catatan:**

State machine Dualsense mendefinisikan `SESSION_ACTIVE` dalam `VALID_TRANSITIONS` (dapat dicapai dari `MIC_OPEN`) dan mendaftarkan `onEnter` callback untuk `STATES.IDLE`:

```javascript
// src/utils/gatekeeper.js:17 — dualsense
[STATES.MIC_OPEN]: [STATES.SESSION_ACTIVE, STATES.LAR_CHECK, STATES.CAMERA_ACTIVE, STATES.IDLE],
```

Namun, **tidak ada satu pun jalur kode di seluruh codebase** yang memanggil `gatekeeper.transitionTo(STATES.SESSION_ACTIVE)`. Setelah MIC_OPEN tercapai, state machine hanya bisa mundur (ke LAR_CHECK, CAMERA_ACTIVE, IDLE) atau diam di MIC_OPEN — tidak pernah maju ke SESSION_ACTIVE.

Seluruh logika yang seharusnya terjadi di SESSION_ACTIVE (green flash saat f₀ stabil di PoC line 79, monitoring LAR berkelanjutan) berjalan di dalam MIC_OPEN tanpa pernah mengadvance state:

```javascript
// src/main.js — dualsense onFaceLandmarks()
if (sessionActive && audioInitialized && currentState === STATES.MIC_OPEN && currentMode === 'A') {
  // LAR monitor & fallback — langsung di MIC_OPEN
}

// gatekeeper.onEnter(STATES.MIC_OPEN) — pitch polling juga dimulai di sini
gatekeeper.onEnter(STATES.MIC_OPEN, () => {
  openAudioGate();
  startPitchPolling();
});
```

**Dampak:**
1. State SESSION_ACTIVE adalah dead code — mendefinisikan transisi yang tidak pernah dieksekusi.
2. Tidak ada pemisahan state yang jelas antara "mic baru saja terbuka" (MIC_OPEN) vs "fonasi sedang aktif dan stabil" (SESSION_ACTIVE).
3. PoC line 51-71 mengimplikasikan alur state penuh setelah mic terbuka; SESSION_ACTIVE adalah state yang diperlukan untuk menandai sesi fonasi aktif.
4. Jika di masa depan perlu membedakan perilaku antara "baru mulai fonasi" vs "fonasi sudah stabil", tidak ada state yang tersedia.

| Branch | Implementasi SESSION_ACTIVE | Status |
|--------|---------------------------|--------|
| `feature/vocatone` | State machine penuh — SESSION_ACTIVE tercapai via MIC_OPEN → SESSION_ACTIVE | N/A — Vocatone punya SESSION_ACTIVE |
| `feature/dualsense` | SESSION_ACTIVE didefinisikan tapi tidak pernah ditransisikan | ❌ **Dead state** |

**Lokasi kode:**
- `feature/dualsense`: `src/utils/gatekeeper.js:17` — definisi VALID_TRANSITIONS untuk MIC_OPEN → SESSION_ACTIVE
- `feature/dualsense`: `src/main.js` — seluruh file: tidak ada satupun panggilan `gatekeeper.transitionTo(STATES.SESSION_ACTIVE)` atau `.transitionTo('SESSION_ACTIVE')`

---

#### S07 — Dualsense audio.js Tidak Meresume AudioContext — Gagal Total di Chrome/Android 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:42
- **Catatan:**

PoC line 42 (dan line 37) mensyaratkan Web Audio API dapat menangkap dan memproses pitch:

> *"Kode menangkap aliran audio analog dari mikrofon gawai dan berhasil memproses ekstraksi pitch domain waktu menjadi satuan Hertz (Hz) secara luring."*

Dualsense `initAudioStream()` di `src/utils/audio.js` membuat `AudioContext` tetapi **tidak pernah memanggil `.resume()`** . Pada browser Chrome / Android WebView, AudioContext baru otomatis masuk state **'suspended'** karena kebijakan *autoplay policy* — tanpa resume, tidak ada data audio yang mengalir melalui graph node, dan `extractPitch()` selalu mengembalikan `null`.

**Kode dualsense (❌ — resume hilang):**

```javascript
// src/utils/audio.js — dualsense initAudioStream()
export async function initAudioStream() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // ⚠️ AudioContext dibuat, state = 'suspended' di Chrome
  // ❌ Tidak ada audioContext.resume() setelah getUserMedia

  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(mediaStream);
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = FFT_SIZE;
  source.connect(analyserNode);
  dataArray = new Float32Array(analyserNode.fftSize);

  return audioContext;
  // ❌ Context tetap 'suspended' → AnalyserNode tidak pernah menerima data
}
```

**Kode vocatone (✅ — resume benar):**

```javascript
// src/utils/audio.js — vocatone initAudioStream()
export async function initAudioStream() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // ...
  // Step 5: Resume AudioContext to satisfy browser autoplay policy
  if (audioContext.state === 'suspended') {
    await audioContext.resume();    // ✅ Wajib untuk Chrome/Android
  }
  return audioContext;
}
```

**Dampak:**
1. Di browser Chrome desktop, AudioContext tetap 'suspended' — pitch extraction selalu return null — aplikasi tidak berfungsi.
2. Di Android WebView (target utama V-NADA), masalah ini 100% reproducible — mikrofon terbuka tapi tidak ada data audio yang diproses.
3. Tidak ada error/warning yang muncul — `extractPitch()` diam-diam return null — pengguna melihat LAR terdeteksi tapi pitch selalu "--".
4. Melanggar PoC line 42 sebagai requirement fungsional inti aplikasi.

| Branch | `audioContext.resume()` | Status |
|--------|------------------------|--------|
| `feature/vocatone` | ✅ `if (suspended) await resume()` | ✅ Sesuai Web Audio API best practice |
| `feature/dualsense` | ❌ Tidak ada resume call | ❌ **Functional blocker** |

**Lokasi kode:**
- `feature/dualsense`: `src/utils/audio.js:8-21` — `initAudioStream()` tanpa resume
- `feature/vocatone`: `src/utils/audio.js:114-116` — `initAudioStream()` dengan resume guard

---

#### S08 — Dualsense Euclidean 3D Bukan 2D — LAR Mengandung Noise Sumbu Z 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:58-60
- **Catatan:**

50% PoC secara eksplisit mendefinisikan Euclidean distance dalam 2D (hanya sumbu X dan Y):

$$d(p,q) = \sqrt{(p_x - q_x)^2 + (p_y - q_y)^2}$$

Dualsense mengimplementasikan Euclidean 3D yang menyertakan sumbu Z:

```javascript
// src/utils/vision.js:22-24 — dualsense
export function computeEuclideanDistance(p, q) {
  return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2);
}
```

Sumbu Z dari MediaPipe FaceMesh adalah normalized depth yang tidak relevan untuk LAR — LAR adalah metrik rasio aspek 2D. Noise sumbu Z mengakibatkan error sistematis pada seluruh perhitungan LAR.

| Branch | Euclidean | Status |
|--------|-----------|--------|
| `feature/vocatone` | 2D — hanya (x,y) ✅ | Sesuai PoC |
| `feature/dualsense` | 3D — termasuk (z) ❌ | **Melanggar** |

**Lokasi kode:**
- `feature/dualsense`: `src/utils/vision.js:22-24` — `computeEuclideanDistance()` 3D
- `feature/vocatone`: `src/utils/vision.js:22-24` — `computeEuclideanDistance()` 2D ✅

---

#### S09 — Dualsense Vokal /i/ Pakai Mouth Spread Ratio, Bukan `LAR ≤ low` 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:69
- **Catatan:**

50% PoC line 69 secara eksplisit menyatakan validasi vokal /i/ menggunakan **`LAR ≤ Threshold_Low`** :

> *"Validasi Huruf I: Pengembang meringis melebar secara horizontal. Sistem mendeteksi nilai LAR mengecil secara proporsional mendekati batas bawah LAR ≤ Threshold_Low."*

Dualsense mengimplementasikan deteksi /i/ menggunakan kombinasi `isMiddleLar` (LAR di rentang 0.2-0.5) dan `isMouthSpread` (lebar mulut > 1.3× resting width), bukan `LAR ≤ low`:

```javascript
// src/main.js:225-227 — dualsense onFaceLandmarks()
const isMiddleLar = lastLar >= lar_threshold.low && lastLar < lar_threshold.high;
const isMouthSpread = lastMouthWidth > restingMouthWidth * SPREAD_TRIGGER;
// ...
gatekeeper.transitionTo(STATES.MIC_OPEN, { mode: 'I' });
```

Vokal /i/ dapat terpicu saat LAR di rentang tengah (0.2-0.5), bukan hanya saat LAR ≤ 0.2. Juga bergantung pada `restingMouthWidth` yang dikalibrasi per sesi dan rentan error.

| Branch | Deteksi /i/ | Status |
|--------|-------------|--------|
| `feature/vocatone` | N/A — threshold tunggal | N/A |
| `feature/dualsense` | `isMiddleLar + isMouthSpread` — bukan `LAR ≤ low` | ❌ **Melanggar** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:225-227` — transisi CAMERA_ACTIVE → MIC_OPEN untuk /i/ via spread ratio
- `feature/dualsense`: `src/main.js:266-274` — fallback monitor /i/ pakai MouthWidth

---

#### S10 — Dualsense triggerFallback() Reset ke IDLE, Bukan CAMERA_ACTIVE 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:70
- **Catatan:**

PoC line 70 mensyaratkan: *"gerbang mikrofon wajib ditutup secara instan secara otomatis"* — mikrofon ditutup, namun kamera harus tetap memonitor untuk pemulihan LAR. Dualsense melanggar dengan mereset state machine ke IDLE:

```javascript
// src/main.js — dualsense triggerFallback()
function triggerFallback(mode) {
  closeAudioGate();       // ✅ mic closed
  gatekeeper.reset();     // ❌ goes to IDLE — state machine berhenti
}
```

`gatekeeper.reset()` mengembalikan state ke IDLE, yang menghentikan state machine sepenuhnya. Setelah fallback, diperlukan transisi manual kembali ke CAMERA_ACTIVE. Sebaliknya, Vocatone menggunakan `gatekeeper.fallbackTo(STATES.CAMERA_ACTIVE)` yang menjaga kamera tetap aktif untuk monitoring LAR berkelanjutan.

| Branch | Fallback target | Status |
|--------|----------------|--------|
| `feature/vocatone` | `fallbackTo(CAMERA_ACTIVE)` — kamera tetap monitoring ✅ | Sesuai PoC |
| `feature/dualsense` | `gatekeeper.reset()` → IDLE — state machine berhenti ❌ | **Melanggar** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:229-240` — `triggerFallback()` panggil `gatekeeper.reset()`
- `feature/vocatone`: `src/main.js:129-148` — `executeFallback()` panggil `gatekeeper.fallbackTo(CAMERA_ACTIVE)` ✅

---

#### S11 — Dualsense Face Loss Saat MIC_OPEN — Mic Tidak Ditutup 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:70 (implisit)
- **Catatan:**

PoC line 70 mensyaratkan mikrofon ditutup secara instan saat kondisi validasi tidak terpenuhi. Jika wajah menghilang saat MIC_OPEN, mikrofon harus segera ditutup. Dualsense `startMonitor()` mendeteksi face loss tetapi **tidak menutup microphone**:

```javascript
// src/main.js — dualsense startMonitor()
if (faceGone) {
  clearAllFlash();
  flashOverlay.classList.add('flash-idle');
  if (faceEverDetected) {
    showError(true, 'No Face Detected', '...');
  }
  // ❌ NO closeAudioGate() dipanggil
  // ❌ NO transisi state keluar dari MIC_OPEN
  // ❌ startPitchPolling() terus berjalan
}
```

Sebaliknya, Vocatone `executeHardReset()` menutup mic, menghentikan game loop, dan mereset state machine ke IDLE.

| Branch | Face loss saat MIC_OPEN | Status |
|--------|------------------------|--------|
| `feature/vocatone` | `executeHardReset()` — tutup mic + stop kamera ✅ | Sesuai PoC |
| `feature/dualsense` | Mic tetap terbuka, polling terus berjalan ❌ | **Melanggar** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:346-352` — `startMonitor()` face loss tanpa closeAudioGate()
- `feature/vocatone`: `src/main.js:155-175` — `executeHardReset()` tutup mic + stop kamera ✅

---

#### S12 — Dualsense /i/ Fallback Monitor Pakai MouthWidth, Bukan LAR 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:69-70
- **Catatan:**

Fallback monitor untuk vokal /i/ di dualsense menggunakan `lastMouthWidth` (lebar mulut absolut) sebagai metrik, bukan `LAR`:

```javascript
// src/main.js — dualsense onFaceLandmarks() monitor /i/
const isOutOfRange = lastMouthWidth <= restingMouthWidth * SPREAD_SUSTAIN || lastLar >= lar_threshold.high;
```

Ini inkonsisten dengan PoC yang mendefinisikan fallback berdasarkan LAR. Ketergantungan pada `restingMouthWidth` yang dikalibrasi per sesi (dimulai dari `Infinity`) membuat deteksi rentan error — jika user tidak melakukan resting face yang benar, threshold spread tidak akurat.

| Branch | Fallback monitor /i/ | Status |
|--------|---------------------|--------|
| `feature/vocatone` | N/A | N/A |
| `feature/dualsense` | `lastMouthWidth <= restingMouthWidth * SPREAD_SUSTAIN` ❌ | **Melanggar** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:266-274` — fallback monitor /i/ pakai MouthWidth

---

#### S13 — Dualsense openAudioGate() Fire-and-Forget — Orphan AudioContext 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:42
- **Catatan:**

`gatekeeper.onEnter(MIC_OPEN)` memanggil `openAudioGate()` tanpa `await`:

```javascript
// src/main.js — dualsense gatekeeper.onEnter(MIC_OPEN)
gatekeeper.onEnter(STATES.MIC_OPEN, () => {
  openAudioGate();   // ❌ fire-and-forget, no await
  startPitchPolling();
});
```

Jika `triggerFallback()` dieksekusi sebelum `initAudioStream()` selesai:
1. `openAudioGate()` mulai → `initAudioStream()` async pending
2. LAR drop → `triggerFallback()` → `closeAudioGate()` → `audioInitialized=false` → no-op
3. `gatekeeper.reset()` → `onExit(MIC_OPEN)` → `closeAudioGate()` → no-op lagi
4. `initAudioStream()` **resolve** → `audioInitialized = true` ← **AudioContext orphan!**

| Branch | openAudioGate() | Status |
|--------|----------------|--------|
| `feature/vocatone` | `initAudioStream()` dengan await + then/catch ✅ | Aman |
| `feature/dualsense` | Fire-and-forget tanpa await ❌ | **Rentan orphan** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:71-78` — `openAudioGate()` tanpa await di `gatekeeper.onEnter(MIC_OPEN)`
- `feature/dualsense`: `src/main.js:79-82` — `gatekeeper.onEnter(MIC_OPEN)` panggil `openAudioGate()` fire-and-forget

---

#### S14 — Dualsense Per-Frame new Map() ~800 Entries — Memory Pressure 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** AGENTS.md — memory constraint <150MB
- **Catatan:**

Dualsense `autocorrelationPitch()` mengalokasikan `new Map()` setiap kali dipanggil, diisi dengan ~800 entri (satu per lag):

```javascript
// src/utils/audio.js:57 — dualsense autocorrelationPitch()
const corrMap = new Map();  // ❌ alokasi per-frame
for (let lag = minLag; lag <= maxLag; lag++) {
  correlation /= energy;
  corrMap.set(lag, correlation);  // ~800 entri per frame
}
```

Pada sample rate 44.1 kHz, rentang lag ~55-882 = ~828 entri per panggilan `extractPitch()`. Dipanggil setiap 100ms via `startPitchPolling()` → ~8.280 alokasi Map per detik. Pada perangkat low-end (<150MB), ini menyebabkan GC pressure dan frame drop.

Sebaliknya, Vocatone menggunakan loop tradisional tanpa Map — zero allocation di hot path.

| Branch | Alokasi autocorrelation | Status |
|--------|----------------------|--------|
| `feature/vocatone` | Loop tradisional — zero allocation ✅ | Sesuai best practice memori |
| `feature/dualsense` | `new Map()` + ~800 entri per frame ❌ | **Boros memori** |

**Lokasi kode:**
- `feature/dualsense`: `src/utils/audio.js:57` — `const corrMap = new Map()` per panggilan `autocorrelationPitch()`
- `feature/vocatone`: `src/utils/audio.js` — loop tradisional tanpa Map ✅

---

#### S15 — Dualsense Tidak Ada User-Facing Mic Error — Silent Catch 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:42
- **Catatan:**

Dualsense memiliki dua titik kegagalan mikrofon yang keduanya tidak menampilkan error ke pengguna:

1. `preGrantAudioPermission()` — silent catch tanpa feedback:
```javascript
// src/main.js:60-65 — dualsense
async function preGrantAudioPermission() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach(t => t.stop());
  } catch (_) {}  // ❌ SILENT — user tidak tahu mic gagal
}
```

2. `openAudioGate()` — hanya console.warn, tidak ada UI error:
```javascript
// src/main.js:71-78 — dualsense
async function openAudioGate() {
  try {
    await initAudioStream();
    audioInitialized = true;
  } catch (err) {
    console.warn('[Audio] Mic unavailable:', err.message);  // ❌ hanya dev log
  }
}
```

Sebaliknya, Vocatone memiliki error handling lengkap dengan pesan user-facing untuk setiap skenario kegagalan mic (NotAllowedError, NotFoundError, NotReadableError).

| Branch | Mic error handling | Status |
|--------|-------------------|--------|
| `feature/vocatone` | Structured error messages + cleanup ✅ | Sesuai best practice |
| `feature/dualsense` | Silent catch + console.warn ❌ | **Tidak user-friendly** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:60-65` — `preGrantAudioPermission()` silent catch
- `feature/dualsense`: `src/main.js:71-78` — `openAudioGate()` hanya console.warn
- `feature/vocatone`: `src/utils/audio.js:30-52` — error handling dengan pesan user-facing ✅

---

#### S16 — Dualsense Siluet Oval Selalu Putih — Tidak Berubah Per State 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:82
- **Catatan:**

Siluet oval kalibrasi di dualsense selalu berwarna putih (`rgba(255, 255, 255, 0.3)`) terlepas dari state validasi. Tidak ada perubahan warna berdasarkan state — hijau saat LAR valid, merah saat error, atau abu-abu saat searching.

```javascript
// src/components/overlay.js:15 — dualsense drawSilhouette()
ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';   // selalu putih
```

Oval tidak pernah memberikan feedback visual tentang status validasi — kehilangan kesempatan kalibrasi yang seharusnya membantu user menyejajarkan posisi wajah.

| Branch | Warna oval per state | Status |
|--------|---------------------|--------|
| `feature/vocatone` | Putih statis (sama) ⚠️ | Tidak optimal |
| `feature/dualsense` | Putih selalu — tidak pernah berubah ❌ | **Kurang informatif** |

**Lokasi kode:**
- `feature/dualsense`: `src/components/overlay.js:15,21` — `ctx.strokeStyle` selalu putih

---

#### S17 — Dualsense f_min = 100 Hz Terlalu Rendah untuk Anak 7-9 Tahun 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** Implisit — target pengguna anak tunarungu Fase A/B (7-9 tahun)
- **Catatan:**

Dualsense menetapkan `f_min = 100` Hz di `src/utils/constants.js`:

```javascript
// src/utils/constants.js:2 — dualsense
export const f_min = 100;
```

Frekuensi fundamental anak usia 7-9 tahun umumnya berada di rentang 250-500 Hz. `f_min = 100` Hz memperpanjang rentang search ke area vocal fry, meningkatkan false positive dari noise frekuensi rendah dan subharmonik. Sebagai perbandingan, Vocatone menggunakan `f_min = 150` Hz.

| Branch | f_min | Status |
|--------|-------|--------|
| `feature/vocatone` | 150 Hz ✅ | Lebih sesuai untuk anak |
| `feature/dualsense` | 100 Hz ❌ | Terlalu rendah — rentan false positive |

**Lokasi kode:**
- `feature/dualsense`: `src/utils/constants.js:2` — `export const f_min = 100;`
- `feature/vocatone`: `src/components/game.js:30` — `DEFAULT_F_MIN = 150`

---

#### S38 — Dualsense `initAudioStream()` Tidak Cleanup AudioContext Saat `getUserMedia` Gagal 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:42
- **Catatan:**

PoC line 42 mensyaratkan Web Audio API dapat menangkap aliran audio. Dualsense `initAudioStream()` di `src/utils/audio.js` membuat `AudioContext` sebelum `getUserMedia` — tetapi jika `getUserMedia` gagal (izin ditolak, tidak ada mic), AudioContext yang sudah dibuat **tidak pernah dibersihkan**:

```javascript
// src/utils/audio.js — dualsense initAudioStream()
export async function initAudioStream() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();  // ✅ dibuat
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true }); // ❌ error: tidak cleanup!
  // ⚠️ Jika getUserMedia throw, audioContext menjadi orphan — tidak pernah di-close
  // ...
}
```

Sementara itu, `openAudioGate()` hanya menangkap error dengan `console.warn` tanpa cleanup:

```javascript
// src/main.js — dualsense openAudioGate()
async function openAudioGate() {
  if (audioInitialized) {return;}
  try {
    await initAudioStream();
    audioInitialized = true;
  } catch (err) {
    console.warn('[Audio] Mic unavailable, visual-only mode:', err.message);
    // ❌ Tidak ada cleanup untuk AudioContext yang sudah dibuat di initAudioStream()
  }
}
```

**Perbandingan dengan Vocatone (✅ cleanup benar):**

Vocatone `initAudioStream()` membungkus `getUserMedia` dalam `try/catch` dan membersihkan AudioContext pada error:

```javascript
// src/utils/audio.js — vocatone initAudioStream()
try {
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (err) {
  const ctx = audioContext;
  audioContext = null;
  await ctx.close();                                          // ✅ cleanup AudioContext
  if (err.name === 'NotAllowedError') { throw new Error(...); }
  if (err.name === 'NotFoundError') { throw new Error(...); }
  throw new Error(...);
}
```

**Dampak:**
1. Setiap kali mic gagal (izin ditolak, tidak ada hardware), AudioContext baru menjadi orphan — tidak ada mekanisme cleanup.
2. Pada Chrome/Android WebView, AudioContext yang tidak di-close menghabiskan resource memory dan Web Audio graph — akumulasi hingga puluhan orphan context pada sesi gagal berulang.
3. Karena `openAudioGate()` tidak mereset `audioContext` ke null, panggilan `initAudioStream()` berikutnya membuat AudioContext baru tanpa menutup yang lama.
4. Untuk perangkat <150MB target, orphan AudioContext adalah memory leak yang terakumulasi.

| Branch | Cleanup AudioContext saat getUserMedia gagal | Status |
|--------|---------------------------------------------|--------|
| `feature/vocatone` | `try/catch` + `await ctx.close()` + null ✅ | Sesuai best practice Web Audio API |
| `feature/dualsense` | `audioContext` dibiarkan sebagai orphan ❌ | **Memory leak** — AudioContext tidak pernah di-close |

**Lokasi kode:**
- `feature/dualsense`: `src/utils/audio.js:8-11` — `initAudioStream()` membuat AudioContext tanpa cleanup path saat getUserMedia gagal
- `feature/dualsense`: `src/main.js:71-78` — `openAudioGate()` catch tanpa cleanup
- `feature/vocatone`: `src/utils/audio.js:28-53` — `initAudioStream()` dengan try/catch + cleanup ✅

---

#### S39 — Dualsense `openAudioGate()` Tidak Memiliki Re-Entry Guard untuk `initAudioStream()` Async 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:42
- **Catatan:**

`openAudioGate()` hanya memiliki guard `if (audioInitialized) return;` — tetapi guard ini tidak cukup karena `initAudioStream()` adalah fungsi `async` yang membutuhkan waktu untuk resolve:

```javascript
// src/main.js — dualsense openAudioGate()
async function openAudioGate() {
  if (audioInitialized) {return;}     // ❌ Tidak guard selama async wait
  try {
    await initAudioStream();           // ← async, butuh waktu (getUserMedia)
    audioInitialized = true;
  } catch (err) {
    console.warn('[Audio] Mic unavailable, visual-only mode:', err.message);
  }
}
```

**Skenario race condition:**

1. `onEnter(MIC_OPEN)` → `openAudioGate()` → `initAudioStream()` mulai (pending)
2. LAR drop → `triggerFallback()` → `closeAudioGate()` → `audioInitialized = false` (sudah false)
3. `gatekeeper.reset()` → `onExit(MIC_OPEN)` → `closeAudioGate()` (no-op, audioInitialized sudah false)
4. User buka mulut lagi → `CAMERA_ACTIVE` → `LAR_CHECK` → `MIC_OPEN`
5. `onEnter(MIC_OPEN)` → `openAudioGate()` → guard `audioInitialized` masih `false` → **re-entry!**
6. `initAudioStream()` dipanggil **lagi** — sekarang dua proses async berjalan konkuren

```javascript
// Skenario konkuren (dua initAudioStream berjalan):
// Stream #1: menunggu getUserMedia resolve
// Stream #2: menunggu getUserMedia resolve (dipanggil saat #1 masih pending)
// Keduanya menggunakan module-level `audioContext` dan `mediaStream` — race!
```

**Perbandingan dengan Vocatone (✅ `audio_initializing` guard):**

Vocatone menambahkan flag `audio_initializing` sebagai re-entry guard:

```javascript
// src/main.js — vocatone onFaceLandmarks()
if (!audio_initialized && !audio_initializing   // ✅ Guard ganda
    && gatekeeper.getState() === STATES.LAR_CHECK) {
  audio_initializing = true;                      // ✅ Kunci re-entry
  initAudioStream()
    .then(() => { audio_initialized = true; audio_initializing = false; })
    .catch(() => { audio_initializing = false; });
}
```

**Dampak:**
1. Dua (atau lebih) `initAudioStream()` berjalan konkuren — keduanya membaca/menulis `audioContext` dan `mediaStream` yang sama (module-level), menyebabkan race condition.
2. Salah satu stream bisa overwrite `mediaStream` stream yang lain — referensi stream hilang, tidak bisa di-stop.
3. AnalyserNode dikonfigurasi ulang oleh stream kedua sementara stream pertama masih menggunakan buffer — dataArray tidak konsisten.
4. Resource leak: stream getUserMedia yang tergantikan tetap hidup (tidak di-stop) — microphone hardware tetap aktif.

| Branch | Re-entry guard untuk async initAudioStream | Status |
|--------|--------------------------------------------|--------|
| `feature/vocatone` | `audio_initializing` flag — mencegah re-entry ✅ | Aman — inisialisasi serial |
| `feature/dualsense` | Hanya `audioInitialized` — tidak guard async ❌ | **Race condition** — konkuren initAudioStream |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:71-78` — `openAudioGate()` tanpa re-entry guard
- `feature/vocatone`: `src/main.js:100-117` — `audio_initializing` guard di `onFaceLandmarks()` ✅

---

#### S18 — Dualsense Flash Opacity < 30% — Semua Kelas di Bawah Blueprint 🟢

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **PoC Line:** 50_PERCENT_OF_MVP.md:79
- **Catatan:**

Semua kelas flash CSS di dualsense memiliki opacity di bawah 30% yang ditentukan blueprint:

```css
/* src/styles/main.css — dualsense */
.flash-success { opacity: 0.25 !important; }   /* harus 0.30 */
.flash-warning { opacity: 0.2  !important; }   /* harus 0.30 */
.flash-error   { opacity: 0.25 !important; }   /* harus 0.30 */
.flash-idle    { opacity: 0.15 !important; }   /* harus 0.30 + warna #F8FAFC bukan merah */
```

Selain opacity yang kurang, `flash-idle` menggunakan warna merah (#EF4444) bukan warna muted (#F8FAFC) seperti yang ditentukan di blueprint.

| Branch | Flash opacity | Status |
|--------|--------------|--------|
| `feature/vocatone` | 20% (via Canvas fillRect) ⚠️ | Mendekati |
| `feature/dualsense` | 15-25% — semua < 30% ❌ | **Di bawah blueprint** |

**Lokasi kode:**
- `feature/dualsense`: `src/styles/main.css` — `.flash-success { opacity: 0.25 }`, `.flash-warning { opacity: 0.2 }`, `.flash-error { opacity: 0.25 }`, `.flash-idle { opacity: 0.15 }`

---

#### S19 — VocaTone Mic Error Messages Dead Code — `.catch()` Buang Error Object 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:42
- **Catatan:**

VocaTone `src/utils/audio.js` memiliki error handling detail dengan 3 pesan spesifik untuk skenario kegagalan mic (NotAllowedError, NotFoundError, NotReadableError). Namun, `src/main.js` sebagai pemanggil membuang error object tersebut:

```javascript
// src/main.js — vocatone
initAudioStream()
  .then(() => { /* ... */ })
  .catch(() => {                          // ❌ Parameter error dihapus!
    console.warn('Audio stream initialization failed');
    audio_initializing = false;
  });
```

Parameter error di `.catch(() => { ... })` dihilangkan sepenuhnya — pesan error detail dari `audio.js` tidak pernah sampai ke pengguna. Di Chrome/Android target, user tidak mendapat notifikasi jika mic ditolak atau tidak ditemukan.

| Branch | Mic error consumption | Status |
|--------|----------------------|--------|
| `feature/vocatone` | `.catch()` tanpa parameter — error dibuang ❌ | **Dead code** |
| `feature/dualsense` | Silent catch + console.warn (S15) ❌ | Sudah tercatat |

**Lokasi kode:**
- `feature/vocatone`: `src/utils/audio.js:25-50` — pesan error detail (dibuang)
- `feature/vocatone`: `src/main.js:114-117` — `.catch(() => { ... })` tanpa parameter error

---

#### S20 — Dualsense restingMouthWidth Kalibrasi Asumsi Frame Pertama Adalah Resting 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:69
- **Catatan:**

`restingMouthWidth` diinisialisasi ke `Infinity` dan diisi dari frame FaceMesh pertama:

```javascript
// src/main.js — dualsense
let restingMouthWidth = Infinity;

// onFaceLandmarks() — setiap frame:
if (lastMouthWidth > 0 && lastMouthWidth < restingMouthWidth) {
  restingMouthWidth = lastMouthWidth;   // ← diisi dari frame pertama
}
```

**Masalah:** Frame pertama bisa merekam posisi mulut apa pun (menganga untuk /a/, meringis untuk /i/, sedang fonasi), bukan posisi resting/netral. Karena `restingMouthWidth` hanya bisa **menurun** (tidak pernah naik), bias dari frame pertama bersifat permanen.

Ini langsung memengaruhi deteksi /i/:
```javascript
const isMouthSpread = lastMouthWidth > restingMouthWidth * SPREAD_TRIGGER;
```

- Jika frame pertama menangkap **mulut menganga** → `restingMouthWidth` terlalu besar → `isMouthSpread` mungkin **tidak pernah** terpicu
- Jika frame pertama menangkap **mulut meringis** → `restingMouthWidth` terlalu kecil → `isMouthSpread` terpicu **prematur**

| Branch | Kalibrasi resting | Risiko |
|--------|------------------|--------|
| `feature/vocatone` | N/A — tidak pakai mouth width | N/A |
| `feature/dualsense` | Single-frame first-touch, tanpa validasi ❌ | /i/ gagal diam-diam |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:70` — `let restingMouthWidth = Infinity;`
- `feature/dualsense`: `src/main.js:228` — kalibrasi frame pertama
- `feature/dualsense`: `src/main.js:225` — `const isMouthSpread = lastMouthWidth > restingMouthWidth * SPREAD_TRIGGER;`

---

#### S21 — Dualsense LAR_CHECK Gagal Transisi ke IDLE (Full Reset), Bukan CAMERA_ACTIVE 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:26, 70
- **Catatan:**

S10 mendokumentasikan `triggerFallback()` yang reset ke IDLE dari MIC_OPEN. **S21 adalah kode path berbeda** — di dalam state LAR_CHECK, validasi gagal juga transisi ke IDLE:

```javascript
// src/main.js — dualsense onFaceLandmarks()
if (currentState === STATES.LAR_CHECK) {
  const checkMode = gatekeeper.getMode();
  if (checkMode === 'A' && lastLar >= lar_threshold.high) {
    gatekeeper.transitionTo(STATES.MIC_OPEN, { mode: 'A' });  // ✅ sukses
  } else {
    gatekeeper.transitionTo(STATES.IDLE);                      // ❌ full reset!
  }
}
```

Transisi ke IDLE memicu `onEnter(IDLE)` yang menutup mic, menghentikan polling, dan membersihkan flash. State machine berhenti total — padahal seharusnya cukup kembali ke CAMERA_ACTIVE untuk monitoring berkelanjutan (per PoC line 70: kamera tetap harus memonitor).

**Dampak vs S10 (triggerFallback):**
- S10: `triggerFallback()` dipanggil dari MIC_OPEN — LAR sudah lolos validasi, lalu drop
- S21: LAR_CHECK block dieksekusi **sebelum** MIC_OPEN — LAR gagal di gate pertama
- Keduanya sama-sama reset ke IDLE, tapi via kode path berbeda

| Branch | LAR_CHECK gagal | Status |
|--------|----------------|--------|
| `feature/vocatone` | `transitionTo(IDLE)` (sama) ⚠️ | Sama, tapi vocatone single-vokal |
| `feature/dualsense` | `transitionTo(IDLE)` — hard reset ❌ | **Harusnya CAMERA_ACTIVE** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:236-243` — LAR_CHECK block dengan `transitionTo(STATES.IDLE)` gagal

---

#### S22 — Dualsense outOfThresholdSince Tidak Direset Saat Keluar MIC_OPEN 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:69-70
- **Catatan:**

`outOfThresholdSince` hanya direset di dalam `triggerFallback()`, tetapi **tidak** di `onExit(MIC_OPEN)`:

```javascript
// src/main.js — dualsense
let outOfThresholdSince = 0;

// onExit(MIC_OPEN) — tidak reset outOfThresholdSince ❌
gatekeeper.onExit(STATES.MIC_OPEN, () => {
  setVowelIndicator(null);
  closeAudioGate();
  stopPitchPolling();
  clearAllFlash();
  // outOfThresholdSince tetap bernilai lama!
});

// triggerFallback() — satu-satunya tempat reset
function triggerFallback(mode) {
  outOfThresholdSince = 0;  // ✅ direset di sini
}
```

**Race condition:**
1. User di MIC_OPEN (mode 'A'), LAR drop → `outOfThresholdSince = performance.now()`
2. Sebelum debounce 300ms, state pindah ke IDLE (misal face loss)
3. `onExit(MIC_OPEN)` tidak reset `outOfThresholdSince`
4. User buka mulut lagi → CAMERA_ACTIVE → LAR_CHECK → MIC_OPEN
5. `outOfThresholdSince` masih menyimpan timestamp lama
6. Jika LAR < threshold di frame pertama setelah re-entry:
   - `outOfThresholdSince !== 0` (nilai lama)
   - `performance.now() - outOfThresholdSince > 300` bisa **immediately true**
   - **Fallback prematur!**

| Branch | Reset onExit(MIC_OPEN) | Risiko |
|--------|------------------------|--------|
| `feature/vocatone` | N/A — mekanisme fallback berbeda | N/A |
| `feature/dualsense` | Tidak direset ❌ | Fallback prematur |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:71` — `let outOfThresholdSince = 0;`
- `feature/dualsense`: `src/main.js:137-142` — `onExit(MIC_OPEN)` tanpa reset
- `feature/dualsense`: `src/main.js:239` — `triggerFallback()` mereset

---

#### S23 — Dualsense Konstanta SPREAD_TRIGGER/SPREAD_SUSTAIN di Dalam Hot-Path Callback 🟢

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **PoC Line:** AGENTS.md — memory constraint <150MB
- **Catatan:**

Konstanta `SPREAD_TRIGGER` (1.3) dan `SPREAD_SUSTAIN` (1.15) dideklarasikan sebagai `const` di dalam fungsi `onFaceLandmarks()` yang dipanggil setiap frame FaceMesh (15 FPS):

```javascript
// src/main.js — dualsense onFaceLandmarks()
function onFaceLandmarks(landmarks) {
  const SPREAD_TRIGGER = 1.3;    // ❌ dideklarasi setiap frame
  const SPREAD_SUSTAIN = 1.15;   // ❌ dideklarasi setiap frame
  // ...
}
```

Konstanta ini tidak pernah berubah dan seharusnya dideklarasikan di level module seperti konstanta lain (`NO_FACE_TIMEOUT = 1500`). Walaupun V8 mengoptimasi `const`, deklarasi ulang setiap 66ms menambah tekanan GC pada perangkat <150MB.

| Branch | Pola konstanta | Status |
|--------|---------------|--------|
| `feature/vocatone` | Semua konstanta module-level ✅ | Best practice |
| `feature/dualsense` | `SPREAD_TRIGGER`/`SPREAD_SUSTAIN` di dalam callback ❌ | Hot-path allocation |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:222-223` — `const SPREAD_TRIGGER = 1.3;` dan `const SPREAD_SUSTAIN = 1.15;`

---

#### S24 — Dualsense Silhouette RAF Loop 60Hz Terlepas dari FaceMesh 15FPS 🟢

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **PoC Line:** 50_PERCENT_OF_MVP.md:82
- **Catatan:**

Silhouette overlay loop berjalan via `requestAnimationFrame` (60Hz) independen dari pipeline FaceMesh yang throttle di 15 FPS:

```javascript
// src/main.js — dualsense startSilhouetteLoop()
function startSilhouetteLoop() {
  function loop() {
    silhouetteRAF = requestAnimationFrame(loop);  // 60 fps
    overlayCtx.clearRect(...);
    drawSilhouette(overlayCtx, ..., mouthData);   // mouthData update di 15 fps
  }
  loop();
}
```

`mouthData` diisi di `onFaceLandmarks()` di **15 FPS**, tapi `drawSilhouette()` membaca di **60 FPS**. Untuk 45 dari 60 frame per detik, data yang sama digambar ulang tanpa perubahan — membuang siklus CPU di perangkat <150MB.

Sebaliknya, VocaTone `drawMouthOverlay()` dipanggil langsung di dalam `onResults()` FaceMesh, sehingga hanya redraw saat ada data baru (20 FPS).

| Branch | Refresh rate siluet | Efisiensi |
|--------|--------------------|-----------|
| `feature/vocatone` | Di dalam `onResults()` di 20 FPS ✅ | Efisien |
| `feature/dualsense` | RAF loop di 60 Hz ❌ | ~75% frame redundant |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:177-191` — `startSilhouetteLoop()` dengan RAF loop 60Hz

---

#### S25 — VocaTone Butuh Kamera + FaceMesh Meskipun Spek Audio-Only 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:30-48
- **Catatan:**

50% PoC Section 3 (VocaTone Engine) mendefinisikan pipeline audio-only:

```
[Suara Masuk] ──> [Noise Floor Gate: RMS > 0.01] ──> [Autocorrelation] ──> [Canvas Y-Axis]
```

Tidak ada kamera dalam pipeline. AGENTS.md juga menyatakan: *"Audio-only pipeline. No camera dependency. Sequential Validation Logic does NOT apply."*

Namun, VocaTone `src/main.js` menginisialisasi kamera + FaceMesh penuh dan menerapkan Sequential Validation Gate:

```javascript
// src/main.js — vocatone startSession()
camera_controller = initCamera(cameraFeed, {
  onFaceLandmarks,
  onNoFace,
  overlayCanvas,
});
await camera_controller.start();

// onFaceLandmarks() — Sequential Validation Gate
if (current_state === STATES.CAMERA_ACTIVE && lar >= threshold) {
  gatekeeper.transitionTo(STATES.LAR_CHECK);
}
// Mic hanya inisialisasi setelah LAR_CHECK
```

**Dampak:**
- VocaTone **membutuhkan kamera** untuk berfungsi — objek tidak akan naik tanpa deteksi wajah + LAR
- Di perangkat tanpa kamera atau izin kamera ditolak, VocaTone tidak berfungsi sama sekali
- Sequential Validation Logic tidak sesuai untuk modul audio-only

| Spek vs Implementasi | Audio-only? | Butuh kamera? | Sequential Gate? |
|---------------------|-------------|---------------|------------------|
| 50_PERCENT_OF_MVP.md Section 3 | ✅ Audio murni | ❌ Tidak disebut | ❌ Tidak disebut |
| `feature/vocatone` aktual | ❌ Tidak — butuh kamera | ✅ Ya, wajib | ✅ Ya, diterapkan |

**Lokasi kode:**
- `feature/vocatone`: `src/main.js:123-137` — inisialisasi kamera di `startSession()`
- `feature/vocatone`: `src/main.js:83-89` — Sequential Validation Gate
- `feature/vocatone`: `src/main.js:1` — import dari `vision.js`

---

#### S26 — Dualsense Tidak Ada `onEnter(LAR_CHECK)` — Tidak Ada Inisialisasi State Gate 🟢

- **Refactor:** ❌ Belum
- **Prioritas:** 🟢 Ringan
- **PoC Line:** 50_PERCENT_OF_MVP.md:26, 68-69
- **Catatan:**

Dualsense hanya mendaftarkan 3 lifecycle callback state:
- `onEnter(MIC_OPEN)` ✅
- `onExit(MIC_OPEN)` ✅
- `onEnter(IDLE)` ✅

Callback yang **tidak ada**:
- `onEnter(LAR_CHECK)` ❌
- `onEnter(CAMERA_ACTIVE)` ❌
- `onExit(CAMERA_ACTIVE)` ❌
- `onExit(LAR_CHECK)` ❌
- `onExit(IDLE)` ❌

Ketiadaan `onEnter(LAR_CHECK)` berarti tidak ada inisialisasi state saat memasuki gate validasi LAR — seharusnya setidaknya mereset `outOfThresholdSince` untuk mencegah kontaminasi antar sesi (lihat S22).

| Branch | `onEnter(LAR_CHECK)` | Risiko |
|--------|----------------------|--------|
| `feature/vocatone` | Tidak ada (sama) ⚠️ | Rendah — state machine sederhana |
| `feature/dualsense` | Tidak ada ❌ | Stale state antar sesi |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:133-149` — hanya callback MIC_OPEN dan IDLE

---

#### S27 — Dualsense Tidak Ada `onNoFace` Callback di FaceMesh Pipeline 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:70
- **Catatan:**

PoC line 70 mensyaratkan *Instant Fallback* — jika bentuk bibir berubah mendadak, gerbang mikrofon wajib ditutup **secara instan**. Dualsense melanggar ini karena tidak memiliki callback `onNoFace` di pipeline FaceMesh, sehingga kehilangan wajah tidak terdeteksi secara real-time.

**Akar masalah — `initCamera()` hanya 2 parameter callback:**

Dualsense `initCamera()` di `src/utils/vision.js` hanya menerima `onResults` (face detected) dan `onError` — **tidak ada parameter untuk `onNoFace`**:

```javascript
// src/utils/vision.js — dualsense initCamera()
export function initCamera(videoElement, onResults, onError) { ... }
```

Akibatnya, `faceMesh.onResults()` hanya memanggil `onResults()` saat wajah terdeteksi:

```javascript
// src/utils/vision.js — dualsense faceMesh.onResults()
if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
  onResults(results.multiFaceLandmarks[0]);
}
// ❌ Tidak ada else branch — tidak ada panggilan ke callback "no face"
```

Deteksi face loss hanya mungkin via polling `startMonitor()` di `src/main.js` yang berjalan setiap **500ms**:

```javascript
// src/main.js — dualsense startMonitor()
monitorTimer = setInterval(() => {
  const now = performance.now();
  const faceGone = now - lastFaceTime > NO_FACE_TIMEOUT;
  // ❌ Deteksi face loss hanya via polling, delay hingga 500ms
}, 500);
```

**Perbandingan dengan Vocatone (✅ callback-based):**

Vocatone `initCamera()` di `src/utils/vision.js` menerima objek callbacks dengan properti `onFaceLandmarks` **dan** `onNoFace`:

```javascript
// src/utils/vision.js — vocatone initCamera()
function initCamera(videoElement, callbacks) {
  const { onFaceLandmarks, onNoFace, overlayCanvas } = callbacks;
  // ...
  face_mesh.onResults((results) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      // ...
      onFaceLandmarks(landmarks);
    } else if (onNoFace) {
      onNoFace();    // ✅ Dipanggil INSTAN saat frame tanpa wajah
    }
  });
}
```

**Dampak:**

1. Face loss saat MIC_OPEN — tidak ada reaksi instan. Mic tetap terbuka hingga maksimal 500ms (memperparah S11).
2. Face loss saat CAMERA_ACTIVE — timer 1500ms NO_FACE_TIMEOUT baru dimulai setelah 500ms polling → total delay hingga 2000ms.
3. Tidak ada transisi state machine saat face loss — harus menunggu polling cycle.
4. Inkonsisten dengan Vocatone yang menggunakan arsitektur callback instan.

| Branch | Arsitektur deteksi face loss | Latensi respons | Status |
|--------|------------------------------|-----------------|--------|
| `feature/vocatone` | Callback `onNoFace()` instan dari FaceMesh ✅ | ~0ms (next frame) | ✅ Sesuai PoC |
| `feature/dualsense` | Polling `setInterval` 500ms ❌ | 0–500ms + NO_FACE_TIMEOUT | ❌ **Melanggar** |

**Lokasi kode:**
- `feature/dualsense`: `src/utils/vision.js:96-99` — `initCamera()` tanpa parameter onNoFace
- `feature/dualsense`: `src/utils/vision.js:114-120` — `faceMesh.onResults()` tanpa else branch
- `feature/dualsense`: `src/main.js:306-330` — `startMonitor()` polling 500ms
- `feature/vocatone`: `src/utils/vision.js:134-148` — `initCamera()` dengan objek callbacks + `onNoFace`
- `feature/vocatone`: `src/utils/vision.js:177-183` — `faceMesh.onResults()` dengan else `onNoFace()`

---

#### S28 — VocaTone Flash Feedback Static Tint, Bukan "Layar Berkedip" 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:79
- **Catatan:**

PoC line 79 secara eksplisit menyebut **"Layar Berkedip Hijau"** (blinking/flashing):

> *"Layar Berkedip Hijau: Aktif secara instan di latar belakang canvas jika motorik wajah (LAR) memenuhi syarat berbarengan dengan frekuensi audio (f₀) yang stabil."*

PoC line 80 juga menyebut "Layar Berkedip Kuning" — semuanya mengimplikasikan animasi **blink/kedip**, bukan static tint.

VocaTone mengimplementasikan flash feedback sebagai **static fillRect dengan opacity konstan**, tanpa animasi berkedip:

```javascript
// src/components/game.js — vocatone _drawBackground()
const BG_STABLE = 'rgba(34, 197, 94, 0.2)';   // hijau statis — tidak berkedip
const BG_SHRILL = 'rgba(234, 179, 8, 0.2)';   // kuning statis — tidak berkedip

_drawBackground() {
  if (state === 'stable') {
    ctx.fillStyle = BG_STABLE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);  // ❌ Tint statis
  } else if (state === 'shrill') {
    ctx.fillStyle = BG_SHRILL;
    ctx.fillRect(0, 0, canvas.width, canvas.height);  // ❌ Tint statis
  }
}
```

**Perbandingan dengan Dualsense (via DOM):**

Dualsense menggunakan DOM class toggle dengan CSS transition 300ms untuk efek flash:

```css
/* src/styles/main.css — dualsense */
.flash-success { background-color: #22C55E; opacity: 0.25; }
```

Meskipun Dualsense juga tidak mengimplementasikan "berkedip" secara literal (blinking on/off), pendekatan DOM class toggle-nya memungkinkan efek transient (triggerFlash dengan setTimeout 500ms) — lebih mendekati "berkedip" daripada static tint Vocatone.

| Branch | Implementasi Flash | Efek Berkedip? | Status |
|--------|-------------------|----------------|--------|
| `feature/vocatone` | `fillRect` static tint 20% opacity ❌ | Tidak — warna solid statis | ❌ **Menyimpang** |
| `feature/dualsense` | DOM class toggle + setTimeout 500ms ⚠️ | Transient (500ms lalu hilang), bukan blink berulang | ⚠️ Mendekati |

**Lokasi kode:**
- `feature/vocatone`: `src/components/game.js:31-32` — konstanta `BG_STABLE`, `BG_SHRILL`
- `feature/vocatone`: `src/components/game.js:267-277` — `_drawBackground()` dengan fillRect statis
- `feature/dualsense`: `src/main.js:185-197` — `triggerFlash()` dengan setTimeout 500ms
- `feature/dualsense`: `src/styles/main.css` — class `.flash-success`, `.flash-warning` dengan CSS transition

---

#### S29 — Dualsense `closeAudioStream()` Tanpa `await` — Resource Leak Risk 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:42
- **Catatan:**

Dualsense `closeAudioStream()` di `src/utils/audio.js` memanggil `audioContext.close()` tanpa `await`, menyebabkan Promise unresolved dan potensi leak AudioContext:

```javascript
// src/utils/audio.js — dualsense closeAudioStream()
if (audioContext) {
    audioContext.close();        // ❌ Tanpa await
    audioContext = null;
}
```

Vocatone mengimplementasikan dengan `await`:

```javascript
// src/utils/audio.js — vocatone closeAudioStream()
await ctx.close();               // ✅ Await sampai close selesai
```

`AudioContext.close()` mengembalikan Promise dan transisi ke state `'closed'` bersifat async. Tanpa `await`, code setelahnya bisa lanjut sebelum context benar-benar tertutup. Jika `initAudioStream()` dipanggil lagi cepat (misal fallback → re-init), AudioContext baru bisa dibuat sebelum yang lama selesai ditutup — berpotensi orphan context.

**Dampak:**
1. Pada perangkat <150MB target, AudioContext orphan = memory leak.
2. Race condition: `audioContext = null` dijalankan sebelum `close()` selesai → `initAudioStream()` membuat context baru → dua context hidup bersamaan.
3. Chrome/Android WebView dapat membatasi jumlah AudioContext concurrent — leak menyebabkan `initAudioStream()` gagal setelah beberapa siklus fallback.

| Branch | `audioContext.close()` | Risiko |
|--------|----------------------|--------|
| `feature/vocatone` | `await ctx.close()` ✅ | Aman — tunggu close selesai |
| `feature/dualsense` | Fire-and-forget tanpa await ❌ | **Memory leak / orphan context** |

**Lokasi kode:**
- `feature/dualsense`: `src/utils/audio.js:30` — `audioContext.close();` tanpa await
- `feature/vocatone`: `src/utils/audio.js:62` — `await ctx.close();` dengan await ✅

---

#### S30 — Dualsense `cameraController.start()` Fire-and-Forget — Silent Failure 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:42
- **Catatan:**

Dualsense `startSession()` memanggil `cameraController.start()` tanpa `await` dan tanpa `try/catch`:

```javascript
// src/main.js — dualsense startSession()
cameraController = initCamera(cameraFeed, onFaceLandmarks, showCameraError);
if (cameraController) {
    cameraController.start();              // ❌ Fire-and-forget — Promise tidak di-await
}
```

`camera.start()` adalah async function yang melempar error jika kamera gagal. Tanpa `await`, error menjadi **unhandled promise rejection** — tidak ada feedback ke user:

```javascript
// src/utils/vision.js — dualsense camera.start override
camera.start = async () => {
    try {
      await origStart();
    } catch (err) {
      // onError dipanggil di sini ✅
      if (onError) {onError(err);}
    }
};
```

Sebaliknya, Vocatone meng-await start dengan try/catch penuh:

```javascript
// src/main.js — vocatone startSession()
try {
    await camera_controller.start();      // ✅ Await + try/catch
} catch (err) {
    console.error(`Camera start failed: ${err.message}`);
    session_active = false;
}
```

**Dampak:**
1. Walaupun error handling ada di dalam `camera.start()`, Promise rejection tetap terjadi dan bisa memicu `unhandledrejection` event global.
2. Tidak ada error propagation ke `startSession()` — fungsi lanjut seolah sukses meskipun kamera gagal.
3. `session_active` tetap `true` meskipun kamera mati — aplikasi dalam state invalid (mic bisa terbuka tanpa kamera).

| Branch | Camera start pattern | Status |
|--------|---------------------|--------|
| `feature/vocatone` | `await` dalam `try/catch` ✅ | Error tertangkap + session_active di-reset |
| `feature/dualsense` | Fire-and-forget tanpa await ❌ | **Silent failure / unhandled rejection** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:467-469` — `cameraController.start()` tanpa await
- `feature/dualsense`: `src/utils/vision.js:131-150` — `camera.start` override dengan internal error handling
- `feature/vocatone`: `src/main.js:133-137` — `await camera_controller.start()` dalam try/catch ✅

---

#### S31 — Dualsense `isF0*` Flags Stale Setelah Fallback 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:70, 79
- **Catatan:**

Dualsense memiliki tiga boolean flag untuk status pitch: `isF0Shrill`, `isF0Stable`, `isF0InRange`. Flag ini di-reset di `startPitchPolling()` tetapi **tidak** di `triggerFallback()` atau `onEnter(IDLE)`:

```javascript
// src/main.js — dualsense triggerFallback()
function triggerFallback(mode) {
    closeAudioGate();
    gatekeeper.reset();
    clearAllFlash();
    flashOverlay.classList.add('flash-error');
    outOfThresholdSince = 0;
    fallbackMode = mode;
    larValidSince = 0;
    // ❌ Tidak ada reset: isF0Shrill, isF0Stable, isF0InRange
}

// src/main.js — dualsense onEnter(IDLE)
gatekeeper.onEnter(STATES.IDLE, () => {
    closeAudioGate();
    stopPitchPolling();         // Hanya clear interval — tidak reset flags
    setVowelIndicator(null);
    clearAllFlash();
    // ❌ Tidak ada reset: isF0Shrill, isF0Stable, isF0InRange
});
```

Flag hanya di-reset di `startPitchPolling()`:

```javascript
function startPitchPolling() {
    stopPitchPolling();
    isF0InRange = false;
    isF0Stable = false;
    isF0Shrill = false;
    // ...
}
```

**Race condition teoritis:**
1. User di MIC_OPEN, pitch stabil → `isF0Stable = true`
2. LAR drop → `triggerFallback()` dipanggil
3. `closeAudioGate()` → audio berhenti
4. `gatekeeper.reset()` → state → IDLE, `onEnter(IDLE)` → `stopPitchPolling()`, `clearAllFlash()`
5. Di frame **sebelum** FaceMesh callback berikutnya, logika flash di `onFaceLandmarks()` membaca `currentState` yang sudah IDLE → langsung `flash-error` ✅

Namun, jika ada kode path di masa depan yang membaca `isF0*` flags setelah fallback tanpa guard `currentState === MIC_OPEN`, stale flags akan menyebabkan perilaku tidak terdefinisi.

| Branch | Reset `isF0*` on fallback | Risiko |
|--------|--------------------------|--------|
| `feature/vocatone` | N/A — state machine berbeda | N/A |
| `feature/dualsense` | Tidak direset di `triggerFallback()` / `onEnter(IDLE)` ❌ | **Stale state — potensi flash salah di masa depan** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:229-239` — `triggerFallback()` tanpa reset `isF0*`
- `feature/dualsense`: `src/main.js:133-137` — `onEnter(IDLE)` tanpa reset `isF0*`
- `feature/dualsense`: `src/main.js:159-166` — `startPitchPolling()` (satu-satunya tempat reset)

---

#### S32 — Dualsense `transitionTo()` Silent Return — State Violation Tidak Terdeteksi 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:26
- **Catatan:**

PoC line 26 mendefinisikan Sequential Validation Engine sebagai pipeline yang ketat: IDLE → CAMERA_ACTIVE → LAR_CHECK → MIC_OPEN. State machine harus **strict** — transisi invalid wajib dideteksi.

Dualsense `transitionTo()` menggunakan `console.warn()` + `return` pada transisi invalid:

```javascript
// src/utils/gatekeeper.js — dualsense transitionTo()
transitionTo(targetState, options) {
    if (!this.canTransitionTo(targetState)) {
        console.warn(`[GateKeeper] Invalid transition: ${this.#currentState} → ${targetState}`);
        return;   // ❌ Silent — developer tidak tahu ada state violation
    }
    // ...
}
```

Vocatone melempar `Error`:

```javascript
// src/utils/gatekeeper.js — vocatone transitionTo()
transitionTo(targetState) {
    if (!allowed || !allowed.includes(targetState)) {
        throw new Error(
            `Invalid transition: '${this.#currentState}' → '${targetState}'. ` +
            `Allowed transitions from '${this.#currentState}': ${(allowed || []).join(', ') || 'none'}.`
        );
    }
    // ...
}
```

**Dampak:**
1. State violation tidak terdeteksi saat development — bug tidak muncul sebagai crash.
2. Sequential Validation Gate kehilangan jaminan integritas — transisi bisa gagal diam-diam.
3. Contoh: `transitionTo(MIC_OPEN)` dari IDLE (tanpa CAMERA_ACTIVE/LAR_CHECK) → silent return → user stuck di IDLE tanpa feedback.
4. PoC sequential validation "mengunci sensor mikrofon agar berstatus mati secara default" membutuhkan state machine yang strict agar jaminan terjaga.

| Branch | Invalid transition behavior | Dampak |
|--------|---------------------------|--------|
| `feature/vocatone` | `throw Error` — crash terlihat ✅ | Bug terdeteksi langsung |
| `feature/dualsense` | `console.warn` + silent return ❌ | **State violation silent** |

**Lokasi kode:**
- `feature/dualsense`: `src/utils/gatekeeper.js:33-37` — `canTransitionTo()` check dengan silent return
- `feature/vocatone`: `src/utils/gatekeeper.js:62-69` — `throw new Error(...)` pada invalid transition ✅

---

#### S33 — Dualsense IDLE→CAMERA_ACTIVE via `onFaceLandmarks()` Bypass Session Init 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:26
- **Catatan:**

Dualsense `onFaceLandmarks()` memiliki kode path yang mentransisikan state machine dari IDLE ke CAMERA_ACTIVE langsung dari callback FaceMesh — tanpa melalui `startSession()`:

```javascript
// src/main.js — dualsense onFaceLandmarks()
if (currentState === STATES.IDLE) {
    if (lastLar >= lar_threshold.high) {
        gatekeeper.transitionTo(STATES.CAMERA_ACTIVE);   // ❌ Bypass session init
    } else if (isMiddleLar && isMouthSpread) {
        gatekeeper.transitionTo(STATES.CAMERA_ACTIVE);   // ❌ Bypass session init
    }
}
```

Jika user membuka mulut sebelum menekan Start, state machine pindah ke CAMERA_ACTIVE tanpa:
- `startSilhouetteLoop()` — tidak ada overlay oval
- `startMonitor()` — tidak ada monitor interval
- `preGrantAudioPermission()` — tidak ada pre-grant mic
- Sizing overlay canvas — belum di-set

Ketika `startSession()` dipanggil kemudian, ia memanggil `gatekeeper.transitionTo(STATES.CAMERA_ACTIVE)` — tapi state sudah di CAMERA_ACTIVE, jadi transisi invalid (no-op silent return, lihat S32). Fungsi setup lain (silhouette loop, monitor) tetap dipanggil, jadi tidak total loss, tetapi state machine tidak melalui lifecycle yang benar.

| Branch | IDLE → CAMERA_ACTIVE path | Status |
|--------|--------------------------|--------|
| `feature/vocatone` | Hanya via `startSession()` → `transitionTo(CAMERA_ACTIVE)` ✅ | Lifecycle terkontrol |
| `feature/dualsense` | Juga via `onFaceLandmarks()` callback — tanpa setup ❌ | **Bypass session init** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:245-252` — IDLE→CAMERA_ACTIVE di dalam `onFaceLandmarks()`
- `feature/dualsense`: `src/main.js:453-470` — `startSession()` yang seharusnya menjadi satu-satunya entry point

---

#### S34 — Kedua Branch `MIN_PITCH_HZ` Hardcoded 50 Hz, Tidak Pakai `f_min` dari Constants 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** AGENTS.md — `f_min` sebagai konfigurasi pitch detection
- **Catatan:**

AGENTS.md mendefinisikan `f_min` sebagai "Minimum frequency (Hz) for pitch detection" — mengimplikasikan nilai ini digunakan sebagai batas bawah search range autocorrelation. Kedua branch menggunakan hardcoded `MIN_PITCH_HZ = 50` di `audio.js`, tidak mengimpor `f_min` dari `constants.js`:

```javascript
// src/utils/audio.js — vocatone & dualsense (sama)
const MIN_PITCH_HZ = 50;         // ❌ Hardcoded, tidak pakai constants.js
const MAX_PITCH_HZ = 800;

// src/utils/constants.js — shared
export const f_min = 150;        // ✅ Konfigurasi terpusat (vocatone)
export const f_min = 100;        // ✅ Konfigurasi terpusat (dualsense)
```

Akibatnya, rentang search autocorrelation adalah **50–800 Hz** di kedua branch, bukan `f_min–f_max` dari konfigurasi:

```javascript
const minLag = Math.floor(sampleRate / MAX_PITCH_HZ);  // sampleRate/800
const maxLag = Math.ceil(sampleRate / MIN_PITCH_HZ);   // sampleRate/50
// Pada 44100 Hz: minLag=55, maxLag=882
// Seharusnya dengan f_min=150: maxLag=ceil(44100/150)=294
```

**Dampak:**
1. Autocorrelation mencari pitch hingga 50 Hz (vocal fry) — ~3× lebih banyak lag dari yang diperlukan.
2. Pada 44100 Hz, loop memproses 828 lag (55–882) bukan 294 lag (55–294) — CPU tak berguna.
3. `f_min` dan `f_max` hanya digunakan sebagai post-filter (app-level check `pitch >= f_min`), bukan sebagai parameter DSP — melanggar definisi AGENTS.md sebagai "minimum frequency for pitch detection".

| Branch | Search range (aktual) | Search range (seharusnya) | CPU waste |
|--------|----------------------|--------------------------|-----------|
| `feature/vocatone` | 50–800 Hz (MIN_PITCH_HZ hardcoded) ❌ | 150–350 Hz (f_min/f_max) | ~64% frame waste |
| `feature/dualsense` | 50–800 Hz (MIN_PITCH_HZ hardcoded) ❌ | 100–350 Hz (f_min/f_max) | ~62% frame waste |

**Lokasi kode:**
- `feature/vocatone`: `src/utils/audio.js:15-16` — `MIN_PITCH_HZ = 50`, `MAX_PITCH_HZ = 800`
- `feature/dualsense`: `src/utils/audio.js:5-6` — `MIN_PITCH_HZ = 50`, `MAX_PITCH_HZ = 800`
- `feature/vocatone`: `src/utils/constants.js:2-3` — `f_min = 150`, `f_max = 350` (tidak dipakai)
- `feature/dualsense`: `src/utils/constants.js:2-3` — `f_min = 100`, `f_max = 350` (tidak dipakai DSP)

---

#### S35 — VocaTone Tidak Import constants.js — Threshold LAR 0.3 ≠ 0.5 (Spec) 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:68, AGENTS.md
- **Catatan:**

VocaTone `main.js` tidak mengimpor `constants.js` sama sekali. Sebagai gantinya, mendefinisikan `DEFAULT_LAR_THRESHOLD = 0.3` secara lokal:

```javascript
// src/main.js — vocatone (baris 1-3, tidak ada import constants.js)
import { initCamera, computeLipAspectRatio } from './utils/vision.js';
import { initAudioStream, closeAudioStream, extractPitch } from './utils/audio.js';
import { getProfile } from './utils/db.js';
import gatekeeper, { STATES } from './utils/gatekeeper.js';
import VocaToneGame from './components/game.js';
// ❌ Tidak ada import dari ./utils/constants.js!

// src/main.js — vocatone (baris 10)
const DEFAULT_LAR_THRESHOLD = 0.3;   // ❌ Berbeda dari constants.js (0.5)
```

Sementara `constants.js` di repo yang sama mendefinisikan:

```javascript
// src/utils/constants.js
export const lar_threshold = { high: 0.5, low: 0.2 };   // ✅ Referensi spec
export const f_min = 150;
export const f_max = 350;
```

Juga, `game.js` mendefinisikan `DEFAULT_F_MIN = 150` dan `DEFAULT_F_MAX = 350` secara lokal — nilainya sama dengan constants.js, tetapi duplikasi melanggar DRY.

**Dampak:**
1. VocaTone menggunakan LAR threshold 0.3, bukan 0.5 seperti spec → gerbang audio terbuka lebih mudah (false positive).
2. Tidak ada cara mengubah konfigurasi terpusat — perubahan harus dilakukan di 2 tempat berbeda (main.js + constants.js).
3. Melanggar AGENTS.md: "All database fields, configuration objects, and state variables MUST use exact snake_case naming" — `DEFAULT_LAR_THRESHOLD` tidak mengikuti pola `lar_threshold`.
4. Jika profile IndexedDB menyimpan `lar_threshold.high = 0.5`, VocaTone membaca `profile.lar_threshold?.value` yang undefined → fallback ke 0.3 — profile tidak berguna.

| Branch | Sumber LAR threshold | Nilai | Konsisten dengan constants.js? |
|--------|---------------------|-------|-------------------------------|
| `feature/vocatone` | `DEFAULT_LAR_THRESHOLD` lokal | 0.3 ❌ | Tidak — constants.js punya 0.5 |
| `feature/dualsense` | Import `lar_threshold` dari constants.js ✅ | {high: 0.5, low: 0.2} ✅ | Ya ✅ |

**Lokasi kode:**
- `feature/vocatone`: `src/main.js:1-5` — tidak ada import `./utils/constants.js`
- `feature/vocatone`: `src/main.js:10` — `DEFAULT_LAR_THRESHOLD = 0.3`
- `feature/vocatone`: `src/components/game.js:30-31` — `DEFAULT_F_MIN = 150`, `DEFAULT_F_MAX = 350`
- `feature/vocatone`: `src/utils/constants.js:1-3` — `lar_threshold = { high: 0.5, low: 0.2 }` (tidak dipakai)
- `feature/dualsense`: `src/main.js:4` — `import { lar_threshold, f_min, f_max } from './utils/constants.js';` ✅

---

## 6. SCOPE-05 — UI/UX Pengganti Sensorik

**Dokumen:** `project_context/50_PERCENT_OF_MVP.md` (Baris 74–82)

### 6.1 Binary Visual Feedback — Hijau/Kuning/Merah

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | ⚠️ | Flash via canvas fill — warna sesuai, opacity tidak selalu sesuai | (tercatat di Note 1) |
| `feature/dualsense` | ⚠️ | Flash overlay dengan opacity < 30% | (tercatat di Note 1 U24) |

### 6.2 Mouth Silhouette Calibration — Oval Transparan Statis 🟡 S02

**Baris 82:** *"Menampilkan garis bantu cetakan bentuk mulut (oval transparan) **statis** di atas lapisan kanvas kamera guna membantu proses penyejajaran posisi wajah pengembang saat merekam video demonstrasi."*

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:82
- **Catatan:**

50% PoC mensyaratkan siluet oval yang **statis** — berfungsi sebagai **garis bantu** (alignment guide) yang diam di posisi tetap, sehingga pengguna bisa menyejajarkan wajahnya ke referensi tersebut. Dualsense melanggar "statis" dalam dua aspek:

**Aspek 1: Posisi Oval Dinamis (Mengikuti Midpoint Mulut)**

```javascript
// src/components/overlay.js:6-12 — dualsense drawSilhouette()
if (mouthData) {
  centerX = mouthData.cx * width;   // ← posisi mengikuti mulut
  centerY = mouthData.cy * height;  // ← posisi mengikuti mulut
  radiusX = mouthData.rx * width;
  radiusY = mouthData.ry * height;
} else {
  centerX = width / 2;              // ← statis hanya saat no face
  centerY = height / 2;
  radiusX = width * 0.15;
  radiusY = height * 0.10;
}
```

Saat wajah terdeteksi, oval mengikuti midpoint mulut — ini menjadikannya indikator posisi, bukan **garis bantu statis** untuk penyejajaran. Sebaliknya, VocaTone `drawMouthOverlay()` mempertahankan oval di `(w/2, h/2)` secara konsisten — inilah yang dimaksud "statis" oleh PoC.

**Aspek 2: Animasi Pulsing**

```javascript
// src/components/overlay.js:25 — dualsense drawSilhouette()
const pulse = 0.35 + 0.15 * Math.sin(Date.now() / 500);
ctx.strokeStyle = `rgba(255, 255, 255, ${pulse.toFixed(2)})`;
```

Saat wajah tidak terdeteksi, oval memiliki animasi pulsing (opacity berosilasi 20%-50%) — elemen dinamis yang tidak sesuai dengan spesifikasi "statis".

| Branch | Posisi Oval | Saat Face Detected | Saat No Face | Status |
|--------|------------|-------------------|--------------|--------|
| `feature/vocatone` | Statis di `(w/2, h/2)` — benar ✅ | Oval di tengah ✅ | Tidak ada oval ❌ (U25) | ⚠️ |
| `feature/dualsense` | Dinamis — mengikuti midpoint mulut ❌ | Posisi ikut mulut ❌ | Oval statis di tengah ✅ + animasi pulsing ❌ | ❌ **Melanggar** |

**Dampak:**
- Oval yang mengikuti mulut tidak bisa dijadikan **referensi tetap** untuk penyejajaran posisi wajah.
- Animasi pulsing menambah kompleksitas visual yang tidak diperlukan untuk garis bantu kalibrasi.
- Tujuan utama siluet — membantu user menyejajarkan posisi wajah ke referensi tetap — tidak tercapai.

**Lokasi kode:**
- `feature/dualsense`: `src/components/overlay.js:1-35` — `drawSilhouette()` posisi dinamis + pulsing
- `feature/vocatone`: `src/utils/vision.js:148-184` — `drawMouthOverlay()` posisi statis di `w/2, h/2`

---

#### S06 — Dualsense Flash Feedback via DOM Overlay, Bukan Canvas Background 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:79
- **Catatan:**

PoC line 79 secara eksplisit menyatakan flash feedback harus dirender **"di latar belakang canvas"** :

> *"Layar Berkedip Hijau: Aktif secara instan di latar belakang canvas jika motorik wajah (LAR) memenuhi syarat berbarengan dengan frekuensi audio (f₀) yang stabil."*

Dualsense mengimplementasikan flash feedback menggunakan **DOM element** `<div id="flash-overlay">` dengan CSS class toggle, bukan melalui Canvas 2D rendering API:

```html
<!-- index.html — dualsense -->
<div id="flash-overlay" class="fixed inset-0 pointer-events-none z-40 opacity-0"></div>
```

```css
/* src/styles/main.css — dualsense */
.flash-success { background-color: #22C55E; opacity: 0.25 !important; }
.flash-warning { background-color: #EAB308; opacity: 0.2  !important; }
.flash-error   { background-color: #EF4444; opacity: 0.25 !important; }
```

```javascript
// src/main.js — dualsense onFaceLandmarks()
if (currentState !== STATES.MIC_OPEN) {
  clearAllFlash();
  flashOverlay.classList.add('flash-error');    // ← DOM class toggle
} else if (isF0Shrill) {
  clearAllFlash();
  flashOverlay.classList.add('flash-warning');  // ← DOM class toggle
} else if (isF0InRange && isF0Stable) {
  triggerFlash();                               // ← DOM class toggle flash-success
}
```

Sebaliknya, VocaTone menggunakan Canvas `fillRect` untuk background tint yang langsung dirender ke canvas:

```javascript
// src/components/game.js — vocatone _drawBackground()
if (state === 'stable') {
  ctx.fillStyle = BG_STABLE;    // 'rgba(34, 197, 94, 0.2)'
  ctx.fillRect(0, 0, canvas.width, canvas.height);
} else if (state === 'shrill') {
  ctx.fillStyle = BG_SHRILL;    // 'rgba(234, 179, 8, 0.2)'
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

| Branch | Media Feedback | Lokasi Render | Status |
|--------|---------------|---------------|--------|
| `feature/vocatone` | Canvas `fillRect` tint statis ✅ (media benar) | Latar belakang canvas ✅ | ⚠️ Tint statis, bukan berkedip |
| `feature/dualsense` | DOM `<div>` overlay ❌ | Di luar canvas (DOM) ❌ | ❌ **Melanggar** |

**Dampak:**
1. PoC secara spesifik menyebut "di latar belakang canvas" — DOM overlay tidak memenuhi spesifikasi ini.
2. Flash overlay DOM tidak terpengaruh oleh transformasi/proyeksi canvas — jika canvas di-scroll atau di-zoom, overlay tidak mengikutinya secara native.
3. Konsistensi visual: canvas background flash (VocaTone) dan DOM overlay flash (Dualsense) memiliki perilaku berbeda terhadap stacking context, opacity transition, dan interaksi pengguna.

**Lokasi kode:**
- `feature/dualsense`: `index.html` — `<div id="flash-overlay">` DOM element
- `feature/dualsense`: `src/styles/main.css` — class `.flash-success`, `.flash-warning`, `.flash-error`
- `feature/dualsense`: `src/main.js` — `clearAllFlash()`, `triggerFlash()`, logika flash di `onFaceLandmarks()`
- `feature/vocatone`: `src/components/game.js` — `_drawBackground()` Canvas fillRect

---

#### S36 — Dualsense `accuracyDisplay` Menampilkan Teks Status Melampaui Spesifikasi Binary Feedback PoC 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:79, 16
- **Catatan:**

PoC line 78-81 mendefinisikan **Binary Visual Feedback** yang ketat hanya 3 status — semuanya dirender sebagai **canvas background flash** (hijau/kuning/merah). Tidak ada teks status tambahan. PoC shared visual layer juga menyatakan: *"Star rating & IndexedDB history deferred post-PoC"* — akurasi dan stars adalah fitur ditunda.

Dualsense `startPitchPolling()` menimpa `accuracyDisplay.textContent` dengan teks status **"SHRILL"**, **"STABLE"**, atau **"--"** beserta perubahan warna teks:

```javascript
// src/main.js — dualsense startPitchPolling()
if (pitch > f_max) {
  accuracyDisplay.textContent = 'SHRIILL';   // ❌ Teks di luar PoC
  accuracyDisplay.style.color = '#EAB308';
} else if (pitch >= f_min) {
  if (stableCount >= 3) {
    accuracyDisplay.textContent = 'STABLE';  // ❌ Teks di luar PoC
    accuracyDisplay.style.color = '#22C55E';
  }
} else {
  accuracyDisplay.textContent = '--';        // ❌ Teks di luar PoC
  accuracyDisplay.style.color = '#94A3B8';
}
```

Sebaliknya, Vocatone hanya memanggil `updateAccuracy(0)` dengan nilai statis — tidak ada teks status dinamis.

**Dampak:**
1. PoC Binary Visual Feedback dirancang sebagai sistem isyarat biner sederhana (3 warna) untuk anak tunarungu — teks "SHRILL"/"STABLE" berbahasa Inggris tidak aksesibel untuk target pengguna Fase A/B.
2. `accuracyDisplay` adalah UI untuk fitur *accuracy score* yang **ditunda** (deferred post-PoC) — menggunakannya untuk teks status pitch adalah penyalahgunaan elemen deferred.
3. Menambah kebingungan visual: flash overlay DOM (hijau/kuning/merah) berjalan paralel dengan teks status yang berubah — dua sistem feedback independen untuk sinyal yang sama.

| Branch | Implementasi accuracyDisplay | Status |
|--------|----------------------------|--------|
| `feature/vocatone` | `updateAccuracy(0)` statis — tidak digunakan ✅ | Sesuai PoC (deferred) |
| `feature/dualsense` | Teks "SHRILL"/"STABLE"/"--" dinamis ❌ | **Melanggar** — menggunakan elemen deferred untuk feedback tambahan |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:160-177` — `startPitchPolling()` mengubah `accuracyDisplay.textContent` dan `.style.color`
- `feature/dualsense`: `index.html` — `<span id="accuracy-display">` elemen deferred

---

#### S37 — Dualsense `vowel-indicator` DOM Overlay (Huruf A/I Raksasa) Tidak Ada Dalam PoC 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:78-82
- **Catatan:**

50% PoC lines 78-82 mendefinisikan **seluruh antarmuka pengganti sensorik** (zero-audio interface) secara eksklusif terdiri dari:
1. **Binary Visual Feedback** — canvas background flash (hijau/kuning/merah) — lines 78-81
2. **Mouth Silhouette** — oval transparan statis — line 82

Tidak ada indikator vokal dalam spesifikasi PoC. Dualsense menambahkan DOM elemen `vowel-indicator` yang menampilkan huruf "A" atau "I" ukuran **72pt** di tengah layar:

```html
<!-- index.html — dualsense -->
<div id="vowel-indicator" class="hidden fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
  <span class="font-heading font-bold text-black" style="font-size:72pt;">A</span>
</div>
```

Elemen ini di-show/hide oleh `setVowelIndicator()` yang dipanggil di `onEnter(MIC_OPEN)`, `onExit(MIC_OPEN)`, dan `onEnter(IDLE)`:

```javascript
// src/main.js — dualsense
function setVowelIndicator(mode) {
  if (mode === 'A' || mode === 'I') {
    vowelIndicator.querySelector('span').textContent = mode;
    vowelIndicator.classList.remove('hidden');
  } else {
    vowelIndicator.classList.add('hidden');
  }
}
```

**Dampak:**
1. Scope creep — menambah elemen UI yang tidak disebut dalam 50% PoC. PoC sengaja membatasi UI ke binary visual feedback minimalis.
2. Indikator vokal teks (A/I) tidak memberikan informasi yang belum tersedia dari binary feedback — green flash sudah menandakan vokal benar.
3. Font 72pt dengan `z-[60]` (paling depan) berpotensi mengaburkan kamera feed dan siluet oval — mengganggu fungsi kalibrasi.
4. Konsumsi memori tambahan untuk elemen DOM fixed yang tidak diperlukan pada perangkat <150MB.

| Branch | Vowel indicator UI | Status |
|--------|-------------------|--------|
| `feature/vocatone` | Tidak ada ✅ | Sesuai PoC |
| `feature/dualsense` | `<div id="vowel-indicator">` dengan teks 72pt ❌ | **Scope creep** — tidak ada di PoC |

**Lokasi kode:**
- `feature/dualsense`: `index.html:14-16` — elemen `<div id="vowel-indicator">`
- `feature/dualsense`: `src/main.js:91-102` — `setVowelIndicator()` show/hide
- `feature/dualsense`: `src/main.js:133` — `onEnter(MIC_OPEN)` → `setVowelIndicator(mode)`
- `feature/dualsense`: `src/main.js:138` — `onExit(MIC_OPEN)` → `setVowelIndicator(null)`
- `feature/dualsense`: `src/main.js:145` — `onEnter(IDLE)` → `setVowelIndicator(null)`

---

#### S40 — Dualsense Tidak Menampilkan Flash Merah Saat MIC_OPEN Tanpa Input Suara 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:81
- **Catatan:**

PoC line 81 mendefinisikan: *"Layar Berkedip Merah: Aktif jika tidak ada input suara atau bentuk posisi motorik rahang/bibir terdeteksi salah total oleh MediaPipe."*

Dualsense logika flash di `onFaceLandmarks()` tidak menampilkan flash merah saat MIC_OPEN tanpa input suara:

```javascript
// src/main.js — dualsense onFaceLandmarks() logika flash
if (currentState !== STATES.MIC_OPEN) {
  clearAllFlash();
  flashOverlay.classList.add('flash-error');
} else if (isF0Shrill) {
  clearAllFlash();
  flashOverlay.classList.add('flash-warning');
} else if (isF0InRange && isF0Stable) {
  triggerFlash();
} else {
  clearAllFlash();   // ❌ Tidak ada flash — seharusnya merah (PoC line 81)
}
```

Saat `extractPitch()` mengembalikan `null` (tidak ada suara, RMS di bawah noise floor), `isF0Shrill`, `isF0InRange`, dan `isF0Stable` semuanya `false` — eksekusi jatuh ke `else { clearAllFlash(); }`. Tidak ada indikator merah.

**Dampak:**
1. Pelanggaran langsung terhadap PoC line 81 yang mensyaratkan flash merah saat tidak ada input suara.
2. User tidak mendapat indikasi visual bahwa mikrofon terbuka tapi tidak ada suara yang diproses.
3. Di perangkat dengan mic mati/rusak, aplikasi diam-diam tidak memberikan feedback.

| Branch | Implementasi flash saat MIC_OPEN tanpa suara | Status |
|--------|---------------------------------------------|--------|
| `feature/vocatone` | Tidak ada red tint — `_drawBackground()` hanya toggle stable/shrill ❌ | **Melanggar** |
| `feature/dualsense` | `clearAllFlash()` tanpa flash — silent ❌ | **Melanggar** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:283-294` — logika flash `onFaceLandmarks()`
- `feature/vocatone`: `src/components/game.js:267-277` — `_drawBackground()` tanpa red tint untuk no-pitch

---

#### S41 — Dualsense `lastFaceTime` Tidak Direset di `stopSession()` — False Positive Face-Gone Pada Restart 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:79, 82
- **Catatan:**

`lastFaceTime` adalah timestamp frame FaceMesh terakhir yang sukses. Nilai ini digunakan oleh `startMonitor()` untuk mendeteksi face loss:

```javascript
// src/main.js — dualsense startMonitor()
monitorTimer = setInterval(() => {
  const now = performance.now();
  const faceGone = now - lastFaceTime > NO_FACE_TIMEOUT;  // 1500ms
  // ...
}, 500);
```

`lastFaceTime` hanya diinisialisasi ke `0` di deklarasi variabel (`let lastFaceTime = 0;`) tetapi **tidak direset** di dalam `stopSession()`:

```javascript
// src/main.js — dualsense stopSession()
function stopSession() {
  sessionActive = false;
  stopSilhouetteLoop();
  stopMonitor();
  stopPitchPolling();
  gatekeeper.reset();
  // ❌ Tidak ada: lastFaceTime = 0;
}
```

**Skenario bug:**
1. User memulai sesi → `lastFaceTime` diisi dari frame FaceMesh pertama.
2. User menghentikan sesi → `lastFaceTime` tetap menyimpan timestamp lama.
3. User memulai sesi baru → `startSession()` tidak mereset `lastFaceTime`.
4. `startMonitor()` berjalan → `now - lastFaceTime` sudah ~beberapa detik sejak step 2.
5. `faceGone = true` dalam 500ms pertama → flash merah + error "No Face Detected" muncul.

**Dampak:** False positive face-gone pada setiap restart sesi. Flash merah dan error screen muncul beberapa saat setelah start, sebelum FaceMesh sempat mengirim frame pertama.

| Branch | Reset `lastFaceTime` di stop | Status |
|--------|-----------------------------|--------|
| `feature/vocatone` | `no_face_timer` direset via `resetNoFaceTimer()` ✅ | Aman |
| `feature/dualsense` | Tidak direset ❌ | **False positive face-gone** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:17` — `let lastFaceTime = 0;` (deklarasi)
- `feature/dualsense`: `src/main.js:510-538` — `stopSession()` tanpa reset `lastFaceTime`

---

#### S42 — Dualsense `errorHideTimer` Tidak Dibersihkan di `stopSession()` 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:79
- **Catatan:**

`triggerFallback()` men-set `errorHideTimer` dengan `setTimeout(2000ms)` untuk auto-hide pesan error:

```javascript
// src/main.js — dualsense triggerFallback()
errorHideTimer = setTimeout(() => {
  if (fallbackMode) {
    showError(false);
    fallbackMode = null;
    larValidSince = 0;
  }
}, 2000);
```

`stopSession()` tidak membersihkan timer ini:

```javascript
// src/main.js — dualsense stopSession()
function stopSession() {
  // ...
  showError(false);
  // ❌ Tidak ada: clearTimeout(errorHideTimer); errorHideTimer = null;
}
```

**Skenario race condition:**
1. User fonasi → LAR drop → `triggerFallback('A')` → `errorHideTimer` set → error screen muncul.
2. User klik Stop dalam 2 detik → `stopSession()` → `showError(false)` → state machine di-reset.
3. User klik Start lagi (dalam <2 detik sejak step 1) → sesi baru dimulai.
4. `errorHideTimer` fire → `showError(false)` dipanggil di tengah sesi baru — state `fallbackMode` dan `larValidSince` sudah direset oleh `startSession()`, tetapi timer callback masih memanggil `showError(false)` yang bisa menghilangkan error yang baru muncul.

| Branch | Cleanup `errorHideTimer` di stopSession | Status |
|--------|----------------------------------------|--------|
| `feature/vocatone` | N/A — mekanisme error berbeda | N/A |
| `feature/dualsense` | Tidak ada cleanup ❌ | **Callback stale — risiko state corruption** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:21` — `let errorHideTimer = null;`
- `feature/dualsense`: `src/main.js:237-243` — `setTimeout` assignment di `triggerFallback()`
- `feature/dualsense`: `src/main.js:510-538` — `stopSession()` tanpa `clearTimeout(errorHideTimer)`

---

#### S43 — Dualsense `startSession()` Tidak Memiliki Guard Re-Entry 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:26
- **Catatan:**

PoC line 26 mendefinisikan Sequential Validation Engine sebagai pipeline lifecycle session yang ketat. Dualsense `startSession()` tidak memiliki guard untuk mencegah re-entry saat session sudah aktif:

```javascript
// src/main.js — dualsense startSession()
async function startSession() {
  sessionActive = true;        // ← Set tanpa cek status sebelumnya
  // ...
  startSilhouetteLoop();       // ← RAF loop baru — yang lama tidak di-stop
  startMonitor();              // ← Interval baru — yang lama tidak di-stop
  gatekeeper.transitionTo(STATES.CAMERA_ACTIVE);
  cameraController = initCamera(cameraFeed, onFaceLandmarks, showCameraError);
  if (cameraController) {
    cameraController.start();  // ← Kamera baru — yang lama tidak di-stop
  }
}
```

`btnStart` tidak di-disable selama session berjalan — double-click memungkinkan.

**Skenario double-click:**
1. Klik Start → `startSession()` → `sessionActive = true` → setup kamera, RAF, monitor.
2. FaceMesh callback pertama masuk → `lastFaceTime` diisi.
3. Klik Start lagi (sebelum Stop) → `startSession()` dipanggil lagi tanpa guard.
4. `startSilhouetteLoop()` dipanggil lagi → RAF loop kedua berjalan paralel.
5. `startMonitor()` dipanggil lagi → interval kedua berjalan.
6. `initCamera()` dipanggil lagi → kamera stream kedua dibuat.
7. `gatekeeper.transitionTo(CAMERA_ACTIVE)` — mungkin invalid jika state sudah di CAMERA_ACTIVE.

**Dampak:**
1. Dua RAF loop untuk siluet berjalan paralel — 2× beban GPU.
2. Dua monitor interval berjalan — face loss detection bisa conflict.
3. Dua kamera stream aktif — resource kamera terbagi.
4. Melanggar sequential validation PoC yang membutuhkan lifecycle session tunggal.

| Branch | Guard re-entry startSession | Status |
|--------|---------------------------|--------|
| `feature/vocatone` | Tidak ada guard eksplisit ⚠️ | Risiko serupa |
| `feature/dualsense` | Tidak ada guard ❌ | **Double session — resource leak** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:453-470` — `startSession()` tanpa guard `if (sessionActive) return;`
- `feature/dualsense`: `index.html` — `<button id="btn-start">` tanpa disabled state management

---

#### S44 — Dualsense Canvas Sizing Tidak Responsif Terhadap Resize/Orientation Change 🟡

- **Refactor:** ❌ Belum
- **Prioritas:** 🟡 Sedang
- **PoC Line:** 50_PERCENT_OF_MVP.md:82
- **Catatan:**

PoC line 82 mensyaratkan: *"Menampilkan garis bantu cetakan bentuk mulut (oval transparan) statis di atas lapisan kanvas kamera guna membantu proses penyejajaran posisi wajah."*

Untuk oval statis berfungsi sebagai alignment guide, dimensi kanvas harus sinkron dengan video feed. Dualsense hanya mengatur ukuran canvas sekali di `startSession()`:

```javascript
// src/main.js — dualsense startSession()
overlayCanvas.width = cameraFeed.clientWidth;    // ← Satu kali di awal sesi
overlayCanvas.height = cameraFeed.clientHeight;  // ← Satu kali di awal sesi
```

Tidak ada `ResizeObserver`, `window.resize`, atau `screen.orientation.onchange` listener yang memperbarui dimensi canvas.

**Dampak:**
1. Rotasi perangkat (portrait ↔ landscape) mengubah `cameraFeed.clientWidth/Height` tetapi canvas buffer tetap dimensi lama → oval digambar di posisi yang salah relatif terhadap video feed.
2. Keyboard virtual muncul → viewport mengecil → `cameraFeed` di-resize → canvas tetap ukuran lama.
3. Split-screen/multi-window mode (Android 12+) → canvas tidak mengikuti ukuran baru.
4. Oval siluet yang seharusnya menjadi referensi penyejajaran statis menjadi tidak akurat — melanggar tujuan PoC line 82.

| Branch | Responsive canvas sizing | Status |
|--------|-------------------------|--------|
| `feature/vocatone` | `ResizeObserver` di game canvas ✅; overlay canvas tidak ⚠️ | Sebagian |
| `feature/dualsense` | Tidak ada — sizing sekali ❌ | **Canvas stale** |

**Lokasi kode:**
- `feature/dualsense`: `src/main.js:461-462` — sizing canvas satu kali di `startSession()`
- `feature/vocatone`: `src/components/game.js:26-28` — `ResizeObserver` untuk game canvas ✅

---

#### S45 — VocaTone Tidak Menampilkan Flash Merah Saat Tidak Ada Input Suara 🔴

- **Refactor:** ❌ Belum
- **Prioritas:** 🔴 Kritis
- **PoC Line:** 50_PERCENT_OF_MVP.md:81
- **Catatan:**

Sama seperti S40 untuk branch vocatone. PoC line 81 mensyaratkan flash merah saat tidak ada input suara.

VocaTone `_drawBackground()` di `src/components/game.js` hanya mengatur warna latar untuk 2 kondisi:

```javascript
// src/components/game.js — vocatone _drawBackground()
_drawBackground() {
  if (state === 'stable') {
    ctx.fillStyle = BG_STABLE;      // rgba(34, 197, 94, 0.2) — hijau
    ctx.fillRect(0, 0, ...);
  } else if (state === 'shrill') {
    ctx.fillStyle = BG_SHRILL;      // rgba(234, 179, 8, 0.2) — kuning
    ctx.fillRect(0, 0, ...);
  }
  // ❌ Tidak ada else branch — tidak ada red tint
}
```

Saat `extractPitch()` mengembalikan `null` (tidak ada suara, RMS < 0.01, atau mic belum diinisialisasi), state tidak 'stable' atau 'shrill'. Canvas tetap berwarna default — tidak ada indikator merah.

**Dampak:**
1. Pelanggaran langsung terhadap PoC line 81 — tidak ada feedback visual saat suara tidak terdeteksi.
2. User tidak bisa membedakan antara "belum mulai fonasi" dan "sistem tidak mendeteksi suara."
3. Di environment bising, user mungkin mengira fonasi sudah benar karena tidak ada indikator merah.

| Branch | Implementasi flash saat no-pitch | Status |
|--------|--------------------------------|--------|
| `feature/vocatone` | Tidak ada red tint ❌ | **Melanggar** |
| `feature/dualsense` | `clearAllFlash()` — tidak ada flash ❌ (S40) | **Melanggar** |

**Lokasi kode:**
- `feature/vocatone`: `src/components/game.js:267-277` — `_drawBackground()` tanpa red tint untuk no-pitch
- `feature/vocatone`: `src/components/game.js:31-32` — konstanta warna hanya BG_STABLE dan BG_SHRILL

---

## 7. Inkonsistensi Langsung Antar Kedua Branch

| # | Aspek | `feature/vocatone` | `feature/dualsense` | Prioritas | Refactor |
|---|-------|-------------------|-------------------|-----------|----------|
| X01 | Mic initialization timing | Lazy — setelah LAR_CHECK ✅ | Eager — `preGrantAudioPermission()` di awal ❌ | 🔴 | [ ] (S01) |
| X02 | Siluet posisi | Statis di tengah canvas ✅ | Dinamis mengikuti mulut ❌ | 🟡 | [ ] (S02) |
| X03 | Siluet animasi | Tidak ada ✅ | Pulsing `sin()` ❌ | 🟡 | [ ] (S02) |
| X04 | Objek hover position | Di posisi Y terkini ❌ | N/A | 🟢 | [ ] (S03) |
| X05 | LAR_CHECK state untuk /i/ | N/A | Bypass — langsung CAMERA_ACTIVE → MIC_OPEN ❌ | 🔴 | [ ] (S04) |
| X06 | SESSION_ACTIVE tercapai | ✅ State machine penuh dengan transisi ke SESSION_ACTIVE | ❌ Dead state — tidak pernah ditransisikan | 🟡 | [ ] (S05) |
| X07 | Flash feedback media render | Canvas `fillRect` ✅ | DOM `<div>` overlay ❌ | 🟡 | [ ] (S06) |
| X08 | AudioContext resume | ✅ `if (suspended) await resume()` | ❌ Tidak ada resume — gagal di Chrome/Android | 🔴 | [ ] (S07) |
| X09 | Euclidean distance | 2D (x,y only) ✅ | 3D (termasuk z) ❌ | 🔴 | [ ] (S08) |
| X10 | Vokal /i/ deteksi | N/A — threshold tunggal | Mouth spread ratio, bukan `LAR ≤ low` ❌ | 🔴 | [ ] (S09) |
| X11 | Fallback target state | `fallbackTo(CAMERA_ACTIVE)` ✅ | `gatekeeper.reset()` → IDLE ❌ | 🔴 | [ ] (S10) |
| X12 | Face loss saat MIC_OPEN | `executeHardReset()` — tutup mic ✅ | Mic tetap terbuka ❌ | 🔴 | [ ] (S11) |
| X13 | /i/ fallback monitor | N/A | MouthWidth, bukan LAR ❌ | 🔴 | [ ] (S12) |
| X14 | openAudioGate() safety | `then/catch` — aman ✅ | Fire-and-forget — orphan risk ❌ | 🟡 | [ ] (S13) |
| X15 | Autocorrelation allocation | Loop tradisional — zero alloc ✅ | `new Map()` ~800 entri per frame ❌ | 🟡 | [ ] (S14) |
| X16 | User-facing mic error | Structured error messages ✅ | Silent catch + console.warn ❌ | 🟡 | [ ] (S15) |
| X17 | Oval color per state | Putih statis ⚠️ | Putih selalu ❌ | 🟡 | [ ] (S16) |
| X18 | f_min value | 150 Hz ✅ | 100 Hz ❌ | 🟡 | [ ] (S17) |
| X19 | Flash opacity | 20% ⚠️ | 15-25% ❌ | 🟢 | [ ] (S18) |
| X20 | Face loss detection arsitektur | Callback `onNoFace()` instan ✅ | Polling 500ms ❌ | 🔴 | [ ] (S27) |
| X21 | Flash berkedip (blink) | Static tint ❌ | DOM transient ⚠️ | 🟡 | [ ] (S28) |
| X22 | `closeAudioStream()` safety | `await ctx.close()` ✅ | Fire-and-forget ❌ | 🟡 | [ ] (S29) |
| X23 | Camera start error handling | `await` + try/catch ✅ | Fire-and-forget ❌ | 🔴 | [ ] (S30) |
| X24 | `transitionTo()` invalid path | `throw Error` ✅ | `console.warn` + silent return ❌ | 🔴 | [ ] (S32) |
| X25 | Config source for LAR threshold | `DEFAULT_LAR_THRESHOLD=0.3` lokal ❌ | `lar_threshold` dari constants.js ✅ | 🔴 | [ ] (S35) |
| X26 | Accuracy display usage | `updateAccuracy(0)` statis — deferred ✅ | Teks "SHRILL"/"STABLE"/"--" dinamis ❌ | 🟡 | [ ] (S36) |
| X27 | Vowel indicator UI | Tidak ada ✅ | `<div id="vowel-indicator">` teks 72pt ❌ | 🟡 | [ ] (S37) |
| X28 | Cleanup AudioContext saat mic gagal | `try/catch` + `await ctx.close()` ✅ | Tidak ada cleanup — orphan ❌ | 🟡 | [ ] (S38) |
| X29 | Re-entry guard async initAudioStream | `audio_initializing` flag ✅ | Tidak ada — konkuren init ❌ | 🟡 | [ ] (S39) |
| X30 | Flash merah saat MIC_OPEN tanpa suara | Tidak ada red tint ❌ | `clearAllFlash()` — silent ❌ | 🔴 | [ ] (S40, S45) |
| X31 | Reset `lastFaceTime` di stop session | `resetNoFaceTimer()` ✅ | Tidak direset ❌ | 🟡 | [ ] (S41) |
| X32 | Cleanup `errorHideTimer` di stop session | N/A | Tidak dibersihkan ❌ | 🟡 | [ ] (S42) |
| X33 | Guard re-entry startSession | Tidak ada ⚠️ | Tidak ada ❌ | 🟡 | [ ] (S43) |
| X34 | Canvas responsive resizing | `ResizeObserver` di game ✅; overlay canvas ⚠️ | Tidak ada — sizing sekali ❌ | 🟡 | [ ] (S44) |

---

## 8. Rangkuman Kepatuhan 50% PoC

| Area | Bobot | `feature/vocatone` | `feature/dualsense` |
|------|-------|-------------------|-------------------|
| SCOPE-01 — Lingkup & Reduksi | ⭐⭐⭐ | 80% | 90% |
| SCOPE-02 — Core Tech & Infrastruktur | ⭐⭐⭐ | 95% | 55% |
| SCOPE-03 — VocaTone Engine | ⭐⭐⭐ | 80% | N/A |
| SCOPE-04 — Dual-Sense Engine | ⭐⭐⭐ | N/A | 15% |
| SCOPE-05 — UI/UX Pengganti Sensorik | ⭐⭐ | 70% | 45% |
| **Rata-rata tertimbang** | | **80%** | **44%** |

---

## Lampiran

### Lampiran A: Glossary Status Ikon

| Ikon | Arti |
|------|------|
| ✅ | Sesuai 50% PoC / sudah benar |
| ❌ | Tidak sesuai / melanggar scope boundary / belum diimplementasikan |
| ⚠️ | Perlu perhatian / menyimpang minor / tidak optimal |
| 🔴 Kritis | Melanggar scope boundary — fitur di luar PoC atau fitur wajib PoC tidak ada |
| 🟡 Sedang | Menyimpang dari 50% PoC, butuh perbaikan |
| 🟢 Ringan | Bisa ditunda, tidak mengganggu fungsionalitas inti PoC |
| N/A | Tidak relevan untuk branch tersebut |

### Lampiran B: Template Temuan Baru

Salin blok berikut untuk menambah temuan baru:

```markdown
### [Nomor] — [Judul Temuan] [Kode Prioritas] [Kode Item]

- **Refactor:** ❌ Belum
- **Prioritas:** [🔴 Kritis / 🟡 Sedang / 🟢 Ringan]
- **PoC Line:** [50_PERCENT_OF_MVP.md:line]
- **Catatan:**

[Deskripsi temuan — jelaskan apa yang melanggar scope boundary atau apa yang hilang]

| Branch | Status | Detail |
|--------|--------|--------|
| `feature/vocatone` | [status] | [detail] |
| `feature/dualsense` | [status] | [detail] |

**Lokasi kode:**
- `feature/vocatone`: [path]:[line]
- `feature/dualsense`: [path]:[line]
```

Setelah menambah, update [Master Scope Boundary Checklist](#master-scope-boundary-checklist) dengan baris baru.

### Lampiran C: Change Log

| Tanggal | Versi | Perubahan | Oleh |
|---------|-------|-----------|------|
| 17 Jul 2026 | 1.0 | Initial — 3 temuan pertama: S01 dualsense preGrantAudioPermission() eager 🔴, S02 dualsense siluet tidak statis 🟡, S03 vocatone hover tidak di tengah 🟢 | Agent V-NADA |
| 17 Jul 2026 | 1.1 | +S04 dualsense state machine bypass LAR_CHECK untuk /i/ 🔴, +S05 dualsense SESSION_ACTIVE dead state 🟡, +S06 dualsense flash via DOM overlay 🟡 | Agent V-NADA |
| 17 Jul 2026 | 1.2 | +S07 dualsense audio.js tidak resume AudioContext 🔴 — functional blocker di Chrome/Android | Agent V-NADA |
| 17 Jul 2026 | 1.3 | +S08 dualsense Euclidean 3D bukan 2D 🔴, +S09 dualsense vokal /i/ pakai mouth spread ratio 🔴, +S10 dualsense triggerFallback() reset ke IDLE 🔴, +S11 dualsense face loss mic tidak ditutup 🔴, +S12 dualsense /i/ fallback monitor pakai MouthWidth 🔴 | Agent V-NADA |
| 17 Jul 2026 | 1.4 | +S13 dualsense openAudioGate() fire-and-forget 🟡, +S14 dualsense per-frame new Map() 🟡, +S15 dualsense tidak ada user-facing mic error 🟡, +S16 dualsense siluet oval selalu putih 🟡, +S17 dualsense f_min=100Hz terlalu rendah 🟡, +S18 dualsense flash opacity <30% 🟢 | Agent V-NADA |
| 17 Jul 2026 | 1.5 | +S19 vocatone mic error dead code 🟡, +S20 dualsense restingMouthWidth kalibrasi 🟡, +S21 dualsense LAR_CHECK gagal ke IDLE 🔴, +S22 dualsense outOfThresholdSince tidak direset 🟡, +S23 dualsense konstanta di hot-path 🟢, +S24 dualsense silhouette RAF 60Hz 🟢, +S25 vocatone butuh kamera 🟡, +S26 dualsense tidak ada onEnter(LAR_CHECK) 🟢 | Agent V-NADA |
| 17 Jul 2026 | 1.6 | +S27 dualsense tidak ada onNoFace callback 🔴 — face loss hanya polling 500ms, +S28 vocatone flash static tint bukan "Berkedip" 🟡 — update SCOPE rangkuman vocatone 90%→86%, dualsense 55%→50% | Agent V-NADA |
| 17 Jul 2026 | 1.7 | +S29 dualsense closeAudioStream() tanpa await 🟡, +S30 dualsense cameraController.start() fire-and-forget 🔴, +S31 dualsense isF0* flags stale 🟡, +S32 dualsense transitionTo() silent return 🔴, +S33 dualsense IDLE→CAMERA_ACTIVE bypass session init 🟡, +S34 kedua branch MIN_PITCH_HZ hardcoded 50Hz 🟡, +S35 vocatone tidak import constants.js 🔴 — update SCOPE akhir vocatone 86%→82%, dualsense 50%→48% | Agent V-NADA |
| 17 Jul 2026 | 1.8 | +S36 dualsense accuracyDisplay teks "SHRILL"/"STABLE" melampaui PoC binary feedback 🟡 — accuracyDisplay adalah elemen deferred, bukan untuk teks status pitch. +S37 dualsense vowel-indicator DOM overlay (huruf A/I 72pt) tidak ada dalam PoC 🟡 — scope creep elemen UI tambahan di luar binary feedback + siluet. Update SCOPE-05 dualsense 50%→45%, rata-rata dualsense 48%→47% | Agent V-NADA |
| 17 Jul 2026 | 1.9 | +S38 dualsense initAudioStream() tidak cleanup AudioContext saat getUserMedia gagal 🟡 — orphan AudioContext setiap kegagalan mic, akumulasi memory leak. +S39 dualsense openAudioGate() tidak memiliki re-entry guard untuk async initAudioStream() 🟡 — race condition konkuren initAudioStream yang overwrite module-level variabel | Agent V-NADA |
| 17 Jul 2026 | 2.0 | +S40 dualsense tidak ada flash merah saat MIC_OPEN tanpa suara 🔴 — PoC line 81 dilanggar, silent saat no-input. +S41 dualsense lastFaceTime tidak direset di stopSession 🟡 — false positive face-gone pada restart. +S42 dualsense errorHideTimer tidak dibersihkan di stopSession 🟡 — callback stale risiko state corruption. +S43 dualsense startSession tidak ada guard re-entry 🟡 — double session menyebabkan resource leak. +S44 dualsense canvas sizing tidak responsif terhadap resize/orientation change 🟡 — oval siluet tidak sejajar setelah resize. +S45 vocatone tidak ada flash merah saat tidak ada suara 🔴 — PoC line 81 dilanggar, no-pitch tanpa feedback visual. Update SCOPE rangkuman vocatone 82%→80%, dualsense 47%→44% | Agent V-NADA |

---

*Dokumen ini dihasilkan oleh Agent V-NADA pada 17 Juli 2026.*
