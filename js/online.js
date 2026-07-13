/* ================================================================
   SINYAL — TANDING ONLINE (P2P via PeerJS)
   Tanpa server sendiri: browser kedua pemain terhubung langsung
   lewat WebRTC; broker publik PeerJS hanya untuk perkenalan awal.
   Alur: host BUAT ROOM (kode 4 huruf) → lawan GABUNG dengan kode
   → keduanya memainkan paket & urutan soal yang sama di perangkat
   masing-masing → progres lawan tampil live → hasil dibandingkan.
   ================================================================ */
const OL_PREFIX="sinyal-duel-";
let olPeer=null, olConn=null, olIsHost=false;
let olOppName="LAWAN", olOppIdx=0, olOppScore=0, olOppDone=false, olOppFinal=0;
let olLocalDoneFlag=false, olActive=false;

const duel=$("duel");
window.MODE_META = window.MODE_META || {}; // tambahkan baris ini
MODE_META.online={label:"ONLINE", promptQ:"SIAPA PEMBUATNYA?", tag:"SPESIMEN TEKS"};

/* ---------- util ---------- */
function olCode(){
  const C="ABCDEFGHJKMNPQRSTUVWXYZ23456789"; let c="";
  for(let i=0;i<4;i++) c+=C[Math.floor(Math.random()*C.length)];
  return c;
}
function olStatus(t){ const el=$("duelStatus"); if(el) el.textContent=t; }
function olCleanup(){
  olActive=false; olLocalDoneFlag=false; olOppDone=false; olOppIdx=0; olOppScore=0;
  try{ if(olConn) olConn.close(); }catch(e){}
  try{ if(olPeer) olPeer.destroy(); }catch(e){}
  olConn=null; olPeer=null;
  $("duelMenu").classList.remove("hidden");
  $("duelWait").classList.add("hidden");
}

/* ---------- HOST ---------- */
function olHost(){
  if(typeof Peer === "undefined"){
    olStatus("PeerJS gagal dimuat — cek koneksi internet.");
    return;
  }

  sfx.click();

  $("duelMenu").classList.add("hidden");
  $("duelWait").classList.remove("hidden");

  const code = olCode();

  $("roomCode").textContent = code;

  olStatus("menghubungi broker…");

  olIsHost = true;

  olPeer = new Peer(
    OL_PREFIX + code.toLowerCase()
  );

  olPeer.on("open", id => {
    console.log("HOST OPEN:", id);
    olStatus(
      "room aktif · menunggu lawan…"
    );
  });

  olPeer.on("error", e => {
    console.error(
      "HOST ERROR:",
      e
    );

    if(e.type === "unavailable-id"){
      olCleanup();
      olHost();
      return;
    }

    olStatus(
      "gangguan koneksi: " +
      e.type
    );
  });

  olPeer.on("connection", conn => {

    if(olConn){
      conn.close();
      return;
    }

    console.log(
      "PLAYER CONNECTED:",
      conn.peer
    );

    olConn = conn;

    olWire();

    console.log("HOST READY");

    olStatus(
      "lawan terhubung! menyiapkan arena…"
    );

    currentPaket =
      PAKET[
        Math.floor(
          Math.random() *
          PAKET.length
        )
      ];

    const order =
      shuffle(
        currentPaket.soal.map(
          (_,i)=>i
        )
      );

    setTimeout(() => {

      conn.send({
        t:"start",
        paketId: currentPaket.id,
        order,
        name: PLAYER || "HOST"
      });

      olBegin(
        currentPaket,
        order
      );

    }, 500);

    conn.on("error", e => {
      console.error(
        "HOST CONNECTION ERROR:",
        e
      );
    });
  });
}

/* ---------- JOIN ---------- */
function olJoin(){
  if(typeof Peer === "undefined"){
    olStatus("PeerJS gagal dimuat — cek koneksi internet.");
    return;
  }

  const code = ($("joinCode").value || "")
    .trim()
    .toUpperCase();

  if(code.length !== 4){
    beep(160,.1,"sawtooth",.03);
    return;
  }

  sfx.click();

  $("duelMenu").classList.add("hidden");
  $("duelWait").classList.remove("hidden");

  $("roomCode").textContent = code;
  olStatus("mencari room " + code + "…");

  olIsHost = false;

  olPeer = new Peer();

  olPeer.on("open", id => {
    console.log("JOIN OPEN:", id);

    olConn = olPeer.connect(
      OL_PREFIX + code.toLowerCase(),
      {
        reliable: true
      }
    );

    // INI YANG HILANG TADI
    olWire();

    console.log(
      "CONNECT TO:",
      OL_PREFIX + code.toLowerCase()
    );

    olConn.on("open", () => {
      console.log("JOIN DATA OPEN");

      olStatus(
        "terhubung! menunggu host memulai…"
      );

      olConn.send({
        t: "hello",
        name: PLAYER || "TAMU"
      });
    });

    olConn.on("error", e => {
      console.error(
        "CONNECTION ERROR:",
        e
      );
    });

    olConn.on("close", () => {
      console.log(
        "JOIN CONNECTION CLOSED"
      );
    });
  });

  olPeer.on("error", e => {
    console.error(
      "JOIN ERROR:",
      e
    );

    if(e.type === "peer-unavailable"){
      olStatus(
        "room " + code +
        " tidak ditemukan. Cek kodenya."
      );
    } else {
      olStatus(
        "gangguan koneksi: " +
        e.type
      );
    }
  });
}

/* ---------- pesan masuk ---------- */
function olWire(){
  olConn.on("data",msg=>{
    if(!msg||!msg.t) return;
    if(msg.t==="hello"){ olOppName=(msg.name||"LAWAN").slice(0,12); }
    if(msg.t==="start" && !olIsHost){
      olOppName=(msg.name||"LAWAN").slice(0,12);
      const pk=PAKET.find(x=>x.id===msg.paketId)||PAKET[0];
      currentPaket=pk;
      olBegin(pk, msg.order);
    }
    if(msg.t==="prog"){ olOppIdx=msg.i; olOppScore=msg.s; olOppChip(); }
    if(msg.t==="done"){
      olOppDone=true; olOppFinal=msg.s;
      olOppName=(msg.name||olOppName).slice(0,12);
      if(olLocalDoneFlag) olEnd();
      else olOppChip();
    }
  });
  olConn.on("close",()=>{ if(olActive) olDropped(); });
  olConn.on("error",()=>{ if(olActive) olDropped(); });
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
  if(!olConn) return;
  try{ olConn.send({t:"prog", i:idx+1, s:score}); }catch(e){}
}
function onlineLocalDone(){
  olLocalDoneFlag=true;
  try{ olConn && olConn.send({t:"done", s:score, name:PLAYER||"AKU"}); }catch(e){}
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
  try{ if(olConn) olConn.close(); }catch(e){}
  try{ if(olPeer) olPeer.destroy(); }catch(e){}
  olConn=null; olPeer=null;
}
function onlineAbort(){ // dipanggil saat pemain menekan "kembali ke lab" di tengah duel
  try{ olConn && olConn.send({t:"done", s:score, name:PLAYER||"AKU"}); }catch(e){}
  olActive=false; olTeardownSoft(); olCleanup();
}

/* ---------- events ---------- */
$("duelLocal").addEventListener("click",()=>{ startGame("tanding"); });
$("duelHost").addEventListener("click",olHost);
$("duelJoin").addEventListener("click",olJoin);
$("joinCode").addEventListener("keydown",e=>{ if(e.key==="Enter") olJoin(); });
$("duelBack").addEventListener("click",()=>{ olCleanup(); });
