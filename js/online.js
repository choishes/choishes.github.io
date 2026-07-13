/* ================================================================
   SINYAL — TANDING ONLINE (relay via WebSocket / Deno Deploy)
   Semua data duel lewat server relay (bukan WebRTC P2P) — jalan
   lintas device & jaringan apa pun, karena tidak butuh NAT traversal.
   Dua cara main: (1) lihat daftar pemain online → klik AJAK MAIN,
   atau (2) BUAT ROOM (kode 4 huruf) / GABUNG dengan kode ke teman.
   ================================================================ */
const OL_WS_URL = "wss://keen-myna-8956.choishes.deno.net";

let olWS=null, olIsHost=false, olMyId=null;
let olOppName="LAWAN", olOppIdx=0, olOppScore=0, olOppDone=false, olOppFinal=0;
let olLocalDoneFlag=false, olActive=false;

const duel=$("duel");

/* ---------- util ---------- */
function olStatus(t){ const el=$("duelStatus"); if(el) el.textContent=t; }
function olSend(obj){ try{ if(olWS && olWS.readyState===1) olWS.send(JSON.stringify(obj)); }catch(e){} }
function olShowWait(){ $("duelMenu").classList.add("hidden"); $("duelWait").classList.remove("hidden"); }
function olShowMenu(){ $("duelMenu").classList.remove("hidden"); $("duelWait").classList.add("hidden"); }

/* ---------- koneksi lobby (dibuka begitu layar TANDING → online dibuka) ---------- */
function olEnterLobby(){
  if(olWS && (olWS.readyState===0 || olWS.readyState===1)) return; // sudah connect/menyambung
  olRenderOnlineList([]);
  const box=$("onlineList"); if(box) box.innerHTML='<div class="olempty">menghubungkan…</div>';
  if(!/^wss?:\/\//.test(OL_WS_URL) || OL_WS_URL.includes("GANTI-DENGAN")){
    if(box) box.innerHTML='<div class="olempty">server relay belum diatur.</div>';
    return;
  }
  olWS=new WebSocket(OL_WS_URL);
  olWS.onopen=()=>olSend({t:"hello", name:PLAYER||"ANON"});
  olWS.onmessage=olOnMessage;
  olWS.onclose=()=>{ if(olActive) olDropped(); };
  olWS.onerror=()=>{ if(box && !olActive) box.innerHTML='<div class="olempty">gagal terhubung ke server relay.</div>'; };
}
function olLeaveLobby(){
  olActive=false; olLocalDoneFlag=false; olOppDone=false; olOppIdx=0; olOppScore=0; olMyId=null;
  try{ if(olWS) olWS.close(); }catch(e){}
  olWS=null;
  olShowMenu();
}
/* jalankan fn begitu koneksi lobby siap (menunggu sebentar kalau masih connecting) */
function olWithConn(fn){
  if(olWS && olWS.readyState===1){ fn(); return; }
  olEnterLobby();
  let tries=0;
  const iv=setInterval(()=>{
    tries++;
    if(olWS && olWS.readyState===1){ clearInterval(iv); fn(); }
    else if(tries>60){ clearInterval(iv); olStatus("gagal terhubung ke server relay."); }
  },100);
}

/* ---------- daftar pemain online ---------- */
function olRenderOnlineList(players){
  const box=$("onlineList"); if(!box) return;
  if(!players || players.length===0){
    box.innerHTML='<div class="olempty">belum ada pemain lain online. Tunggu sebentar, atau pakai kode room.</div>';
    return;
  }
  box.innerHTML=players.map(p=>
    '<div class="olrow"><span class="olname">'+p.name+'</span>'+
    '<button class="cta small ghost olinvite" data-id="'+p.id+'" data-name="'+p.name+'">AJAK MAIN</button></div>'
  ).join("");
  box.querySelectorAll(".olinvite").forEach(btn=>{
    btn.addEventListener("click",()=>{
      sfx.click();
      box.querySelectorAll(".olinvite").forEach(b=>b.disabled=true);
      olStatus("mengajak "+btn.dataset.name+"…");
      olSend({t:"invite", to:btn.dataset.id});
    });
  });
}

/* ---------- BUAT ROOM (kode manual) ---------- */
function olHost(){
  sfx.click(); olIsHost=true;
  $("roomCode").textContent="…";
  olShowWait();
  olStatus("membuat room…");
  olWithConn(()=>{
    olSend({t:"create"});
  });
}

/* ---------- GABUNG (kode manual) ---------- */
function olJoin(){
  const code=($("joinCode").value||"").trim().toUpperCase();
  if(code.length!==4){ beep(160,.1,"sawtooth",.03); return; }
  sfx.click(); olIsHost=false;
  $("roomCode").textContent=code;
  olShowWait();
  olStatus("mencari room "+code+"…");
  olWithConn(()=>{
    olSend({t:"join", room:code});
  });
}

