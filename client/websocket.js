const socket = io();

function joinRoom(roomId) {
  socket.emit("join-room", roomId);
}

function sendPoint(data) {
  socket.emit("stroke-point", data);
}

function sendStroke(operation, roomId) {
  socket.emit("stroke-end", { roomId, operation });
}

function undo(roomId) {
  socket.emit("undo", roomId);
}

function redo(roomId) {
  socket.emit("redo", roomId);
}
