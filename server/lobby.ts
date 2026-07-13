/* ================================================================
   SINYAL — RELAY DUEL ONLINE + LOBBY + LEADERBOARD (Deno Deploy)
   Menggantikan PeerJS/WebRTC: semua data duel lewat server ini,
   jadi tidak butuh NAT traversal P2P — jalan lintas device & jaringan.

   PENTING — kenapa pakai Deno KV + BroadcastChannel, bukan Map biasa:
   Deno Deploy menjalankan server ini di banyak isolate (bisa beda
   region) sekaligus. Dua koneksi WebSocket yang berbeda bisa mendarat
   di isolate yang berbeda pula — sebuah Map in-memory biasa TIDAK
   dibagi antar-isolate, jadi "room" yang dibuat di satu isolate tidak
   akan ketemu dari isolate lain (persis penyebab bug "device lain gak
   ketemu room"-nya). Deno KV adalah database yang dibagi semua isolate,
   dan BroadcastChannel meneruskan pesan real-time ke isolate lain yang
   memegang koneksi socket tujuan.

   DEPLOY GRATIS KE DENO DEPLOY (tanpa kartu kredit, tanpa git):
   1. Buka https://dash.deno.com (login GitHub) → New Project → Playground.
   2. Paste isi file ini, deploy. Kamu dapat URL: https://NAMAPROYEK.deno.dev
   3. Di js/online.js, set OL_WS_URL ke "wss://NAMAPROYEK.deno.dev".

   Protokol WebSocket (JSON):
   → {t:"hello", name}               daftarkan nama, tampil di lobby online
   ← {t:"hello_ok", id}              server kasih tahu id socket kamu
   ← {t:"online", players:[{id,name}]}  siaran daftar pemain yg lagi bebas
   → {t:"invite", to}                ajak pemain lain dari daftar online
   → {t:"create"}                    minta room baru (kode dibagikan manual)
   ← {t:"created", room}             kode room (4 huruf)
   → {t:"join", room}                gabung dgn kode
   ← {t:"matched", host:bool, opp}   dikirim ke KEDUA pemain saat berpasangan
   ← {t:"err", msg}                  create/join/invite gagal
   → {t:"relay", data}               kirim data duel apa adanya ke lawan
   ← {t:"relay", data}               data duel dari lawan
   ← {t:"opp_left"}                  lawan putus/keluar

   HTTP (leaderboard global, disimpan di Deno KV):
   GET  /leaderboard   → 20 skor teratas (JSON array)
   POST /leaderboard   → {name, score, mode} simpan skor baru
   ================================================================ */
const kv = await Deno.openKv();
const bc = new BroadcastChannel("sinyal-relay");

const sockets = new Map(); // id -> {ws, name, hostingCode?}
let nextId = 1;

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type",
};
const ONLINE_TTL = 30 * 60 * 1000;  // 30 menit — jaga-jaga kalau onclose gagal terpanggil
const ROOM_TTL   = 15 * 60 * 1000;  // 15 menit — kode room basi otomatis hilang
const MATE_TTL   = 2 * 60 * 60 * 1000; // 2 jam — cukup untuk satu sesi duel

function send(ws, obj) { try { ws.send(JSON.stringify(obj)); } catch {} }

/* ---------- jembatan antar-isolate ---------- */
function deliverTo(id, payload) {
  const local = sockets.get(id);
  if (local) { send(local.ws, payload); return; }
  bc.postMessage({ type: "deliver", to: id, payload });
}
async function pushOnlineToLocals() {
  const list = [];
  for await (const e of kv.list({ prefix: ["online"] })) list.push({ id: String(e.key[1]), name: e.value.name });
  for (const [id, s] of sockets) send(s.ws, { t: "online", players: list.filter(p => p.id !== id) });
}
function broadcastRefresh() {
  bc.postMessage({ type: "refresh_online" });
  pushOnlineToLocals();
}
bc.onmessage = (e) => {
  const msg = e.data;
  if (msg.type === "deliver") {
    const local = sockets.get(msg.to);
    if (local) send(local.ws, msg.payload);
  } else if (msg.type === "refresh_online") {
    pushOnlineToLocals();
  }
};

async function freshRoomCode() {
  const C = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < 6; i++) {
    const c = Array.from({ length: 4 }, () => C[Math.floor(Math.random() * C.length)]).join("");
    if (!(await kv.get(["room", c])).value) return c;
  }
  return Date.now().toString(36).toUpperCase().slice(-4);
}

