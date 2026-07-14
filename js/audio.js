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
/* Musik twist memakai DUA instans yang saling crossfade di ujung lagu,
   sehingga loop terdengar mulus tanpa jeda/putus. */
const TW_SRC="assets/bgm/Observing_the_Glass_Moon.mp3";
const TW_XFADE=2200; // ms panjang crossfade
const twistLoop=(function(){
  const a=new Audio(TW_SRC), bAlt=new Audio(TW_SRC);
  [a,bAlt].forEach(x=>{x.preload="auto"; x.loop=false;});
  let cur=a, nxt=bAlt, on=false, watch=null, swapping=false;
  function tick(){
    if(!on || swapping) return;
    const d=cur.duration;
    if(d && !isNaN(d) && cur.currentTime > d - TW_XFADE/1000){
      swapping=true;
      nxt.currentTime=0; nxt.volume=0;
      nxt.play().then(()=>{
        fade(nxt,bgmVol,TW_XFADE); fade(cur,0,TW_XFADE);
        setTimeout(()=>{ const t=cur; cur=nxt; nxt=t; swapping=false; }, TW_XFADE+80);
      }).catch(()=>{ swapping=false; });
    }
  }
  return {
    start(){
      on=true; swapping=false;
      cur.currentTime=0; cur.volume=0;
      cur.play().then(()=>fade(cur,bgmVol,300)).catch(()=>{});
      clearInterval(watch); watch=setInterval(tick,150);
    },
    stop(){ on=false; clearInterval(watch); fade(cur,0,800); fade(nxt,0,800); },
    setVolume(v){ if(on){ if(!cur.paused && !swapping) cur.volume=v; } },
    get playing(){ return on; }
  };
})();
/* Pembuat looper crossfade generik (dipakai twist, title, crisis) */
function makeLoop(src, xfade){
  const a=new Audio(src), b=new Audio(src);
  [a,b].forEach(x=>{x.preload="auto"; x.loop=false;});
  let cur=a, nxt=b, on=false, watch=null, swapping=false;
  function tick(){
    if(!on || swapping) return;
    const d=cur.duration;
    if(d && !isNaN(d) && cur.currentTime > d - xfade/1000){
      swapping=true; nxt.currentTime=0; nxt.volume=0;
      nxt.play().then(()=>{
        fade(nxt,bgmVol,xfade); fade(cur,0,xfade);
        setTimeout(()=>{ const t=cur; cur=nxt; nxt=t; swapping=false; }, xfade+80);
      }).catch(()=>{ swapping=false; });
    }
  }
  return {
    start(){ on=true; swapping=false; cur.currentTime=0; cur.volume=0;
      cur.play().then(()=>fade(cur,bgmVol,600)).catch(()=>{});
      clearInterval(watch); watch=setInterval(tick,150); },
    stop(){ on=false; clearInterval(watch); fade(cur,0,800); fade(nxt,0,800); },
    setVolume(v){ if(on && !cur.paused && !swapping) cur.volume=v; },
    get playing(){ return on; }
  };
}
/* Jalur STORY: judul (pembuka) & krisis (fase tegang) */
const titleLoop  = makeLoop("assets/bgm/Cinematic_Title_Sequence_Composition_Guide.mp3", 2600);
const crisisLoop = makeLoop("assets/bgm/Cinematic_Conflict_and_Resolution.mp3", 2400);
/* Jalur STORY tambahan: hangat/optimis & melankolis/merenung */
const warmLoop   = makeLoop("assets/bgm/Optimistic_Game_Soundtrack_Composition_Guide.mp3", 2400);
const melanLoop  = makeLoop("assets/bgm/Melancholic_Emotional_Musical_Composition.mp3", 2600);

let ambient = null; // fallback generatif untuk jalur game

function fade(el, to, ms=700){
  const gen = (el.__fadeGen = (el.__fadeGen||0) + 1); // token: batalkan fade lama
  const from=el.volume, start=performance.now();
  function step(t){
    if(el.__fadeGen!==gen) return; // fade ini sudah digantikan fade baru → berhenti
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
  twistLoop.start(); // crossfade-loop, tanpa jeda di titik ulang
}
function bgmTwistStop(){
  if(currentCtx==="twist") currentCtx=null;
  twistLoop.stop();
}

function bgmStopAll(){ fade(trackIntro,0,300); fade(trackGame,0,300); twistLoop.stop(); titleLoop.stop(); crisisLoop.stop(); warmLoop.stop(); melanLoop.stop(); stopAmbient(); }

/* Jalur STORY — dipanggil story.js */
function bgmTitleStart(){ currentCtx="title"; if(!bgmOn) return; twistLoop.stop(); crisisLoop.stop(); warmLoop.stop(); melanLoop.stop(); fade(trackGame,0,300); titleLoop.start(); }
function bgmTitleStop(){ if(currentCtx==="title") currentCtx=null; titleLoop.stop(); }
function bgmCrisisStart(){ currentCtx="crisis"; if(!bgmOn) return; twistLoop.stop(); titleLoop.stop(); warmLoop.stop(); melanLoop.stop(); fade(trackGame,0,300); crisisLoop.start(); }
function bgmCrisisStop(){ if(currentCtx==="crisis") currentCtx=null; crisisLoop.stop(); }
function bgmWarmStart(){ currentCtx="warm"; if(!bgmOn) return; twistLoop.stop(); titleLoop.stop(); crisisLoop.stop(); melanLoop.stop(); fade(trackGame,0,300); warmLoop.start(); }
function bgmWarmStop(){ if(currentCtx==="warm") currentCtx=null; warmLoop.stop(); }
function bgmMelanStart(){ currentCtx="melan"; if(!bgmOn) return; twistLoop.stop(); titleLoop.stop(); crisisLoop.stop(); warmLoop.stop(); fade(trackGame,0,300); melanLoop.start(); }
function bgmMelanStop(){ if(currentCtx==="melan") currentCtx=null; melanLoop.stop(); }

/* ---------- API untuk layar Pengaturan ---------- */
let bgmVol = 0.35; // 0..1, dikontrol slider

function setBgmVolume(v){
  bgmVol = Math.max(0, Math.min(1, v));
  if(!trackIntro.paused) trackIntro.volume = bgmVol;
  if(!trackGame.paused)  trackGame.volume  = bgmVol;
  twistLoop.setVolume(bgmVol);
  titleLoop.setVolume(bgmVol);
  crisisLoop.setVolume(bgmVol);
  warmLoop.setVolume(bgmVol);
  melanLoop.setVolume(bgmVol);
}
function setBgm(on){
  bgmOn = on;
  if(!on){ bgmStopAll(); return; }
  if(currentCtx==="intro") { trackIntro.volume=0; trackIntro.play().then(()=>fade(trackIntro,bgmVol,600)).catch(()=>{}); }
  else if(currentCtx==="twist"){ twistLoop.start(); }
  else if(currentCtx==="title"){ titleLoop.start(); }
  else if(currentCtx==="crisis"){ crisisLoop.start(); }
  else if(currentCtx==="warm"){ warmLoop.start(); }
  else if(currentCtx==="melan"){ melanLoop.start(); }
  else if(currentCtx==="game"){ trackGame.volume=0; trackGame.play().then(()=>fade(trackGame,bgmVol,600)).catch(()=>startAmbient()); }
}
function setSfx(on){ sfxOn = on; if(on) sfx.click(); }
