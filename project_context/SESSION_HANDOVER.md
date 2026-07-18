# Session Handover

## Branch & Remote Status
- **Aktif:** `feature/dualsense` — up to date with `origin/feature/dualsense`
- **Branch lama:** Semua branch `feat/c6.*`, `feat/c7.*`, `feat/c8.*`, `feat/d11.1*`, `feat/d11.2*` ❌ sudah dihapus (local + remote)

## Task Terakhir Dikerjakan
| Task | Status | Keterangan |
|------|--------|-----------|
| D10.3 — Flash Merah (Error/Idle) | ✅ Done | `.flash-error` (25%), `.flash-idle` (15%), prioritas merah>kuning>hijau |
| D11.1 — Render Oval Transparan | ✅ Done | `drawSilhouette()` via RAF, pulse sin, default center |
| D11.2 — Posisi Oval Ikut Wajah | ✅ Done | `getMouthMidpoint()` di vision.js, mouthData dinamis |

## Perubahan File Kunci (Sesi Ini)

### `src/components/overlay.js` (baru)
- `drawSilhouette(ctx, width, height, isFaceDetected, mouthData)` — oval center default (rx=15%w, ry=10%h) atau posisi dinamis dari mouthData
- Pulse `0.35 + 0.15*Math.sin(Date.now()/500)` saat !isFaceDetected, statis rgba(255,255,255,0.3) saat face detected

### `src/utils/vision.js`
- `getMouthMidpoint(landmarks)` — midpoint 4 landmark bibir + rx/ry + 0.02 padding

### `index.html` (restrukturasi)
- **Dashboard screen baru** (`#screen-dashboard`): landing page dengan 2 module card (VocaTone + Dual-Sense), mobile-first layout
- Dual-Sense screen dipindah ke `#screen-dualsense` (hidden by default) + back button
- VocaTone screen baru (`#screen-vocatone`): game canvas + pitch display + status + back button
- `#game-canvas` dipindah dari camera-view ke VocaTone screen
- `#flash-overlay` dipindah ke dalam Dual-Sense screen agar tidak tumpang tindih

### `src/main.js` (restrukturasi besar)
- **Screen Router**: `showScreen(id)` mengontrol 3 screen (dashboard, dualsense, vocatone)
- **Dashboard**: `btn-vocatone` → navigasi ke VocaTone, `btn-dualsense` → navigasi ke Dual-Sense
- **Navigation**: Back buttons (`btn-back-dualsense`, `btn-back-vocatone`) → stop semua + kembali ke dashboard
- **VocaTone functions**: `startVocaTone()`, `stopVocaTone()` — init AudioContext + VocaToneGame loop + pitch polling terpisah
- `navigateToDashboard()` — cleanup semua resource (camera, audio, gatekeeper, game)
- Import `VocaToneGame` dan `getPitchHz` dari modul masing-masing
- Lint fix: curly braces di dua single-line if

### `src/styles/main.css`
- `.flash-error { background-color: #EF4444; opacity: 0.25 !important; }`
- `.flash-idle { background-color: #EF4444; opacity: 0.15 !important; }`

## Bug Ditemukan & Solusi
| Bug | Sebab | Solusi |
|-----|-------|--------|
| D10.3: Error screen muncul saat idle awal (no face) | `faceGone` selalu trigger showError | Tambah `faceEverDetected` flag — error screen hanya mid-session |
| D10.3: Flash merah terhapus oleh gatekeeper.reset() | `clearAllFlash()` di onExit/onEnter callback hapus flash-error | Pindah `clearAllFlash(); flash-error` setelah `gatekeeper.reset()` |
| D11.2: Oval tetap di posisi terakhir saat face hilang | `mouthData` stale, tetap dikirim ke drawSilhouette | Pass `isFaceDetected ? mouthData : null` |
| Lint: 6 error curly (missing braces) | ESLint rule `curly: error` | Tambah braces di semua single-line if |

## Next Steps
1. B5.x — VocaTone Game Loop (jika diperlukan)
2. Update GitHub Issues — close task yang sudah selesai
3. Testing integrasi end-to-end
4. IndexedDB history logging (deferred to post-PoC)

## Catatan Penting
- Trigger I: `LAR >= 0.2 && LAR < 0.5 && mouthWidth > resting * 1.3`
- Fallback I: `mouthWidth <= resting * 1.15 || LAR >= 0.5` > 300ms
- Trigger A: `LAR >= 0.5`
- Fallback A: `LAR < 0.5` > 300ms
- Flash priority: RED (non-MIC_OPEN) > YELLOW (shrill) > GREEN (stable)
- Oval: default center saat no face, ikut midpoint landmark saat face detected
- Hapus branch task: feat/c6.1, c6.3, c7.1, c7.2, c8.2, c8.3, feat/d11.1*, feat/d11.2* ✅
