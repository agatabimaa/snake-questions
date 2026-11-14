# 🐍 Snake Questions (Ular Tangga Cinta & Deep Talk)

> **Game Ular Tangga Berpasangan & Media Deep Talk Hubungan Interaktif**  
> Terinspirasi dari gaya visual Neo-Brutalist Comic Pop ala [mainwarga62.id](https://mainwarga62.id/).

---

## 🌟 Fitur Utama

- **🎲 Mekanik Dadu "Tahan untuk Kocok" (*Hold-to-Roll*)**:
  - Meter kekuatan kedalaman (*Santai* ➔ *Intim* ➔ *Deep Talk ★*).
  - Animasi dadu 3D & teks komentar lucu ala MainWarga62.
- **❤️ Bank Soal Hubungan yang Luas & Diacak (*Smart Randomization*)**:
  - 👦 **Petak Biru (Soal Cowok)**: Menggali isi kepala, ekspektasi, beban emosional, dan cara pria mencintai.
  - 👧 **Petak Pink (Soal Cewek)**: Menggali kebutuhan rasa aman (*reassurance*), hal kecil bermakna, dan bahasa kasih sayang.
  - 💜 **Petak Ungu (Deep Talk Bersama)**: Masa depan, keuangan bersama, privasi keluarga, dan resolusi konflik.
  - 🪜 **Tangga Cinta (+Naik Petak)**: Afirmasi positif, pujian tulus, dan rasa syukur memiliki pasangan.
  - 🐍 **Ular Manja (-Turun Petak)**: Refleksi ringan untuk melunakkan ego dan meminta maaf dengan nada manja.
  - 💌 **Love Dare / Virtual Action**: 100% ramah pasangan LDR (Voice Note, kirim PAP, share lagu kenangan, tatap layar 20 detik) serta mode ketemu langsung.
- **🔄 Anti-Duplikasi (*No-Repeat Tracker*) & Tukar Soal**:
  - Soal tidak akan terulang dalam 1 sesi permainan.
  - Tombol **Tukar Soal** menarik pertanyaan acak berikutnya jika ingin mengganti topik.
- **📖 Catatan Deep Talk (*Journal*)**:
  - Menyimpan riwayat semua pertanyaan yang telah dijawab selama sesi permainan.
- **🏆 Love Milestone & Kupon Hadiah Cinta**:
  - Efek ledakan *confetti*, statistik permainan, dan kupon kencan spesial untuk pasangan pemenang.
- **🎵 Sound Effects & Lo-Fi Synthesizer**:
  - Efek suara interaktif tanpa ketergantungan file eksternal (Web Audio API) + toggle BGM santai.

---

## 🚀 Menjalankan Secara Lokal

1. **Install dependensi:**
   ```bash
   npm install
   ```
2. **Jalankan development server:**
   ```bash
   npm run dev
   ```
3. Buka browser di `http://localhost:5173`.

---

## 🌐 Deploy ke Vercel

Proyek ini sudah dikonfigurasi siap pakai untuk Vercel.

1. Hubungkan repositori GitHub:
   ```bash
   git add .
   git commit -m "feat: initial commit for snake questions couple deep talk game"
   git push -u origin main
   ```
2. Buka [Vercel Dashboard](https://vercel.com/new).
3. Import repositori `agatabimaa/snake-questions`.
4. Klik **Deploy**! Vercel akan otomatis mendeteksi konfigurasi Vite dan mempublikasikannya secara instan.
