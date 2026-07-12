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
