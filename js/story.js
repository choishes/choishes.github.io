/* ================================================================
   SINYAL — ENGINE STORY MODE (visual novel)
   Naskah di js/naskah.js. Aset visual di assets/story/:
     char_<id>_<mood>.png   (mood: normal | senyum | marah | kaget)
     bg_<kunci>.jpg         (lab | kota | redaksi | server | void)
   Tanpa file, engine memakai placeholder (gradasi + siluet inisial).
   ================================================================ */
const STORY_KEY="sinyal_story_v1";
const storySec=$("story");

/* baris loading khusus story */
LOAD_LINES.story=[
  "membuka berkas kasus…",
  "__PAKET__",
  "menghubungkan ke sistem SINYAL…",
  "lab siap. jangan langsung percaya siapa pun."
];

/* gradasi fallback per latar */
const VN_BG_FALLBACK={
  lab:   "radial-gradient(900px 500px at 70% 20%, rgba(63,224,197,.16), transparent), linear-gradient(180deg,#0a1420,#060a11)",
  kota:  "radial-gradient(900px 500px at 30% 10%, rgba(155,123,255,.18), transparent), linear-gradient(180deg,#0d0f1e,#05070e)",
  redaksi:"radial-gradient(900px 500px at 60% 15%, rgba(255,194,71,.14), transparent), linear-gradient(180deg,#141008,#0a0806)",
  server:"radial-gradient(900px 500px at 50% 80%, rgba(255,93,115,.12), transparent), linear-gradient(180deg,#0c0810,#060409)",
  void:  "radial-gradient(700px 700px at 50% 40%, rgba(63,224,197,.10), transparent), #020409",
};
const VN_FILTER={
  teks1:  s=>s.type==="teks"&&s.level===1,
  chat:   s=>s.type==="teks"&&s._pk===6,
  berita: s=>s.type==="teks"&&s._pk===3,
  akademik:s=>s.type==="teks"&&s._pk===9,
  gambar: s=>s.type==="gambar",
  trap:   s=>s.type==="teks"&&s.trap===true,
  final:  s=>s.type==="gambar"||(s.type==="teks"&&s.level===2),
};
const VN_POOL=[
  ...(typeof PAKET!=="undefined"?PAKET:[]).flatMap(p=>p.soal.map(s=>({type:"teks", _pk:p.id, ...s}))),
  ...BANK.filter(s=>s.type==="gambar")
];
/* identitas unik tiap spesimen (untuk anti-ulang) */
function vnKey(s){ return s.type==="teks" ? ("t:"+(s.text||"").slice(0,40)) : ("g:"+(s.src||"")); }
/* spesimen yang sudah pernah muncul sepanjang satu run cerita */
let vnSeen = new Set();
/* Ambil n spesimen dari filter, utamakan yang BELUM pernah muncul, lalu acak.
   Kalau stok baru habis, reset kategori itu supaya tetap bisa jalan. */
function vnPick(filterKey, n){
  const f = VN_FILTER[filterKey] || (()=>true);
  const all = VN_POOL.filter(f);
  let fresh = all.filter(s=>!vnSeen.has(vnKey(s)));
  if(fresh.length < n){
    /* stok baru tak cukup → lupakan kategori ini, mulai lagi dari bersih */
    all.forEach(s=>vnSeen.delete(vnKey(s)));
    fresh = all.slice();
  }
  const chosen = shuffle(fresh).slice(0, Math.min(n, fresh.length));
  chosen.forEach(s=>vnSeen.add(vnKey(s)));
  return chosen;
}

let vnIdx=0, vnTyping=null, vnTypeDone=true, vnPendingChal=null, vnBgKey=null, vnMusicBeforeChal=null;
let vnConvergeSay=null; // baris respons sekali-pakai dari pilihan konvergen
let vnShowingConverge=null; // baris konvergen yang sedang tampil (bukan node NASKAH)
let vnAutoOn=false, vnAutoTimer=null, vnMusicNow=null;

function storySave(lb){ try{ localStorage.setItem(STORY_KEY, lb); }catch(e){} }
function storyLoad(){ try{ return localStorage.getItem(STORY_KEY)||""; }catch(e){ return ""; } }
function labelIndex(lb){ const i=NASKAH.findIndex(n=>n.lb===lb); return i<0?0:i; }

/* Bersihkan panggung: sembunyikan & kosongkan kedua slot karakter,
   hapus efek/flag. Dipakai saat masuk story & saat mulai dari awal. */
