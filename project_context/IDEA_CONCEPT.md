# DRAF IDE: V-NADA (Visual Networked Audio & Digital Articulation)

---

## 1. IDENTITAS & SPESIFIKASI PROGRESIVE IDEA

- **Nama Inovasi:** V-NADA (Visual Networked Audio & Digital Articulation)
- **Divisi Target LIDM 2026:** Divisi I - Inovasi Teknologi Digital Pendidikan (ITDP)
- **Target Pengguna Utama:** Siswa tunarungu jenjang SDLB-B Tingkat Rendah (Fase A & B / Kelas 1–3, rentang usia 7–9 tahun) serta anak berkebutuhan khusus di SD Inklusi.
- **Fokus Kasus:** Gangguan pendengaran kategori Berat (61 dB s.d. 90 dB) hingga Sangat Berat/Tuli Total (di atas 90 dB).
- **Teknologi Utama:** Progressive Web Apps (PWA), Web Audio API (Autocorrelation Pitch Detection), MediaPipe Face Mesh (Computer Vision), Client-Side Computational Processing.

---

## 2. LANDASAN URGENSI & AKAR MASALAH (THE ROOT CAUSE)

### 2.1. Defisit Fonasi & Artikulasi (Lost Auditory Feedback Loop)

Secara klinis, anak tunarungu mengalami kegagalan fungsi pendengaran yang berakibat pada putusnya *auditory feedback loop* (kemampuan mendengar suara sendiri untuk mengoreksi lafal). Akibatnya:

1. **Gangguan Kontrol Pita Suara:** Frekuensi dasar suara (f₀) anak tidak terkontrol, memicu produksi suara yang monoton, terlalu lirih, atau melengking ekstrem (*hypernasal*).
2. **Kelemahan Motorik Organ Wicara:** Memori otot (*muscle memory*) tenggorokan dan bibir tidak terlatih, sehingga pasokan udara tidak stabil dan bukaan bibir kaku.

### 2.2. Ketimpangan Aksesibilitas Alat Terapi di Indonesia

- **Realitas Lapangan:** Alat *Speech Trainer* konvensional berbasis perangkat keras (*hardware*) di pasaran dibanderol seharga belasan hingga puluhan juta rupiah.
- **Kesenjangan Sosial-Geografis:** SLB-B di daerah pedalaman, daerah 3T, dan sekolah inklusi tidak memiliki anggaran untuk membeli alat tersebut.
- **Metode Manual yang Subjektif:** Guru terpaksa menggunakan alat seadanya seperti cermin rias (untuk melihat bentuk mulut), lilin, atau balon tiup (untuk latihan napas). Alat-alat ini **tidak objektif** karena tidak mampu mengukur kestabilan frekuensi suara (f₀) atau kepresisian bukaan bibir anak.

---

## 3. PARADIGMA SOLUSI: KONSEP SUBSTITUSI SENSORIK

Ketika jalur auditif anak tunarungu berat (tuli total di atas 90 dB) sudah tidak mampu lagi memproses gelombang suara sekalipun menggunakan Alat Bantu Dengar (ABD), V-NADA hadir menggunakan paradigma **Substitusi Sensorik (Sensory Substitution)**.

> "Kita tidak memaksa telinga mereka untuk mendengar, melainkan mengonversi energi mekanik suara dan gerakan motorik wajah mereka menjadi umpan balik visual (mata) yang intuitif secara real-time."

---

## 4. ARSITEKTUR EKOSISTEM "VISUALNADA OMNITRAINER"

V-NADA membagi proses terapi menjadi dua tahapan progresif yang diintegrasikan ke dalam satu platform tunggal:

```
                VISUALNADA OMNITRAINER
                       /        \
                      /          \
        MODUL 1: VOCATONE     MODUL 2: DUAL-SENSE
        • Sensor: Mikrofon    • Sensor: Kamera + Mik
          Saja                 • Fokus: Artikulasi Huruf
        • Fokus: Fondasi       • Sinkronisasi Bentuk
          Suara                  Bibir dan Lafal Vokal
        • Melatih Kestabilan
          Pita Suara & 
          Kontrol Nada
```

### 4.1. Modul 1: VocaTone (Fase Fondasi Fonasi - Ranah Isyarat Audio)

- **Cara Kerja:** Hanya mengaktifkan sensor mikrofon gawai pengguna.
- **Mekanisme Terapi:** Siswa memainkan game kontrol suara (contoh: mengendalikan balon udara naik-turun menggunakan suara mereka).
- **Fungsi Klinis:** Melatih kekuatan embusan napas, durasi keluaran suara, dan fleksibilitas kontrol pita suara (f₀) sebelum anak diperkenalkan pada huruf/vokal spesifik.

### 4.2. Modul 2: Dual-Sense (Fase Sinkronisasi Fonetik - Ranah Multimodal)

- **Cara Kerja:** Mengaktifkan kamera depan (untuk mendeteksi bibir) dan mikrofon secara sekuensial (*Sequential Validation Logic*).
- **Mekanisme Terapi:** Anak harus membentuk posisi mulut dengan benar untuk melafalkan vokal tertentu (A, I, U, E, O), lalu meniupkan suara dengan frekuensi yang tepat untuk memicu aksi di dalam game (contoh: menghancurkan rintangan).
- **Fungsi Klinis:** Memastikan anak tidak hanya menganga (motorik wajah benar tapi tidak bersuara) atau berteriak serampangan (bersuara tapi bentuk bibir salah).

