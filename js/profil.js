/* ================================================================
   SINYAL — PROFIL DETEKTOR (analitik kelemahan berbasis cue)
   ----------------------------------------------------------------
   Ide: tiap spesimen punya sinyal linguistik (kata zombi, pola tiga
   pilar, em dash, hedges, dst) yang selama ini cuma muncul sekilas di
   penjelasan. Di sini tiap jawaban dicatat per KATEGORI sinyal yang
   ada pada spesimen itu (disimpan di localStorage, tanpa server).
   Di akhir sesi / dari homescreen, pemain bisa lihat: kategori mana
   yang sering bikin dia tertipu dan mana yang sudah dia kuasai.
   Kategori mencerminkan metrik linguistik pada laporan riset
   (kata zombi, keseragaman, hedges, spesifisitas leksikal, dsb).

   Cara kerja klasifikasi: tiap spesimen dipindai lewat penjelasan
   (explain) + cue + teks, dicocokkan ke pola regex per kategori.
   Satu spesimen bisa masuk beberapa kategori. Kalau tak ada yang
   cocok, masuk kategori "umum".

   Dipanggil dari game.js: profilRecord(spesimen, benar?).
   ================================================================ */
const PROFIL_KEY = "sinyal_profil_v1";

/* Kategori sinyal + label ramah + deskripsi edukatif singkat.
   'human' = sinyal yang justru menandai tulisan MANUSIA (spesifisitas,
   keraguan), sisanya menandai kecenderungan AI. */
const PROFIL_CATS = [
  { key:"zombi",    label:"Kata zombi & jargon",
    tip:"Kata megah tapi kosong seperti 'menyelami', 'lanskap', 'mengungkap', 'holistik'. AI menyukainya; manusia jarang." },
  { key:"tiga",     label:"Pola tiga pilar",
    tip:"Rangkaian tiga hal sejajar ('cepat, tepat, dan efisien'). Struktur favorit AI untuk terdengar rapi." },
  { key:"emdash",   label:"Tanda hubung em (—)",
    tip:"Penggunaan em dash yang rapi di tengah kalimat. Sering jadi sidik jari mesin pada teks Indonesia." },
  { key:"mulus",    label:"Terlalu mulus & seragam",
    tip:"Tanpa typo, panjang kalimat seragam, selalu sopan. Kerapian sempurna justru mencurigakan." },
  { key:"vague",    label:"Klaim tanpa data spesifik",
    tip:"'Berbagai pihak', 'beberapa waktu terakhir', tanpa angka atau nama. AI aman di generalisasi." },
  { key:"filler",   label:"Frasa pengisi klise",
    tip:"'Penting untuk diingat bahwa', 'pada akhirnya', 'bukan sekadar... melainkan'. Kalimat yang tak menambah info." },
  { key:"emoji",    label:"Emoji & antusiasme berlebih",
    tip:"Sapaan riang, emoji, ajakan kolektif ('semangat ya kita semua!'). Nada CS/AI yang tak pernah lelah." },
  { key:"emosi",    label:"Emosi template",
    tip:"Arc perasaan yang terlalu rapi: dari sedih ke bersyukur dalam satu tarikan, tanpa detail spesifik." },
  { key:"spesifik", label:"Spesifisitas manusia",
    tip:"Angka ganjil, nama konkret, kejadian tak terduga. Tanda kuat KARYA MANUSIA yang sering keliru dicap AI." },
  { key:"ragu",     label:"Keraguan & suara personal",
    tip:"'Kayaknya', 'nggak yakin sih', sarkasme, ganti pikiran di tengah. Suara manusia yang hidup." },
  { key:"umum",     label:"Penilaian umum",
    tip:"Spesimen tanpa penanda menonjol. Andalkan nalar menyeluruh, bukan satu ciri." },
];

/* Aturan pencocokan (regex) per kategori, diuji ke gabungan
   explain + cue + text (huruf kecil). */
