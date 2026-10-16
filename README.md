# Membandingkan Tata Tulis Aksara Jawa

Aplikasi web sederhana untuk membandingkan hasil transliterasi Latin → Aksara Jawa dari berbagai paugeran tata tulis secara real-time. Dibuat untuk membantu pembelajar, pengajar, dan pegiat Aksara Jawa memahami perbedaan antar sistem penulisan.

> **Live Demo:** [`https://www.kandangjago.com`](https://www.kandangjago.com)


![Aksara Jawa](https://img.shields.io/badge/Aksara-Jawa-%230056b3?style=for-the-badge)
![Harmonisasi Aksara](https://img.shields.io/badge/Harmonisasi-Aksara-%230056b3?style=for-the-badge)

![License](https://img.shields.io/badge/license-KANDANGJAGO-green?style=flat-square)
![Made in Yogyakarta](https://img.shields.io/badge/Made%20in-Yogyakarta-blue?style=flat-square)

---

## ✨ Fitur Utama

- **Input Latin Sekali, Hasil 5 Paugeran Sekaligus:** Ketik latin, langsung keluar aksara untuk semua sistem.
- **Transliterasi Lengkap:** Setiap paugeran menampilkan 3 output:
  - `Aksara Jawa` - dengan font Ngayogyan New & Ngayogyan Old
  - `JGST` (Javanese General System of Transliteration) - warna merah
  - `IPA` (International Phonetic Alphabet) - warna hijau
- **Interaktif:** 
  - Slider **Ukuran Aksara** (1rem - 4rem)
  - Slider **Jarak Spasi Vertikal** (1 - 3)
- **Deteksi Cerdas Aksara Rekan:**
  - Otomatis mendeteksi penggunaan aksara rekan khusus seperti `f, v, z, kh, sy` dll
  - Memberikan peringatan `⚠️ untuk paugeran yang tidak mengenalnya (KBJ, Sriwedari, Cara Kawi)
  - Highlight merah untuk karakter tersebut
- **Dukungan Sastra Lampah:** Penanganan khusus untuk Tradisional & Cara Kawi (Mardi Kawi)
- **100% Client-Side:** Tidak butuh backend, berjalan sepenuhnya di browser. 

## 📜 5 Paugeran yang Dibandingkan

Aplikasi ini memuat 5 modul transliterasi terpisah:

| # | Paugeran/Tata Tulis | Font | Karakteristik |
|---|----------|------|---------------|
| 1 | **KBJ** | Ngayogyan New | Kongres Bahasa Jawa. Paugeran paling umum diajarkan saat ini |
| 2 | **Sriwedari** | Ngayogyan New | Hasil Kongres Sriwedari, mempertahankan banyak tradisi |
| 3 | **Simplified** | Ngayogyan New | Penyederhanaan untuk kemudahan belajar |
| 4 | **Tradisional** | Ngayogyan Old | Gaya tradisional / Kawi, didukung Aksara Rekan |
| 5 | **Cara Kawi (Mardi Kawi)** | Ngayogyan Old | Untuk penulisan Jawa Kuno / Kawi |

## 🔤 JGST & IPA

- **JGST:** Sistem transliterasi latin baku untuk Aksara Jawa
- **IPA:** Pelafalan fonetik akurat dari hasil JGST
- Proses: `Latin → Aksara Jawa → JGST → IPA`

## 💡 Cara Pakai

1. Ketik teks latin di kolom **Huruf Latin** (contoh: `aku mangan sega`)
2. Hasil 5 paugeran akan muncul otomatis di kartu di bawah
3. Atur kenyamanan baca lewat slider ukuran dan spasi
4. Perhatikan badge peringatan merah jika mengetik huruf asing (f, v, z, dll)

Contoh input untuk uji rekan:
```
televisi, foto, dzikir, khusnul
```

## 🛠️ Teknologi

- HTML5, CSS3 (Grid, CSS Variables), Vanilla JavaScript
- Font: `Ngayogyan New`, `Ngayogyan Old`, `Gentium Plus`

## 🗺️ Roadmap / Ide Pengembangan

- [ ] Tombol copy untuk setiap output aksara
- [ ] Mode gelap / terang
- [ ] Export hasil sebagai PNG / PDF
- [ ] Perbandingan side-by-side dengan tabel
- [ ] Penjelasan kaidah tiap paugeran (tooltip)

Jika menemukan bug transliterasi, sertakan: input latin, output yang salah, dan output yang diharapkan menurut paugeran tersebut.

## 📄 Lisensi

MIT License - bebas dipakai untuk pendidikan, pengembangan, dan pelestarian Aksara Jawa.

> **Mangga uri-uri Aksara Jawa!**
