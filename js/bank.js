/* ================================================================
   SINYAL — BANK SPESIMEN
   Edit file ini untuk kurasi konten. Tidak perlu sentuh game.js.

   Format tiap item:
   { type:"teks"|"gambar", isAI:true/false, cue:"...",
     text:"..." (untuk teks) ATAU src:"..." (untuk gambar),
     explain:"penjelasan edukatif", trap:true (opsional),
     level:1|2|3 (dipakai mode Karir) }

   gambar: isi "src" dengan path lokal (mis. "assets/img/01.jpg")
   atau URL. Item media TANPA src otomatis di-skip di mode Infinite
   & Tanding, tapi tetap muncul sebagai slot demo di Karir Misi 3.
   ================================================================ */
const BANK = [
  { type:"teks", level:1, isAI:true, cue:"Struktur esai generik",
    text:"Membaca merupakan salah satu aktivitas yang memiliki peran penting dalam kehidupan sehari-hari. Selain menambah wawasan, membaca juga dapat meningkatkan kemampuan berpikir kritis, memperluas kosakata, serta menumbuhkan rasa empati. Oleh karena itu, penting bagi kita untuk menjadikan membaca sebagai kebiasaan yang positif.",
    explain:"Ciri AI klasik: pembukaan “merupakan salah satu… yang memiliki peran penting”, daftar tiga manfaat yang rapi, lalu penutup “Oleh karena itu, penting bagi kita…”. Terlalu seimbang dan tanpa detail spesifik atau suara pribadi." },

  { type:"teks", level:1, isAI:false, cue:"Suara kasual & spesifik",
    text:"gila sih tadi macet parah di jalan kaliurang, gara2 ada acara apa gitu deket UII. gue nyampe kelas telat 20 menit untung dosennya belom masuk wkwk. laen kali mending naik motor aja deh drpd mobil",
    explain:"Ciri manusia: singkatan (drpd, gara2), typo (“laen”, “belom”), “wkwk”, detail konkret (Kaliurang, UII, telat 20 menit), dan alur pikiran yang meloncat. AI jarang menulis serandom dan sepersonal ini kecuali diminta khusus." },

  { type:"teks", level:1, isAI:true, cue:"Frasa promosi kosong",
    text:"Yogyakarta menawarkan perpaduan sempurna antara keindahan budaya dan pesona alam. Dari Candi Prambanan yang megah hingga hamparan pantai selatan yang menawan, setiap sudut kota ini menyimpan cerita tersendiri. Tak heran, Yogyakarta menjadi destinasi favorit para wisatawan dari berbagai penjuru.",
    explain:"“perpaduan sempurna”, “pesona alam”, “setiap sudut… menyimpan cerita”, “tak heran… menjadi favorit” — frasa promosi generik yang sangat sering keluar dari AI. Nadanya mulus tapi kosong dari pengalaman nyata." },

  { type:"teks", level:1, isAI:false, cue:"Opini tegas tanpa hedging",
    text:"Jujur aku nggak setuju sama kebijakan parkir baru di kampus. Masa iya mahasiswa disuruh bayar tapi lahannya tetep sempit dan becek kalau hujan, kan aneh. Mending duitnya buat benerin drainase dulu baru ngomongin tarif.",
    explain:"Opini tegas tanpa menyeimbangkan dua sisi, keluhan konkret (parkir, becek, drainase), dan kalimat yang “ngalir” seperti orang bicara. AI cenderung lebih hati-hati dan netral daripada ini." },

  { type:"teks", level:2, isAI:true, cue:"Pola “di satu sisi… di sisi lain”",
    text:"Media sosial memiliki dampak yang beragam terhadap kehidupan masyarakat. Di satu sisi, media sosial mempermudah komunikasi dan penyebaran informasi. Namun di sisi lain, penggunaannya yang berlebihan dapat menimbulkan dampak negatif seperti kecanduan dan hoaks. Oleh sebab itu, diperlukan kebijaksanaan dalam menggunakannya.",
    explain:"Struktur “di satu sisi… di sisi lain… oleh sebab itu” adalah pola argumen AI paling khas: dua sisi seimbang, ditutup nasihat normatif (“diperlukan kebijaksanaan”). Aman, netral, tanpa posisi tegas." },

  { type:"teks", level:2, isAI:false, cue:"Pesan fungsional sehari-hari",
    text:"eh nanti sore jadi ngumpul di sekre gak? aku bawa laptop sama proyektor yg kmrn. kalo jadi tolong konfirm ya, soalnya aku harus pinjem kunci ke pak satpam dulu",
    explain:"Pesan logistik nyata: pertanyaan langsung, detail situasional (proyektor, kunci, pak satpam), singkatan sehari-hari. Terlalu praktis dan terikat konteks untuk teks AI generik." },

  { type:"teks", level:2, isAI:true, cue:"Definisi ensiklopedis netral",
    text:"Fotosintesis adalah proses yang dilakukan tumbuhan untuk mengubah energi cahaya matahari menjadi energi kimia. Proses ini melibatkan klorofil, air, dan karbon dioksida, serta menghasilkan glukosa dan oksigen. Fotosintesis memainkan peran penting dalam menjaga keseimbangan ekosistem.",
    explain:"Definisi rapi dan netral, ditutup “memainkan peran penting dalam…”. Benar secara fakta tapi generik — gaya rangkuman AI. (Catatan: manusia pun bisa menulis begini, dan itulah kenapa deteksi sulit.)" },

  { type:"teks", level:2, isAI:false, cue:"Memori otobiografis",
    text:"Kadang aku mikir, kenapa ya tiap hujan sore-sore bau tanahnya bikin kangen rumah nenek di Klaten. Padahal rumahnya udah dijual dari 2019. Aneh aja memori nempel di hal-hal kecil kayak gitu.",
    explain:"Detail otobiografis spesifik (nenek, Klaten, dijual 2019) dan asosiasi personal tak terduga (bau tanah → kangen), tanpa struktur argumen. Ini teritori manusia — AI tak punya kenangan pribadi sespesifik ini." },

  { type:"teks", level:2, isAI:true, trap:true, cue:"JEBAKAN — AI meniru gaya kasual",
    text:"astaga baru nyadar tugas komunikasi pemberdayaan deadline besok padahal belom kelar 😭 kayaknya harus begadang nih. doain lancar yaa gaes, semangat buat yang senasib 🫂",
    explain:"JEBAKAN. Ini ditulis AI yang diminta meniru gaya kasual — emoji, “gaes”, “semangat buat yang senasib”. Ketika di-prompt dengan gaya tertentu, AI bisa menyamar sangat meyakinkan. Kalau kamu tertipu, itu justru poin utama proyek ini: gaya bahasa bukan bukti yang andal." },

  { type:"teks", level:2, isAI:false, trap:true, cue:"JEBAKAN — manusia menulis formal",
    text:"Berdasarkan hasil observasi, dapat disimpulkan bahwa tingkat partisipasi warga dalam kegiatan ini tergolong tinggi. Faktor pendukungnya antara lain sosialisasi yang efektif serta keterlibatan tokoh masyarakat setempat.",
    explain:"JEBAKAN sebaliknya. Ini tulisan MANUSIA (gaya laporan mahasiswa), tapi register formal-akademiknya (“dapat disimpulkan bahwa”, “faktor pendukungnya antara lain”) sangat mirip AI. Inilah false positive: penulis manusia yang formal sering dituduh mesin. Menebak dari “rasa” sangat rawan salah." },

  /* ---------- GAMBAR (16 spesimen, 8 pasang asli vs AI) ----------
     Penjelasan ditulis sesuai ISI gambar (bukan nama file). */

  /* PEMANDANGAN */
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_scenery.jpg", cue:"Foto astro asli",
    explain:"FOTO ASLI. Gunung berapi meletus di bawah langit berbintang — noise sensor pada langit malam, jejak lava tak simetris, dan lintasan pijar yang terekam long-exposure. Ketidaksempurnaan optik seperti ini sulit dipalsukan." },
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_scenery.jpg", cue:"Papan nama tak terbaca",
    explain:"AI. Jalanan malam bergaya Jepang dengan motion blur — periksa papan-papan neonnya: hurufnya 'seperti tulisan' tapi kacau bila dibaca, dan lampu taksi menampilkan teks tak bermakna. Grain dan blur kamera bisa ditiru; teks yang koheren belum." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_scenery__2_.jpg", cue:"Bukit hijau nyata",
    explain:"FOTO ASLI. Lereng pegunungan hijau dengan langit biru polos — gradasi cahaya matahari alami pada rumput, lipatan lereng dan tekstur batu yang tidak berulang. Komposisi sederhana tanpa 'drama' justru sering menandai keaslian." },
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_scenery__2_.jpg", cue:"Cahaya terlalu sempurna",
    explain:"AI. Desa pegunungan malam dengan sorot cahaya vertikal menembus langit — sorotnya terlalu bersih dan lurus sempurna, Milky Way terlalu dramatis, dan pantulan di danau tidak konsisten dengan arah sumber cahaya. 'Terlalu indah untuk nyata' adalah sinyal untuk curiga." },

  /* SENI & JALANAN */
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_art.jpg", cue:"Sapuan tanpa arah",
    explain:"AI. Lukisan abstrak meniru gaya ekspresionis — tapi sapuan kuasnya tak punya 'logika tangan': arah goresan acak tanpa tekanan yang konsisten, dan tepi warna terlalu rapi untuk cat minyak sungguhan di kanvas." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_art.jpg", cue:"Jejak berlapis nyata",
    explain:"FOTO ASLI. Van penuh grafiti di sudut jalan — coretan bertumpuk dari banyak tangan selama bertahun-tahun, stiker mengelupas, rambu jalan dengan teks yang benar-benar terbaca. Akumulasi sejarah visual seperti ini belum bisa direka generator secara koheren." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_art__2_.jpg", cue:"Materialitas cat",
    explain:"FOTO ASLI. Close-up palet pelukis — gumpalan cat bertumpuk secara fisik dengan bayangan nyata, campuran tekstur kering-basah, dan kilau minyak yang merespons arah cahaya. Depth-of-field makronya juga wajar: sebagian fokus, sebagian blur alami." },
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_park.jpg", cue:"Detail kota janggal",
    explain:"AI. Taman kota bergaya foto stok — sekilas meyakinkan, tapi periksa papan tokonya: teks generik yang 'hampir benar', sampah tersebar terlalu merata seperti ditata, dan sosok-sosok pejalan yang postur serta bayangannya sedikit meleset." },

  { type:"gambar", level:3, isAI:false, src:"assets/img/human_park.jpg", cue:"Komposisi biasa yang jujur",
    explain:"FOTO ASLI. Bangku taman di sore hari — cahaya menembus dedaunan membentuk bayangan berbintik yang konsisten, cat bangku mengelupas wajar, dan tak ada satu elemen pun yang 'dipamerkan'. Foto asli sering biasa-biasa saja; citra AI cenderung selalu ingin tampak menarik." },

  /* MESIN & TEKNOLOGI */
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_machine__2_.jpg", cue:"Teks & angka kacau",
    explain:"AI. Mesin retro rumit dengan seorang teknisi — lihat teks pada label dan angka pada dial: kabur, tak terbaca, 'seperti tulisan'. Kerumitan mekanisnya juga tidak fungsional bila ditelusuri: gir dan rantai tak benar-benar terhubung logis. Teks kacau adalah petunjuk citra sintetis paling andal." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_machine.jpg", cue:"Keausan tak beraturan",
    explain:"FOTO ASLI. Close-up mesin motor trail berlumpur — cipratan lumpur yang acak, goresan dan karat di tempat yang tidak sengaja, tetesan air di logam. Keausan yang tidak beraturan seperti ini adalah jejak pemakaian nyata, bukan tekstur yang digenerate." },
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_machine.jpg", cue:"Detail produk 'hampir benar'",
    explain:"AI. Meja kerja rapi penuh produk Apple — gayanya foto produk profesional, tapi periksa detailnya: tampilan jam pada smartwatch tidak cocok dengan antarmuka asli mana pun, teks di layar ponsel kabur tak bermakna, dan proporsi perangkat sedikit 'meleset'. AI meniru estetika, bukan spesifikasi." },

  /* MANUSIA & AKTIVITAS */
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_human.jpg", cue:"Kulit terlalu mulus",
    explain:"AI. Potret pria tua tersenyum memegang ikan di tepi sungai — kulit terlalu mulus dan merata untuk usianya, pola manik pada aksesori tidak konsisten bila ditelusuri, dan sisik ikan terlalu seragam. Wajah AI kini sangat meyakinkan; periksa tekstur dan aksesori." },
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_human__2_.jpg", cue:"Layar & papan kacau",
    explain:"AI. Mahasiswa berdiskusi di kelas bergaya foto stok — komposisinya 'terlalu sempurna' khas stock photo, dan petunjuk utamanya: tulisan di papan, slide proyektor, dan layar laptop semuanya huruf kacau yang tak bisa dibaca. Latar yang penuh teks adalah titik lemah generator." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_human.jpg", cue:"Ekspresi candid",
    explain:"FOTO ASLI. Dua pria paruh baya tertawa di bawah sinar matahari — ekspresi asimetris di tengah gerakan (satu memicingkan mata), kilap keringat, tekstur kulit dan gigi yang tidak seragam. Ketidaksempurnaan candid seperti ini sangat sulit disintesis meyakinkan." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_human__2_.jpg", cue:"Perpustakaan nyata",
    explain:"FOTO ASLI. Tiga pelajar menatap laptop di perpustakaan — antarmuka situs di layar benar-benar terbaca, judul buku di rak koheren, dan ekspresi tiap orang berbeda arah fokusnya. Detail lingkungan yang konsisten menandai foto sungguhan." },
];

