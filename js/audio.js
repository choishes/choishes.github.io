/* ================================================================
   SINYAL — AUDIO
   1) SFX: dibangkitkan lewat WebAudio (tanpa file), toggle 🔊.
   2) BGM: <audio id="bgm"> memutar assets/bgm/theme.mp3 (PLACEHOLDER —
      taruh file mp3-mu di sana). Kalau file tidak ada, otomatis
      fallback ke ambient generatif (pad sintetis) supaya tetap ada
      atmosfer. Toggle ♪ di bar atas.
   ================================================================ */
let sfxOn = true, actx = null;

function ctx(){
  actx = actx || new (window.AudioContext||window.webkitAudioContext)();
  if(actx.state==="suspended") actx.resume();
  return actx;
}

function beep(freq, dur=0.09, type="sine", gain=0.05){
  if(!sfxOn) return;
  try{
    const c=ctx(), o=c.createOscillator(), g=c.createGain();
    o.type=type; o.frequency.value=freq;
    g.gain.setValueAtTime(gain,c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+dur);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime+dur);
  }catch(e){}
}

const sfx = {
  click:()=>beep(520,.05,"square",.03),
  scan:()=>{beep(880,.4,"sine",.02); setTimeout(()=>beep(660,.3,"sine",.02),150);},
  ok:()=>{beep(660,.08); setTimeout(()=>beep(990,.14),90);},
  no:()=>{beep(330,.12,"sawtooth",.04); setTimeout(()=>beep(220,.18,"sawtooth",.04),110);},
  lose:()=>{[392,330,262,196].forEach((f,i)=>setTimeout(()=>beep(f,.16,"sawtooth",.04),i*140));},
  done:()=>{[523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.12),i*120));}
};

/* ---------- BGM: DUA JALUR ----------
   1) INTRO  : assets/bgm/The_Third_Moon.mp3 — hanya saat cinematic.
   2) GAME   : assets/bgm/Cinematic_Retro_Synth_Progression.mp3 —
               looping selama gameplay. Ganti file = ganti nama file
               di bawah ini ATAU timpa file dengan nama yang sama.
   Kalau file game gagal dimuat → fallback ambient generatif. */
let bgmOn = true;
let currentCtx = null; // "intro" | "game" | null
const trackIntro = new Audio("assets/bgm/The_Third_Moon.mp3");
trackIntro.loop = true; trackIntro.preload = "auto";
const trackGame  = new Audio("assets/bgm/Cinematic_Retro_Synth_Progression.mp3");
trackGame.loop = true; trackGame.preload = "auto";
const trackTwist = new Audio("assets/bgm/Observing_the_Glass_Moon.mp3");
trackTwist.loop = true; trackTwist.preload = "auto";
let ambient = null; // fallback generatif untuk jalur game

function fade(el, to, ms=700){
  const from=el.volume, start=performance.now();
  function step(t){
    const k=Math.min(1,(t-start)/ms);
    el.volume=from+(to-from)*k;
    if(k<1) requestAnimationFrame(step);
    else if(to===0){ el.pause(); }
  }
  requestAnimationFrame(step);
}

function startAmbient(){
  if(ambient) return;
  try{
    const c=ctx();
    const g=c.createGain(); g.gain.value=0.035;
    const lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=520;
    const o1=c.createOscillator(); o1.type="sine";     o1.frequency.value=110;
    const o2=c.createOscillator(); o2.type="triangle"; o2.frequency.value=164.8;
    const o3=c.createOscillator(); o3.type="sine";     o3.frequency.value=220.6;
    const lfo=c.createOscillator(); lfo.frequency.value=0.08;
    const lfoG=c.createGain(); lfoG.gain.value=0.02;
    lfo.connect(lfoG); lfoG.connect(g.gain);
    [o1,o2,o3].forEach(o=>o.connect(lp));
    lp.connect(g); g.connect(c.destination);
    [o1,o2,o3,lfo].forEach(o=>o.start());
    ambient={stop(){[o1,o2,o3,lfo].forEach(o=>{try{o.stop()}catch(e){}}); ambient=null;}};
  }catch(e){}
}
function stopAmbient(){ if(ambient) ambient.stop(); }

/* Jalur INTRO — dipanggil cine.js */
function bgmIntroStart(){
  currentCtx="intro";
  if(!bgmOn) return;
  trackIntro.volume=0; trackIntro.currentTime=0;
  trackIntro.play().then(()=>fade(trackIntro,bgmVol,1200)).catch(()=>{});
}
function bgmIntroStop(){
  if(currentCtx==="intro") currentCtx=null;
  fade(trackIntro,0,900);
}

/* Jalur GAME — dipanggil game.js */
function bgmGameStart(){
  if(currentCtx==="game" && (!trackGame.paused || ambient)) return; // sudah berjalan
  currentCtx="game";
  if(!bgmOn) return;
  trackGame.volume=0; trackGame.currentTime=0;
  trackGame.play()
    .then(()=>fade(trackGame,bgmVol,1000))
    .catch(()=>startAmbient()); // file belum ada → ambient generatif
}
function bgmGameStop(){
  if(currentCtx==="game") currentCtx=null;
  fade(trackGame,0,700);
  stopAmbient();
}

/* Jalur TWIST — dipanggil ending.js saat layar error dimulai */
function bgmTwistStart(){
  currentCtx="twist";
  if(!bgmOn) return;
  trackTwist.volume=0; trackTwist.currentTime=0;
  trackTwist.play().then(()=>fade(trackTwist,bgmVol,300)).catch(()=>{}); // fade singkat: lagunya sendiri sudah fade-in
}
function bgmTwistStop(){
  if(currentCtx==="twist") currentCtx=null;
  fade(trackTwist,0,800);
}

function bgmStopAll(){ fade(trackIntro,0,300); fade(trackGame,0,300); fade(trackTwist,0,300); stopAmbient(); }

/* ---------- API untuk layar Pengaturan ---------- */
let bgmVol = 0.35; // 0..1, dikontrol slider

function setBgmVolume(v){
  bgmVol = Math.max(0, Math.min(1, v));
  if(!trackIntro.paused) trackIntro.volume = bgmVol;
  if(!trackGame.paused)  trackGame.volume  = bgmVol;
  if(!trackTwist.paused) trackTwist.volume = bgmVol;
}
function setBgm(on){
  bgmOn = on;
  if(!on){ bgmStopAll(); return; }
  if(currentCtx==="intro") { trackIntro.volume=0; trackIntro.play().then(()=>fade(trackIntro,bgmVol,600)).catch(()=>{}); }
  else if(currentCtx==="twist"){ trackTwist.volume=0; trackTwist.play().then(()=>fade(trackTwist,bgmVol,600)).catch(()=>{}); }
  else if(currentCtx==="game"){ trackGame.volume=0; trackGame.play().then(()=>fade(trackGame,bgmVol,600)).catch(()=>startAmbient()); }
}
function setSfx(on){ sfxOn = on; if(on) sfx.click(); }
