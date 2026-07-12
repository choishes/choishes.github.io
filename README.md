# SINYAL — Lab Forensik Media Sintetis

Game edukasi web: uji kemampuan membedakan konten buatan **manusia** vs **AI**
(teks, gambar, video). Dibuat untuk proyek mata kuliah Analisa Data Raya dan AI - Peminatan Kajian Media —
Produksi & Analisis Aplikasi.

Developer:
Muhammad Zaki Tasnim Mubarak (24321148)

Presenter:
Haidar Al Ghozi (24321180)
Syahadan Deka Allesio Destiansyah (24321173)

Laporan:
D. Rajbani Gibran Ahmad (24321052)
Maulana Malik Alfajri (24321054)


## Struktur

```
sinyal/
├── index.html          ← halaman utama
├── css/style.css       ← tampilan
├── js/bank.js          ← BANK SPESIMEN — edit di sini untuk kurasi konten
├── js/audio.js         ← SFX + BGM (dengan fallback ambient generatif)
├── js/leaderboard.js   ← papan skor lokal (localStorage)
├── js/game.js          ← logika 3 mode
└── assets/bgm/         ← taruh theme.mp3 di sini (placeholder BGM)
```

## Mode permainan

| Mode | Aturan |
|---|---|
| **KARIR** | 3 misi bertingkat (teks dasar → zona jebakan → forensik visual). Lulus ambang skor untuk naik; tuntaskan semua untuk mendapat pangkat. |
| **INFINITE** | Spesimen tanpa akhir, 3 nyawa. Skor tercatat ke papan skor. |
| **TANDING** | 2 pemain, 1 perangkat (hot-seat). Spesimen sama, jawab bergiliran, skor dibandingkan. |

## Papan skor: lokal vs global (penting)

GitHub Pages adalah **hosting statis** — tidak ada server/database.
Konsekuensinya:

- ✅ **Papan skor lokal** (yang sekarang): tersimpan di `localStorage`
  perangkat masing-masing pengguna. Cukup untuk demo tugas.
- ❌ **Papan skor global** (semua pengguna saling lihat): butuh backend.
  Opsi gratis kalau nanti mau upgrade:
  - **Cloudflare Workers + KV** (free tier longgar, ~30 baris kode)
  - **Firebase Realtime Database** (free tier Spark)
  - **PocketBase** di VPS/hosting gratisan (open-source, satu file)

## Roadmap "main bareng" (multiplayer online)

Real-time multiplayer di waktu bersamaan **tidak bisa** dari static hosting
saja, karena butuh saluran komunikasi antar pemain. Jalur realistisnya:

1. **Sekarang (0 backend)**: mode TANDING hot-seat — sudah jadi. Cocok
   untuk demo presentasi (dua penonton maju, main di laptopmu).
2. **Tahap 2 (masih tanpa server sendiri)**: WebRTC via **PeerJS** —
   pemain A membuat room, pemain B memasukkan kode room, data jawaban
   dikirim peer-to-peer. Bisa jalan dari GitHub Pages karena hanya butuh
   broker publik PeerJS untuk perkenalan awal.
3. **Tahap 3 (backend ringan)**: WebSocket server kecil (mis. Cloudflare
   Workers Durable Objects / PocketBase realtime) untuk room, sinkronisasi
   soal, dan leaderboard global sekaligus.

Untuk deadline 3 hari: **berhenti di tahap 1.** Tahap 2–3 layak masuk
bagian "pengembangan lanjutan" di laporanmu — itu sendiri menunjukkan
pemahaman arsitektur.

## Kredit & etika konten

- Spesimen AI: dihasilkan model AI (dicatat per item di `bank.js`).
- Spesimen manusia: WAJIB bersumber jelas + atribusi di versi final.
- Media: gunakan lisensi bebas (CC0/CC-BY) dan cantumkan kredit.