const PROFIL_RULES = {
  zombi:    /kata zombi|jargon|menyelami|lanskap|mengungkap|permadani|holistik|menggugah|memanjakan|bersinergi|sinergi|seluruh elemen|masa depan (yang )?lebih baik/,
  tiga:     /pola tiga|tiga (hal|pilar|sejajar|manfaat)|trio |sejajar|rule of three/,
  emdash:   /em dash|tanda hubung/,
  mulus:    /mulus|terlalu rapi|tanpa cela|seragam|sempurna|tanpa (typo|salah ketik)|prosedural|steril|register (birokratis|formal)|humas/,
  vague:    /tanpa (satu )?(angka|data|nama|detail|contoh|pengalaman)|kabur|generik|berbagai pihak|beberapa waktu|tak terverifikasi|tanpa sumber|hampa|kosong|ensiklopedis|definisi|pro dan kontra|jalan tengah|seimbang steril|segala.?artikel|klaim umum/,
  filler:   /penting untuk diingat|pada akhirnya|bukan sekadar.*melainkan|pengisi|klise|frasa (klise|pengisi)|aforisme|oleh karena itu|penutup (segala|artikel)/,
  emoji:    /emoji|antusias|clickbait|penyemangat|ajakan kolektif|🙏|💪|💕|✨|😊|🥹|🌏|template (jokes|viral)/,
  emosi:    /arc|emosi template|emosi yang (terlalu )?rapi|menyalahkan diri|legowo|bersyukur|resolusi|terlalu (rapi|tertata)/,
  spesifik: /spesifik|angka (spesifik|konkret|ganjil|pasti)|nama konkret|detail (spesifik|konkret|sensorik|lapangan)|pengalaman (nyata|langsung)|tak (bisa )?di(karang|palsukan)|5w1h|absurd.?nyata|konteks mikro|penamaan folder|tanggal|durasi|lokasi berjenjang|nama\+usia|orang dalam/,
  ragu:     /keraguan|hedge|kayaknya|mungkin|bimbang|ragu|sarkas|ganti pikiran|spontan|berantakan tapi hidup|familiar/,
};

function profilStorageOk(){
  try{ localStorage.setItem("__p","1"); localStorage.removeItem("__p"); return true; }
  catch(e){ return false; }
}
const PROFIL_PERSIST = profilStorageOk();
let profilMemory = null; // fallback kalau localStorage diblokir

function profilBlank(){
  const cats={};
  PROFIL_CATS.forEach(c=>cats[c.key]={seen:0, wrong:0});
  return { v:1, answered:0, wrong:0, cats };
}
function profilGet(){
  if(!PROFIL_PERSIST) return profilMemory || (profilMemory=profilBlank());
  try{
    const raw=localStorage.getItem(PROFIL_KEY);
    if(!raw) return profilBlank();
    const d=JSON.parse(raw);
    if(!d||d.v!==1||!d.cats) return profilBlank();
    /* lengkapi kategori baru yang mungkin belum ada di data lama */
    PROFIL_CATS.forEach(c=>{ if(!d.cats[c.key]) d.cats[c.key]={seen:0,wrong:0}; });
    return d;
  }catch(e){ return profilBlank(); }
}
function profilSave(d){
  if(!PROFIL_PERSIST){ profilMemory=d; return; }
  try{ localStorage.setItem(PROFIL_KEY, JSON.stringify(d)); }catch(e){}
}

/* Kembalikan daftar key kategori yang cocok untuk sebuah spesimen. */
function profilClassify(spec){
  const hay = ((spec.explain||"")+" "+(spec.cue||"")+" "+(spec.text||"")).toLowerCase();
  const hits=[];
  for(const k in PROFIL_RULES){
    if(k==="emdash"){
      /* em dash dihitung sebagai SINYAL hanya bila karakter — ada di TEKS
         spesimen, atau frasa "em dash"/"tanda hubung" disebut di penjelasan.
         Ini mencegah false positive dari em dash yang cuma jadi tanda baca
         di dalam teks penjelasan. */
      if(/—/.test(spec.text||"") || /em dash|tanda hubung/i.test(spec.explain||"")) hits.push(k);
    }else if(PROFIL_RULES[k].test(hay)){
      hits.push(k);
    }
  }
  if(hits.length===0) hits.push("umum");
  return hits;
}

