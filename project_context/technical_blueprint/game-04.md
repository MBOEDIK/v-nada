# Spesifikasi Arsitektur Sistem Progresi & Reward

Dokumen ini merinci rancangan teknis untuk skema peningkatan kesulitan bertahap (*progressive scaling*) dan mekanisme penghargaan digital (*digital rewards*) pada platform V-NADA. Fokus utama sistem ini adalah menjaga retensi dan motivasi siswa tunarungu usia 7-9 tahun (Fase A & B) agar tetap terlibat dalam sesi terapi wicara yang repetitif melalui pendekatan gamifikasi yang sepenuhnya berbasis visual (*zero-audio*).

**Kode Dokumen:** GAME-04
**Versi:** 3

---

## 1. Matriks Progresi Kesulitan (Difficulty Progression Matrix)

Roadmap penskalaan kesulitan dirancang untuk menyesuaikan dengan perkembangan kemampuan motorik wicara pengguna, mulai dari fondasi fonasi hingga artikulasi kompleks.

| Tingkat Kesulitan | Fokus Materi | Parameter Validasi (Toleransi) | Mekanik Game |
|---|---|---|---|
| **Initial (Dasar)** | Vokal kontras dasar (A & I). | Toleransi LAR ±20%; Stabilitas frekuensi dasar (f0) rendah (durasi < 2 detik). | Balon udara bergerak naik-turun dengan kontrol suara sederhana. |
| **Intermediate (Menengah)** | Set vokal lengkap (A, I).<br>*CATATAN: Setelah final baru tambahkan U, E, O* | Toleransi LAR ±10%; Akurasi bentuk bibir lebih ketat; Durasi suara stabil 3-5 detik. | Karakter harus melewati rintangan dengan mengubah bentuk mulut secara tepat. |
| **Advanced (Mahir)** | Transisi cepat (misal: A-I) & durasi napas panjang.<br>*CATATAN: Setelah final baru tambahkan transisi U-E, dan lain-lain.* | Toleransi LAR ±5%; Stabilitas konstan pada durasi > 5 detik; Transisi antar-vokal cepat. | Petualangan interaktif yang membutuhkan kombinasi lafal sekuensial untuk membuka jalan. |

---

## 2. Logika Perhitungan Skor (Scoring System Logic)

Sistem ini mengubah performa sensorik (Visual LAR dan Audio f0) menjadi nilai numerik objektif. Penilaian menggunakan skala 1-3 Bintang berdasarkan variabel berikut:

1. **Presisi LAR:** Seberapa dekat nilai Lip Aspect Ratio aktual dengan target standar vokal.
2. **Stabilitas Frekuensi (f0):** Konsistensi getaran pita suara yang dideteksi via Web Audio API.
3. **Durasi Fonasi:** Kemampuan mempertahankan embusan napas selama durasi target.

### 2.1. Parameter Rating Bintang (Khusus Modul 2 — Dual-Sense)

- **1 Bintang (Cukup):** Berhasil melewati ambang batas validasi visual (LAR) dan audio (f0) dengan akurasi 60-75% dari durasi target.
- **2 Bintang (Baik):** Mencapai akurasi LAR dan stabilitas frekuensi sebesar 76-90% dengan kontrol napas yang stabil.
- **3 Bintang (Sempurna):** Presisi LAR > 90%, frekuensi sangat stabil, dan durasi napas memenuhi atau melebihi target sesi tanpa terputus.

**Catatan:** Sistem penilaian berbasis durasi fonasi untuk Modul 1 (VocaTone) didefinisikan terpisah di GAME-01.

---

## 3. Sistem Loop Reward Digital (Digital Reward Loop)

Mengingat target pengguna mengalami gangguan pendengaran berat hingga total, seluruh feedback loop dialihkan sepenuhnya ke indra penglihatan (*sensory substitution*).

### 3.1. Mekanisme Trigger & Visualisasi

Setiap keberhasilan divalidasi melalui Sequential Validation Logic (Wajah → Suara).

- **Success Transition:** Animasi perubahan warna layar menjadi hijau lembut sebagai isyarat visual keberhasilan.
- **Sparkling Particle Effects:** Efek partikel berkilau di sekitar karakter atau objek game saat target LAR tercapai secara instan.
- **Unlockable Content:** Akumulasi bintang digunakan untuk membuka kostum baru atau karakter pendamping (*pets*) untuk meningkatkan ikatan emosional anak terhadap aplikasi.
- **Progress Bar Harian:** Visualisasi di akhir sesi yang menunjukkan total pencapaian target harian untuk memudahkan pemantauan oleh guru atau orang tua.

---

## 4. Panduan Implementasi Visual & Diagram

Instruksi untuk Game Artist & Developer:

1. **Desain Progress Bar:**
   - Gunakan gradasi warna dari kuning ke biru cerah (hindari warna merah untuk indikator progres positif).
   - Tambahkan ikon "Smart Chip" atau stiker lucu yang muncul setiap kali progres harian mencapai 25%, 50%, 75%, dan 100%.
2. **Visualisasi Siluet Mulut:**
   - Buat garis bantu (*mouth silhouette calibration*) yang semi-transparan di atas feed kamera.
   - Garis ini bersifat statis dengan Opacity 30% (lingkup 50% PoC) sebagai panduan kalibrasi posisi wajah tanpa mengganggu visibilitas kamera. Untuk pengembangan pasca-PoC, opasitas dapat dibuat dinamis.
3. **Animasi Reward:**
   - Gunakan prinsip "Juice" dalam desain game (efek membal, cahaya, dan pergerakan halus) untuk menggantikan kepuasan sensorik yang biasanya didapat dari efek suara level-up.