function vnResetStage(){
  ["vnCharL","vnCharR"].forEach(idc=>{
    const el=$(idc);
    el.className = idc==="vnCharL" ? "vnchar vnL hidden" : "vnchar vnR hidden";
    el.innerHTML="";
    delete el.dataset.char; delete el.dataset.mood;
  });
  const st=$("vnStage"); st.classList.remove("solo","glitch","shake");
  const f=$("vnFlash"); if(f) f.classList.remove("go");
  $("vnName").textContent=""; $("vnText").textContent="";
  vnBgKey=null; vnConvergeSay=null; vnShowingConverge=null;
}

/* ---------- masuk story mode ---------- */
function startStory(){
  sfx.click();
  show(storySec);
  document.querySelector(".card").classList.add("bare");
  vnClearAuto(); vnAutoOn=false; vnMusicNow=null; vnSeen=new Set();
  vnResetStage();
  const ab=$("vnAuto"); if(ab){ ab.classList.remove("on"); ab.textContent="▶ AUTO"; }
  vnMaybeSuggestLandscape();
  const saved=storyLoad();
  if(saved && saved!=="TAMAT" && saved!=="ch1"){
    vnSetBg("lab"); bgmTitleStart();
    $("vnName").style.display="none"; $("vnText").textContent="Berkas kasus lamamu masih terbuka, operator.";
    vnShowChoices([
      {l:"LANJUTKAN — "+saved.toUpperCase().replace("CH","BAB "), g:saved},
      {l:"MULAI DARI AWAL", g:"ch1"}
    ], true);
  }else{
    vnJump("ch1");
  }
}
function vnJump(lb){
  if(lb==="ch1"){ vnResetStage(); vnSeen=new Set(); } // mulai dari awal → panggung bersih
  vnIdx=labelIndex(lb); vnRun();
}

/* ---------- eksekusi node ---------- */
function vnRun(){
  /* baris respons dari pilihan konvergen: tampilkan dulu, jangan geser vnIdx */
  if(vnConvergeSay){
    const say=vnConvergeSay; vnConvergeSay=null;
    vnShowingConverge = say;      // tandai: yang tampil adalah baris konvergen
    vnSay({n:say.who, t:say.t});
    return;
  }
  vnShowingConverge = null;
  while(vnIdx<NASKAH.length){
    const nd=NASKAH[vnIdx];
    if(nd.lb!==undefined){ if(/^ch\d/.test(nd.lb)) storySave(nd.lb); vnIdx++; continue; }
    if(nd.chapter!==undefined){ vnChapterCard(nd.chapter, nd.sub||""); return; }
    if(nd.bg){ vnSetBg(nd.bg); vnIdx++; continue; }
    if(nd.m){ vnMusic(nd.m); vnIdx++; continue; }
    if(nd.fx){ vnFx(nd.fx); vnIdx++; continue; }
    if(nd.c){ vnShowChar(nd.c, nd.side||"L", nd.mood||"normal"); vnIdx++; continue; }
    if(nd.hide){ vnHideChar(nd.hide); vnIdx++; continue; }
    if(nd.g){ vnIdx=labelIndex(nd.g); continue; }
    if(nd.n!==undefined){ vnSay(nd); return; }
    if(nd.ch){ vnShowChoices(nd.ch); return; }
    if(nd.q){ vnChallenge(nd.q); return; }
    if(nd.end){ vnEnd(nd.end); return; }
    vnIdx++;
  }
}

/* ---------- kartu judul bab (sinematik) ---------- */
function vnChapterCard(title, sub){
  const card=$("vnChapter");
  $("vnChapterTitle").textContent=title;
  $("vnChapterSub").textContent=sub;
  card.classList.remove("hidden");
  void card.offsetWidth;
  card.classList.add("show");
  if(sfxOn) beep(320,.5,"sine",.04);
  const dwell=reducedMotion?300:2200;
  setTimeout(()=>{
    card.classList.remove("show");
    setTimeout(()=>{ card.classList.add("hidden"); vnIdx++; vnRun(); }, reducedMotion?0:700);
  }, dwell);
}