/* ---------- leaderboard global (stateless per-request, aman lintas isolate) ---------- */
async function handleLeaderboard(req) {
  if (req.method === "GET") {
    const list = [];
    for await (const e of kv.list({ prefix: ["lb"] })) list.push(e.value);
    list.sort((a, b) => b.score - a.score);
    return new Response(JSON.stringify(list.slice(0, 20)), { headers: { ...CORS, "content-type": "application/json" } });
  }
  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return new Response("bad json", { status: 400, headers: CORS }); }
    const name = String(body.name || "ANON").toUpperCase().slice(0, 12);
    const score = Number(body.score);
    const mode = String(body.mode || "").toUpperCase().slice(0, 20);
    if (!Number.isFinite(score) || score < 0 || score > 9999 || !["INFINITE", "KARIR"].includes(mode)) {
      return new Response("invalid", { status: 400, headers: CORS });
    }
    await kv.set(["lb", crypto.randomUUID()], { name, score, mode, date: new Date().toISOString().slice(0, 10) });
    return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, "content-type": "application/json" } });
  }
  return new Response("method not allowed", { status: 405, headers: CORS });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (url.pathname === "/leaderboard") return await handleLeaderboard(req);

  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("SINYAL relay aktif. Sambungkan via WebSocket.", { status: 200, headers: CORS });
  }
  const { socket, response } = Deno.upgradeWebSocket(req);
  const id = "p" + (nextId++) + "-" + crypto.randomUUID().slice(0, 6); // unik lintas isolate

  socket.onopen = () => sockets.set(id, { ws: socket, name: null });

  socket.onmessage = async (e) => {
    let m; try { m = JSON.parse(e.data); } catch { return; }
    const me = sockets.get(id); if (!me) return;

    if (m.t === "hello") {
      me.name = String(m.name || "ANON").toUpperCase().slice(0, 12);
      await kv.set(["online", id], { name: me.name }, { expireIn: ONLINE_TTL });
      send(socket, { t: "hello_ok", id });
      broadcastRefresh();
      return;
    }

    if (m.t === "invite") {
      const to = String(m.to || "");
      const meOnline = await kv.get(["online", id]);
      const oppOnline = await kv.get(["online", to]);
      if (!oppOnline.value) { send(socket, { t: "err", msg: "pemain itu sudah tidak online" }); return; }
      const res = await kv.atomic()
        .check(meOnline).check(oppOnline)
        .delete(["online", id]).delete(["online", to])
        .set(["roommate", id], to, { expireIn: MATE_TTL })
        .set(["roommate", to], id, { expireIn: MATE_TTL })
        .commit();
      if (!res.ok) { send(socket, { t: "err", msg: "coba lagi, pemain baru saja sibuk" }); return; }
      deliverTo(to, { t: "matched", host: false, opp: me.name || "LAWAN" });
      send(socket, { t: "matched", host: true, opp: oppOnline.value.name });
      broadcastRefresh();
      return;
    }

    if (m.t === "create") {
      const code = await freshRoomCode();
      me.hostingCode = code;
      await kv.delete(["online", id]);
      await kv.set(["room", code], { hostId: id, hostName: me.name || "HOST" }, { expireIn: ROOM_TTL });
      send(socket, { t: "created", room: code });
      broadcastRefresh();
      return;
    }

    if (m.t === "join") {
      const code = String(m.room || "").toUpperCase();
      const entry = await kv.get(["room", code]);
      if (!entry.value) { send(socket, { t: "err", msg: "room tidak ditemukan" }); return; }
      const { hostId, hostName } = entry.value;
      const res = await kv.atomic()
        .check(entry)
        .delete(["room", code]).delete(["online", id])
        .set(["roommate", hostId], id, { expireIn: MATE_TTL })
        .set(["roommate", id], hostId, { expireIn: MATE_TTL })
        .commit();
      if (!res.ok) { send(socket, { t: "err", msg: "room baru saja diambil, coba lagi" }); return; }
      deliverTo(hostId, { t: "matched", host: true, opp: me.name || "TAMU" });
      send(socket, { t: "matched", host: false, opp: hostName || "HOST" });
      broadcastRefresh();
      return;
    }

    if (m.t === "relay") {
      const mate = await kv.get(["roommate", id]);
      if (mate.value) deliverTo(mate.value, { t: "relay", data: m.data });
      return;
    }
  };

  const drop = async () => {
    const me = sockets.get(id);
    sockets.delete(id);
    await kv.delete(["online", id]);
    if (me?.hostingCode) await kv.delete(["room", me.hostingCode]);
    const mate = await kv.get(["roommate", id]);
    if (mate.value) {
      await kv.delete(["roommate", id]);
      await kv.delete(["roommate", mate.value]);
      deliverTo(mate.value, { t: "opp_left" });
    }
    broadcastRefresh();
  };
  socket.onclose = drop;
  socket.onerror = drop;

  return response;
});
