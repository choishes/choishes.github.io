/* ================================================================
   SINYAL — GAME LOGIC (Karir / Infinite / Tanding)
   ================================================================ */
const $=id=>document.getElementById(id);
const hub=$("hub"), game=$("game"), end=$("end"), board=$("board"),
      settings=$("settings"), credits=$("credits"), levels=$("levels"), duelSec=$("duel");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
const playable = s => s.type==="teks" || (s.src && s.src.length>0);
/* Pool gabungan: 100 soal teks dari js/paket.js + media dari js/bank.js */
const TEXT_POOL  = (typeof PAKET_ALL!=="undefined") ? PAKET_ALL : BANK.filter(s=>s.type==="teks");
const MEDIA_POOL = BANK.filter(s=>s.type!=="teks");
const FULL_POOL  = [...TEXT_POOL, ...MEDIA_POOL];

/* ---------- STATE ---------- */
let mode="infinite";        // "karir" | "infinite" | "tanding"
let deck=[], idx=0, answered=false, busy=false;
let score=0;                // karir(misi aktif) & infinite
let lives=3;                // infinite
let currentLevel=0; // karir: level yang sedang dimainkan
/* Progres karir tersimpan di perangkat */
const CAREER_KEY="sinyal_career_v1";
function careerLoad(){
  try{ const d=JSON.parse(localStorage.getItem(CAREER_KEY)||"{}");
       return {unlocked:d.unlocked||0, done:d.done||[]}; }
  catch(e){ return {unlocked:0, done:[]}; }
}
function careerSave(pr){ try{ localStorage.setItem(CAREER_KEY, JSON.stringify(pr)); }catch(e){} }
let careerProg = careerLoad();
let p1=0, p2=0, turn=1, firstGuess=null;      // tanding
let bestInfinite=null, rankIdx=0;
let answeredTotal=0, runTwistShown=false; // pemicu twist ending

/* ================= NAVIGASI LAYAR ================= */
function show(sec){
  [hub,game,end,board,settings,credits,levels,duelSec].forEach(s=>s.classList.add("hidden"));
  sec.classList.remove("hidden");
  /* menu awal tampil polos tanpa kartu; layar lain memakai kartu */
  document.querySelector(".card").classList.toggle("bare", sec===hub || sec===levels);
}

/* ================= LOADING SINEMATIK ================= */
const LOAD_LINES = {
  karir:[
    "menetapkan koordinat planet…",
    "__PAKET__",
    "menghubungkan ke sistem AI…",
    "pendaratan siap. selamat bertugas."
  ],
  infinite:[
    "membuka saluran tanpa batas…",
    "mengisi tiga nyawa cadangan…",
    "menghubungkan ke sistem AI…",
    "peringatan: spesimen tidak akan berhenti datang."
  ],
  tanding:[
    "menyiapkan arena duel…",
    "__PAKET__", // diganti nama paket terpilih
    "menghubungkan ke sistem AI…",
    "dua kursi terpasang. jangan saling intip."
  ]
};

function playLoading(m, extra, done){
  const scr=$("loadscreen");
  if(reducedMotion){ done(); return; }
  const lines=LOAD_LINES[m].map(l=>l==="__PAKET__"?("memuat "+extra.toLowerCase()+"…"):l);
  $("ldTitle").textContent="MODE: "+m.toUpperCase();
  const fill=$("ldFill"), log=$("ldLog");
  fill.style.width="0"; log.textContent="";
  scr.classList.remove("hidden","fadeout");
  let i=0;
  (function step(){
    if(i<lines.length){
      log.textContent=lines[i];
      fill.style.width=Math.round(((i+1)/lines.length)*100)+"%";
      beep(600+i*140,.06,"square",.02);
      i++;
      setTimeout(step, 480+Math.random()*320);
    }else{
      setTimeout(()=>{
        scr.classList.add("fadeout"); sfx.scan();
        setTimeout(()=>{ scr.classList.add("hidden"); done(); }, 450);
      }, 320);
    }
  })();
}

/* ================= MULAI MODE ================= */
function startGame(m){
  mode=m; sfx.click();
  if(m==="karir"){ renderPlanets(); show(levels); return; } // peta dulu
  bgmGameStart();
  let extra="";
  if(m==="tanding"){
    currentPaket = PAKET[Math.floor(Math.random()*PAKET.length)];
    extra = currentPaket.nama;
  }
  playLoading(m, extra, ()=>bootMode(m));
}

