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
- `js/naskah2.js` — NASKAH BABAK II "Protokol Fajar" (sekuel). Aditif:
  merge tokoh baru ke VN_CHARS, tambah 4 latar ke VN_BG_FALLBACK, ganti
  node {end:"epilog"} jadi pilihan jembatan (lanjut babak II / tamat),
  lalu push NASKAH2 ke NASKAH. WAJIB dimuat SETELAH naskah.js DAN
  SETELAH story.js (VN_BG_FALLBACK baru ada setelah story.js). Label
  ch9–ch13 cocok regex simpan /^ch\d/ jadi save/resume otomatis jalan.
  Ada guard anti dobel (cek label ch9).
- `js/story.js` — engine visual novel
- `js/game.js` — logika Karir / Infinite / Tanding / Story
- `js/online.js` — multiplayer relay (WebSocket → Deno Deploy)
- `js/audio.js` — musik: intro, game, twist, title, crisis
- `js/bank.js` — 16 spesimen gambar + konfigurasi 11 level Karir
- `js/paket.js` — 100 soal teks (10 paket bertema, id 1–10)
- `js/paket_ekstra.js` — 120 soal teks TAMBAHAN (10 paket, id 11–20).
  TIDAK mendeklarasikan ulang PAKET; hanya `PAKET.push(...)` paket baru,
  jadi paket.js tak perlu diubah. WAJIB dimuat SETELAH paket.js dan
  SEBELUM story.js (story.js membangun kolam soalnya sekali saat load).
  Ada guard anti-dobel berbasis id. Paket 13/16/19 diberi `theme`
  (berita/chat/akademik) supaya ikut mengisi bab cerita terkait.
- `js/paket.js` + `js/paket_ekstra.js` = 220 soal total (20 paket).
- `js/profil.js` — PROFIL DETEKTOR: catat tiap jawaban per kategori
  sinyal linguistik (kata zombi, pola tiga, em dash, hedges, spesifisitas,
  dll) di localStorage, lalu tampilkan kelemahan/kekuatan pemain. Diklasifikasi
  dengan memindai explain+cue+text. Dihook dari game.js (profilRecord).
- `assets/story/` — gambar karakter & latar Story Mode. Juga:
  `intro_video.mp4` (cutscene prolog, di-stream + runtime-cache, TIDAK
  di-precache karena besar) dan `cuts_<kunci>.jpg` untuk adegan fokus:
  archive_open, arga_mother, dira_envelope, dira_fake, sari_ai, sari_book,
  syn_deprecated. Tanpa file, engine pakai gradasi/siluet (cerita tetap jalan).

- `js/dev.js` — PANEL DEV TERSEMBUNYI (bukan untuk pemain). Buka: URL
  `#dev`, ketik "dev", atau Ctrl+Shift+D. Fitur: loncat ke bab mana pun
  (Babak I & II), toggle KUNCI JAWABAN (sorot jawaban benar + alasan via
  monkey-patch window.render), luncurkan quiz per kategori pool, uji
  prolog/profil/papan skor, reset progres/profil, status simpanan.
  Aditif: inject label __dev_back untuk balik dari quiz; guard di vnEnd
  ("dev*" tak menimpa save). Dimuat TERAKHIR di index.html.

- `js/items.js` — SISTEM KOLEKSI ITEM. 14 item terbuka otomatis via
  milestone (masuk bab, tamat babak, akurasi profil, buka dev). Aditif:
  monkey-patch window.vnJump/vnEnd/profilRecord + sisipkan blok "KOLEKSI
  ITEM" ke layar Profil (patch profilRender). Gambar item_<id>.png;
  tanpa gambar pakai emoji fallback. Reset via panel dev.

## Riwayat update
- **v2.28** — (1) Panel dev sekarang dibuka lewat PLANET rahasia di layar
  Pengaturan (ketuk 3x); pemicu ketik "dev" DIHAPUS (cegah tak sengaja);
  hotkey Ctrl+Shift+D & #dev tetap ada. (2) SISTEM KOLEKSI ITEM baru
  (js/items.js): 14 item kolektibel, dicek di layar Profil, notifikasi
  saat dapat, aditif via monkey-patch. Item rahasia "Bintang" didapat
  saat membuka panel dev. (3) 5 cutscene {cut:} disisipkan ke Babak II
  (b2_menara/bawah/relay/putih/fajar). (4) Prompt cutscene, latar, & item
  ditambah ke PROMPTS.md. sw.js precache items.js, cache game-v13.
- **v2.27** — PANEL DEV tersembunyi (js/dev.js baru). Lihat struktur file.
  Guard vnEnd: key diawali "dev" tidak menyimpan "TAMAT" (quiz dev tidak
  merusak progres pemain). sw.js precache dev.js, cache game-v12.
- **v2.26** — REVISI NASKAH BABAK II (naskah2.js v2): bahasa jadi santai
  senada babak I (nggak/kayak, kalimat pendek, humor Arga), tiap bab
  diperpanjang (~390 node, +30%; adegan baru: warung bubur Kota Bawah,
  doodle "jangan lupa jemput" Renata, keraguan Nara soal Senja, rekaman
  ibu yang lebih emosional). STRUKTUR JADI BUILD-UP MURNI: dua ending
  lama (Terang/Senyap) dan epilog2 DIHAPUS. Twist Senja tetap klimaks
  BAB 12, tapi BAB 13 kini kekalahan: Fajar menyala, SYN-0 disandera di
  intinya, tim dilabeli PALSU & buron ke Kota Bawah, ditutup sinyal
  Renata "Tunggu ibu" → BERSAMBUNG KE FINALE: SINYAL (open ending).
  Cache game-v11.
