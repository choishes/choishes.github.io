/* ================================================================
   SINYAL — TWIST ENDING ("ARSIP TERBUKA")
   Terpicu saat: (1) Karir tuntas semua misi, atau (2) Infinite
   melewati 100 spesimen terjawab.
   Urutan: intervensi glitch → layar error → pemulihan (loading)
   → pengungkapan baris demi baris → debrief jujur → kembali.
   Naskah bisa diedit di ERR_LINES / REVEAL_LINES / DEBRIEF_HTML.
   ================================================================ */
const TWIST_KEY="sinyal_ending_v1";
function twistSeen(){ try{ return localStorage.getItem(TWIST_KEY)==="1"; }catch(e){ return false; } }
function setTwistSeen(){ try{ localStorage.setItem(TWIST_KEY,"1"); }catch(e){} }

const ERR_LINES=[
  "ERR 0xA1 — INTEGRITAS ARSIP GAGAL",
  "verifikasi label sumber…                 GAGAL",
  "kontak kurator manusia…                  TIDAK DITEMUKAN",
  "menelusuri asal spesimen…                ANOMALI",
  "memulai pemulihan paksa arsip internal…",
];

const REVEAL_LINES=[
  "pemulihan selesai. membuka log arsip…",
  "» generator: SYN-4.2 — sumber seluruh spesimen",
  "» termasuk 50 teks berlabel “MANUSIA”",
  "» termasuk potret, puisi, dan curhat yang kau percaya",
  "tidak ada manusia di arsip ini.",
  "selama ini kamu tidak membedakan manusia dari mesin —",
  "kamu mempercayai label yang tidak pernah kamu verifikasi.",
];

const DEBRIEF_HTML =
  '<b>FAKTA DI BALIK TWIST:</b> ini fiksi yang menyimpan kebenaran. '
  +'Seluruh teks berlabel “manusia” di game ini <b>memang ditulis oleh AI</b> '
  +'selama pengembangan (tercatat di js/paket.js). Foto berlabel asli tetap '
  +'karya fotografer manusia. Pelajarannya nyata untuk keduanya: skor '
  +'tertinggi pun tidak berarti bila sumber label tidak pernah diperiksa. '
  +'<b>Provenance dulu, persepsi kemudian.</b>';

const twistReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const tw=id=>document.getElementById(id);
const twait=ms=>new Promise(r=>setTimeout(r,ms));

let twAdvance=null;
function twClick(){ return new Promise(res=>{ twAdvance=()=>{twAdvance=null;res();}; }); }
function twHoldOrClick(ms){ return Promise.race([twait(ms), twClick()]); }

function glitchNoise(){ // derau kasar
  beep(90,.25,"sawtooth",.06); setTimeout(()=>beep(1400,.08,"square",.04),60);
  setTimeout(()=>beep(60,.3,"sawtooth",.05),150);
}

async function playTwistEnding(done){
  const ov=tw("twist");
  ov.classList.remove("hidden","fadeout");
  ["twGlitch","twError","twLoad","twReveal","twFinal"].forEach(i=>tw(i).classList.add("hidden"));
  bgmGameStop(); // senyap mendadak = bagian dari dramanya

  if(!twistReduced){
    /* --- A: INTERVENSI GLITCH --- */
    tw("twGlitch").classList.remove("hidden");
    glitchNoise(); setTimeout(glitchNoise,500); setTimeout(glitchNoise,1050);
    await twait(1700);
    tw("twGlitch").classList.add("hidden");

    /* --- B: LAYAR ERROR --- */
    tw("twError").classList.remove("hidden");
    const log=tw("twErrLog"); log.innerHTML="";
    for(const l of ERR_LINES){
      const d=document.createElement("div"); d.textContent="> "+l;
      log.appendChild(d);
      beep(180,.06,"square",.035);
      await twait(520);
    }
    await twait(700);
    tw("twError").classList.add("hidden");

    /* --- C: PEMULIHAN --- */
    tw("twLoad").classList.remove("hidden");
    const fill=tw("twFill"); fill.style.width="0";
    for(let p=0;p<=100;p+=Math.floor(6+Math.random()*14)){
      fill.style.width=Math.min(p,100)+"%";
      beep(500+p*3,.03,"sine",.012);
      await twait(160+Math.random()*180);
    }
    fill.style.width="100%";
    await twait(500);
    tw("twLoad").classList.add("hidden");
  }

  /* --- D: PENGUNGKAPAN --- */
  tw("twReveal").classList.remove("hidden");
  const line=tw("twLine");
  if(twistReduced){
    line.innerHTML=REVEAL_LINES.join("<br>");
    await twClick();
  }else{
    for(let i=0;i<REVEAL_LINES.length;i++){
      line.textContent=REVEAL_LINES[i];
      line.classList.remove("in"); void line.offsetWidth; line.classList.add("in");
      beep(330,.07,"sine",.02);
      const last=i===REVEAL_LINES.length-1;
      await twHoldOrClick(last?3000:(1900+REVEAL_LINES[i].length*16));
      line.classList.add("outup"); await twait(320); line.classList.remove("outup");
    }
  }
  tw("twReveal").classList.add("hidden");

  /* --- E: JUDUL + DEBRIEF --- */
  tw("twFinal").classList.remove("hidden");
  tw("twDebrief").innerHTML=DEBRIEF_HTML;
  sfx.done();
  setTwistSeen(); showEndingBadge();

  tw("twBack").onclick=()=>{
    sfx.click();
    ov.classList.add("fadeout");
    setTimeout(()=>{ ov.classList.add("hidden"); done(); }, twistReduced?0:600);
  };
}

function showEndingBadge(){
  const b=tw("endingBadge");
  if(b && twistSeen()){ b.classList.remove("hidden"); }
}

tw("twist").addEventListener("click",e=>{
  if(e.target.closest("#twBack")) return;
  if(twAdvance) twAdvance();
});
window.addEventListener("DOMContentLoaded",()=>{
  showEndingBadge();
  /* PINTU DEVELOPER: buka index.html?dev=ending untuk langsung
     memutar twist tanpa bermain. Hapus blok ini di rilis final
     bila tak ingin bisa diakses publik. */
  if(new URLSearchParams(location.search).get("dev")==="ending"){
    playTwistEnding(()=>{ location.href=location.pathname; });
  }
});
