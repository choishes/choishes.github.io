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

  /* ---------- GAMBAR (16 spesimen, 8 pasang asli vs AI) ---------- */
  /* PEMANDANGAN */
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_scenery.jpg", cue:"Foto astro asli",
    explain:"FOTO ASLI. Gunung berapi meletus di bawah langit berbintang — noise sensor pada langit malam, jejak lava tak simetris, dan awan yang terekam long-exposure. Ketidaksempurnaan optik ini sulit dipalsukan." },
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_scenery.jpg", cue:"Cahaya terlalu sempurna",
    explain:"AI. Sorotan cahaya vertikal dari puncak gunung terlalu bersih, Milky Way terlalu dramatis sempurna, dan pantulan di danau kurang konsisten dengan sumber cahaya. 'Terlalu indah untuk nyata'." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_scenery__2_.jpg", cue:"Bukit hijau nyata",
    explain:"FOTO ASLI. Lereng bukit hijau, langit biru polos — gradasi cahaya matahari alami pada rumput, tekstur batu tak berulang, horizon wajar. Kesederhanaan justru menandai keaslian." },
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_scenery__2_.jpg", cue:"Tekstur berulang",
    explain:"AI. Perhatikan pola tekstur berulang dan detail latar yang 'meleleh' di kejauhan — ciri generator yang kesulitan menjaga konsistensi pada area luas yang seragam." },

  /* SENI / LUKISAN */
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_art.jpg", cue:"Sapuan tanpa arah",
    explain:"AI. Lukisan abstrak meniru gaya ekspresionis, tapi sapuan kuasnya tak punya 'logika tangan' — arah goresan acak tanpa tekanan konsisten, tepi warna terlalu bersih untuk cat minyak sungguhan." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_art.jpg", cue:"Palet cat nyata",
    explain:"FOTO ASLI. Close-up palet cat pelukis — tumpukan cat berlapis fisik dengan bayangan nyata, tekstur kering-basah bercampur, kilau minyak yang merespons cahaya. Materialitas yang tak bisa direka mesin." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_art__2_.jpg", cue:"Makro autentik",
    explain:"FOTO ASLI. Detail permukaan cat dengan depth-of-field makro yang wajar — sebagian fokus, sebagian blur alami. Retakan cat mengikuti fisika pengeringan nyata." },
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_park.jpg", cue:"Bokeh artifisial",
    explain:"AI. Meski tampak seperti foto taman, blur latar (bokeh) tidak konsisten dengan jarak, dan dedaunan detailnya 'berulang'. Generator sering salah mensimulasikan optik lensa." },

  /* MESIN / TEKNOLOGI */
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_machine.jpg", cue:"Teks & angka kacau",
    explain:"AI. Mesin retro rumit dengan teknisi — lihat teks pada label dan angka pada dial: kabur, tak terbaca, 'seperti tulisan'. Teks kacau adalah petunjuk citra sintetis paling andal." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_machine.jpg", cue:"Foto produk nyata",
    explain:"FOTO ASLI. Meja kerja dengan perangkat — pantulan cahaya konsisten pada layar, bayangan sesuai satu sumber cahaya, tekstur (kayu, kain, logam) stabil di seluruh frame." },
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_machine__2_.jpg", cue:"Geometri mustahil",
    explain:"AI. Setup gawai di meja — periksa detail 'hampir benar': tepi perangkat menyatu aneh, port/kabel tidak logis, permukaan terlalu mulus. Konsistensi geometri adalah kelemahan AI." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_park.jpg", cue:"Motor trail nyata",
    explain:"FOTO ASLI. Close-up mesin motor trail berlumpur — cipratan lumpur acak, karat dan goresan tak sengaja, tetesan air pada logam. Keausan tak beraturan menandakan objek nyata." },

  /* MANUSIA / WAJAH */
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_human.jpg", cue:"Kulit terlalu mulus",
    explain:"AI. Potret pria memegang ikan di tepi sungai — kulit terlalu mulus dan merata, detail manik/aksesori tak logis bila ditelusuri, latar desa 'meleleh'. Wajah AI kini meyakinkan; periksa tangan dan latar." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_human.jpg", cue:"Kelas nyata",
    explain:"FOTO ASLI. Mahasiswa berkolaborasi di kelas — pori kulit, refleksi kacamata yang benar, teks pada layar/papan yang terbaca. Kedalaman ruang dan pencahayaan konsisten." },
  { type:"gambar", level:3, isAI:true, src:"assets/img/ai_human__2_.jpg", cue:"Senyum & rambut",
    explain:"AI. Dua pria tersenyum di taman — waspadai gigi terlalu seragam, helai rambut yang menyatu tak wajar, kilau kulit berlebihan. Simetri senyum yang sempurna sering menandai wajah sintetis." },
  { type:"gambar", level:3, isAI:false, src:"assets/img/human_human__2_.jpg", cue:"Perpustakaan nyata",
    explain:"FOTO ASLI. Tiga pelajar di perpustakaan — ekspresi mikro natural (satu fokus, satu bicara), judul buku di rak terbaca, bayangan tubuh konsisten. Interaksi spontan sulit dipalsukan." },
];

/* Konfigurasi mode Karir */
const CAREER = [
  { name:"MISI 1 — TEKS DASAR",   filter:s=>s.type==="teks"&&s.level===1, n:4, pass:3,
    brief:"Empat spesimen teks tingkat dasar. Lulus: minimal 3 benar." },
  { name:"MISI 2 — ZONA JEBAKAN", filter:s=>s.type==="teks"&&s.level===2, n:6, pass:4,
    brief:"Enam spesimen — termasuk jebakan. Lulus: minimal 4 benar." },
  { name:"MISI 3 — FORENSIK VISUAL", filter:s=>s.type==="gambar", n:8, pass:5,
    brief:"Delapan spesimen gambar. Lulus: minimal 5 benar." }
];
const RANKS = ["KADET","ANALIS","INSPEKTUR","FORENSIKAWAN"];
