# MINIMUM VARIABLE PRODUCT

## Core Tech & Infrastructure

- **PWA Core Skeleton:** Fondasi aplikasi berbasis web yang bisa diinstal di Android/Laptop dan berjalan 100% offline-first tanpa cloud server berbayar.
- **Sequential Validation Engine:** Logika pemrograman dasar yang mengatur alur pengecekan: sistem membaca kamera dulu (bentuk bibir), baru membuka sensor mikrofon (suara).

---

## Modul 1: VocaTone (Fondasi Suara)

- **Single-Game Mode (Balon Udara):** Satu jenis mekanik game kontrol suara sederhana. Balon bergerak naik saat ada suara, stabil di tengah jika nada (f0) konstan, dan turun jika anak berhenti bersuara.
- **Web Audio Autocorrelation:** Implementasi kode dasar untuk menangkap kestabilan frekuensi dan durasi napas dari mikrofon secara real-time.

---

## Modul 2: Dual-Sense (Artikulasi)

- **Vokal Kontras Dasar (A & I):** Batasi deteksi AI hanya untuk 2 huruf vokal dengan bentuk motorik wajah paling ekstrem. Huruf A (menganga lebar / Lip Aspect Ratio tinggi) dan I (bibir melebar) menggunakan MediaPipe Face Mesh.
- **Euclidean LAR Calculator:** Rumus matematika dasar yang ditanam di client-side untuk menghitung jarak titik koordinat bibir atas-bawah dan kanan-kiri.

---

## Antarmuka & UX Pengganti Sensorik

- **Binary Visual Feedback:** Sistem isyarat visual super kontras sebagai pengganti auditory feedback. Layar berwarna Hijau jika motorik wajah/suara benar, dan Merah/Kuning jika salah.
- **Mouth Silhouette Calibration:** Garis bantu berupa siluet bentuk mulut di layar kamera untuk membantu anak usia 7-9 tahun menyejajarkan posisi wajah mereka secara mandiri.