- **v2.25** — SEKUEL: BABAK II "PROTOKOL FAJAR" (js/naskah2.js baru,
  5 bab ch9–ch13 + epilog2). Nada lebih serius & fiksi: kota dengan
  label ASLI/PALSU pada arsip warga; yang PALSU "dihapus" dari dunia.
  3 tokoh baru (NARA arsiparis, ELIAS kapten siber, SENJA kurator agung)
  dan 4 latar baru (menara, bawah, relay, putih). Misteri SYN-0 dibuka:
  SYN-0 = "Mercusuar", sistem label pertama buatan RENATA, ibu pemain,
  yang dihapus dari arsip. TWIST: pelakunya selama ini adalah SENJA
  (mentor Vega, direktur proyek lama): memalsukan label 40 tahun,
  menghapus Renata, membangun SYN-4.2, merekayasa banjir konten, bahkan
  memancing pemain masuk lab (kunci biometrik garis darah Renata).
  2 ending (Terang/Senyap) + cliffhanger Babak III (sinyal Renata dari
  luar kota). Akhir epilog babak I kini pilihan jembatan; TAMAT lama
  tetap tersedia. index.html: script naskah2 SETELAH story.js. sw.js:
  precache naskah2.js + 4 bg + 12 sprite baru, cache game-v10. Prompt
  aset di PROMPTS.md; tanpa aset, siluet/gradasi fallback tetap jalan.
- **v2.20–v2.24** — Rangkaian hotfix prolog: BGM biasa menimpa audio
  video (mute); gerbang mulai sebelum video di semua orientasi
  (#prologStart, perbaikan card kosong akibat media query .vnrotate);
  replay prolog dari Pengaturan; starfield dijeda saat video (anti
  patah-patah di laptop).
- **v2.19** — Lima fitur besar:
  (1) PROFIL DETEKTOR (js/profil.js baru) — analitik kelemahan berbasis
  cue, tersimpan lokal, diakses dari tombol homescreen "PROFIL DETEKTOR"
  (section #profil). Coverage klasifikasi ~86% (14% "umum"); em dash
  di-special-case agar tak salah tangkap dari tanda baca di penjelasan.
  (2) CUTS — node naskah {cut:"kunci", n, t} untuk adegan fokus layar
  penuh tanpa karakter (engine: vnShowCut/vnHideCut/#vnCut). 7 cut
  disisipkan ke naskah di bab 2/4/4/5/5/6/7.
  (3) CUTSCENE PROLOG + LOADING — runProlog() di story.js: layar loading
  memastikan intro_video.mp4 termuat, lalu video prolog + caption + tombol
  skip berkonfirmasi; fallback aman kalau video hilang. Dipicu di awal
  cerita (startStory fresh) dan bisa diputar ulang dari Pengaturan.
  (4) LEADERBOARD GLOBAL OTOMATIS — endInfinite/endCareerFinal memanggil
  autoSubmitGlobal() pakai nama operator; guard globalDone cegah dobel.
  (5) Aset baru intro_video.mp4 + 7 cuts_*.jpg (lihat di atas).
  sw.js: precache profil.js + 7 cuts (video runtime-cache), cache game-v4.
- **v2.18** — TAMBAH 10 paket soal baru (id 11–20, 120 soal unik, total
  jadi 220) di file baru `js/paket_ekstra.js`. Aditif: push ke array
  PAKET yang ada, paket.js tak disentuh. index.html menambah satu tag
  script (setelah paket.js, sebelum story.js). story.js: filter cerita
  `chat`/`berita`/`akademik` diperluas agar paket bertema baru
  (16/13/19) ikut mengisi bab 2/3/4, kolam tiap bab naik 10→22.
  Tanding & Online otomatis mengacak 20 paket. sw.js precache +
  paket_ekstra.js, cache game-v3.
- **v2.17** — FIX gambar telat/kedip. Akar masalah bukan ukuran file.
  (1) story.js: engine dulu bikin Image() baru tiap karakter/latar tampil
  dan selalu placeholder→swap; sekarang ada cache prapemuatan (VN_IMG_CACHE,
  vnPreload/vnPreloadAll dipanggil di startStory), gambar yang sudah siap
  tampil instan tanpa kedip, yang belum pakai placeholder lalu ditukar,
  file hilang tetap fallback siluet. (2) sw.js: precache diganti dari
  addAll (atomik, satu 404 menggagalkan semua) ke per-file allSettled,
  tambah handler activate (buang cache lama), fetch kini runtime-cache
  aset baru, daftar precache ditambah 4 gambar Sari, cacheName game-v2.
- **v2.16** — NASKAH v5: 2 bab sisipan baru (BAB 2 "Pesan untuk Ibu" —
  penipuan chat bot, pool Paket 06; BAB 4 "Yang Dituduh Mesin" — karakter
  baru SARI, manusia yang dituduh menulis pakai AI, pool Paket 09). Total
  jadi 8 bab + prolog (label ch1–ch7 + epilog). Pelajaran deteksi AI
  dipecah satu tema per bab dan dibungkus tebak-tebakan interaktif
  (bukan ceramah beruntun); seluruh em dash di naskah dihapus supaya
  dialog "manusia"-nya tidak memakai pola AI yang justru diajarkan game.
  story.js: filter soal baru `chat` (Paket 06) & `akademik` (Paket 09).
  Aset baru yang dibutuhkan: char_sari_{normal,senyum,marah,kaget}.png
  (prompt di assets/story/PROMPTS.md; tanpa file, engine pakai siluet).
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
