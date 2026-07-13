# SINYAL — Lab Forensik Media Sintetis

Game edukasi web: uji kemampuan membedakan konten buatan **manusia** vs **AI**
(teks, gambar, video). Proyek Peminatan Kajian Media — Produksi & Analisis
Aplikasi, Ilmu Komunikasi UII.

**Kru:** Muhammad Zaki Tasnim Mubarak / 24321148 (developer) ·
Syahadan Deka Allesio Destiansyah / 24321173 & Haidar Al Ghozi / 24321180 (presentasi) ·
Maulana Malik Alfajri / 24321054 & D. Rajbani Gibran Ahmad / 24321052 (laporan).

---

## Struktur proyek

```
sinyal/
├── index.html          halaman utama (semua layar: menu, game, pengaturan, kredit)
├── css/style.css       seluruh tampilan
├── js/bank.js          ★ BANK SPESIMEN — konten soal + kunci benar/salah
├── js/audio.js         ★ BGM & SFX
├── js/space.js         latar partikel luar angkasa
├── js/cine.js          ★ intro sinematik (naskah cerita bisa diedit)
├── js/leaderboard.js   papan skor lokal
├── js/game.js          logika 3 mode (jarang perlu disentuh)
└── assets/bgm/         ★ file musik
```
★ = file yang berisi placeholder untuk kamu isi/ubah.

## Hosting di GitHub Pages

1. Buat repo (mis. `sinyal`), upload semua isi folder ini.
2. Settings → Pages → Source: `Deploy from a branch` → `main` / `(root)` → Save.
3. Live di `https://USERNAME.github.io/sinyal/` (±1 menit).
   Murni statis — tanpa build, tanpa npm.

---

# PANDUAN PLACEHOLDER

## 1. Musik (BGM) — `assets/bgm/` + `js/audio.js`

Dua jalur musik, keduanya dirujuk di `js/audio.js` baris atas:

| Jalur | File yang dicari | Kapan bunyi |
|---|---|---|
| Intro | `assets/bgm/The_Third_Moon.mp3` | selama cinematic (boot + narasi + nama) |
| Game  | `assets/bgm/Cinematic_Retro_Synth_Progression.mp3` | looping selama bermain, fade-out saat kembali ke lab |

**Cara ganti:** taruh file mp3 di `assets/bgm/`, lalu samakan namanya di
`js/audio.js`:

```js
const trackIntro = new Audio("assets/bgm/NAMA_FILE_INTRO.mp3");
const trackGame  = new Audio("assets/bgm/NAMA_FILE_GAME.mp3");
```

Kalau file jalur game tidak ditemukan, game otomatis memutar *ambient pad
generatif* (dibangkitkan kode) — jadi tidak pernah hening total.
Volume default 35% — pemain bisa mengubah lewat Pengaturan.
**Musik baru mulai setelah tombol "▶ MASUKI LAB" ditekan** — browser memblokir
autoplay audio tanpa interaksi; gerbang itulah yang membuka izinnya.

> Gunakan musik bebas lisensi (Pixabay Music, Free Music Archive) dan catat
> judul + pembuat untuk bagian atribusi di laporan.

## 2. Efek suara (SFX) — `js/audio.js`

SFX **tidak memakai file** — semuanya dibangkitkan WebAudio (fungsi `beep`).
Daftarnya di objek `sfx`: `click`, `scan`, `ok` (benar), `no` (salah),
`lose` (game over), `done` (fanfare). Mengubah rasa bunyi = mengubah angka
frekuensi/durasi, contoh:

```js
ok:()=>{beep(660,.08); setTimeout(()=>beep(990,.14),90);},
//        ^nada Hz  ^durasi detik        ^nada kedua
```

Ingin pakai file wav/mp3 sendiri? Ganti isi fungsinya:

```js
ok:()=>{ if(sfxOn) new Audio("assets/sfx/benar.mp3").play(); },
```

## 3. Spesimen TEKS + kunci benar/salah — `js/bank.js`

Semua soal ada di array `BANK`. Satu item teks:

```js
{ type:"teks", level:1, isAI:true, cue:"Struktur esai generik",
  text:"Kalimat soalnya…",
  explain:"Penjelasan edukatif yang muncul setelah menjawab." },
```