---

## 5. INOVASI TEKNOLOGI & IMPLEMENTASI MATEMATIS

### 5.1. Deteksi Bentuk Mulut via Lip Aspect Ratio (LAR)

Sistem menggunakan pustaka **MediaPipe Face Mesh** untuk memetakan koordinat titik-titik penting (*landmarks*) pada bibir secara *real-time*. Untuk mengukur bukaan mulut secara objektif, sistem menghitung nilai *Lip Aspect Ratio* (LAR) menggunakan rumus jarak Euclidean.

Misalkan P_top dan P_bottom adalah koordinat titik vertikal bibir bagian dalam, sedangkan P_left dan P_right adalah koordinat titik ujung horizontal bibir. Formula matematika untuk menghitung jarak Euclidean d(p, q) antara dua titik koordinat 2D adalah:

$$d(p,q) = \sqrt{(p_x - q_x)^2 + (p_y - q_y)^2}$$

Berdasarkan jarak tersebut, nilai LAR didefinisikan sebagai rasio jarak vertikal terhadap jarak horizontal:

$$LAR = \frac{d(P_{top}, P_{bottom})}{d(P_{left}, P_{right})}$$

Setiap pelafalan vokal memiliki rentang standar nilai LAR masing-masing, misalnya:

- Vokal **"A"** memiliki karakteristik bukaan vertikal lebar, sehingga nilai LAR ≥ LAR_threshold_A.
- Vokal **"U"** memiliki bentuk bibir memonyong, sehingga rasio vertikal dan horizontalnya mengecil secara proporsional.

### 5.2. Estimasi Frekuensi Dasar (f₀) Web Audio API

Sistem menangkap sinyal audio analog dari mikrofon, mengubahnya menjadi data digital domain waktu, lalu memprosesnya menggunakan **Algoritma Autokorelasi** untuk mengekstrak frekuensi dasar (f₀) pita suara anak secara instan tanpa membebani memori perangkat.

### 5.3. Logika Validasi Sekuensial (Sequential Validation)

Proses penentuan keberhasilan anak melafalkan huruf dilakukan melalui dua tahap pemeriksaan berurutan (*sequential filter*):

**Tahap 1: Validasi Visual** ⟹ LAR_actual ≈ LAR_target

**Tahap 2: Validasi Audio** ⟹ f₀ ∈ [f_min, f_max]

Jika dan hanya jika kedua kondisi tersebut terpenuhi, maka sistem menyatakan lafal anak **"Benar/Valid"** dan memberikan *reward* di dalam game.

---

## 6. VALUE PROPOSITION: MENGAPA V-NADA UNGGUL & REVOLUSIONER?

Berikut adalah matriks komparasi yang menjelaskan mengapa V-NADA jauh lebih unggul dibandingkan perangkat terapi konvensional (*headset speech trainer*):

| Kategori Batasan | Perangkat Fisik Konvensional (Headset) | Solusi Digital V-NADA (PWA + Multimodal) |
|---|---|---|
| **Ekonomi & Akses** | Sangat mahal (belasan juta rupiah). Hanya dimiliki SLB-B besar di kota-kota maju. | **Rp0 (Gratis).** Berbasis PWA yang hemat data, dapat diakses di HP Android murah seharga 1 jutaan milik orang tua siswa. |
| **Infrastruktur Komputasi** | Memerlukan komputer berspesifikasi khusus atau perangkat keras analog yang rumit. | **Client-Side Processing.** 100% proses komputasi terjadi di perangkat lokal gawai siswa tanpa membutuhkan server cloud berbayar. |
| **Efisiensi Geografis** | Siswa hanya bisa terapi di sekolah 1-2 kali seminggu karena keterbatasan alat. | **Terapi Mandiri di Rumah.** Memungkinkan latihan repetitif harian untuk mempercepat pembentukan *muscle memory*. |
| **Aspek Sensorik** | Buta aspek motorik wajah. Alat hanya mendeteksi suara, tidak tahu jika bentuk mulut anak salah. | **Multimodal AI.** Mengawinkan deteksi wajah (kamera) dan deteksi frekuensi (mikrofon) secara sinkron. |
| **Faktor Psikologis** | Tampilan kaku (VU Meter analog/grafik gelombang), membuat anak usia 7-9 tahun cepat bosan/stres. | **Gamifikasi Edukatif.** Mengubah proses terapi menjadi petualangan interaktif yang menyenangkan. |
| **Isu Kesehatan** | Memaksa volume suara tinggi ke telinga anak berisiko memicu trauma akustik sisa pendengaran. | **Aman & Ramah Saraf.** Mengalihkan seluruh proses koreksi ke indra penglihatan (visualisasi interaktif). |

---

## 7. PENERAPAN PEDAGOGIS PADA KURIKULUM MERDEKA

- **Integrasi Mata Pelajaran:** V-NADA didesain untuk masuk langsung ke dalam struktur Kurikulum Merdeka pada mata pelajaran khusus wajib PKPBI (Pengembangan Komunikasi, Persepsi Bunyi dan Irama).
- **Golden Age Target (Fase A & B):** Anak usia 7–9 tahun memiliki tingkat neuroplastisitas otak yang sangat tinggi. Intervensi wicara menggunakan V-NADA pada fase ini mencegah organ-organ artikulasi (seperti pita suara dan otot rahang) menjadi kaku secara permanen saat mereka beranjak dewasa.