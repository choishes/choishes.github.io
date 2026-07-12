/* ================================================================
   SINYAL — CINEMATIC INTRO
   Urutan: gelap → boot lab → narasi baris demi baris → input nama
   → "MAJU, [NAMA]!" → hub muncul satu per satu.
   Klik di mana saja = percepat. Tombol SKIP = langsung ke hub.
   Nama tersimpan (localStorage bila ada) → kunjungan berikutnya
   intro dipersingkat jadi "Selamat datang kembali".
   ================================================================ */
const PLAYER_KEY="sinyal_player_v1";
let PLAYER = "";

function loadPlayer(){
  try{ return localStorage.getItem(PLAYER_KEY)||""; }catch(e){ return ""; }
}
function savePlayer(n){
  PLAYER=n;
  try{ localStorage.setItem(PLAYER_KEY,n); }catch(e){}
}

const cine=document.getElementById("cine");
const cineReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Naskah pembuka — edit bebas */
const SCRIPT_BARU = [
  "Tahun 2026.",
  "Mesin kini menulis, melukis, dan bersuara — nyaris tak terbedakan dari manusia.",
  "Linimasa banjir wajah yang tak pernah lahir dan berita yang tak pernah terjadi.",
  "Di era ketika melihat tak lagi berarti percaya…",
  "…dunia membutuhkan indra yang terlatih.",
  "Mampukah kamu membedakannya?"
];
const SCRIPT_KEMBALI = n => [
  "Sinyal terdeteksi kembali…",
  "Selamat datang kembali di lab, "+n+".",
  "Spesimen baru menunggumu."
];

const BOOT_LINES = [
  "memuat modul forensik teks… OK",
  "memuat modul forensik visual… OK",
  "kalibrasi sensor sintesis… OK",
  "membuka saluran aman… OK"
];

const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
let skipRequested=false, advanceClick=null;

function clickToAdvance(){
  return new Promise(res=>{
    advanceClick=()=>{advanceClick=null; res("click");};
  });
}
function holdOrClick(ms){
  return Promise.race([wait(ms), clickToAdvance()]);
}

async function runCinematic(){
  const returning = loadPlayer()!=="";
  PLAYER = loadPlayer();
  document.getElementById("cgate").classList.add("hidden");
  document.getElementById("cskip").classList.remove("hidden");
  bgmIntroStart(); // Cold Light of Dawn — mengalun di bawah cinematic

  if(cineReduced){ // aksesibilitas: tanpa animasi, langsung ke nama/hub
    returning ? finishCinematic() : showNameStage();
    return;
  }

  /* --- FASE 1: BOOT --- */
  const boot=document.getElementById("cboot");
  const logo=document.getElementById("clogo");
  const log=document.getElementById("clog");
  const fillEl=document.getElementById("cfill");
  boot.classList.remove("hidden");
  await wait(300);
  logo.classList.add("in"); sfx.scan();
  for(let i=0;i<BOOT_LINES.length;i++){
    if(skipRequested) return;
    await wait(340);
    log.textContent=BOOT_LINES[i];
    fillEl.style.width=((i+1)/BOOT_LINES.length*100)+"%";
    beep(700+i*120,.05,"square",.02);
  }
  await wait(450);
  boot.classList.add("out");
  await wait(600);
  boot.classList.add("hidden");

  /* --- FASE 2: NARASI --- */
  const story=document.getElementById("cstory");
  const line=document.getElementById("cline");
  const hint=document.getElementById("chint");
  story.classList.remove("hidden");
  const script = returning ? SCRIPT_KEMBALI(PLAYER) : SCRIPT_BARU;
  for(let i=0;i<script.length;i++){
    if(skipRequested) return;
    line.textContent=script[i];
    line.classList.remove("in"); void line.offsetWidth; // restart animasi
    line.classList.add("in");
    hint.style.opacity = i===0 ? "1" : "0.5";
    beep(440,.06,"sine",.015);
    const isLast = i===script.length-1;
    await holdOrClick(isLast?2600:(2000+script[i].length*18));
    line.classList.add("outup");
    await wait(340);
    line.classList.remove("outup");
  }
  story.classList.add("hidden");

  /* --- FASE 3: NAMA / MAJU --- */
  if(returning){ await flashMaju(PLAYER); finishCinematic(); }
  else showNameStage();
}

function showNameStage(){
  const nm=document.getElementById("cname");
  nm.classList.remove("hidden");
  const inp=document.getElementById("cnameinput");
  inp.value=""; inp.focus();
}

async function submitName(){
  const inp=document.getElementById("cnameinput");
  const n=(inp.value.trim()||"PENDEKAR").toUpperCase().slice(0,12);
  savePlayer(n);
  document.getElementById("cname").classList.add("hidden");
  sfx.ok();
  await flashMaju(n);
  finishCinematic();
}

async function flashMaju(n){
  const mj=document.getElementById("cmaju");
  document.getElementById("cmajutext").textContent="MAJU, "+n+"!";
  mj.classList.remove("hidden");
  void mj.offsetWidth;
  mj.classList.add("in");
  sfx.done();
  await wait(cineReduced?200:1900);
  mj.classList.add("hidden"); mj.classList.remove("in");
}

function finishCinematic(){
  skipRequested=true;
  bgmIntroStop(); // fade-out Cold Light of Dawn
  cine.classList.add("fadeout");
  setTimeout(()=>{
    cine.classList.add("hidden");
    document.body.classList.remove("noscroll");
    revealHub();
  }, cineReduced?0:700);
}

/* Hub muncul satu per satu */
function revealHub(){
  const greet=document.getElementById("hubGreet");
  if(greet && PLAYER) greet.textContent="OPERATOR: "+PLAYER;
  const items=document.querySelectorAll("#hub .stagger");
  items.forEach((el,i)=>{
    el.classList.remove("stagger-in");
    setTimeout(()=>{ el.classList.add("stagger-in"); beep(520+i*60,.04,"square",.012); },
      cineReduced?0:180*i+150);
  });
}

/* Events */
cine.addEventListener("click",e=>{
  if(e.target.closest("#cnameinput,#cnamebtn,#cskip")) return;
  if(advanceClick) advanceClick();
});
document.getElementById("cskip").addEventListener("click",()=>{
  const hasName = loadPlayer()!=="";
  if(!hasName && document.getElementById("cname").classList.contains("hidden")){
    // belum punya nama → skip menuju input nama, bukan lompat total
    skipRequested=true;
    ["cboot","cstory"].forEach(id=>document.getElementById(id).classList.add("hidden"));
    showNameStage();
  }else{
    finishCinematic();
  }
});
document.getElementById("cnamebtn").addEventListener("click",submitName);
document.getElementById("cnameinput").addEventListener("keydown",e=>{
  if(e.key==="Enter") submitName();
});

/* Gerbang masuk: klik pertama membuka izin audio browser,
   lalu cinematic + BGM intro dimulai bersamaan. */
document.getElementById("centerbtn").addEventListener("click",e=>{
  e.stopPropagation();
  document.body.classList.add("noscroll");
  runCinematic();
});