/* ---- PETA PLANET: perjalanan vertikal zigzag ---- */
function renderPlanets(){
  const map=$("planetMap"); map.innerHTML="";
  const W=map.clientWidth || Math.min(560, innerWidth-48);
  /* pola kiri-kanan tak beraturan (persen lebar), final di tengah */
  const XS=[26,68,32,72,22,64,35,74,27,61,50];
  const hues=["#3fe0c5","#9b7bff","#ffc247","#ff5d73","#6fb3ff"];
  let y=26; const pts=[];

  CAREER.forEach((lv,i)=>{
    const size = lv.final ? Math.min(128, W*0.34) : Math.round(46 + i*6);
    const cx = XS[i]/100*W;
    const cy = y + size/2;
    pts.push([cx,cy]);

    const node=document.createElement("div");
    node.className="pnode";
    node.style.left=(cx-size/2)+"px";
    node.style.top=y+"px";
    node.style.width=size+"px";

    const pl=document.createElement("button");
    pl.style.width=pl.style.height=size+"px";
    pl.style.fontSize=(lv.final?26:13+i*0.9)+"px";
    const hue=hues[i%hues.length];
    pl.style.background="radial-gradient(circle at 30% 28%, "+hue+"66, #0b111c 72%)";
    const done=!!careerProg.done[i];
    const open=i<=careerProg.unlocked;
    pl.className="planet"+(lv.final?" final":"")+(done?" done":open?" open":" locked");
    pl.innerHTML="<span>"+(lv.final?"★":(i+1))+"</span>";
    pl.setAttribute("aria-label",lv.name);
    pl.onclick = open ? ()=>startLevel(i) : ()=>{ beep(160,.1,"sawtooth",.03); };

    const lb=document.createElement("div");
    lb.className="plabel"; lb.style.width=Math.max(size,110)+"px";
    lb.style.marginLeft=((size-Math.max(size,110))/2)+"px";
    lb.textContent=lv.name.includes("—")?lv.name.split("—")[1].trim():lv.name;

    node.appendChild(pl); node.appendChild(lb);
    map.appendChild(node);
    y += size + 78;
  });
  map.style.height=(y+10)+"px";

  /* rute putus-putus menembus planet */
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("class","ppath");
  svg.setAttribute("width",W); svg.setAttribute("height",y+10);
  const poly=document.createElementNS("http://www.w3.org/2000/svg","polyline");
  poly.setAttribute("points", pts.map(p=>p[0]+","+p[1]).join(" "));
  svg.appendChild(poly);
  map.insertBefore(svg, map.firstChild);
}
let _pmResize=null;
window.addEventListener("resize",()=>{
  clearTimeout(_pmResize);
  _pmResize=setTimeout(()=>{ if(!levels.classList.contains("hidden")) renderPlanets(); },200);
});

function startLevel(i){
  currentLevel=i; sfx.click(); bgmGameStart();
  playLoading("karir", CAREER[i].name, ()=>{
    const lv=CAREER[i];
    let pool=FULL_POOL.filter(lv.filter);
    deck=shuffle(pool).slice(0, Math.min(lv.n, pool.length));
    idx=0; score=0;
    setupBoardUI({track:true, lives:false, turn:false, chip:lv.name});
    show(game); render();
  });
}

let currentPaket=null;
function bootMode(m){
  if(m==="infinite"){
    deck=shuffle(FULL_POOL.filter(playable)); idx=0; score=0; lives=3;
    answeredTotal=0; runTwistShown=false;
    setupBoardUI({track:false, lives:true, turn:false, chip:"MODE: INFINITE"});
  }
  if(m==="tanding"){
    deck=shuffle(currentPaket.soal.map(s=>({type:"teks",...s})));
    idx=0; p1=0; p2=0; turn=1; firstGuess=null;
    setupBoardUI({track:true, lives:false, turn:true,
      chip:"TANDING · PAKET "+String(currentPaket.id).padStart(2,"0")});
  }
  show(game); render();
}


function setupBoardUI(o){
  $("modechip").textContent=o.chip;
  $("liveschip").classList.toggle("hidden", !o.lives);
  $("turnchip").classList.toggle("hidden", !o.turn);
  const t=$("track"); t.innerHTML="";
  if(o.track) deck.forEach((_,i)=>{const s=document.createElement("div");s.className="seg";s.id="seg"+i;t.appendChild(s);});
}

