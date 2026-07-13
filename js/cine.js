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
  if(returning){ await flashMaju(PLAYER); await playLaunch(); finishCinematic(); }
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
  await playLaunch();
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

/* ---- PELUNCURAN ROKET: warp kokpit + gemuruh + fade cahaya ---- */
function startWarp(cv){
  const c2=cv.getContext("2d");
  cv.width=cv.clientWidth||innerWidth; cv.height=cv.clientHeight||innerHeight;
  const mk=()=>({a:Math.random()*Math.PI*2, r:Math.random()*46+6, sp:Math.random()*1.6+.5});
  const S=Array.from({length:170},mk);
  let speed=1, run=true;
  (function f(){
    if(!run) return;
    const W=cv.width,H=cv.height,CX=W/2,CY=H*0.55,MAX=Math.hypot(W,H)/2;
    c2.fillStyle="rgba(3,6,10,.38)"; c2.fillRect(0,0,W,H);
    speed*=1.035;
    for(const s of S){
      const r0=s.r; s.r+=s.sp*speed;
      const x0=CX+Math.cos(s.a)*r0, y0=CY+Math.sin(s.a)*r0;
      const x1=CX+Math.cos(s.a)*s.r, y1=CY+Math.sin(s.a)*s.r;
      c2.strokeStyle="rgba(220,240,255,"+Math.min(1,s.r/220)+")";
      c2.lineWidth=Math.min(2.6, s.r/160+.4);
      c2.beginPath(); c2.moveTo(x0,y0); c2.lineTo(x1,y1); c2.stroke();
      if(s.r>MAX) Object.assign(s,mk());
    }
    requestAnimationFrame(f);
  })();
  return ()=>{run=false;};
}

function launchRumble(sec){
  if(!sfxOn) return;
  try{
    const c=ctx();
    const o=c.createOscillator(); o.type="sawtooth";
    o.frequency.setValueAtTime(36,c.currentTime);
    o.frequency.exponentialRampToValueAtTime(130,c.currentTime+sec);
    const lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=240;
    const g=c.createGain();
    g.gain.setValueAtTime(0.0001,c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.09,c.currentTime+0.35);
    g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+sec);
    o.connect(lp); lp.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime+sec);
    const buf=c.createBuffer(1,Math.floor(c.sampleRate*sec),c.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(i/d.length);
    const n=c.createBufferSource(); n.buffer=buf;
    const bp=c.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=850;
    const ng=c.createGain(); ng.gain.value=0.05;
    n.connect(bp); bp.connect(ng); ng.connect(c.destination); n.start();
  }catch(e){}
}

async function playLaunch(){
  if(cineReduced) return;
  const st=document.getElementById("claunch");
  st.classList.remove("hidden");
  const stopWarp=startWarp(document.getElementById("warp"));
  launchRumble(2.9);
  await wait(2150);
  document.getElementById("whiteout").style.opacity="1"; // cahaya menelan kokpit
  beep(1200,.5,"sine",.05);
  await wait(560);
  stopWarp();
  st.classList.add("hidden");
}

function finishCinematic(){
  skipRequested=true;
  bgmIntroStop(); // fade-out Cold Light of Dawn
  cine.classList.add("fadeout");
  setTimeout(()=>{
    cine.classList.add("hidden");
    document.body.classList.remove("noscroll");
    document.getElementById("whiteout").style.opacity="0";
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
