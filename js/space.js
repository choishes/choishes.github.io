/* ================================================================
   SINYAL — LATAR ANGKASA
   Canvas fullscreen di belakang UI: bintang melayang perlahan
   dengan kedalaman (parallax), kelap-kelip halus, dan beberapa
   "nebula" blur yang mengapung. Hormat pada prefers-reduced-motion
   (bintang statis, tanpa animasi).
   ================================================================ */
(function(){
  const cv=document.getElementById("space");
  if(!cv) return;
  const cx=cv.getContext("2d");
  const RM=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W,H,stars=[],orbs=[];

  const PALETTE=["#3fe0c5","#9b7bff","#cfe8ff","#ffffff"];

  function resize(){
    W=cv.width=window.innerWidth;
    H=cv.height=window.innerHeight;
    seed();
  }

  function seed(){
    const n=Math.min(140, Math.floor(W*H/12000));
    stars=Array.from({length:n},()=>({
      x:Math.random()*W, y:Math.random()*H,
      z:Math.random(),                        // kedalaman 0..1
      r:0.4+Math.random()*1.6,
      c:PALETTE[Math.floor(Math.random()*PALETTE.length)],
      tw:Math.random()*Math.PI*2,             // fase kelap-kelip
      tws:0.4+Math.random()*1.2               // kecepatan kelip
    }));
    orbs=Array.from({length:3},(_,i)=>({
      x:Math.random()*W, y:Math.random()*H,
      r:120+Math.random()*160,
      c:i===0?"63,224,197":(i===1?"155,123,255":"255,194,71"),
      a:Math.random()*Math.PI*2,
      sp:0.00008+Math.random()*0.00012
    }));
  }

  function draw(t){
    cx.clearRect(0,0,W,H);
    /* nebula mengapung */
    for(const o of orbs){
      const ox=o.x+Math.cos(t*o.sp+o.a)*40;
      const oy=o.y+Math.sin(t*o.sp*0.8+o.a)*30;
      const g=cx.createRadialGradient(ox,oy,0,ox,oy,o.r);
      g.addColorStop(0,"rgba("+o.c+",0.06)");
      g.addColorStop(1,"rgba("+o.c+",0)");
      cx.fillStyle=g;
      cx.fillRect(ox-o.r,oy-o.r,o.r*2,o.r*2);
    }
    /* bintang melayang diagonal, makin dekat makin cepat & terang */
    for(const s of stars){
      if(!RM){
        s.x-=(0.03+s.z*0.12);
        s.y-=(0.015+s.z*0.06);
        if(s.x<-4){s.x=W+4; s.y=Math.random()*H;}
        if(s.y<-4){s.y=H+4; s.x=Math.random()*W;}
        s.tw+=0.016*s.tws;
      }
      const alpha=(0.25+s.z*0.55)*(RM?1:(0.7+0.3*Math.sin(s.tw)));
      cx.globalAlpha=alpha;
      cx.fillStyle=s.c;
      cx.beginPath();
      cx.arc(s.x,s.y,s.r*(0.6+s.z*0.7),0,Math.PI*2);
      cx.fill();
    }
    cx.globalAlpha=1;
  }

  let raf=null;
  function loop(t){ draw(t); raf=requestAnimationFrame(loop); }

  window.addEventListener("resize",resize);
  resize();
  if(RM){ draw(0); }              // statis untuk reduced motion
  else{ raf=requestAnimationFrame(loop); }

  /* hemat baterai: jeda saat tab tak terlihat */
  document.addEventListener("visibilitychange",()=>{
    if(RM) return;
    if(document.hidden){ cancelAnimationFrame(raf); raf=null; }
    else if(!raf && fxOn){ raf=requestAnimationFrame(loop); }
  });

  /* API untuk layar Pengaturan: nyalakan/matikan partikel */
  let fxOn=true;
  window.spaceFX=function(on){
    fxOn=on;
    cv.style.display = on ? "block" : "none";
    if(RM) return;
    if(!on){ cancelAnimationFrame(raf); raf=null; }
    else if(!raf){ raf=requestAnimationFrame(loop); }
  };
})();