/* ================= RENDER RONDE ================= */
function render(){
  answered=false; busy=false; firstGuess=null;
  const r=deck[idx];
  $("roundlabel").textContent = mode==="infinite"
    ? "Spesimen "+String(answeredTotal+1).padStart(3,"0")+" · TANPA BATAS"
    : "Spesimen "+String(idx+1).padStart(2,"0")+" / "+String(deck.length).padStart(2,"0");
  updateHeader();
  $("spectag").textContent="SPESIMEN "+r.type.toUpperCase();
  $("prompt").textContent = mode==="tanding" ? "GILIRAN PEMAIN 1 — SIAPA PEMBUATNYA?" : "SIAPA PEMBUATNYA?";
  $("prompt").classList.remove("analyzing");
  $("verdict").classList.remove("show");
  $("btnHuman").disabled=false; $("btnAI").disabled=false;
  if(mode==="tanding"){ turn=1; $("turnchip").textContent="GILIRAN: P1"; }

  const body=$("specBody");
  if(r.type==="teks"){
    body.innerHTML='<p id="specimenText"></p>';
    revealText($("specimenText"), r.text);
  }else if(r.src){
    body.innerHTML = '<div class="media"><img src="'+r.src+'" alt="Spesimen visual"></div>';
  }else{
    body.innerHTML='<div class="slotinfo"><b>[ SLOT '+r.type.toUpperCase()+' KOSONG ]</b><br>'
      +'Isi field <b>src</b> item ini di js/bank.js dengan path/URL<br>hasil kurasimu (mis. assets/img/01.jpg).</div>';
  }
  const seg=$("seg"+idx);
  document.querySelectorAll(".seg").forEach(s=>s.classList.remove("now"));
  if(seg && !seg.classList.contains("done") && !seg.classList.contains("wrong")) seg.classList.add("now");
}

function updateHeader(){
  if(mode==="infinite"){
    $("count").innerHTML="SKOR <b>"+score+"</b>";
    $("liveschip").textContent="❤".repeat(lives)+"♡".repeat(3-lives);
  }else if(mode==="tanding"){
    $("count").innerHTML="P1 <b>"+p1+"</b> — <b>"+p2+"</b> P2";
  }else if(mode==="online"){
    $("count").innerHTML="SKORMU <b>"+score+"</b>";
  }else{
    $("count").innerHTML="MISI SKOR <b>"+score+"</b>";
  }
}

/* Efek dekripsi teks */
let revealTimer=null;
function revealText(el, finalText){
  clearInterval(revealTimer);
  if(reducedMotion){ el.textContent=finalText; return; }
  const glyphs="▓▒░<>/\\|·:;+=-_";
  let shown=0; const total=finalText.length;
  const step=Math.max(2, Math.ceil(total/28));
  revealTimer=setInterval(()=>{
    shown=Math.min(total, shown+step);
    let out=finalText.slice(0,shown);
    if(shown<total) for(let i=0;i<Math.min(10,total-shown);i++)
      out+=glyphs[Math.floor(Math.random()*glyphs.length)];
    el.textContent=out;
    if(shown>=total) clearInterval(revealTimer);
  },28);
}

