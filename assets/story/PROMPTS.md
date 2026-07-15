# PANDUAN ASET VISUAL — STORY MODE "PROTOKOL SINYAL"

Dokumen ini buat kamu (atau siapa pun di tim) yang mau menaruh / mengganti
gambar karakter & latar di Story Mode. Ditulis untuk pemula — ikuti langkahnya
urut saja.

---

## 1. GAMBAR KARAKTER SUDAH TERPASANG ✅

16 gambar karakter (4 tokoh × 4 ekspresi) sudah ada di folder
`assets/story/` dan langsung dipakai game. Kamu tidak perlu melakukan apa-apa
lagi kecuali mau menggantinya.

**4 ekspresi yang dipakai game:** `normal`, `senyum`, `marah`, `kaget`.
(Ekspresi lain seperti "sedih/serius/cemas" sudah dihapus dari cerita dan
dipetakan ke salah satu dari empat ini — jadi kamu cukup menyiapkan 4 saja.)

---

## 2. KALAU MAU GANTI / TAMBAH GAMBAR KARAKTER

### Di mana file disimpan?
Semua di satu folder: **`assets/story/`**

### Aturan nama file (WAJIB persis begini)
```
char_<tokoh>_<ekspresi>.png
```
- `<tokoh>` = `vega`, `arga`, `dira`, `sari`, atau `syn`
  (sari = tokoh baru v2.16; sebelum filenya ada, game otomatis pakai
  siluet placeholder, cerita tetap jalan)
- `<ekspresi>` = `normal`, `senyum`, `marah`, atau `kaget`

Contoh yang benar:
```
char_vega_normal.png
char_arga_senyum.png
char_dira_marah.png
char_syn_kaget.png
```
Kalau namanya salah satu huruf saja, game otomatis pakai placeholder (siluet
lingkaran berinisial). Jadi kalau muncul siluet, cek dulu nama filenya.

### Format & ukuran
- **Format: PNG dengan background transparan.** Ini penting supaya karakter
  "menempel" di atas latar, bukan punya kotak putih di belakangnya.
- **Ukuran ideal:** tinggi 1000–1400 px, potret (lebih tinggi daripada lebar).
  Yang sekarang 1080×1350 px — itu pas.

### Soal ukuran file 1–10 MB: perlu dikompres?
- **1–3 MB: aman, tidak usah dikompres.**
- **4 MB ke atas: sebaiknya dikompres** biar game cepat dibuka, terutama di HP.
  Targetkan tiap PNG di bawah ~2 MB.
- Cara kompres PNG gratis tanpa aplikasi: buka **tinypng.com**, seret filenya,
  unduh hasilnya, timpa file lama. Transparansi tetap terjaga.
- Jangan ubah PNG jadi JPG untuk karakter — JPG tidak bisa transparan.

---

## 3. GAMBAR LATAR (BACKGROUND) — OPSIONAL

Sekarang latar masih pakai gradasi warna otomatis (placeholder). Cerita tetap
jalan tanpa file latar. Kalau mau latar sungguhan:

### Nama file (taruh juga di `assets/story/`)
```
bg_lab.jpg        (ruang lab forensik)
bg_kota.jpg       (jalanan kota malam)
bg_redaksi.jpg    (ruang redaksi pers kampus)
bg_server.jpg     (ruang server gelap)
bg_void.jpg       (ruang arsip surreal)
```
- **Format: JPG** (latar tidak perlu transparan, JPG lebih ringan).
- **Ukuran:** lebar ~1600 px, mendatar (16:9). Kompres ke JPG kualitas ~80%
  supaya di bawah ~500 KB. Bisa pakai tinypng.com juga.

---

## 4. PROMPT UNTUK BIKIN GAMBAR (kalau butuh generate lagi)

Tempel jangkar gaya ini di awal tiap prompt biar konsisten:

> Beautiful modern anime illustration, clean detailed line art, soft cel
> shading, attractive charming character design, cinematic teal-cyan and
> violet rim lighting, dark sci-fi mood. Fully clothed, modest outfit, no
> suggestive posing. SFW. Transparent background, PNG, 2:3 portrait.

Deskripsi fisik tiap tokoh (salin persis biar wajahnya tetap sama):

- **VEGA** — perempuan Indonesia 40-an, elegan berwibawa, rambut pendek hitam
  dengan satu helai perak, jas lab navy beraksen amber.
- **ARGA** — laki-laki Indonesia awal 20-an, ganteng ramah, rambut hitam
  berantakan, hoodie gelap bermotif sirkuit cyan, headphone di leher.
