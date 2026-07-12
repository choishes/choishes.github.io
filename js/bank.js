/* ================================================================
   SINYAL — BANK SPESIMEN
   Edit file ini untuk kurasi konten. Tidak perlu sentuh game.js.

   Format tiap item:
   { type:"teks"|"gambar"|"video", isAI:true/false, cue:"...",
     text:"..." (untuk teks) ATAU src:"..." (untuk gambar/video),
     explain:"penjelasan edukatif", trap:true (opsional),
     level:1|2|3 (dipakai mode Karir) }

   gambar/video: isi "src" dengan path lokal (mis. "assets/img/01.jpg")
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

  /* ---------- GAMBAR (isi src untuk mengaktifkan) ---------- */
  { type:"gambar", level:3, isAI:true, src:"", cue:"Anatomi & tekstur",
    explain:"Slot demo. Saat kurasi, pakai gambar dari generator gratis. Petunjuk khas: jari aneh, teks kacau di latar, pantulan tak konsisten, kulit terlalu mulus, latar “meleleh”." },
  { type:"gambar", level:3, isAI:false, src:"", cue:"Ketidaksempurnaan alami",
    explain:"Slot demo. Foto asli: noise sensor alami, fokus tak sempurna, detail latar konsisten. Gunakan sumber bebas lisensi (Unsplash/Wikimedia) + catat atribusi untuk laporan." },

  /* ---------- VIDEO (isi src untuk mengaktifkan) ---------- */
  { type:"video", level:3, isAI:true, src:"", cue:"Wajah & sinkronisasi",
    explain:"Slot demo. Petunjuk video sintetis/deepfake: kedipan tak wajar, bibir meleset dari audio, tepi wajah bergetar, arah cahaya wajah beda dengan lingkungan." },
  { type:"video", level:3, isAI:false, src:"", cue:"Kontinuitas nyata",
    explain:"Slot demo. Video asli: guncangan kamera alami, audio ruangan konsisten, mikro-ekspresi halus. Simpan klip pendek (mp4) di assets/ dan isi field src." }
];

/* Konfigurasi mode Karir */
const CAREER = [
  { name:"MISI 1 — TEKS DASAR",   filter:s=>s.type==="teks"&&s.level===1, n:4, pass:3,
    brief:"Empat spesimen teks tingkat dasar. Lulus: minimal 3 benar." },
  { name:"MISI 2 — ZONA JEBAKAN", filter:s=>s.type==="teks"&&s.level===2, n:6, pass:4,
    brief:"Enam spesimen — termasuk jebakan. Lulus: minimal 4 benar." },
  { name:"MISI 3 — FORENSIK VISUAL", filter:s=>s.type!=="teks", n:4, pass:3,
    brief:"Gambar dan video. Lulus: minimal 3 benar." }
];
const RANKS = ["KADET","ANALIS","INSPEKTUR","FORENSIKAWAN"];
