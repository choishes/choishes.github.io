/* ==========================================================
   SINYAL — Deno WebRTC Signaling Server
   Supports:
   - 4 character room codes
   - create room
   - join room
   - offer / answer / ICE relay
   ========================================================== */

const rooms = new Map();

function makeCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

Deno.serve((req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("SINYAL signaling server online");
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  let roomId = null;

  socket.onmessage = (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); }
    catch { return; }

    if (msg.t === "create") {
      let code;
      do code = makeCode();
      while (rooms.has(code));

      rooms.set(code, new Set([socket]));
      roomId = code;

      socket.send(JSON.stringify({
        t: "created",
        room: code
      }));
    }

    if (msg.t === "join") {
      const room = rooms.get(msg.room);

      if (!room || room.size >= 2) {
        socket.send(JSON.stringify({
          t: "error",
          message: "room_not_found"
        }));
        return;
      }

      room.add(socket);
      roomId = msg.room;

      for (const peer of room) {
        peer.send(JSON.stringify({ t: "ready" }));
      }
    }

    if (["offer", "answer", "candidate"].includes(msg.t)) {
      const room = rooms.get(roomId);
      if (!room) return;

      for (const peer of room) {
        if (peer !== socket) {
          peer.send(ev.data);
        }
      }
    }
  };

  socket.onclose = () => {
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.delete(socket);

    for (const peer of room) {
      peer.send(JSON.stringify({ t: "opp_left" }));
    }

    if (room.size === 0) {
      rooms.delete(roomId);
    }
  };

  return response;
});
