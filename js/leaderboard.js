/* ================================================================
   SINYAL — PAPAN SKOR (LOKAL)
   Tersimpan di localStorage perangkat pengguna → cocok untuk
   GitHub Pages (tanpa server). Kalau localStorage diblokir
   (mis. preview sandbox), otomatis fallback ke memori sesi.

   CATATAN: untuk papan skor GLOBAL (semua pengguna), butuh backend.
   Lihat README.md bagian "Roadmap online".
   ================================================================ */
const LB_KEY = "sinyal_leaderboard_v1";
let lbMemory = []; // fallback

function lbStorageOk(){
  try{
    localStorage.setItem("__t","1"); localStorage.removeItem("__t");
    return true;
  }catch(e){ return false; }
}
const LB_PERSIST = lbStorageOk();

function lbGet(){
  if(!LB_PERSIST) return [...lbMemory];
  try{ return JSON.parse(localStorage.getItem(LB_KEY)||"[]"); }
  catch(e){ return []; }
}

function lbAdd(name, score, mode){
  const entry={ name:(name||"ANON").toUpperCase().slice(0,12),
                score, mode, date:new Date().toISOString().slice(0,10) };
  const list=lbGet();
  list.push(entry);
  list.sort((a,b)=>b.score-a.score);
  const top=list.slice(0,20);
  if(LB_PERSIST){ try{ localStorage.setItem(LB_KEY, JSON.stringify(top)); }catch(e){} }
  else lbMemory=top;
  return top;
}

function lbRender(container){
  const list=lbGet();
  if(list.length===0){
    container.innerHTML='<div class="lb"><div class="empty">Belum ada skor tercatat.<br>Mainkan mode INFINITE atau KARIR untuk mengukir nama.</div></div>';
    return;
  }
  let rows='<div class="row head"><span>#</span><span>NAMA</span><span>MODE</span><span style="text-align:right">SKOR</span></div>';
  list.slice(0,10).forEach((e,i)=>{
    rows+=`<div class="row"><span class="rank">${String(i+1).padStart(2,"0")}</span>
      <span class="nm">${e.name}</span><span class="md">${e.mode}</span>
      <span class="sc">${e.score}</span></div>`;
  });
  container.innerHTML=rows;
}

/* ================================================================
   PAPAN SKOR GLOBAL — via server relay Deno Deploy (lihat js/online.js)
   Fallback diam-diam kalau server relay belum diatur / offline.
   ================================================================ */
function lbHttpBase(){
  if(typeof OL_WS_URL==="undefined" || OL_WS_URL.includes("GANTI-DENGAN")) return null;
  return OL_WS_URL.replace(/^ws/,"http");
}
async function lbSubmitGlobal(name, score, mode){
  const base=lbHttpBase(); if(!base) return;
  try{
    await fetch(base+"/leaderboard", {
      method:"POST", headers:{"content-type":"application/json"},
      body:JSON.stringify({ name:(name||"ANON").toUpperCase().slice(0,12), score, mode })
    });
  }catch(e){ /* offline — skor lokal tetap tersimpan */ }
}
async function lbRenderGlobal(container){
  const base=lbHttpBase();
  if(!base){ container.innerHTML='<div class="empty">Server global belum diatur.</div>'; return; }
  container.innerHTML='<div class="empty">memuat papan skor global…</div>';
  try{
    const res=await fetch(base+"/leaderboard");
    const list=await res.json();
    if(!Array.isArray(list) || list.length===0){
      container.innerHTML='<div class="empty">Belum ada skor global tercatat.</div>'; return;
    }
    let rows='<div class="row head"><span>#</span><span>NAMA</span><span>MODE</span><span style="text-align:right">SKOR</span></div>';
    list.slice(0,10).forEach((e,i)=>{
      rows+=`<div class="row"><span class="rank">${String(i+1).padStart(2,"0")}</span>
        <span class="nm">${e.name}</span><span class="md">${e.mode}</span>
        <span class="sc">${e.score}</span></div>`;
    });
    container.innerHTML=rows;
  }catch(e){
    container.innerHTML='<div class="empty">Gagal memuat — cek koneksi internet.</div>';
  }
}
