# Game Asset Inventory & Asset Breakdown

Dokumen ini disusun sebagai manifes teknis untuk memetakan seluruh kebutuhan aset grafis 2D yang diperlukan dalam pengembangan aplikasi V-NADA. Fokus utama inventarisasi ini adalah mendukung visualisasi terapi wicara bagi siswa tunarungu melalui pendekatan gamifikasi yang interaktif.

**Kode Dokumen:** VISUAL-03
**Versi:** 3

---

## 1. Standardisasi Spesifikasi Teknis & Penamaan Berkas

Seluruh aset harus diproduksi dengan mengikuti pedoman teknis berikut untuk menjaga performa Progressive Web Apps (PWA) agar tetap ringan dan responsif.

### 1.1. Format Berkas & Resolusi

- **Aset Game (.PNG):** Digunakan untuk karakter, rintangan, dan latar belakang kompleks. Harus memiliki latar belakang transparan (Alpha Channel) dengan resolusi maksimal 1024px pada dimensi terpanjang.
- **Aset UI (.SVG):** Digunakan untuk ikon, tombol, dan elemen HUD agar bersifat vector-based dan tetap tajam di berbagai ukuran layar gawai.

### 1.2. Konvensi Penamaan (Naming Convention)

Format penamaan: `[Tipe]_[Kategori]_[Nama]_[Status].[Ekstensi]`

- `img_` : Image/Sprite (PNG)
- `ic_` : Icon (SVG)
- `bg_` : Background (PNG)
- `ani_` : Sequence Animation Frame

---

## 2. Inventaris Aset Karakter Utama (Character/Avatar)

Aset ini berfokus pada maskot utama yang akan dikendalikan oleh input suara (VocaTone) dan artikulasi bibir (Dual-Sense).

| Nama Aset | Kategori | Format | Status Visual (Sprite States) |
|---|---|---|---|
| img_char_balon_udara | Karakter | PNG | Idle, Naik, Turun, Sukses, Error |
| ani_char_bubble | Animasi | PNG | Animasi partikel saat balon udara bergerak |

---

## 3. Inventaris Aset Lingkungan & Rintangan

Aset ini mendukung visualisasi "Dunia Bunyi" di mana siswa melakukan navigasi melalui suara mereka.

| Nama Aset | Kategori | Format | Deskripsi / Fungsi |
|---|---|---|---|
| bg_layer_sky | Latar | PNG | Layer langit (Parallax Background) |
| bg_layer_mountains | Latar | PNG | Layer gunung untuk kedalaman visual |
| img_obs_cloud_mon | Rintangan | PNG | Awan/Monster penghalang (Dual-Sense) |
| img_gate_sonic | Target | PNG | Gerbang yang terbuka dengan frekuensi f0 |
| ani_obs_destroy | Animasi | PNG | Transisi saat rintangan hancur (Success) |

---

## 4. Inventaris Aset Komponen UI/HUD

Elemen antarmuka yang memberikan umpan balik visual sebagai substitusi sensorik pendengaran.

| Nama Aset | Kategori | Format | Fungsi |
|---|---|---|---|
| ic_ui_star_gold | UI/Reward | SVG | Indikator pencapaian/bintang skor |
| ic_ui_progress_bar | UI/HUD | SVG | Bar kemajuan durasi napas/fonasi |
| ic_ui_cam_frame | UI/Sensor | SVG | Bingkai kalibrasi wajah (Mouth Silhouette) |
| ic_nav_home_default | UI/Menu | SVG | Tombol navigasi kembali ke menu utama |
| img_ui_feedback_bin | UI/Logic | PNG | Indikator biner: Hijau (Benar) / Merah (Salah) |

---

## 5. Panduan Instruksional Produksi Aset

Mengingat keterbatasan sistem dalam menghasilkan file gambar secara langsung, berikut adalah panduan instruksional bagi Lead Game Artist untuk merealisasikan aset di atas:

### 5.1. Produksi Karakter & Animasi

1. **Ekspresi Emosional:** Buatlah karakter Balon Udara dengan wajah yang ekspresif. Saat status Error terdeteksi (Sequential Validation gagal), karakter harus menunjukkan visual 'bingung' atau 'kaget' dengan warna dominan Merah (#EF4444).
2. **Transisi Halus:** Gunakan minimal 3-5 frame untuk animasi `ani_obs_destroy` guna memberikan kepuasan visual (Reward) bagi anak ketika berhasil melafalkan vokal dengan benar.

### 5.2. Desain Antarmuka (HUD)

1. **High Contrast:** Gunakan palet warna yang kontras tinggi namun tetap lembut (subdued) sesuai standar aksesibilitas bagi anak usia 7-9 tahun.
2. **Mouth Silhouette:** Siluet mulut pada `ic_ui_cam_frame` harus dibuat transparan di bagian tengah dengan garis tepi (outline) yang jelas untuk memandu posisi wajah anak saat menggunakan fitur MediaPipe Face Mesh.