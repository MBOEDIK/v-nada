# DOKUMEN BLUEPRINT PROGRES 50% (PROOF OF CONCEPT)

**Nama Inovasi:** V-NADA (Visual Networked Audio & Digital Articulation)
**Target Tahapan:** Video Demonstrasi Kemajuan Proyek (Babak Seleksi Nasional LIDM ITDP)
**Prinsip Utama:** Otak Komputasi Lokal Berfungsi (*Core Logic Running*), Kosmetik Grafis Ditunda (*Zero Asset Dependency*).
**Patokan:** Dokumen ini berpatokan 100% terhadap project_context\MVP.md dan project_context\IDEA_CONCEPT.md.

---

## 1. Lingkup Batasan & Target Reduksi (Scope Constraints)

Dokumen ini memangkas ruang lingkup *Minimum Viable Product* (MVP) penuh menjadi fungsionalitas murni berbobot **50%** untuk membuktikan klaim solusi *Sensory Substitution* di depan juri.

- **Target Pengguna Pengujian:** Fokus simulasi klinis pada karakteristik anak tunarungu berat (61 dB s.d. 90 dB) hingga tuli total (>90 dB) Fase A & B.
- **Pembatasan Fonetik:** Deteksi *Artificial Intelligence* (AI) dan matematika murni hanya mengeksekusi vokal kontras dasar yaitu huruf **A** dan **I**.
- **Penyimpanan & Analisis Data:** Pengaturan tabel basis data lokal (*IndexedDB*) dan halaman riwayat performa orang tua/guru ditunda sepenuhnya.
- **Status Visual:** Seluruh grafis menggunakan objek geometri dasar HTML5 Canvas (*placeholder style*).

---

## 2. Core Tech & Infrastruktur Luring

Menegakkan fondasi dasar aplikasi agar terbukti mampu beroperasi tanpa ketergantungan server *cloud*.

- **PWA Core Skeleton:** Inisialisasi struktur dasar aplikasi web yang sukses diinstal di perangkat Android/Laptop dan mampu memuat seluruh dependensi kode saat jaringan luring 100%.
- **Sequential Validation Engine (Gate Keeper):** Pipa logika pemrograman yang mengunci sensor mikrofon agar berstatus mati (*idle*) secara default dan baru membuka aliran data audio jika kamera depan sukses memvalidasi struktur motorik bibir.

---

## 3. Modul 1: VocaTone Engine (Fondasi Suara)

Melatih kontrol pita suara frekuensi dasar (f₀) dan kekuatan embusan napas menggunakan respons mikrofon secara *real-time*.

**Alur proses:**

```
[Suara Masuk] ──> [Noise Floor Gate: RMS > 0.01] ──> [Autocorrelation] ──> [Sumbu Vertikal Y-Axis Canvas]
```

### Kriteria Keberhasilan Fungsional (DoD):

- **Web Audio Autocorrelation:** Kode menangkap aliran audio analog dari mikrofon gawai dan berhasil memproses ekstraksi *pitch domain* waktu menjadi satuan Hertz (Hz) secara luring.
- **Noise Floor Gate Check:** Sistem secara otomatis mengabaikan perhitungan autokorelasi jika amplitudo volume suara berada di bawah batas bising ruangan (RMS < 0.01) untuk menghemat daya komputasi.
- **Single-Game Placeholder (Balon Udara Vertikal):**
  - Jika suara terdeteksi: Objek kotak *placeholder* bergerak naik secara konstan ke atas layar (koordinat Y berkurang).
  - Jika frekuensi dasar (f₀) konstan dalam target wicara normal: Objek kotak bertahan stabil melayang di jalur tengah canvas.
  - Jika anak berhenti bersuara / diam: Objek kotak otomatis meluncur turun ke bawah layar akibat simulasi gravitasi (koordinat Y bertambah).

---

## 4. Modul 2: Dual-Sense Engine (Artikulasi Multimodal)

Sinkronisasi ranah *computer vision* kamera depan dengan mikrofon secara sekuensial untuk mendeteksi kepresisian bentuk bibir.

### Implementasi Matematika Client-Side:

1. Pustaka **MediaPipe Face Mesh** wajib memetakan 4 titik koordinat bibir inti: P_top (bibir atas), P_bottom (bibir bawah), P_left (sudut kiri), dan P_right (sudut kanan).
2. Tanam rumus jarak Euclidean untuk menghitung dimensi bentang bibir:

$$d(p,q) = \sqrt{(p_x - q_x)^2 + (p_y - q_y)^2}$$

3. Hitung rasio bukaan mulut menggunakan rumus *Lip Aspect Ratio* (LAR):

$$LAR = \frac{d(P_{top}, P_{bottom})}{d(P_{left}, P_{right})}$$

### Logika Pemeriksaan Filter Sekuensial:

- **Validasi Huruf A:** Pengembang membuka mulut menganga lebar secara vertikal. Sistem mendeteksi nilai LAR ≥ LAR_threshold_A. Jika valid, layar memicu *Audio Gate Open*.
- **Validasi Huruf I:** Pengembang meringis melebar secara horizontal. Sistem mendeteksi nilai LAR mengecil secara proporsional mendekati batas bawah LAR ≤ Threshold_Low. Jika valid, layar memicu *Audio Gate Open*.
- **Instant Fallback:** Jika di tengah sesi fonasi pengembang merubah bentuk bibir secara mendadak (nilai LAR aktual jatuh di bawah ambang batas), gerbang mikrofon wajib ditutup secara instan secara otomatis.

---

## 5. UI/UX Pengganti Sensorik (Zero-Audio Interface)

Mengalihkan seluruh umpan balik pendengaran (*lost auditory feedback loop*) secara penuh ke indra penglihatan menggunakan indikator biner.

- **Binary Visual Feedback Matrix:**
  - **Layar Berkedip Hijau:** Aktif secara instan di latar belakang canvas jika motorik wajah (LAR) memenuhi syarat berbarengan dengan frekuensi audio (f₀) yang stabil.
  - **Layar Berkedip Kuning:** Aktif sebagai peringatan jika bentuk mulut (LAR) sudah benar, namun suara terdeteksi terlalu melengking ekstrem (*hypernasal* / f₀ > 350 Hz).
  - **Layar Berkedip Merah:** Aktif jika tidak ada input suara atau bentuk posisi motorik rahang/bibir terdeteksi salah total oleh MediaPipe.
- **Mouth Silhouette Calibration Placement:** Menampilkan garis bantu cetakan bentuk mulut (oval transparan) statis di atas lapisan kanvas kamera guna membantu proses penyejajaran posisi wajah pengembang saat merekam video demonstrasi.