/* ---------- dialog + typewriter ---------- */
function vnSay(nd){
  const nameEl=$("vnName"), textEl=$("vnText");
  const pname=(typeof PLAYER!=="undefined"&&PLAYER)?PLAYER:"OPERATOR";
  const who = nd.n==="@" ? pname : nd.n;
  const txt = (nd.t||"").split("[NAMA]").join(pname);
  nameEl.textContent=who;
  const meta=Object.values(VN_CHARS).find(c=>c.name===who);
  nameEl.style.color = who==="???" ? "#ff5d73" : (meta?meta.color:"var(--cyan)");
  nameEl.style.display = who ? "inline-block" : "none";
  clearInterval(vnTyping); vnTypeDone=false; vnClearAuto();
  if(reducedMotion){ textEl.textContent=txt; vnTypeDone=true; vnScheduleAuto(txt.length); return; }
  let i=0; textEl.textContent="";
  vnTyping=setInterval(()=>{
    i+=2; textEl.textContent=txt.slice(0,i);
    if(i>=txt.length){ clearInterval(vnTyping); vnTypeDone=true; vnScheduleAuto(txt.length); }
  },16);
}

/* ---------- auto-play (cerita jalan sendiri) ---------- */
function vnClearAuto(){ if(vnAutoTimer){ clearTimeout(vnAutoTimer); vnAutoTimer=null; } }
function vnScheduleAuto(len){
  if(!vnAutoOn) return;
  vnClearAuto();
  /* jeda baca: dasar 1,1 dtk + waktu baca per karakter, dibatasi 6 dtk */
  const wait=Math.min(6000, 1100 + (len||0)*45);
  vnAutoTimer=setTimeout(()=>{
    vnAutoTimer=null;
    /* hanya lanjut bila masih di layar cerita & tak sedang memilih/kartu bab */
    if(storySec.classList.contains("hidden")) return;
    if(!$("vnChoices").classList.contains("hidden")) return;
    if(!$("vnChapter").classList.contains("hidden")) return;
    vnAdvance();
  }, wait);
}
function vnToggleAuto(){
  vnAutoOn=!vnAutoOn;
  const b=$("vnAuto");
  b.classList.toggle("on", vnAutoOn);
  b.textContent = vnAutoOn ? "⏸ AUTO" : "▶ AUTO";
  if(vnAutoOn && vnTypeDone) vnScheduleAuto(($("vnText").textContent||"").length);
  else if(!vnAutoOn) vnClearAuto();
}
function vnAdvance(){
  if(!$("vnChoices").classList.contains("hidden")) return;
  if(!$("vnChapter").classList.contains("hidden")) return;
  vnClearAuto();
  /* kalau yang tampil adalah baris konvergen (bukan node NASKAH) */
  if(vnShowingConverge){
    if(!vnTypeDone){
      clearInterval(vnTyping);
      const pname=(typeof PLAYER!=="undefined"&&PLAYER)?PLAYER:"OPERATOR";
      $("vnText").textContent=(vnShowingConverge.t||"").split("[NAMA]").join(pname);
      vnTypeDone=true; vnScheduleAuto(($("vnText").textContent||"").length);
      return;
    }
    beep(520,.03,"square",.012);
    vnShowingConverge=null;
    vnRun();            // lanjut ke resumeIdx TANPA menambah vnIdx
    return;
  }
  const nd=NASKAH[vnIdx];
  if(nd && nd.n!==undefined && !vnTypeDone){
    clearInterval(vnTyping);
    const pname=(typeof PLAYER!=="undefined"&&PLAYER)?PLAYER:"OPERATOR";
    $("vnText").textContent=(nd.t||"").split("[NAMA]").join(pname);
    vnTypeDone=true;
    vnScheduleAuto(($("vnText").textContent||"").length);
    return;
  }
  beep(520,.03,"square",.012);
  vnIdx++; vnRun();
}