/* ================= MENJAWAB ================= */
function choose(guessAI){
  if(answered||busy) return;
  const r=deck[idx];

  /* Mode tanding: P1 menjawab dulu, lalu estafet ke P2 */
  if(mode==="tanding" && turn===1){
    firstGuess=guessAI; turn=2; sfx.click();
    $("turnchip").textContent="GILIRAN: P2";
    $("prompt").textContent="GILIRAN PEMAIN 2 — JANGAN INTIP EKSPRESI P1";
    return;
  }

  busy=true;
  $("btnHuman").disabled=true; $("btnAI").disabled=true;
  const spec=$("specimen"); spec.classList.add("scanning"); sfx.scan();
  $("prompt").textContent="MEMINDAI SPESIMEN…";
  $("prompt").classList.add("analyzing");
  const delay = reducedMotion? 0 : 950;

  setTimeout(()=>{
    spec.classList.remove("scanning");
    answered=true; busy=false;
    $("prompt").classList.remove("analyzing");
    $("prompt").textContent="ANALISIS SELESAI";

    const truthHTML="Spesimen ini dibuat oleh <b class=\""+(r.isAI?"ai":"human")+"\">"+(r.isAI?"AI":"MANUSIA")+"</b>.";
    const vh=$("vhead");

    if(mode==="tanding"){
      const c1=(firstGuess===r.isAI), c2=(guessAI===r.isAI);
      if(c1)p1++; if(c2)p2++;
      (c1||c2)?sfx.ok():sfx.no();
      vh.className="vhead duo";
      vh.textContent="HASIL RONDE";
      $("truth").innerHTML=truthHTML+"<br><span class='p1'>P1: "+(c1?"✓ benar":"✗ meleset")+"</span> · <span class='p2'>P2: "+(c2?"✓ benar":"✗ meleset")+"</span>";
      const seg=$("seg"+idx); seg.classList.remove("now"); seg.classList.add((c1&&c2)?"done":(!c1&&!c2)?"wrong":"now");
    }else{
      const correct=(guessAI===r.isAI);
      if(mode==="infinite") answeredTotal++;
      if(mode==="online" && typeof onlineOnAnswer==="function") setTimeout(()=>onlineOnAnswer(correct),0);
      if(correct){score++; sfx.ok();}
      else{
        sfx.no();
        if(mode==="infinite"){ lives--; }
      }
      vh.className="vhead "+(correct?"ok":"no");
      vh.textContent=correct?"✓ TERDETEKSI BENAR":"✗ MELESET";
      $("truth").innerHTML=truthHTML;
      const seg=$("seg"+idx);
      if(seg){ seg.classList.remove("now"); seg.classList.add(correct?"done":"wrong"); }
    }

    updateHeader();
    $("cue").textContent=r.cue;
    $("explain").innerHTML = r.trap
      ? r.explain.replace("JEBAKAN","<span class='trap'>JEBAKAN</span>")
      : r.explain;
    $("verdict").classList.add("show");

    const gameOver = (mode==="infinite" && lives<=0);
    const lastRound = (mode!=="infinite" && idx===deck.length-1);
    $("next").textContent = gameOver ? "Lihat Hasil →"
      : lastRound ? "Lihat Hasil →"
      : "Spesimen Berikutnya →";
    $("next").focus();
  }, delay);
}

/* ================= LANJUT ================= */
function next(){
  if(!answered) return;
  sfx.click();

  if(mode==="infinite"){
    if(lives<=0){ endInfinite(); return; }
    if(answeredTotal>=100 && !runTwistShown){
      runTwistShown=true;
      playTwistEnding(()=>endInfinite());
      return;
    }
    idx++;
    if(idx>=deck.length){ deck=shuffle(FULL_POOL.filter(playable)); idx=0; } // loop tanpa akhir
    render(); return;
  }

  idx++;
  if(idx<deck.length){ render(); return; }

  if(mode==="online"){
    if(typeof onlineLocalDone==="function") onlineLocalDone();
    return;
  }
  if(mode==="tanding"){ endTanding(); return; }
  /* karir: level selesai */
  const lv=CAREER[currentLevel];
  const passed = score>=lv.pass;
  if(passed){
    careerProg.done[currentLevel]=true;
    careerProg.unlocked=Math.max(careerProg.unlocked, Math.min(currentLevel+1, CAREER.length-1));
    careerSave(careerProg);
  }
  if(passed && lv.final){ playTwistEnding(()=>endCareerFinal()); return; }
  showLevelResult(passed, lv);
}


/* ================= LAYAR AKHIR ================= */
function endScreenBase(title, sc, total, msg, finding, showCoin, showName){
  show(end);
  $("endmode").textContent=title;
  $("finalScore").textContent=sc;
  $("finalTotal").textContent = total!==null ? "/"+total : "";
  $("verdictMsg").textContent=msg;
  $("findingText").innerHTML=finding;
  $("coinbar").classList.toggle("hidden", !showCoin);
  if(showCoin && total){
    const pct=Math.round(sc/total*100);
    $("pctlabel").textContent=pct+"%";
    $("fill").style.width="0";
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ $("fill").style.width=pct+"%"; }));
  }
  $("namebox").classList.toggle("hidden", !showName);
  if(showName){ $("nameinput").value = (typeof PLAYER!=="undefined" && PLAYER) ? PLAYER : ""; }
  $("restart").textContent="Main Lagi";
  $("restart").onclick=()=>{sfx.click(); startGame(mode);};
  $("tolab").textContent="Kembali ke Lab";
  $("tolab").onclick=()=>{sfx.click(); bgmGameStop(); show(hub);};
}