- **DIRA** — perempuan Indonesia awal 20-an berhijab rapi, blazer ungu,
  rompi pers kampus, memegang buku catatan.
- **SARI** — perempuan Indonesia awal 20-an, kacamata bulat, rambut hitam
  dikuncir rendah agak berantakan, kardigan biru muda di atas kaos polos,
  membawa notes kecil bersampul biru lecek dengan noda kopi, ada pulpen
  terselip di kuncirannya. Kesan: pekerja keras yang kurang tidur tapi
  matanya hidup.
- **SYN** — sosok cahaya digital merah-putih yang glitch, tubuh transparan
  seperti hologram, indah tapi bikin merinding. Bukan robot.

Isi bagian ekspresi dengan: `normal` (tenang), `senyum` (ramah),
`marah` (serius/kesal), `kaget` (mata membelalak, terkejut).

Simpan semua prompt final yang kamu pakai — nanti berguna untuk lampiran laporan.

---

## Aset video & cuts (v2.19)

Letakkan di folder `assets/story/` dengan nama PERSIS berikut:

- `intro_video.mp4` — cutscene prolog ± 25 detik. Di-stream saat mulai
  cerita (bukan di-precache karena besar). Kalau file tidak ada, prolog
  otomatis dilewati dan cerita langsung ke BAB 1. Format lain (mis. .webm)
  perlu penyesuaian pada `<source>` di index.html.
- `cuts_<kunci>.jpg` — gambar landscape 16:9 untuk adegan fokus layar
  penuh (tanpa karakter). Kunci yang dipakai naskah:
  - `cuts_arga_mother.jpg`   — BAB 2, ibu Arga di depan ATM
  - `cuts_sari_ai.jpg`       — BAB 4, tangkapan layar "99% AI"
  - `cuts_sari_book.jpg`     — BAB 4, notes biru berpindah tangan
  - `cuts_dira_envelope.jpg` — BAB 5, foto palsu Dira menerima amplop
  - `cuts_dira_fake.jpg`     — BAB 5, forensik foto terkupas
  - `cuts_syn_deprecated.jpg`— BAB 6, ruang server SYN yang ditinggalkan
  - `cuts_archive_open.jpg`  — BAB 7, lautan label di inti arsip

Tanpa file cuts, engine memakai gradasi gelap sebagai fallback dan
narasinya tetap tampil, jadi aman untuk deploy bertahap.

---

## Aset BABAK II — Protokol Fajar (v2.25)

### Tokoh baru (4 ekspresi masing-masing: normal, senyum, marah, kaget)
File: `char_<tokoh>_<ekspresi>.png` — tanpa file, engine pakai siluet.

- **NARA** — perempuan Indonesia akhir belasan/awal 20-an, arsiparis;
  rambut pendek sebahu dengan jepit sederhana, seragam kerja menara
  biru-abu dengan lencana arsip, sarung tangan katun putih arsiparis,
  bekas gelang benang lusuh dari Kota Bawah di pergelangan. Kesan:
  cekatan, keras kepala, mata yang cepat menangkap detail.
- **ELIAS** — laki-laki Indonesia 40-an, kapten Divisi Siber; potongan
  cepak beruban di pelipis, jas hujan gelap di atas seragam, tablet
  penyidik selalu di tangan kiri, garis wajah tegas dan lelah. Kesan:
  kaku, prosedural, tapi lurus.
- **SENJA** — perempuan Indonesia 60-an, Kurator Agung; rambut perak
  disanggul rapi, kacamata baca berantai, selendang tenun abu-perak di
  atas blazer gelap, membawa pena perak antik. Kesan: hangat seperti
  pustakawan tua... dengan tatapan yang sedikit terlalu tenang.
  (PENTING: dia tampil ramah di awal; jangan buat terlihat jahat.)

### Latar baru (16:9, file .jpg)
- `bg_menara.jpg` — interior Menara Arsip Nasional: rak arsip ratusan
  meter menjulang, lift kaca, cahaya biru dingin, kabut tipis pendingin.
- `bg_bawah.jpg` — Kota Bawah: distrik kumuh di bawah jalur layang,
  pipa raksasa, hujan abadi menetes dari kota atas, neon redup, genangan.
- `bg_relay.jpg` — interior Stasiun Relai 7: menara pemancar tua,
  mesin berkarat bercampur rak server baru, cahaya oranye trafo, debu.
- `bg_putih.jpg` — Ruang Putih: ruang memori tanpa batas, putih lembut
  bercahaya dari segala arah, partikel data melayang samar, minimalis.

Tanpa file latar, engine memakai gradasi fallback (sudah disetel di
naskah2.js), jadi babak II bisa dideploy sebelum asetnya jadi.
