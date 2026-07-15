/* ================================================================
   SINYAL — SISTEM KOLEKSI ITEM  (js/items.js)
   ----------------------------------------------------------------
   Item khusus yang bisa dikoleksi. Terbuka otomatis saat pemain
   mencapai momen tertentu (masuk bab, tamat, akurasi tinggi, dll).
   Koleksi dicek di fitur personal (layar PROFIL DETEKTOR).

   ADITIF: tidak mengubah file lain (kecuali 1 <script> + CSS +
   precache). Hook dipasang lewat monkey-patch fungsi global:
     - window.vnJump(lb)   → item per bab
     - window.vnEnd(key)   → item per ending
     - window.profilRecord → item milestone akurasi
     - window.openPanel dev→ item rahasia (di dev.js: window.DEV)
   Semua dijaga typeof; kalau target belum ada, hook dilewati.

   Gambar item: assets/story/item_<id>.png (kotak, transparan).
   Tanpa gambar → tampil ikon emoji fallback. Terkunci → siluet "?".
   ================================================================ */
(function(){
  "use strict";
  const KEY="sinyal_items_v1";
  const $=id=>document.getElementById(id);

  /* ---------- katalog item ----------
     get: cara terbuka (buat hint item terkunci)
     rar: common | rare | epic  (buat warna bingkai)
     emoji: fallback kalau gambar item_<id>.png belum ada */
  const ITEMS=[
    {id:"mie",     name:"Mie Instan Malam Pertama", emoji:"🍜", rar:"common",
     desc:"Semangkuk mie yang dimakan bareng Vega dan Arga di lab, malam pertamamu.",
     get:"Mulai Mode Cerita (BAB 1)."},
    {id:"kopi_arga",name:"Kopi Sachet Murid Bandel", emoji:"☕", rar:"common",
     desc:"Bukti kecil bahwa kebaikan muncul di tempat tak terduga.",
     get:"Capai BAB 2 — Pesan untuk Ibu."},
    {id:"notes",   name:"Notes Biru Sari", emoji:"📓", rar:"rare",
     desc:"Catatan lecek bernoda kopi. Halaman awalnya penuh coretan proses. Yang tak bisa dipalsukan mesin.",
     get:"Capai BAB 4 — Yang Dituduh Mesin."},
    {id:"foto_dira",name:"Negatif Foto Palsu", emoji:"🖼️", rar:"rare",
     desc:"Sisa forensik dari foto Dira yang dipalsukan. Bayangan yang arahnya keliru.",
     get:"Capai BAB 5 — Wajah yang Dipinjam."},
    {id:"kunci_syn",name:"Serpihan Kunci SYN", emoji:"🗝️", rar:"epic",
     desc:"Potongan enkripsi dari entitas yang menunggu sepuluh tahun di balik pintu.",
     get:"Tamatkan Babak I (BAB 7 — Inti Arsip)."},
    {id:"kartu_renata",name:"Kartu Pegawai Renata", emoji:"🪪", rar:"rare",
     desc:"Rambut diikat asal, senyum miring sebelah. Sama seperti senyummu.",
     get:"Masuk Babak II (BAB 9 — Nama yang Dihapus)."},
    {id:"bubur",   name:"Mangkok Bubur Kota Bawah", emoji:"🥣", rar:"common",
     desc:"'Makan yang banyak. Orang atas badannya tipis-tipis, kayak arsip.'",
     get:"Capai BAB 10 — Kota di Bawah Hujan."},
    {id:"relai",   name:"Relai Tua Ibu", emoji:"📡", rar:"epic",
     desc:"Sepuluh tahun memanggil satu nama ke frekuensi yang sudah tak dipakai siapa pun.",
     get:"Capai BAB 11 — Stasiun Relai 7."},
    {id:"pena_senja",name:"Pena Perak Senja", emoji:"🖋️", rar:"epic",
     desc:"Pena yang menulis ulang ribuan nama. Hangat di tangan, dingin di akibat.",
     get:"Capai BAB 12 — Ruang Putih."},
    {id:"lencana",  name:"Lencana Divisi Siber", emoji:"🛡️", rar:"rare",
     desc:"Milik seorang kapten yang memilih menyidik untuk dirinya sendiri.",
     get:"Capai BAB 13 — Fajar Menyala."},
    {id:"sinyal_ibu",name:"Sinyal dari Luar Kota", emoji:"🌌", rar:"epic",
     desc:"Tiga pendek, tiga panjang, tiga pendek. 'Labelku masih ASLI. Tunggu ibu.'",
     get:"Tamatkan Babak II (Protokol Fajar)."},
    {id:"detektor", name:"Sertifikat Detektor Ahli", emoji:"🎖️", rar:"rare",
     desc:"Diberikan pada mata yang sudah membedah ratusan spesimen.",
     get:"Analisis 100 spesimen (lihat Profil)."},
    {id:"mata_elang",name:"Lensa Mata Elang", emoji:"🦅", rar:"epic",
     desc:"Akurasi yang bikin bahkan SYN-0 terdiam.",
     get:"Capai akurasi 85% dengan minimal 40 spesimen."},
    {id:"bintang",  name:"Bintang Tersembunyi", emoji:"⭐", rar:"epic",
     desc:"Kamu menemukan planet yang tidak ada di peta mana pun. Rahasia developer.",
     get:"???"},
  ];
  const ITEM_MAP={}; ITEMS.forEach(it=>ITEM_MAP[it.id]=it);

  /* label bab → item */
  const CHAPTER_ITEM={
    ch1:"mie", ch2:"kopi_arga", ch4:"notes", ch5:"foto_dira",
    ch9:"kartu_renata", ch10:"bubur", ch11:"relai", ch12:"pena_senja", ch13:"lencana",
  };
  const END_ITEM={ epilog:"kunci_syn", babak2:"sinyal_ibu" };

  /* ---------- storage ---------- */
  function ok(){ try{ localStorage.setItem("__i","1"); localStorage.removeItem("__i"); return true; }catch(e){ return false; } }
  const PERSIST=ok(); let mem=[];
  function getOwned(){
    if(!PERSIST) return mem;
    try{ const r=localStorage.getItem(KEY); return r?JSON.parse(r):[]; }catch(e){ return []; }
  }
  function setOwned(arr){ if(!PERSIST){ mem=arr; return; } try{ localStorage.setItem(KEY, JSON.stringify(arr)); }catch(e){} }
  function has(id){ return getOwned().indexOf(id)>=0; }

  /* ---------- unlock + notifikasi ---------- */
  function unlock(id){
    if(!ITEM_MAP[id] || has(id)) return false;
    const arr=getOwned(); arr.push(id); setOwned(arr);
    notify(ITEM_MAP[id]);
    return true;
  }
  let noteQ=[], noteBusy=false;
  function notify(it){ noteQ.push(it); if(!noteBusy) drainNote(); }
  function drainNote(){
    if(!noteQ.length){ noteBusy=false; return; }
    noteBusy=true;
    const it=noteQ.shift();
    let n=$("itemNote");
    if(!n){ n=document.createElement("div"); n.id="itemNote"; n.className="item-note"; document.body.appendChild(n); }
    n.innerHTML='<div class="in-ico">'+ (it.emoji||"✦") +'</div><div class="in-txt"><div class="in-h">ITEM BARU DIDAPAT</div><div class="in-n">'+it.name+'</div></div>';
    n.classList.add("show");
    try{ if(typeof sfx!=="undefined"&&sfx.ok) sfx.ok(); }catch(e){}
    setTimeout(()=>{ n.classList.remove("show"); setTimeout(drainNote, 350); }, 2600);
  }

  /* ---------- API publik ---------- */
  window.ITEMS_award=unlock;
  window.ITEMS_has=has;
  window.ITEMS_all=()=>ITEMS.slice();
  window.ITEMS_owned=getOwned;
  window.ITEMS_reset=()=>{ setOwned([]); };

  /* ---------- hook: bab & ending ---------- */
  function hookStory(){
    if(window.__itemStoryHook) return;
    if(typeof window.vnJump==="function"){
      const oj=window.vnJump;
      window.vnJump=function(lb){ try{ if(CHAPTER_ITEM[lb]) unlock(CHAPTER_ITEM[lb]); }catch(e){} return oj.apply(this,arguments); };
    }
    if(typeof window.vnEnd==="function"){
      const oe=window.vnEnd;
      window.vnEnd=function(key){ try{ if(END_ITEM[key]) unlock(END_ITEM[key]); }catch(e){} return oe.apply(this,arguments); };
    }
    window.__itemStoryHook=true;
  }
  /* ---------- hook: profil (akurasi) ---------- */
  function hookProfil(){
    if(window.__itemProfilHook) return;
    if(typeof window.profilRecord!=="function") return;
    const op=window.profilRecord;
    window.profilRecord=function(spec, correct){
      const r=op.apply(this,arguments);
      try{ checkProfilMilestones(); }catch(e){}
      return r;
    };
    window.__itemProfilHook=true;
  }
  function checkProfilMilestones(){
    if(typeof profilGet!=="function") return;
    const d=profilGet();
    if(d.answered>=100) unlock("detektor");
    if(d.answered>=40){
      const acc=(d.answered-d.wrong)/d.answered;
      if(acc>=0.85) unlock("mata_elang");
    }
  }

  /* dipanggil dev.js saat panel dibuka (via window.ITEMS_devStar) */
  window.ITEMS_devStar=function(){ unlock("bintang"); };

  /* ---------- render koleksi (dipakai di layar Profil) ---------- */
  function renderCollection(container){
    const owned=getOwned();
    const total=ITEMS.length, got=owned.length;
    let html='<div class="col-head"><span>KOLEKSI ITEM</span><span class="col-count">'+got+' / '+total+'</span></div>';
    html+='<div class="col-grid">';
    ITEMS.forEach(it=>{
      const have=owned.indexOf(it.id)>=0;
      const src="assets/story/item_"+it.id+".png";
      if(have){
        html+='<div class="col-item '+it.rar+'" data-id="'+it.id+'">'
          +'<div class="ci-img"><img src="'+src+'" alt="'+it.name+'" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'ci-emoji\',textContent:\''+(it.emoji||"✦")+'\'}))"></div>'
          +'<div class="ci-name">'+it.name+'</div></div>';
      }else{
        html+='<div class="col-item locked" data-id="'+it.id+'">'
          +'<div class="ci-img"><span class="ci-lock">?</span></div>'
          +'<div class="ci-name">???</div></div>';
      }
    });
    html+='</div>';
    html+='<div class="col-detail" id="colDetail">Ketuk item untuk melihat detail.</div>';
    container.innerHTML=html;
    container.querySelectorAll(".col-item").forEach(el=>{
      el.onclick=()=>{
        const it=ITEM_MAP[el.dataset.id]; if(!it) return;
        const have=owned.indexOf(it.id)>=0;
        const det=$("colDetail");
        if(have) det.innerHTML='<b>'+(it.emoji||"✦")+' '+it.name+'</b><br>'+it.desc;
        else det.innerHTML='<b>🔒 Item terkunci</b><br>Cara dapat: '+it.get;
      };
    });
  }
  window.ITEMS_render=renderCollection;

  /* ---------- sisipkan blok koleksi ke layar Profil ----------
     Monkey-patch window.profilRender: setelah profil digambar, tambahkan
     tombol tab "KOLEKSI" + kontainer. Additif, tak mengubah profil.js. */
  function hookProfilRender(){
    if(window.__itemProfilRenderHook) return;
    if(typeof window.profilRender!=="function") return;
    const orig=window.profilRender;
    window.profilRender=function(container){
      orig.apply(this,arguments);
      try{ appendCollectionUI(container); }catch(e){}
    };
    window.__itemProfilRenderHook=true;
  }
  function appendCollectionUI(container){
    if(!container) return;
    const wrap=document.createElement("div");
    wrap.className="pf-collection";
    wrap.innerHTML='<div class="pf-sechead">◆ KOLEKSI ITEM</div><div id="pfColBody"></div>';
    container.appendChild(wrap);
    renderCollection($("pfColBody"));
  }

  /* ---------- pasang semua hook ---------- */
  function installHooks(){ hookStory(); hookProfil(); hookProfilRender(); }
  if(document.readyState!=="loading") installHooks();
  else document.addEventListener("DOMContentLoaded", installHooks);
  /* pasang ulang sekali lagi setelah semua script pasti termuat */
  window.addEventListener("load", installHooks);
})();
