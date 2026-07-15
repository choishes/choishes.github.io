/* ================================================================
   SINYAL — MINIGAME "SUSUN KATA"  (js/wordgame.js)
   ----------------------------------------------------------------
   Selain menebak AI/bukan, ini teka-teki susun kata bertimer:
   diberi petunjuk + huruf teracak, susun jadi kata yang benar
   sebelum waktu habis. Kata bertema literasi media & dunia SINYAL.

   ADITIF: overlay fullscreen sendiri (#wordgame), tidak menyentuh
   show() di game.js. Dipicu tombol hub data-start="wordgame"
   (di-intercept di game.js). Aman kalau audio/sfx belum ada.
   ================================================================ */
(function(){
  "use strict";
  const $=id=>document.getElementById(id);

  /* ---------- bank kata (jawaban selalu HURUF KAPITAL, tanpa spasi) ---------- */
  const BANK=[
    ["HOAKS","Berita bohong yang sengaja disebarkan"],
    ["LABEL","Penanda ASLI atau PALSU pada arsip warga"],
    ["ARSIP","Kumpulan catatan & dokumen resmi kota"],
    ["SINYAL","Nama labmu; juga tanda yang dipancarkan"],
    ["SUMBER","Asal sebuah informasi, wajib dicek"],
    ["MENARA","Gedung raksasa penyimpan arsip nasional"],
    ["FORENSIK","Ilmu memeriksa bukti secara teliti"],
    ["KURATOR","Jabatan penjaga & pengurus arsip"],
    ["RELAI","Alat kecil penerus sinyal"],
    ["PROLOG","Bagian pembuka sebuah cerita"],
    ["OPERATOR","Sebutan untukmu di Lab SINYAL"],
    ["JEJAK","Bekas proses; yang tak dimiliki mesin"],
    ["KABUR","Tidak jelas; ciri klaim buatan AI"],
    ["EMPATI","Rasa yang sulit dipalsukan mesin"],
    ["VERIFIKASI","Proses memastikan sesuatu benar"],
    ["MANIPULASI","Mengubah fakta agar menyesatkan"],
    ["NARASI","Alur cerita yang membingkai informasi"],
    ["BUKTI","Dasar yang membuat klaim bisa dipercaya"],
    ["KONTEKS","Latar yang membuat fakta bermakna utuh"],
    ["SATIRE","Sindiran; sering dikira berita sungguhan"],
    ["KLISE","Ungkapan usang; sering muncul di teks AI"],
    ["DATA","Angka & fakta mentah sebelum diolah"],
    ["ZOMBI","Sebutan kata megah tapi kosong makna"],
    ["JURNALIS","Profesi pencari & penulis berita"],
    ["MERCUSUAR","Julukan Renata untuk sistem label pertama"],
  ];

  /* ---------- state ---------- */
  const ROUND_WORDS=6;      // jumlah kata per sesi
  const TOTAL_TIME=100;     // detik untuk seluruh sesi
  const BONUS_ADD=6;        // detik bonus tiap kata benar
  let queue=[], cur=null, slots=[], picks=[], score=0, solved=0, timeLeft=0, timer=null, running=false, built=false;

  /* ---------- util ---------- */
  const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
  function beepOk(){ try{ if(typeof sfx!=="undefined"&&sfx.ok) sfx.ok(); }catch(e){} }
  function beepNo(){ try{ if(typeof sfx!=="undefined"&&sfx.lose) sfx.lose(); else if(typeof beep==="function") beep(160,.12,"sawtooth",.04); }catch(e){} }
  function click(){ try{ if(typeof sfx!=="undefined"&&sfx.click) sfx.click(); }catch(e){} }

  /* ---------- bangun overlay ---------- */
  function build(){
    if(built) return; built=true;
    const ov=document.createElement("div");
    ov.id="wordgame"; ov.className="wg hidden";
    ov.innerHTML=''
      +'<div class="wg-box">'
      +'  <div class="wg-top">'
      +'    <button id="wgQuit" class="wg-quit">✕ Keluar</button>'
      +'    <div class="wg-score">SKOR <b id="wgScore">0</b></div>'
      +'    <div class="wg-round" id="wgRound">1 / '+ROUND_WORDS+'</div>'
      +'  </div>'
      +'  <div class="wg-timerbar"><i id="wgTimerFill"></i></div>'
      +'  <div class="wg-time" id="wgTime">'+TOTAL_TIME+'s</div>'
      +'  <div class="wg-cluelbl">PETUNJUK</div>'
      +'  <div class="wg-clue" id="wgClue">—</div>'
      +'  <div class="wg-slots" id="wgSlots"></div>'
      +'  <div class="wg-tiles" id="wgTiles"></div>'
      +'  <div class="wg-ctrl">'
      +'    <button id="wgBack" class="wg-btn">⌫ Hapus</button>'
      +'    <button id="wgShuffle" class="wg-btn">↻ Acak</button>'
      +'    <button id="wgSkip" class="wg-btn">Lewati »</button>'
      +'  </div>'
      +'  <div class="wg-end hidden" id="wgEnd"></div>'
      +'</div>';
    document.body.appendChild(ov);
    $("wgQuit").onclick=()=>{ click(); quit(); };
    $("wgBack").onclick=()=>{ click(); backspace(); };
    $("wgShuffle").onclick=()=>{ click(); reshuffle(); };
    $("wgSkip").onclick=()=>{ click(); skip(); };
  }

  /* ---------- alur sesi ---------- */
  function start(){
    build();
    queue=shuffle(BANK.slice()).slice(0,ROUND_WORDS);
    score=0; solved=0; timeLeft=TOTAL_TIME; running=true;
    $("wgScore").textContent="0";
    $("wgEnd").classList.add("hidden");
    $("wordgame").classList.remove("hidden");
    try{ if(typeof bgmGameStart==="function") bgmGameStart(); }catch(e){}
    tickStart();
    nextWord();
  }
  function tickStart(){
    clearInterval(timer);
    timer=setInterval(()=>{
      timeLeft--;
      paintTimer();
      if(timeLeft<=0){ timeLeft=0; paintTimer(); finish(); }
    },1000);
    paintTimer();
  }
  function paintTimer(){
    const f=$("wgTimerFill"); if(f) f.style.width=(timeLeft/TOTAL_TIME*100)+"%";
    const t=$("wgTime"); if(t) t.textContent=timeLeft+"s";
    if(f) f.classList.toggle("low", timeLeft<=15);
  }
  function nextWord(){
    const total=ROUND_WORDS;
    const doneN=total-queue.length;
    $("wgRound").textContent=Math.min(doneN+1,total)+" / "+total;
    if(!queue.length){ finish(); return; }
    cur=queue.shift();
    const word=cur[0], clue=cur[1];
    slots=new Array(word.length).fill(null);
    picks=[];
    $("wgClue").textContent=clue;
    renderSlots();
    renderTiles(shuffle(word.split("")));
  }
  function renderSlots(){
    const el=$("wgSlots"); el.innerHTML="";
    slots.forEach((ch,i)=>{
      const s=document.createElement("div");
      s.className="wg-slot"+(ch?" filled":"");
      s.textContent=ch||"";
      s.onclick=()=>{ if(ch){ click(); removeAt(i); } };
      el.appendChild(s);
    });
  }
  let tileEls=[];
  function renderTiles(letters){
    const el=$("wgTiles"); el.innerHTML=""; tileEls=[];
    letters.forEach((ch,i)=>{
      const t=document.createElement("button");
      t.className="wg-tile"; t.textContent=ch; t.dataset.i=i;
      t.onclick=()=>place(t, ch);
      el.appendChild(t); tileEls.push(t);
    });
  }
  function place(tileEl, ch){
    if(tileEl.disabled) return;
    const empty=slots.indexOf(null);
    if(empty<0) return;
    click();
    slots[empty]=ch; picks.push({el:tileEl, slot:empty});
    tileEl.disabled=true; tileEl.classList.add("used");
    renderSlots();
    if(slots.indexOf(null)<0) check();
  }
  function removeAt(slotIdx){
    const pi=picks.findIndex(p=>p.slot===slotIdx);
    if(pi<0) return;
    const p=picks.splice(pi,1)[0];
    slots[p.slot]=null;
    p.el.disabled=false; p.el.classList.remove("used");
    renderSlots();
  }
  function backspace(){
    if(!picks.length) return;
    const p=picks.pop(); slots[p.slot]=null;
    p.el.disabled=false; p.el.classList.remove("used");
    renderSlots();
  }
  function reshuffle(){
    const remaining=tileEls.filter(t=>!t.disabled).map(t=>t.textContent);
    // pertahankan yang sudah dipasang, acak sisanya
    const el=$("wgTiles");
    const placed=tileEls.filter(t=>t.disabled);
    const shuf=shuffle(remaining);
    el.innerHTML=""; tileEls=[];
    // render ulang: yang used tetap used
    // gabung: buat set huruf penuh dari kata, tandai used sesuai picks
    const word=cur[0].split("");
    const usedCount={};
    picks.forEach(p=>{ const c=slots[p.slot]; usedCount[c]=(usedCount[c]||0)+1; });
    let pool=shuffle(word.slice());
    const need={}; word.forEach(c=>need[c]=(need[c]||0)+1);
    // tampilkan semua huruf; disable sebanyak yang sudah dipakai
    const disableLeft=Object.assign({},usedCount);
    pool.forEach((ch)=>{
      const t=document.createElement("button");
      t.className="wg-tile"; t.textContent=ch;
      if(disableLeft[ch]>0){ t.disabled=true; t.classList.add("used"); disableLeft[ch]--; }
      t.onclick=()=>place(t,ch);
      el.appendChild(t); tileEls.push(t);
    });
  }
  function check(){
    const guess=slots.join("");
    if(guess===cur[0]){
      solved++;
      const bonus=Math.max(5, timeLeft>0?12:5);
      score+=20+bonus; timeLeft+=BONUS_ADD;
      $("wgScore").textContent=score; paintTimer();
      beepOk();
      flash("ok");
      setTimeout(nextWord, 620);
    }else{
      beepNo(); flash("no");
      timeLeft=Math.max(1,timeLeft-3); paintTimer();
      setTimeout(()=>{ // kosongkan slot, buka tile
        slots=new Array(cur[0].length).fill(null); picks=[];
        tileEls.forEach(t=>{ t.disabled=false; t.classList.remove("used"); });
        renderSlots();
      }, 420);
    }
  }
  function flash(kind){
    const b=$("wgSlots"); if(!b) return;
    b.classList.remove("ok","no"); void b.offsetWidth; b.classList.add(kind);
    setTimeout(()=>b.classList.remove(kind), 500);
  }
  function skip(){ if(!running) return; timeLeft=Math.max(1,timeLeft-5); paintTimer(); nextWord(); }

  function finish(){
    running=false; clearInterval(timer);
    const total=ROUND_WORDS;
    const perfect = solved===total;
    const end=$("wgEnd");
    end.innerHTML=''
      +'<div class="wg-end-h">'+(perfect?"SEMPURNA!":"SESI SELESAI")+'</div>'
      +'<div class="wg-end-stat">Kata tersusun: <b>'+solved+' / '+total+'</b></div>'
      +'<div class="wg-end-score">SKOR AKHIR<br><b>'+score+'</b></div>'
      +'<div class="wg-end-btns">'
      +'  <button id="wgAgain" class="wg-btn primary">MAIN LAGI</button>'
      +'  <button id="wgHome" class="wg-btn">KEMBALI</button>'
      +'</div>';
    end.classList.remove("hidden");
    $("wgAgain").onclick=()=>{ click(); start(); };
    $("wgHome").onclick=()=>{ click(); quit(); };
    beepOk();
  }
  function quit(){
    running=false; clearInterval(timer);
    $("wordgame").classList.add("hidden");
    try{ if(typeof bgmGameStop==="function") bgmGameStop(); if(typeof bgmTitleStart==="function") bgmTitleStart(); }catch(e){}
    try{ if(typeof show==="function" && typeof hub!=="undefined") show(hub); }catch(e){}
  }

  /* ---------- API ---------- */
  window.startWordGame=start;
})();