/* ---------- latar & karakter ---------- */
function vnSetBg(key){
  if(key===vnBgKey) return;
  vnBgKey=key;
  const bg=$("vnBg");
  bg.classList.add("fading");
  setTimeout(()=>{
    bg.style.background=VN_BG_FALLBACK[key]||VN_BG_FALLBACK.lab;
    bg.style.backgroundSize="cover"; bg.style.backgroundPosition="center";
    const img=new Image();
    img.onload=()=>{ if(vnBgKey===key) bg.style.background="url('assets/story/bg_"+key+".jpg') center/cover no-repeat"; };
    img.src="assets/story/bg_"+key+".jpg";
    bg.classList.remove("fading");
  }, reducedMotion?0:280);
}
function vnShowChar(id, side, mood){
  const slot = side==="R" ? $("vnCharR") : $("vnCharL");
  const other = side==="R" ? $("vnCharL") : $("vnCharR");
  const meta=VN_CHARS[id]||{name:id.toUpperCase(), color:"#3fe0c5"};
  slot.dataset.char=id; slot.dataset.mood=mood;
  slot.innerHTML='<div class="vnph" style="--cc:'+meta.color+'"><span>'+meta.name[0]+'</span></div>';
  const img=new Image();
  img.onload=()=>{ if(slot.dataset.char===id && slot.dataset.mood===mood) slot.innerHTML='<img src="'+img.src+'" alt="'+meta.name+'">'; };
  img.src="assets/story/char_"+id+"_"+mood+".png";
  slot.classList.remove("in","dim","hidden"); void slot.offsetWidth; slot.classList.add("in");
  /* karakter yg sedang bicara terang, lawan bicara sedikit redup */
  slot.classList.remove("dim");
  if(other && !other.classList.contains("hidden")) other.classList.add("dim");
  vnUpdateSolo();
}
function vnHideChar(w){
  if(w==="all"||w==="L") $("vnCharL").classList.add("hidden");
  if(w==="all"||w==="R") $("vnCharR").classList.add("hidden");
  vnUpdateSolo();
}
/* Kalau cuma satu karakter tampil → beri kelas 'solo' supaya slotnya
   lebih lebar (tidak kelihatan kecil, terutama di HP). */
function vnUpdateSolo(){
  const L=$("vnCharL"), R=$("vnCharR"), st=$("vnStage");
  const shown=[L,R].filter(e=>e && !e.classList.contains("hidden"));
  st.classList.toggle("solo", shown.length===1);
  L.classList.toggle("only", shown.length===1 && !L.classList.contains("hidden"));
  R.classList.toggle("only", shown.length===1 && !R.classList.contains("hidden"));
}
/* Jalur musik story yang sedang aktif (buat dipulihkan setelah tantangan) */
/* vnMusicNow dideklarasikan di blok state atas */

function vnMusic(m){
  if(m===vnMusicNow && m!=="off") return; // sudah main, jangan potong
  vnMusicNow = m;
  bgmTitleStop(); bgmCrisisStop(); bgmTwistStop(); bgmGameStop(); bgmWarmStop(); bgmMelanStop();
  if(m==="twist")      bgmTwistStart();
  else if(m==="crisis")bgmCrisisStart();
  else if(m==="title") bgmTitleStart();
  else if(m==="warm")  bgmWarmStart();
  else if(m==="melan") bgmMelanStart();
  else if(m==="game")  bgmGameStart();
  /* "off" atau lainnya: semua sudah distop di atas */
}
function vnStopAllStoryMusic(){
  vnMusicNow=null;
  bgmTitleStop(); bgmCrisisStop(); bgmTwistStop(); bgmGameStop(); bgmWarmStop(); bgmMelanStop();
}

