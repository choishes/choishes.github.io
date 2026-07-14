# CLAUDE.md — Catatan Proyek & Riwayat Update SINYAL

Aplikasi web edukasi **SINYAL — Lab Forensik Media Sintetis**.
Menguji kemampuan membedakan konten buatan manusia vs buatan AI.
Statis (HTML/CSS/JS), hosting GitHub Pages, multiplayer relay via Deno Deploy.

## Cara menaikkan versi
Nomor versi ada di **satu tempat**: `js/version.js` → konstanta
`SINYAL_VERSION`. Ubah di situ, otomatis tampil di homescreen (chip di bawah
judul) dan di pojok kanan atas. Format `X.YZ`: naikkan `YZ` tiap update kecil,
naikkan `X` untuk rilis besar. Setiap naik versi, tambahkan satu baris di
riwayat bawah ini.

## Struktur file penting
- `index.html` — semua layar (hub, story, game, levels, duel, dll)
- `js/version.js` — nomor versi (sumber tunggal)
- `js/naskah.js` — isi cerita Story Mode (aman diedit tanpa sentuh engine)
- `js/story.js` — engine visual novel
- `js/game.js` — logika Karir / Infinite / Tanding / Story
- `js/online.js` — multiplayer relay (WebSocket → Deno Deploy)
- `js/audio.js` — musik: intro, game, twist, title, crisis
- `js/bank.js` — 16 spesimen gambar + konfigurasi 11 level Karir
- `js/paket.js` — 100 soal teks (10 paket bertema)
- `assets/story/` — gambar karakter & latar Story Mode

## Riwayat update
- **v2.10** — MERGE besar: Story Mode digabung ke basis Claude Code (yang
  sudah terhubung Deno). Ditambah: 16 gambar karakter (4 tokoh × 4 ekspresi),
  transisi sinematik antar-bab (kartu judul + fade), efek layar
  (flash/shake/glitch), 2 musik baru (title untuk pembuka, crisis untuk fase
  tegang). Naskah diperpanjang tiap bab, prolog disederhanakan, bahasa twist &
  ending dibuat lebih membumi. Ending kini **bercabang** (3 akhir: Penjaga
  Terbuka / Dipercaya Buta / Lembaran Kosong). Sistem versi X.YZ tampil di
  homescreen.
- **v2.0x (Claude Code)** — basis: Karir peta planet 11 level, twist ending,
  multiplayer online via relay Deno Deploy + daftar pemain online, audio 3
  jalur, peluncuran roket intro.
- **v1.x** — MVP sampai mode Karir/Infinite/Tanding, 100 soal teks, 16 gambar,
  intro sinematik, papan skor lokal.

## Catatan integritas (untuk laporan)
Teks berlabel "manusia" pada game ini ditulis dengan bantuan AI saat
pengembangan (jujur dicatat di twist ending & dokumen laporan). Foto berlabel
asli = karya fotografer manusia. Pelajaran inti: cek sumber label, jangan
menilai dari "rasa".
