/* ================================================================
   SINYAL — PANEL DEV TERSEMBUNYI  (js/dev.js)
   ----------------------------------------------------------------
   CARA BUKA (salah satu):
     - buka URL dengan  #dev   (mis. .../index.html#dev), atau
     - ketik kata "dev" kapan saja di keyboard, atau
     - tekan tombol rahasia: Ctrl+Shift+D
   TUTUP: tombol ✕ di panel, tekan Esc, atau ketik "dev" lagi.

   ISINYা:
     1) Loncat ke bab mana pun (Babak I & II) langsung.
     2) Toggle "kunci jawaban" — saat quiz, jawaban benar disorot &
        alasan ditampilkan sebelum menjawab.
     3) Luncurkan quiz per kategori soal (teks1/chat/berita/akademik/
        gambar/trap/final) buat ngetes pool.
     4) Uji fitur lain: prolog, profil, papan skor, reset progres cerita,
        reset profil, intip status simpanan.

   Aman: semua panggilan ke engine dijaga typeof; kalau fungsi tak ada,
   tombolnya kasih pesan, bukan error. Tidak mengubah file lain selain
   satu <script> + markup overlay + CSS.
   ================================================================ */
(function(){
  "use strict";
  const $=id=>document.getElementById(id);

  /* ---------- daftar bab (label cocok dengan naskah.js & naskah2.js) ---------- */
  const CHAPTERS_1=[
    ["ch1","BAB 1 · Orang-orang di Lab"],
    ["ch2","BAB 2 · Pesan untuk Ibu"],
    ["ch3","BAB 3 · Berita yang Tak Pernah Terjadi"],
    ["ch4","BAB 4 · Yang Dituduh Mesin"],
    ["ch5","BAB 5 · Wajah yang Dipinjam"],
    ["c5win","» Kontak Pertama (SYN)"],
    ["ch6","BAB 6 · Yang Ditinggalkan"],
    ["ch7","BAB 7 · Inti Arsip"],
    ["epilog","BAB 8 · Sinyal Berikutnya (jembatan)"],
  ];
  const CHAPTERS_2=[
    ["ch9","BAB 9 · Nama yang Dihapus"],
    ["ch10","BAB 10 · Kota di Bawah Hujan"],
    ["ch11","BAB 11 · Stasiun Relai 7"],
    ["ch12","BAB 12 · Ruang Putih (twist)"],
    ["ch13","BAB 13 · Fajar Menyala"],
  ];
  const QUIZ_FILTERS=[
    ["teks1","Pemanasan (teks lvl 1)"],
    ["chat","Chat (paket 6/16)"],
    ["berita","Berita (paket 3/13)"],
    ["akademik","Akademik (paket 9/19)"],
    ["gambar","Gambar"],
    ["trap","Zona Kabut (jebakan)"],
    ["final","Gerbang final (lvl 2 + gambar)"],
  ];

  /* ---------- state ---------- */
  let built=false;

  /* ---------- toggle "kunci jawaban" ----------
     Dipasang lewat monkey-patch ringan pada window.render (game.js).
     Saat aktif, tiap spesimen ditampilkan sorotan jawaban + alasan. */
  window.DEV_SHOW_ANSWERS = false;
  function applyAnswerKeyHook(){
    if(window.__devRenderHooked) return;
    if(typeof window.render!=="function") return;
    const orig=window.render;
    window.render=function(){
      orig.apply(this, arguments);
      try{ if(window.DEV_SHOW_ANSWERS) devPaintAnswer(); }catch(e){}
    };
    window.__devRenderHooked=true;
  }
  function devPaintAnswer(){
    /* deck & idx adalah global di game.js */
    if(typeof deck==="undefined" || !deck[idx]) return;
    const r=deck[idx];
    const ans = r.isAI ? "AI" : "MANUSIA";
    const bH=$("btnHuman"), bA=$("btnAI");
    if(bH&&bA){
      bH.style.outline = r.isAI ? "" : "3px solid #3fe0c5";
      bA.style.outline = r.isAI ? "3px solid #3fe0c5" : "";
      bH.style.outlineOffset=bA.style.outlineOffset="2px";
    }
    let tag=$("devAnsTag");
    if(!tag){
      tag=document.createElement("div"); tag.id="devAnsTag"; tag.className="dev-anstag";
      const host=$("specBody")||document.body; host.appendChild(tag);
    }
    tag.innerHTML='<b>🔑 KUNCI: '+ans+'</b>'+(r.trap?' <span class="dev-trap">JEBAKAN</span>':'')
      +(r.cue?'<br><span class="dev-cue">cue: '+r.cue+'</span>':'')
      +(r.explain?'<br>'+r.explain:'');
  }
  function clearAnswerPaint(){
    const bH=$("btnHuman"), bA=$("btnAI");
    if(bH) bH.style.outline="";
    if(bA) bA.style.outline="";
    const tag=$("devAnsTag"); if(tag) tag.remove();
  }

  /* ---------- aksi ---------- */
  function jump(lb){
    closePanel();
    if(typeof show!=="function" || typeof vnJump!=="function"){ toast("engine cerita belum siap"); return; }
    /* siapkan panggung cerita seperti startStory, tanpa prolog */
    if(typeof storySec!=="undefined") show(storySec);
    const card=document.querySelector(".card"); if(card) card.classList.add("bare");
    if(typeof vnClearAuto==="function") vnClearAuto();
    if(typeof vnAutoOn!=="undefined") vnAutoOn=false;
    if(typeof vnMusicNow!=="undefined") vnMusicNow=null;
    if(typeof vnSeen!=="undefined") vnSeen=new Set();
    if(typeof vnPreloadAll==="function") vnPreloadAll();
    if(typeof vnResetStage==="function") vnResetStage();
    applyAnswerKeyHook();
    vnJump(lb);
  }
  function launchQuiz(f){
    closePanel();
    if(typeof vnChallenge!=="function"){ toast("vnChallenge tak tersedia"); return; }
    applyAnswerKeyHook();
    /* pakai jalur resmi supaya UI papan & musik benar */
    vnChallenge({f:f, n:8, pass:0, win:"__dev_back", lose:"__dev_back", title:"DEV · "+f.toUpperCase()});
  }
  function toggleAnswers(on){
    window.DEV_SHOW_ANSWERS=on;
    applyAnswerKeyHook();
    if(on) { try{ if(typeof deck!=="undefined") devPaintAnswer(); }catch(e){} }
    else clearAnswerPaint();
    const b=$("devAnsBtn"); if(b){ b.textContent = on?"KUNCI JAWABAN: ON":"KUNCI JAWABAN: OFF"; b.classList.toggle("on",on); }
  }
  function feature(kind){
    closePanel();
    switch(kind){
      case "prolog":
        if(typeof runProlog==="function"){
          if(typeof show==="function"&&typeof storySec!=="undefined"){ show(storySec); const c=document.querySelector(".card"); if(c)c.classList.add("bare"); if(typeof vnResetStage==="function") vnResetStage(); }
          runProlog(()=>{ if(typeof show==="function"&&typeof hub!=="undefined") show(hub); });
        } else toast("runProlog tak tersedia");
        break;
      case "profil":
        if(typeof profilRender==="function"&&$("profilBody")&&typeof show==="function"&&typeof profilScr!=="undefined"){ profilRender($("profilBody")); show(profilScr); }
        else toast("profil tak tersedia");
        break;
      case "board":
        if(typeof openBoard==="function") openBoard(); else toast("papan skor tak tersedia");
        break;
      case "resetStory":
        try{ localStorage.removeItem("sinyal_story_v1"); Object.keys(localStorage).filter(k=>k.indexOf("sinyal_story_end_")===0).forEach(k=>localStorage.removeItem(k)); toast("progres cerita direset"); }catch(e){ toast("gagal reset"); }
        break;
      case "resetProfil":
        if(typeof profilReset==="function"){ profilReset(); toast("profil direset"); } else toast("profilReset tak tersedia");
        break;
      case "resetItems":
        if(typeof window.ITEMS_reset==="function"){ window.ITEMS_reset(); toast("koleksi item direset"); } else toast("ITEMS_reset tak tersedia");
        break;
      case "status":
        showStatus();
        break;
    }
  }
  function showStatus(){
    let save="—"; try{ save=localStorage.getItem("sinyal_story_v1")||"(kosong)"; }catch(e){}
    const chars=(typeof VN_CHARS!=="undefined")?Object.keys(VN_CHARS).length:"?";
    const nodes=(typeof NASKAH!=="undefined")?NASKAH.length:"?";
    const ver=(typeof SINYAL_VERSION!=="undefined")?SINYAL_VERSION:"?";
    const bab2=(typeof NASKAH!=="undefined"&&NASKAH.some(n=>n.lb==="ch9"))?"terpasang":"TIDAK ADA";
    toast("v"+ver+" · simpan cerita: "+save+" · node: "+nodes+" · tokoh: "+chars+" · Babak II: "+bab2, 4200);
  }

  /* ---------- toast kecil ---------- */
  let toastT=null;
  function toast(msg, ms){
    let t=$("devToast");
    if(!t){ t=document.createElement("div"); t.id="devToast"; t.className="dev-toast"; document.body.appendChild(t); }
    t.textContent=msg; t.classList.add("show");
    clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"), ms||2200);
  }

  /* ---------- bangun panel ---------- */
  function build(){
    if(built) return; built=true;
    const ov=document.createElement("div");
    ov.id="devPanel"; ov.className="dev-panel hidden";
    const rows=(arr)=>arr.map(([lb,label])=>'<button class="dev-jump" data-lb="'+lb+'">'+label+'</button>').join("");
    const qrows=QUIZ_FILTERS.map(([f,label])=>'<button class="dev-quiz" data-f="'+f+'">'+label+'</button>').join("");
    ov.innerHTML=''
      +'<div class="dev-box">'
      +'  <div class="dev-head"><span>⚙ DEV PANEL</span><button id="devClose" class="dev-x">✕</button></div>'
      +'  <div class="dev-scroll">'
      +'    <div class="dev-sec">KUNCI JAWABAN</div>'
      +'    <button id="devAnsBtn" class="dev-toggle">KUNCI JAWABAN: OFF</button>'
      +'    <div class="dev-hint">Saat ON: jawaban benar disorot & alasan muncul sebelum kamu menjawab (di semua mode quiz).</div>'
      +'    <div class="dev-sec">LONCAT BAB — BABAK I</div>'
      +'    <div class="dev-grid">'+rows(CHAPTERS_1)+'</div>'
      +'    <div class="dev-sec">LONCAT BAB — BABAK II</div>'
      +'    <div class="dev-grid">'+rows(CHAPTERS_2)+'</div>'
      +'    <div class="dev-hint">Loncat langsung tanpa prolog. Progres tetap tersimpan otomatis.</div>'
      +'    <div class="dev-sec">UJI QUIZ PER KATEGORI</div>'
      +'    <div class="dev-grid">'+qrows+'</div>'
      +'    <div class="dev-sec">FITUR LAIN</div>'
      +'    <div class="dev-grid">'
      +'      <button class="dev-feat" data-k="prolog">Putar Prolog</button>'
      +'      <button class="dev-feat" data-k="profil">Buka Profil</button>'
      +'      <button class="dev-feat" data-k="board">Papan Skor</button>'
      +'      <button class="dev-feat" data-k="status">Status Simpanan</button>'
      +'      <button class="dev-feat warn" data-k="resetStory">Reset Progres Cerita</button>'
      +'      <button class="dev-feat warn" data-k="resetProfil">Reset Profil Detektor</button>'
      +'      <button class="dev-feat warn" data-k="resetItems">Reset Koleksi Item</button>'
      +'    </div>'
      +'    <div class="dev-foot">Panel ini tersembunyi dari pemain. Buka: #dev / ketik "dev" / Ctrl+Shift+D. Tutup: Esc.</div>'
      +'  </div>'
      +'</div>';
    document.body.appendChild(ov);

    $("devClose").onclick=closePanel;
    ov.addEventListener("click", e=>{ if(e.target===ov) closePanel(); });
    $("devAnsBtn").onclick=()=>toggleAnswers(!window.DEV_SHOW_ANSWERS);
    ov.querySelectorAll(".dev-jump").forEach(b=>b.onclick=()=>jump(b.dataset.lb));
    ov.querySelectorAll(".dev-quiz").forEach(b=>b.onclick=()=>launchQuiz(b.dataset.f));
    ov.querySelectorAll(".dev-feat").forEach(b=>b.onclick=()=>feature(b.dataset.k));
  }
  function openPanel(){ build(); $("devPanel").classList.remove("hidden"); applyAnswerKeyHook(); if(typeof window.ITEMS_devStar==="function") window.ITEMS_devStar(); const b=$("devAnsBtn"); if(b){ b.textContent=window.DEV_SHOW_ANSWERS?"KUNCI JAWABAN: ON":"KUNCI JAWABAN: OFF"; b.classList.toggle("on",window.DEV_SHOW_ANSWERS); } }
  function closePanel(){ const p=$("devPanel"); if(p) p.classList.add("hidden"); }
  function togglePanel(){ build(); const p=$("devPanel"); if(p.classList.contains("hidden")) openPanel(); else closePanel(); }

  /* ---------- pemicu tersembunyi ---------- */
  function checkHash(){ if(location.hash.toLowerCase()==="#dev") openPanel(); }
  window.addEventListener("hashchange", checkHash);
  document.addEventListener("keydown", e=>{
    if(e.ctrlKey && e.shiftKey && (e.key==="D"||e.key==="d")){ e.preventDefault(); togglePanel(); return; }
    if(e.key==="Escape"){ closePanel(); return; }
  });
  /* planet rahasia di layar Pengaturan: ketuk 3x → buka dev.
     Sengaja butuh beberapa ketukan biar tak terpicu tak sengaja. */
  let tapN=0, tapT=null;
  function wirePlanet(){
    const p=$("devPlanet"); if(!p || p.__wired) return; p.__wired=true;
    p.addEventListener("click", e=>{
      e.preventDefault();
      tapN++;
      p.classList.remove("pulse"); void p.offsetWidth; p.classList.add("pulse");
      clearTimeout(tapT); tapT=setTimeout(()=>{ tapN=0; }, 1600);
      if(tapN>=3){ tapN=0; openPanel(); }
    });
  }
  if(document.readyState!=="loading") wirePlanet();
  document.addEventListener("DOMContentLoaded", wirePlanet);
  window.addEventListener("load", wirePlanet);
  /* buka otomatis kalau URL sudah mengandung #dev saat load */
  if(document.readyState!=="loading") checkHash();
  else document.addEventListener("DOMContentLoaded", checkHash);

  /* expose kecil buat konsol */
  window.DEV={ open:openPanel, close:closePanel, jump:jump, answers:toggleAnswers };

  /* pastikan ada label balik untuk quiz dev (win/lose → __dev_back → hub) */
  function ensureDevBackLabel(){
    if(typeof NASKAH==="undefined" || !Array.isArray(NASKAH)) return;
    if(NASKAH.some(n=>n.lb==="__dev_back")) return;
    NASKAH.push(
      {lb:"__dev_back"},
      {n:"", t:"[DEV] Sesi uji quiz selesai. Kembali ke menu."},
      {end:"devquiz"}
    );
  }
  if(document.readyState!=="loading") ensureDevBackLabel();
  else document.addEventListener("DOMContentLoaded", ensureDevBackLabel);
})();