function endInfinite(){
  sfx.lose();
  if(bestInfinite===null||score>bestInfinite){ bestInfinite=score; $("best-infinite").innerHTML="Rekor: <b>"+bestInfinite+"</b>"; }
  endScreenBase("MODE INFINITE — TRANSMISI PUTUS", score, null,
    score>=15?"Bertahan luar biasa lama. Tapi bahkan analis terbaik akhirnya tumbang — model terus membaik.":
    score>=8?"Bertahan cukup lama sebelum sinyal hilang. Pola mulai terbaca, tapi jebakan tetap lolos.":
    "Tiga nyawa habis cepat — dan itu bukan aib. Konten sintetis memang dirancang untuk lolos dari intuisi.",
    "Mode tanpa akhir meniru kondisi nyata: konten datang terus-menerus, dan kelelahan menurunkan akurasi. Moderator konten profesional menghadapi ini setiap hari. <b>Deteksi manual tidak bisa diskalakan.</b>",
    false, true);
  pendingLB={score:score, mode:"INFINITE"};
}

function endTanding(){
  sfx.done();
  const winner = p1===p2 ? "SERI" : (p1>p2?"PEMAIN 1 MENANG":"PEMAIN 2 MENANG");
  endScreenBase("MODE TANDING — "+winner, p1+" : "+p2, null,
    p1===p2?"Insting kalian sama tajam — atau sama-sama tertipu di tempat yang sama.":
    "Selisih tipis atau lebar, satu hal pasti: kalian berdua kadang yakin pada jawaban yang salah.",
    "Dua orang menatap spesimen yang sama dan sampai pada kesimpulan berbeda — padahal faktanya satu. Persis begitulah hoaks membelah persepsi publik: <b>bukan karena orang bodoh, tapi karena sinyalnya memang ambigu.</b>",
    false, false);
  pendingLB=null;
}

function showLevelResult(passed, lv){
  if(passed) sfx.done(); else sfx.lose();
  const isLastBeforeFinal = currentLevel===CAREER.length-2;
  endScreenBase(
    passed ? lv.name+" ✓ TUNTAS" : lv.name+" — GAGAL",
    score, deck.length,
    passed
      ? (isLastBeforeFinal
          ? "Gerbang terbuka. Planet terbesar menunggumu — dan sesuatu terasa tidak beres di inti arsip."
          : "Planet ditaklukkan. Koordinat planet berikutnya telah terbuka di peta.")
      : "Skor di bawah ambang lulus ("+lv.pass+"). Planet ini belum menyerah — dan kamu juga jangan.",
    passed
      ? "Tiap planet menaikkan kabutnya: pola yang berhasil di level sebelumnya belum tentu berlaku di level berikutnya. Itulah sifat konten sintetis — <b>ia berevolusi lebih cepat dari intuisi.</b>"
      : "Kegagalan di lab lebih murah daripada di dunia nyata, tempat salah menilai keaslian bisa berarti ikut menyebarkan hoaks. <b>Baca lagi penjelasan tiap spesimen; pola butuh latihan.</b>",
    true, false);
  const nextExists = passed && currentLevel<CAREER.length-1;
  $("restart").textContent = passed ? (nextExists?"Planet Berikutnya →":"Peta Level") : "Ulangi Level";
  $("restart").onclick = ()=>{ sfx.click();
    if(!passed){ startLevel(currentLevel); }
    else if(nextExists){ startLevel(currentLevel+1); }
    else { renderPlanets(); show(levels); }
  };
  $("tolab").textContent="Peta Level";
  $("tolab").onclick=()=>{ sfx.click(); renderPlanets(); show(levels); };
}