/* Konfigurasi mode Karir — 10 level + 1 final (peta planet) */
const CAREER = [
  { name:"LEVEL 1 — SINYAL PERTAMA",  n:4,  pass:3, filter:s=>s.type==="teks"&&s.level===1,
    brief:"Empat teks dasar. Lulus: 3 benar." },
  { name:"LEVEL 2 — POLA DASAR",      n:5,  pass:4, filter:s=>s.type==="teks"&&s.level===1,
    brief:"Lima teks dasar. Lulus: 4 benar." },
  { name:"LEVEL 3 — GELOMBANG CAMPUR",n:5,  pass:4, filter:s=>s.type==="teks",
    brief:"Lima teks, mudah dan sulit tercampur. Lulus: 4 benar." },
  { name:"LEVEL 4 — KABUT TIPIS",     n:5,  pass:4, filter:s=>s.type==="teks"&&s.level===2,
    brief:"Lima teks tingkat sulit. Lulus: 4 benar." },
  { name:"LEVEL 5 — MATA FORENSIK",   n:4,  pass:3, filter:s=>s.type==="gambar",
    brief:"Empat spesimen gambar pertama. Lulus: 3 benar." },
  { name:"LEVEL 6 — ZONA JEBAKAN",    n:5,  pass:4, filter:s=>s.type==="teks"&&s.trap===true,
    brief:"Lima jebakan murni. Lulus: 4 benar." },
  { name:"LEVEL 7 — FORENSIK VISUAL", n:6,  pass:4, filter:s=>s.type==="gambar",
    brief:"Enam spesimen gambar. Lulus: 4 benar." },
  { name:"LEVEL 8 — DUA DUNIA",       n:6,  pass:4, filter:s=>true,
    brief:"Teks dan gambar tercampur. Lulus: 4 benar." },
  { name:"LEVEL 9 — BADAI SUNYI",     n:8,  pass:6, filter:s=>s.type==="teks"&&s.level===2,
    brief:"Delapan teks sulit beruntun. Lulus: 6 benar." },
  { name:"LEVEL 10 — GERBANG ARSIP",  n:8,  pass:6, filter:s=>true,
    brief:"Delapan spesimen campuran. Lulus: 6 benar." },
  { name:"FINAL — INTI ARSIP",        n:12, pass:9, filter:s=>true, final:true,
    brief:"Dua belas spesimen. Lulus: 9 benar. Sesuatu menunggumu di inti." },
];
const RANKS = ["KADET","ANALIS","INSPEKTUR","FORENSIKAWAN"];
