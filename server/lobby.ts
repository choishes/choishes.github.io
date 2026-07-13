/* ================================================================
   SINYAL — RELAY DUEL ONLINE (WebSocket, jalan di Deno Deploy)
   Menggantikan PeerJS/WebRTC: semua data duel lewat server ini,
   jadi tidak butuh NAT traversal P2P — jalan lintas device & jaringan
   (termasuk WiFi vs data seluler), yang sering gagal di WebRTC murni.

   DEPLOY GRATIS KE DENO DEPLOY (tanpa kartu kredit, tanpa git):
   1. Buka https://dash.deno.com (login GitHub) → New Project → Playground.
   2. Paste isi file ini, deploy. Kamu dapat URL: https://NAMAPROYEK.deno.dev
   3. Di js/online.js, set OL_WS_URL ke "wss://NAMAPROYEK.deno.dev".

   Protokol (JSON), semua pesan dua arah kecuali disebutkan:
   → {t:"create", name}              host minta room baru
   ← {t:"created", room}             server balas kode room (4 huruf)
   → {t:"join", room, name}          tamu gabung dengan kode
   ← {t:"matched", host:bool, opp}   dikirim ke KEDUA pemain saat room penuh
   ← {t:"err", msg}                  join gagal (room tak ada / penuh)
   → {t:"relay", data}               kirim data duel apa adanya ke lawan
   ← {t:"relay", data}               data duel dari lawan
   ← {t:"opp_left"}                  lawan putus/keluar
   ================================================================ */
const rooms = new Map(); // code -> {host: {ws,name}, guest: {ws,name}|null}

function code() {
  const C = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let c;
  do {
    c = Array.from({ length: 4 }, () => C[Math.floor(Math.random() * C.length)]).join("");
  } while (rooms.has(c));
  return c;
}
function send(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch {}
}

Deno.serve((req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("SINYAL relay aktif. Sambungkan via WebSocket.", { status: 200 });
  }
  const { socket, response } = Deno.upgradeWebSocket(req);
  let myRoom = null; // kode room tempat socket ini terdaftar
  let iAmHost = false;

  socket.onmessage = (e) => {
    let m; try { m = JSON.parse(e.data); } catch { return; }

    if (m.t === "create") {
      const room = code();
      rooms.set(room, { host: { ws: socket, name: String(m.name || "HOST").slice(0, 12) }, guest: null });
      myRoom = room; iAmHost = true;
      send(socket, { t: "created", room });
      return;
    }

    if (m.t === "join") {
      const room = String(m.room || "").toUpperCase();
      const r = rooms.get(room);
      if (!r) { send(socket, { t: "err", msg: "room tidak ditemukan" }); return; }
      if (r.guest) { send(socket, { t: "err", msg: "room sudah penuh" }); return; }
      r.guest = { ws: socket, name: String(m.name || "TAMU").slice(0, 12) };
      myRoom = room; iAmHost = false;
      send(r.host.ws, { t: "matched", host: true, opp: r.guest.name });
      send(socket, { t: "matched", host: false, opp: r.host.name });
      return;
    }

    if (m.t === "relay" && myRoom) {
      const r = rooms.get(myRoom);
      if (!r) return;
      const other = iAmHost ? r.guest : r.host;
      if (other) send(other.ws, { t: "relay", data: m.data });
      return;
    }
  };

  const drop = () => {
    if (!myRoom) return;
    const r = rooms.get(myRoom);
    if (r) {
      const other = iAmHost ? r.guest : r.host;
      if (other) send(other.ws, { t: "opp_left" });
      rooms.delete(myRoom);
    }
    myRoom = null;
  };
  socket.onclose = drop;
  socket.onerror = drop;

  return response;
});