function endCareerFinal(){
  rankIdx=RANKS.length-1;
  sfx.done();
  const total=CAREER.length;
  endScreenBase("EKSPEDISI TUNTAS — PANGKAT: "+RANKS[rankIdx], score, deck.length,
    "Sebelas planet ditaklukkan sampai Inti Arsip. Pangkatmu: "+RANKS[rankIdx]+".",
    "Semakin dekat ke inti, semakin kabur batas manusia–mesin — dan di inti, batas itu runtuh sama sekali. <b>Keahlian menunda kekalahan, tapi verifikasi sumber yang membatalkannya.</b>",
    true, true);
  pendingLB={score:score, mode:"KARIR"};
  $("tolab").textContent="Kembali ke Lab";
  $("tolab").onclick=()=>{ sfx.click(); bgmGameStop(); show(hub); };
}

/* ================= LEADERBOARD ================= */
let pendingLB=null;
$("saveScore").addEventListener("click",()=>{
  if(!pendingLB) return;
  lbAdd($("nameinput").value, pendingLB.score, pendingLB.mode);
  pendingLB=null; sfx.ok();
  $("namebox").classList.add("hidden");
  openBoard();
});
function openBoard(){ lbRender($("lbList")); show(board); }

/* ================= EVENTS ================= */
document.querySelectorAll(".mitem[data-start]").forEach(m=>m.addEventListener("click",()=>{ if(m.dataset.start==="tanding"){ sfx.click(); show(duelSec); } else startGame(m.dataset.start); }));
$("btnHuman").addEventListener("click",()=>choose(false));
$("btnAI").addEventListener("click",()=>choose(true));
$("next").addEventListener("click",next);
$("tolab").onclick=()=>{sfx.click(); bgmGameStop(); show(hub);}; // default; layar level menimpanya
$("quit").addEventListener("click",()=>{
  sfx.click();
  if(mode==="online" && typeof onlineAbort==="function") onlineAbort();
  bgmGameStop(); show(hub);
});
$("openBoard").addEventListener("click",()=>{sfx.click(); openBoard();});
document.querySelectorAll(".backhub").forEach(b=>b.addEventListener("click",()=>{sfx.click(); show(hub);}));

/* pengaturan */
$("openSettings").addEventListener("click",()=>{
  sfx.click();
  $("renameInput").value = (typeof PLAYER!=="undefined") ? PLAYER : "";
  show(settings);
});
$("openCredits").addEventListener("click",()=>{sfx.click(); show(credits);});

/* saklar audio & visual */
function wireSwitch(id, fn){
  const el=$(id);
  el.addEventListener("click",()=>{
    const on=!el.classList.contains("on");
    el.classList.toggle("on",on);
    el.setAttribute("aria-checked",on);
    fn(on);
  });
}
wireSwitch("setBgm", on=>setBgm(on));
wireSwitch("setSfx", on=>setSfx(on));
wireSwitch("setFx",  on=>{ if(window.spaceFX) spaceFX(on); });
$("setVol").addEventListener("input",e=>{
  const v=e.target.value;
  $("volLabel").textContent=v+"%";
  setBgmVolume(v/100);
});
$("renameSave").addEventListener("click",()=>{
  const n=$("renameInput").value.trim().toUpperCase().slice(0,12);
  if(!n) return;
  savePlayer(n);
  const greet=$("hubGreet"); if(greet) greet.textContent="OPERATOR: "+n;
  sfx.ok();
});
$("replayIntro").addEventListener("click",()=>{ location.reload(); });
$("wipeData").addEventListener("click",()=>{
  if(!confirm("Hapus semua data lokal (nama, rekor, papan skor)?")) return;
  try{ localStorage.removeItem(LB_KEY); localStorage.removeItem(PLAYER_KEY); }catch(e){}
  location.reload();
});

/* progres karir di menu */
function refreshCareerChip(){
  const el=document.querySelector('.mitem[data-start="karir"] .mi-desc');
  if(!el) return;
  const doneCount=careerProg.done.filter(Boolean).length;
  el.textContent = doneCount>0 ? "peta planet · "+doneCount+"/"+CAREER.length+" ditaklukkan" : "peta planet · 11 level";
}
refreshCareerChip();
const _careerSaveOrig=careerSave;
careerSave=function(pr){ _careerSaveOrig(pr); refreshCareerChip(); };

document.addEventListener("keydown",e=>{
  if(game.classList.contains("hidden")){
    if(e.key==="Enter" && !end.classList.contains("hidden") && document.activeElement!==$("nameinput")) $("restart").click();
    return;
  }
  if(e.key==="1") choose(false);
  else if(e.key==="2") choose(true);
  else if(e.key==="Enter"&&answered) next();
});
