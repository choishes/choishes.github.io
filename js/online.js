/* ================================================================
   SINYAL — TANDING ONLINE (relay via WebSocket / Deno Deploy)
   Semua data duel lewat server relay (bukan WebRTC P2P) — jalan
   lintas device & jaringan apa pun, karena tidak butuh NAT traversal.
   Alur: host BUAT ROOM (kode 4 huruf) → lawan GABUNG dengan kode
   → keduanya memainkan paket & urutan soal yang sama di perangkat
   masing-masing → progres lawan tampil live → hasil dibandingkan.
   ================================================================ */
const OL_WS_URL = "wss://keen-myna-8956.choishes.deno.net";

let olWS=null, olIsHost=false, olMyRoom=null;
let olOppName="LAWAN", olOppIdx=0, olOppScore=0, olOppDone=false, olOppFinal=0;
let olLocalDoneFlag=false, olActive=false;

const duel=$("duel");
MODE_META.online={label:"ONLINE", promptQ:"SIAPA PEMBUATNYA?", tag:"SPESIMEN TEKS"};

/* ---------- util ---------- */
function olStatus(t){ const el=$("duelStatus"); if(el) el.textContent=t; }
function olSend(obj){ try{ if(olWS && olWS.readyState===1) olWS.send(JSON.stringify(obj)); }catch(e){} }
function olCleanup(){
  olActive=false; olLocalDoneFlag=false; olOppDone=false; olOppIdx=0; olOppScore=0;
  olMyRoom=null;
  try{ if(olWS) olWS.close(); }catch(e){}
  olWS=null;
  $("duelMenu").classList.remove("hidden");
  $("duelWait").classList.add("hidden");
}
function olConnect(onOpen){
  if(!/^wss?:\/\//.test(OL_WS_URL) || OL_WS_URL.includes("GANTI-DENGAN")){
    olStatus("server relay belum diatur — isi OL_WS_URL di js/online.js");
    return;
  }
  olWS=new WebSocket(OL_WS_URL);
  olWS.onopen=onOpen;
  olWS.onmessage=olOnMessage;
  olWS.onclose=()=>{ if(olActive) olDropped(); };
  olWS.onerror=()=>olStatus("gangguan koneksi ke server relay.");
}

/* ---------- HOST ---------- */
function olHost(){
  sfx.click();
  $("duelMenu").classList.add("hidden");
  $("duelWait").classList.remove("hidden");
  $("roomCode").textContent="…";
  olStatus("menghubungi server relay…");
  olIsHost=true;
  olConnect(()=>{
    olStatus("room aktif · menunggu lawan…");
    olSend({t:"create", name:PLAYER||"HOST"});
  });
}

/* ---------- JOIN ---------- */
function olJoin(){
  const code=($("joinCode").value||"").trim().toUpperCase();
  if(code.length!==4){ beep(160,.1,"sawtooth",.03); return; }
  sfx.click();
  $("duelMenu").classList.add("hidden");
  $("duelWait").classList.remove("hidden");
  $("roomCode").textContent=code;
  olStatus("mencari room "+code+"…");
  olIsHost=false;
  olConnect(()=>{
    olMyRoom=code;
    olSend({t:"join", room:code, name:PLAYER||"TAMU"});
  });
}

/* ---------- pesan masuk dari server relay ---------- */
function olOnMessage(e){
  let msg; try{ msg=JSON.parse(e.data); }catch(err){ return; }
  if(!msg||!msg.t) return;

  if(msg.t==="created"){
    olMyRoom=msg.room;
    $("roomCode").textContent=msg.room;
    olStatus("room "+msg.room+" aktif · menunggu lawan…");
  }
  if(msg.t==="err"){
    olStatus(msg.msg||"gagal terhubung ke room.");
  }
  if(msg.t==="matched"){
    olOppName=(msg.opp||"LAWAN").slice(0,12);
    if(msg.host){
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
  $("restart").onclick=()=>{ sfx.click(); olCleanup(); show(duel); };
  olTeardownSoft();
}
function olDropped(){
  olActive=false;
  $("loadscreen").classList.add("hidden");
  endScreenBase("KONEKSI TERPUTUS", score, null,
    "Lawan meninggalkan pertandingan atau jaringan terputus.",
    "Skormu sejauh ini tetap tercatat di layar. Coba buat room baru.",
    false, false);
  $("restart").textContent="Arena Tanding";
  $("restart").onclick=()=>{ sfx.click(); olCleanup(); show(duel); };
  olTeardownSoft();
}
function olTeardownSoft(){
  try{ if(olWS) olWS.close(); }catch(e){}
  olWS=null;
}
function onlineAbort(){ // dipanggil saat pemain menekan "kembali ke lab" di tengah duel
  olSend({t:"relay", data:{t:"done", s:score, name:PLAYER||"AKU"}});
  olActive=false; olTeardownSoft(); olCleanup();
}

/* ---------- events ---------- */
$("duelLocal").addEventListener("click",()=>{ startGame("tanding"); });
$("duelHost").addEventListener("click",olHost);
$("duelJoin").addEventListener("click",olJoin);
$("joinCode").addEventListener("keydown",e=>{ if(e.key==="Enter") olJoin(); });
$("duelBack").addEventListener("click",()=>{ olCleanup(); });
