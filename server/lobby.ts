/* ================================================================
   SINYAL — LOBBY SERVER (opsional, pengembangan lanjutan)
   WebSocket relay sederhana untuk: daftar pemain online, matchmaking
   otomatis, dan relay pesan duel (pengganti PeerJS bila diperlukan).

   DEPLOY GRATIS KE DENO DEPLOY (tanpa kartu kredit):
   1. Buat akun di https://dash.deno.com (login GitHub).
   2. New Project → pilih repo ini → entry point: server/lobby.ts
      (atau paste file ini di playground project).
   3. Deploy. Kamu dapat URL: wss://NAMAPROYEK.deno.dev
   4. Di client, ganti PeerJS dengan koneksi WebSocket ke URL itu.

   Protokol (JSON):
   → {t:"join",  name}                    daftar ke lobby
   ← {t:"lobby", players:[{id,name}]}     siaran daftar online
   → {t:"invite", to}                     ajak pemain
   ← {t:"match", room, opp, host:bool}    dipasangkan
   → {t:"relay", room, data}              teruskan data duel
   ← {t:"relay", data}                    data duel dari lawan
   ================================================================ */
const players = new Map(); // id -> {ws, name, room}
let nextId = 1;

function lobbyList() {
  return [...players.entries()]
    .filter(([, p]) => !p.room)
    .map(([id, p]) => ({ id, name: p.name }));
}
function broadcastLobby() {
  const msg = JSON.stringify({ t: "lobby", players: lobbyList() });
  for (const [, p] of players) if (!p.room) try { p.ws.send(msg); } catch {}
}
function send(id, obj) {
  const p = players.get(id);
  if (p) try { p.ws.send(JSON.stringify(obj)); } catch {}
}

Deno.serve((req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("SINYAL lobby aktif. Sambungkan via WebSocket.", { status: 200 });
  }
  const { socket, response } = Deno.upgradeWebSocket(req);
  const id = "p" + (nextId++);

  socket.onopen = () => players.set(id, { ws: socket, name: "ANON", room: null });

  socket.onmessage = (e) => {
    let m; try { m = JSON.parse(e.data); } catch { return; }
    const me = players.get(id); if (!me) return;

    if (m.t === "join") {
      me.name = String(m.name || "ANON").slice(0, 12).toUpperCase();
      broadcastLobby();
    }
    if (m.t === "invite" && players.has(m.to)) {
      const opp = players.get(m.to);
      if (opp.room || me.room) return;
      const room = "r" + Date.now().toString(36);
      me.room = room; opp.room = room;
      send(id,   { t: "match", room, opp: opp.name, oppId: m.to, host: true  });
      send(m.to, { t: "match", room, opp: me.name,  oppId: id,   host: false });
      broadcastLobby();
    }
    if (m.t === "relay" && me.room) {
      for (const [pid, p] of players)
        if (pid !== id && p.room === me.room) send(pid, { t: "relay", data: m.data });
    }
  };

  const drop = () => {
    const me = players.get(id);
    if (me?.room) // beri tahu lawan
      for (const [pid, p] of players)
        if (pid !== id && p.room === me.room) { p.room = null; send(pid, { t: "opp_left" }); }
    players.delete(id);
    broadcastLobby();
  };
  socket.onclose = drop;
  socket.onerror = drop;

  return response;
});
