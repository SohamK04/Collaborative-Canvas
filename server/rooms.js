const { createDrawingState } = require("./drawing-state");

const rooms = new Map();

function createRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Set(),
      drawingState: createDrawingState()
    });
  }
  return rooms.get(roomId);
}

function getRoom(roomId) {
  return rooms.get(roomId);
}

function removeUser(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.users.delete(socketId);

  if (room.users.size === 0) {
    rooms.delete(roomId);
  }
}

module.exports = {
  createRoom,
  getRoom,
  removeUser
};