/* Catat satu jawaban. Dipanggil dari game.js untuk mode solo. */
function profilRecord(spec, correct){
  if(!spec) return;
  const d=profilGet();
  d.answered++; if(!correct) d.wrong++;
  profilClassify(spec).forEach(k=>{
    if(!d.cats[k]) d.cats[k]={seen:0,wrong:0};
    d.cats[k].seen++; if(!correct) d.cats[k].wrong++;
  });
  profilSave(d);
}

function profilReset(){ profilSave(profilBlank()); }

/* ---------- render layar profil ---------- */
function profilRender(container){
  const d=profilGet();
  if(d.answered<1){
    container.innerHTML='<div class="empty">Belum ada data. Mainkan KARIR, INFINITE, atau CERITA, dan analisis instingmu akan muncul di sini.</div>';
    return;
  }
  const acc = Math.round((d.answered - d.wrong)/d.answered*100);
  /* susun statistik per kategori yang punya cukup sampel (>=3) */
  const rows = PROFIL_CATS
    .map(c=>{ const s=d.cats[c.key]||{seen:0,wrong:0};
      return {c, seen:s.seen, wrong:s.wrong, rate: s.seen? s.wrong/s.seen : 0}; })
    .filter(r=>r.seen>0);
  const ranked = rows.filter(r=>r.seen>=3).sort((a,b)=>b.rate-a.rate);
  const weak = ranked.filter(r=>r.rate>0).slice(0,3);
  const strong = ranked.filter(r=>r.rate<=0.15).sort((a,b)=>a.rate-b.rate).slice(0,2);

  let html='';
  html+='<div class="pf-hero">';
  html+='<div class="pf-acc"><div class="pf-accnum">'+acc+'%</div><div class="pf-acclbl">AKURASI</div></div>';
  html+='<div class="pf-meta"><div><b>'+d.answered+'</b> spesimen dianalisis</div><div><b>'+(d.answered-d.wrong)+'</b> tepat · <b>'+d.wrong+'</b> meleset</div></div>';
  html+='</div>';

  if(weak.length){
    html+='<div class="pf-sechead pf-warn">◤ PALING SERING TERTIPU</div>';
    weak.forEach(r=>{
      const pct=Math.round(r.rate*100);
      html+='<div class="pf-cat"><div class="pf-cattop"><span class="pf-catname">'+r.c.label+'</span><span class="pf-catpct warn">'+pct+'% meleset</span></div>';
      html+='<div class="pf-bar"><i class="warn" style="width:'+pct+'%"></i></div>';
      html+='<div class="pf-tip">'+r.c.tip+'</div></div>';
    });
  }
  if(strong.length){
    html+='<div class="pf-sechead pf-good">◢ SUDAH KAMU KUASAI</div>';
    strong.forEach(r=>{
      const pct=Math.round((1-r.rate)*100);
      html+='<div class="pf-cat"><div class="pf-catop"><span class="pf-catname">'+r.c.label+'</span><span class="pf-catpct good">'+pct+'% tepat</span></div>';
      html+='<div class="pf-bar"><i class="good" style="width:'+pct+'%"></i></div>';
      html+='<div class="pf-tip">'+r.c.tip+'</div></div>';
    });
  }
  if(!weak.length && !strong.length){
    html+='<div class="empty" style="margin-top:12px">Terus bermain untuk mengumpulkan cukup data per kategori. Setiap kategori butuh minimal 3 spesimen agar polanya terbaca.</div>';
  }

  /* rincian semua kategori */
  html+='<div class="pf-sechead">◈ RINCIAN SEMUA SINYAL</div>';
  html+='<div class="pf-all">';
  rows.sort((a,b)=>b.seen-a.seen).forEach(r=>{
    const pct = r.seen? Math.round((1-r.rate)*100) : 0;
    html+='<div class="pf-allrow"><span class="pf-allname">'+r.c.label+'</span>'
      +'<span class="pf-allbar"><i style="width:'+pct+'%"></i></span>'
      +'<span class="pf-allnum">'+pct+'% <em>('+r.seen+')</em></span></div>';
  });
  html+='</div>';

  container.innerHTML=html;
}