/* ---------- pesan masuk dari server relay ---------- */
function olOnMessage(e){
  let msg; try{ msg=JSON.parse(e.data); }catch(err){ return; }
  if(!msg||!msg.t) return;

  if(msg.t==="hello_ok"){ olMyId=msg.id; }
  if(msg.t==="online"){ olRenderOnlineList(msg.players); }

  if(msg.t==="created"){
    $("roomCode").textContent=msg.room;
    olStatus("room "+msg.room+" aktif · menunggu lawan…");
  }
  if(msg.t==="err"){
    olStatus(msg.msg||"gagal terhubung ke room.");
  }
  if(msg.t==="matched"){
    olIsHost=!!msg.host;
    olOppName=(msg.opp||"LAWAN").slice(0,12);
    olShowWait();
    $("roomCode").textContent="VS "+olOppName;
    if(olIsHost){
      olStatus("lawan terhubung! menyiapkan arena…");
      currentPaket=PAKET[Math.floor(Math.random()*PAKET.length)];
      const order=shuffle(currentPaket.soal.map((_,i)=>i));
      olSend({t:"relay", data:{t:"start", paketId:currentPaket.id, order, name:PLAYER||"HOST"}});
      olBegin(currentPaket, order);
    }else{
      olStatus("terhubung! menunggu host memulai…");
    }
  }
  if(msg.t==="relay"){
    const d=msg.data; if(!d||!d.t) return;
    if(d.t==="start" && !olIsHost){
      const pk=PAKET.find(x=>x.id===d.paketId)||PAKET[0];
      currentPaket=pk;
      olBegin(pk, d.order);
    }
    if(d.t==="prog"){ olOppIdx=d.i; olOppScore=d.s; olOppChip(); }
    if(d.t==="done"){
      olOppDone=true; olOppFinal=d.s;
      olOppName=(d.name||olOppName).slice(0,12);
      if(olLocalDoneFlag) olEnd();
      else olOppChip();
    }
  }
  if(msg.t==="opp_left"){ if(olActive) olDropped(); }
}

/* ---------- mulai pertandingan ---------- */
function olBegin(pk, order){
  olActive=true; olLocalDoneFlag=false; olOppDone=false; olOppIdx=0; olOppScore=0;
  mode="online"; bgmGameStart();
  deck=order.map(i=>({type:"teks", ...pk.soal[i]}));
  playLoading("tanding", pk.nama, ()=>{
    idx=0; score=0;
    setupBoardUI({track:true, lives:false, turn:true,
      chip:"ONLINE · PAKET "+String(pk.id).padStart(2,"0")});
    $("turnchip").textContent="VS "+olOppName;
    show(game); render();
    $("turnchip").classList.remove("hidden"); // render() menyembunyikan; buka lagi utk chip lawan
    olOppChip();
  });
}

function olOppChip(){
  const el=$("turnchip"); if(!el || mode!=="online") return;
  el.classList.remove("hidden");
  el.textContent = olOppDone
    ? olOppName+" SELESAI · "+olOppFinal+" ✓"
    : olOppName+" · "+olOppIdx+"/"+deck.length+" · "+olOppScore+" ✓";
}

/* ---------- hook dari game.js ---------- */
function onlineOnAnswer(correct){
  olSend({t:"relay", data:{t:"prog", i:idx+1, s:score}});
}
function onlineLocalDone(){
  olLocalDoneFlag=true;
  olSend({t:"relay", data:{t:"done", s:score, name:PLAYER||"AKU"}});
  if(olOppDone){ olEnd(); return; }
  /* layar tunggu memakai loadscreen */
  $("ldTitle").textContent="PERTANDINGAN ONLINE";
  $("ldFill").style.width="100%";
  $("ldLog").textContent="selesai! menunggu "+olOppName+" menuntaskan soalnya…";
  $("loadscreen").classList.remove("hidden","fadeout");
}
function olEnd(){
  $("loadscreen").classList.add("hidden");
  olActive=false;
  const me=score, op=olOppFinal;
  const title = me===op ? "DUEL ONLINE — SERI" : (me>op ? "DUEL ONLINE — KAMU MENANG!" : "DUEL ONLINE — "+olOppName+" MENANG");
  sfx.done();
  endScreenBase(title, me+" : "+op, null,
    me===op ? "Sama tajam — atau tertipu di soal yang sama."
            : "Paket yang sama, urutan yang sama, insting yang berbeda.",
    "Dua orang di dua tempat menatap spesimen identik dan sampai pada vonis berbeda — persis cara hoaks membelah persepsi publik. <b>Sinyalnya sama; pembacanya yang berbeda.</b>",
    false, false);
  $("restart").textContent="Arena Tanding";
  $("restart").onclick=()=>{ sfx.click(); olLeaveLobby(); show(duel); olEnterLobby(); };
}
function olDropped(){
  olActive=false;
  $("loadscreen").classList.add("hidden");
  endScreenBase("KONEKSI TERPUTUS", score, null,
    "Lawan meninggalkan pertandingan atau jaringan terputus.",
    "Skormu sejauh ini tetap tercatat di layar. Coba buat room baru.",
    false, false);
  $("restart").textContent="Arena Tanding";
  $("restart").onclick=()=>{ sfx.click(); olLeaveLobby(); show(duel); olEnterLobby(); };
}
function onlineAbort(){ // dipanggil saat pemain menekan "kembali ke lab" di tengah duel
  olSend({t:"relay", data:{t:"done", s:score, name:PLAYER||"AKU"}});
  olActive=false; olLeaveLobby();
}

/* ---------- events ---------- */
$("duelLocal").addEventListener("click",()=>{ startGame("tanding"); });
$("duelHost").addEventListener("click",olHost);
$("duelJoin").addEventListener("click",olJoin);
$("joinCode").addEventListener("keydown",e=>{ if(e.key==="Enter") olJoin(); });
$("duelBack").addEventListener("click",()=>{ olLeaveLobby(); });
