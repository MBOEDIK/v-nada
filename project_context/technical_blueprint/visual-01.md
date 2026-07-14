# Spesifikasi Sistem Desain & Panduan Gaya Antarmuka Kontras Tinggi

Dokumen ini merinci standar visual dan fungsional untuk aplikasi V-NADA (Visual Networked Audio & Digital Articulation). Mengingat target pengguna utama adalah siswa tunarungu jenjang SDLB-B Tingkat Rendah (Fase A & B, usia 7-9 tahun), antarmuka harus mengutamakan aksesibilitas tinggi melalui substitusi sensorik auditif ke visual. Fokus utama adalah pada kontras warna yang ekstrem, elemen interaktif yang mudah dioperasikan (fat-finger friendly), dan tipografi yang jelas.

**Kode Dokumen:** VISUAL-01
**Versi:** 3

---

## 1. Standarisasi Palet Warna (Color Token Setup)

Sistem warna V-NADA menggunakan pendekatan kontras tinggi untuk mendukung Binary Visual Feedback. Setiap kombinasi teks dan latar belakang wajib memenuhi standar WCAG AAA (rasio kontras minimal 7:1).

| Kategori | Nama Token | Nilai HEX | Deskripsi Penggunaan |
|---|---|---|---|
| Primary | color-primary | #0D47A1 | Identitas utama, tombol aksi primer. |
| Success | color-success | #22C55E | Indikator lafal benar / valid. |
| Danger | color-danger | #EF4444 | Indikator kesalahan fatal / input salah. |
| Warning | color-warning | #EAB308 | Indikator perhatian atau feedback netral. |
| Background | color-bg-light | #FFFFFF | Latar belakang utama aplikasi. |
| Muted/Neutral | color-muted | #F8FAFC | Indikator netral: tidak ada input, idle, atau amplitudo rendah. |

---

## 2. Blueprint Skala Tipografi (Typography Scale)

Dipilih keluarga font sans-serif untuk menjamin keterbacaan (high legibility) tanpa ornamen dekoratif yang membingungkan bagi anak-anak.

- **Font Family Utama:** Montserrat (untuk Heading) dan Inter (untuk Body/Prose).
- **Scale:** Minor Second (1.067).

| Level | Font Weight | Ukuran (pt/sp) | Penggunaan |
|---|---|---|---|
| Title | Bold (700) | 24 | Judul modul utama (VocaTone/Dual-Sense). |
| Heading 1 | Semi-Bold (600) | 18 | Judul bagian atau instruksi utama. |
| Body Text | Regular (400) | 12 | Teks deskripsi dan panduan terapi. |
| Label | Medium (500) | 10 | Label tombol dan status sistem. |

---

## 3. Desain Komponen Interaktif Universal

Elemen interaktif dirancang untuk mengakomodasi keterbatasan motorik halus anak usia dini (fat-finger friendly).

- **Target Sentuh Minimum:** Seluruh elemen interaktif (tombol, ikon navigasi, touch slider, toggle zone, area feedback) tanpa terkecuali wajib memiliki luas minimal 60x60 dp atau piksel setara (fat-finger friendly) untuk mengakomodasi kontrol motorik anak usia 7-9 tahun.
- **State Komponen:**
  - **Default:** Elevasi rendah, warna solid.
  - **Active/Pressed:** Perubahan warna menjadi lebih gelap (10%) dan umpan balik haptik (jika didukung perangkat).
  - **Disabled:** Opasitas diturunkan menjadi 40% dengan filter greyscale.
- **Mouth Silhouette:** Panduan visual berupa garis siluet tipis di tengah layar kamera untuk membantu kalibrasi posisi wajah siswa secara mandiri.

---

## 4. Grid dan Tata Letak (Layout Grid System)

Aplikasi menggunakan Responsive Flex Grid untuk memastikan konsistensi di berbagai gawai (Smartphone Android murah hingga Tablet/Laptop).

- **Margin Layar:** Minimum 16dp pada sisi kiri dan kanan.
- **Gutter:** 12dp antar elemen visual.
- **Alignment:** Konten utama (visualisasi balon udara atau deteksi bibir) harus berada di pusat (center-aligned) untuk fokus maksimal.

---

## 5. Panduan Implementasi Aset Visual (Instructional Guidelines)

Karena keterbatasan dalam pembuatan diagram secara langsung, berikut adalah instruksi teknis bagi *UI Designer* untuk merealisasikan aset ini:

1. **Penyusunan Library di Figma:** Buat *Local Styles* untuk seluruh Color Tokens dan Typography Scale yang telah didefinisikan di atas. Pastikan penamaan token sesuai dengan dokumentasi teknis.
2. **Visualisasi State Tombol:** Buat komponen master untuk tombol primer dengan varian *Default, Hover, Pressed,* dan *Disabled*. Gunakan *Auto Layout* untuk memastikan *padding* internal menjaga ukuran target sentuh tetap ≥ 60 dp untuk tombol kontrol anak.
3. **Desain Feedback Biner:** Rancang dua set layar penuh (Overlay); satu dengan filter warna Hijau (#22C55E) transparan untuk kondisi "Valid" dan satu dengan filter Merah/Kuning untuk kondisi "Salah".
4. **Siluet Kalibrasi:** Buat aset vektor (.svg) berupa garis putus-putus yang membentuk outline wajah dan bibir untuk diintegrasikan pada *layer* di atas *input* kamera MediaPipe.