- **`isAI` adalah kunci jawaban**: `true` = dibuat AI, `false` = karya manusia.
  Salah mengisi ini = soalnya "bohong", jadi cek dua kali.
- `cue` = label singkat ciri khas (muncul sebagai chip di layar vonis).
- `trap:true` = tandai soal jebakan (kata "JEBAKAN" di explain akan disorot kuning).
- `level` = dipakai mode Karir: 1 → Misi 1, 2 → Misi 2, media → Misi 3.
- **PENTING untuk versi final:** teks "manusia" saat ini masih contoh gaya.
  Ganti dengan kutipan asli bersumber jelas (tweet, berita, chat dengan izin)
  dan simpan daftar sumbernya untuk laporan — ini poin metodologi.

## 4. Spesimen GAMBAR & VIDEO — `js/bank.js` + folder `assets/`

Item media punya field `src` yang sekarang kosong (`src:""` = slot demo).
Mengaktifkannya:

1. Buat folder `assets/img/` dan/atau `assets/vid/`.
2. Taruh filenya, mis. `assets/img/01.jpg`, `assets/vid/01.mp4`.
3. Isi di bank.js:

```js
{ type:"gambar", level:3, isAI:true,  src:"assets/img/01.jpg",
  cue:"Jari tangan aneh",
  explain:"Perhatikan jari kelingking kiri — enam ruas. Ciri khas generator…" },
{ type:"video",  level:3, isAI:false, src:"assets/vid/01.mp4",
  cue:"Guncangan kamera alami",
  explain:"Handheld asli: blur gerak dan audio ruangan konsisten…" },
```

Tips kurasi:
- **Gambar AI**: buat sendiri via generator gratis (Bing Image Creator,
  Ideogram). Catat prompt-nya — bagus untuk metodologi laporan.
- **Foto/video asli**: sumber bebas lisensi (Unsplash, Pexels, Wikimedia
  Commons) + tulis atribusi.
- Video: mp4 H.264, ≤10–15 detik, ≤5–10 MB per file supaya cepat dimuat.
- Tulis `explain` **spesifik per file** ("lihat pantulan di kacamata") —
  jauh lebih edukatif daripada penjelasan generik.
- Item media tanpa `src` otomatis dilewati di Infinite & Tanding, tapi tampil
  sebagai slot demo di Karir Misi 3 — jadi isi minimal 4 item media agar
  Misi 3 hidup.

## 5. Naskah intro sinematik — `js/cine.js`

Cerita pembuka ada di dua array paling atas:
- `SCRIPT_BARU` — pemain pertama kali (6 baris; bebas ditambah/kurangi).
- `SCRIPT_KEMBALI` — pemain yang sudah punya nama.
Baris log boot ada di `BOOT_LINES`.

## 6. Kredit kelompok — `index.html`

Cari `<!-- ============ TENTANG KAMI ============ -->` — nama, NIM, dan
pembagian peran ada di sana sebagai HTML biasa.

---

## Fitur

- Intro sinematik (gerbang audio → boot → narasi → registrasi nama → "MAJU!")
- Latar partikel luar angkasa (bisa dimatikan di Pengaturan; hormat pada
  `prefers-reduced-motion`)
- 3 mode: **Karir** (3 misi + pangkat) · **Infinite** (3 nyawa) ·
  **Tanding** (duel hot-seat)
- Pengaturan: musik, volume, SFX, partikel, ganti nama, putar ulang intro,
  hapus data
- Papan skor lokal (localStorage) — papan skor **global** butuh backend;
  opsi gratis bila ingin upgrade: Cloudflare Workers KV, PocketBase, Firebase.
- Multiplayer online real-time tidak mungkin dari static hosting; jalurnya
  bila ingin lanjut: PeerJS (WebRTC) → backend WebSocket ringan. Mode Tanding
  hot-seat adalah solusi tanpa server yang sudah jalan.

## Etika konten (untuk laporan)

- Spesimen AI: dicatat dihasilkan model apa + prompt-nya.
- Spesimen manusia: wajib bersumber + atribusi (dan izin bila dari orang privat).
- Media & musik: lisensi bebas + kredit.