/* ---------- efek layar ---------- */
function vnFx(kind){
  const st=$("vnStage");
  if(reducedMotion) return;
  if(kind==="flash"){ const f=$("vnFlash"); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go"); }
  if(kind==="shake"){ st.classList.remove("shake"); void st.offsetWidth; st.classList.add("shake"); setTimeout(()=>st.classList.remove("shake"),500); }
  if(kind==="glitch"){ st.classList.remove("glitch"); void st.offsetWidth; st.classList.add("glitch"); if(sfxOn) sfx.no(); setTimeout(()=>st.classList.remove("glitch"),600); }
}

/* ---------- pilihan ---------- */
/* Pilihan mendukung 2 mode:
   - Bercabang : {l:"...", g:"label"}   → lompat ke label (alur beda)
   - Konvergen : {l:"...", say:"respon"} → tampilkan 1 baris respon (opsional),
                  lalu lanjut ke node SETELAH blok pilihan (alur tetap sama).
   Bisa juga {l:"...", say:"...", who:"VEGA"} untuk memberi nama pembicara
   pada baris respons. Tanpa g & tanpa say → langsung lanjut. */
function vnShowChoices(list, noAdvance){
  const box=$("vnChoices"); box.innerHTML="";
  const resumeIdx = vnIdx + 1; // node tepat setelah node {ch:...}
  list.forEach(o=>{
    const b=document.createElement("button");
    b.className="vnchoice"; b.textContent=o.l;
    b.onclick=e=>{
      e.stopPropagation(); sfx.click(); box.classList.add("hidden");
      if(o.g){ vnJump(o.g); return; }                 // bercabang
      /* konvergen: tampilkan respons (kalau ada) lalu lanjut alur sama */
      vnIdx = resumeIdx;
      if(o.say){
        vnConvergeSay = { who: (o.who!==undefined ? o.who : "@"), t:o.say };
        vnRun();
      } else {
        vnRun();
      }
    };
    box.appendChild(b);
  });
  box.classList.remove("hidden");
}

/* ---------- jembatan ke tantangan soal ---------- */
function vnChallenge(q){
  vnClearAuto();
  vnPendingChal=q;
  vnMusicBeforeChal = vnMusicNow; // ingat musik adegan buat dipulihkan nanti
  mode="story";
  /* pindah ke musik game untuk sesi soal — paksa mulai ulang */
  bgmTitleStop(); bgmCrisisStop(); bgmTwistStop();
  bgmGameStop();               // reset currentCtx dulu…
  bgmGameStart();              // …lalu mulai bersih (lolos guard)
  deck = vnPick(q.f, q.n);     // pilih acak, utamakan yang belum pernah muncul
  playLoading("story", q.title, ()=>{
    idx=0; score=0;
    setupBoardUI({track:true, lives:false, turn:false, chip:q.title});
    show(game); render();
  });
}
function storyChallengeDone(finalScore){
  const q=vnPendingChal; vnPendingChal=null;
  const passed=finalScore>=q.pass;
  if(passed) sfx.done(); else sfx.lose();
  show(storySec);
  document.querySelector(".card").classList.add("bare");
  /* pulihkan musik adegan sebelum tantangan (game/crisis/twist/title) */
  bgmGameStop();
  const back = vnMusicBeforeChal || "game";
  vnMusicNow = null;      // paksa vnMusic benar-benar memutar ulang
  vnMusic(back);
  vnJump(passed?q.win:q.lose);
}
function storyAbort(){
  vnPendingChal=null;
  vnStopAllStoryMusic();
  show(hub);
}

/* ---------- tamat ---------- */
function vnEnd(key){
  vnClearAuto();
  storySave("TAMAT");
  try{ localStorage.setItem("sinyal_story_end_"+key,"1"); }catch(e){}
  const box=$("vnChoices"); box.classList.remove("hidden"); box.innerHTML="";
  const b=document.createElement("button");
  b.className="vnchoice"; b.textContent="◈ KEMBALI KE LAB";
  b.onclick=e=>{ e.stopPropagation(); sfx.click(); box.classList.add("hidden"); vnStopAllStoryMusic(); show(hub); };
  box.appendChild(b);
}

/* ---------- events ---------- */
$("vnStage").addEventListener("click",vnAdvance);
$("vnAuto").addEventListener("click",e=>{ e.stopPropagation(); sfx.click(); vnToggleAuto(); });

/* saran putar HP + layar penuh (hanya mobile portrait) */
function vnIsMobile(){
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (window.matchMedia && matchMedia("(pointer:coarse)").matches);
}
function vnMaybeSuggestLandscape(){
  const ov=$("vnRotate"); if(!ov) return;
  const portrait = window.matchMedia && matchMedia("(orientation:portrait)").matches;
  if(vnIsMobile() && portrait){ ov.classList.remove("hidden"); }
  else { ov.classList.add("hidden"); }
}
async function vnGoFullscreen(){
  const el=document.documentElement;
  try{
    if(el.requestFullscreen) await el.requestFullscreen();
    else if(el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
  }catch(e){}
  /* coba kunci ke landscape kalau didukung (Android Chrome) */
  try{ if(screen.orientation && screen.orientation.lock) await screen.orientation.lock("landscape"); }catch(e){}
}
if($("vnFsBtn")) $("vnFsBtn").addEventListener("click",async e=>{
  e.stopPropagation(); sfx.click();
  await vnGoFullscreen();
  $("vnRotate").classList.add("hidden");
});
if($("vnRotateSkip")) $("vnRotateSkip").addEventListener("click",e=>{
  e.stopPropagation(); sfx.click(); $("vnRotate").classList.add("hidden");
});
/* kalau user memutar ke landscape sendiri, tutup overlay */
window.addEventListener("orientationchange",()=>{
  setTimeout(()=>{ if(!storySec.classList.contains("hidden")) vnMaybeSuggestLandscape(); }, 300);
});

$("vnExit").addEventListener("click",e=>{ e.stopPropagation(); sfx.click(); vnClearAuto(); vnStopAllStoryMusic();
  try{ if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); }catch(_){}
  show(hub); });
document.addEventListener("keydown",e=>{
  if(storySec.classList.contains("hidden")) return;
  if(e.key==="Enter"||e.key===" "){ e.preventDefault(); vnAdvance(); }
});
