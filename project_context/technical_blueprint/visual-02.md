# Panduan Overlay Landmark Mulut

Dokumen ini merinci spesifikasi visual untuk komponen Mouth Landmark Overlay Guide sebagai bagian dari sistem V-NADA. Komponen ini berfungsi untuk memandu siswa tunarungu usia 7-9 tahun dalam melakukan kalibrasi posisi wajah secara mandiri sebelum proses deteksi artikulasi dimulai.

**Kode Dokumen:** VISUAL-02
**Versi:** 2

---

## 1. Blueprint Desain Pola Siluet (Overlay Silhouette)

Pola siluet dirancang untuk memberikan instruksi visual non-verbal yang jelas kepada pengguna mengenai posisi bibir yang ideal terhadap kamera.

- **Geometri Siluet:** Menggunakan bentuk oval transparan untuk area wajah dan garis lengkung putus-putus untuk area bibir sebagai titik fokus utama (Region of Interest).
- **Titik Fokus Dinamis:** Garis panduan harus terpusat pada koordinat tengah layar aplikasi PWA.
- **Opasitas:** Siluet memiliki opasitas 30% agar tidak menghalangi pandangan siswa terhadap elemen gameplay di latar belakang.

---

## 2. Standardisasi State Perilaku Visual (Behavioral States)

Berdasarkan prinsip Sequential Validation Logic, overlay harus merespons status deteksi dari MediaPipe Face Mesh secara real-time.

| State Deteksi | Karakteristik Visual | Efek Animasi |
|---|---|---|
| Searching | Warna Abu-abu Muda (#F8FAFC) | Pulsing Effect (opasitas 20% ke 50%) |
| Locked/Aligned | Warna Hijau (#22C55E) | Garis menjadi tebal dan statis |
| Out of Bounds | Warna Merah (#EF4444) | Garis bergetar perlahan (shake) |

---

## 3. Logika Skala Responsif & Padding

Komponen overlay harus konsisten di berbagai perangkat Android kelas menengah yang dimiliki oleh orang tua siswa.

- **Pusat Penempatan:** Elemen wajib berada di absolute center pada sumbu X dan Y dari container video kamera.
- **Skala Dinamis:** Ukuran siluet menyesuaikan dengan rasio aspek layar (16:9 atau 4:3) dengan mempertahankan padding aman minimal 48dp dari tepi layar fisik guna menghindari area fat-finger.
- **Integrasi Client-Side:** Perhitungan posisi dilakukan langsung di perangkat lokal untuk memastikan tidak ada latensi visual saat anak bergerak.

---

## 4. Panduan Instruksional Realisasi Aset (Instructional Guidelines)

Karena keterbatasan dalam pembuatan file grafis secara langsung, berikut adalah panduan langkah demi langkah bagi UI Designer untuk merealisasikan aset ini:

### 4.1. Pembuatan Aset Vektor (.SVG)

1. **Kanvas:** Gunakan artboard berukuran 400x400 px di Figma atau Illustrator.
2. **Layer 1 (Face Outline):** Buatlah bentuk oval dengan stroke sebesar 2pt dan tipe garis dashed.
3. **Layer 2 (Mouth Silhouette):** Buat siluet bibir di tengah oval dengan proporsi yang sesuai untuk anak usia 7-9 tahun. Pastikan jalur (path) bersifat tertutup agar mudah diubah warnanya secara terprogram.
4. **Ekspor:** Simpan dalam format SVG dengan ID layer yang jelas (misal: `mouth-guide-line`) untuk memudahkan Frontend Developer dalam memanipulasi warna melalui CSS atau JavaScript berdasarkan state sistem.

### 4.2. Implementasi pada UI Component

1. Gunakan elemen `<canvas>` atau layer SVG di atas aliran video kamera.
2. Terapkan transisi CSS `transition: stroke 0.3s ease-in-out` untuk perubahan warna saat berpindah dari Searching State ke Locked State.
3. Pastikan komponen ini diposisikan dengan z-index yang lebih tinggi dari lapisan video tetapi di bawah elemen navigasi utama.