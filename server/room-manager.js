const crypto = require('crypto');

// In-memory room storage
const rooms = new Map();

function generateRoomCode() {
  // 6-char alphanumeric, uppercase for easy reading
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

function createRoom(presenterWs) {
  let code;
  do {
    code = generateRoomCode();
  } while (rooms.has(code));

  const room = {
    code,
    presenter: presenterWs,
    controllers: new Set(),
    state: { currentIndex: 0, totalSlides: 0, sections: [], isStreaming: false, qaState: null },
    createdAt: Date.now(),
  };
  rooms.set(code, room);
  console.log(`🏠 Room ${code} created`);
  return room;
}

function joinRoom(code, controllerWs) {
  const room = rooms.get(code);
  if (!room) return null;
  room.controllers.add(controllerWs);
  console.log(`📱 Controller joined room ${code} (${room.controllers.size} controllers)`);
  return room;
}

function leaveRoom(code, ws) {
  const room = rooms.get(code);
  if (!room) return;
  room.controllers.delete(ws);
  if (ws === room.presenter) {
    // Presenter left — notify all controllers and destroy room
    for (const ctrl of room.controllers) {
      try { ctrl.send(JSON.stringify({ type: 'room-closed' })); } catch {}
      try { ctrl.close(); } catch {}
    }
    rooms.delete(code);
    console.log(`🏠 Room ${code} destroyed (presenter left)`);
  }
}

function getRoom(code) {
  return rooms.get(code) || null;
}

function broadcastToControllers(room, message) {
  const data = JSON.stringify(message);
  for (const ctrl of room.controllers) {
    try { ctrl.send(data); } catch {}
  }
}

function sendToPresenter(room, message) {
  try { room.presenter.send(JSON.stringify(message)); } catch {}
}

// Cleanup stale rooms (>30 min with no presenter)
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.createdAt > 30 * 60 * 1000) {
      for (const ctrl of room.controllers) {
        try { ctrl.send(JSON.stringify({ type: 'room-closed' })); } catch {}
        try { ctrl.close(); } catch {}
      }
      rooms.delete(code);
      console.log(`🧹 Stale room ${code} cleaned up`);
    }
  }
}, 60 * 1000);

module.exports = { createRoom, joinRoom, leaveRoom, getRoom, broadcastToControllers, sendToPresenter };
