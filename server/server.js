const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const { createRoom, getRoom, removeUser } = require("./rooms");
const { addOperation, undo, redo } = require("./drawing-state");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

io.on("connection", socket => {
  let currentRoom = null;

  socket.on("join-room", roomId => {
    currentRoom = roomId;
    const room = createRoom(roomId);

    room.users.add(socket.id);
    socket.join(roomId);

    socket.emit("room-joined", {
      roomId,
      users: Array.from(room.users),
      operations: room.drawingState.operations
    });

    socket.to(roomId).emit("user-joined", {
      userId: socket.id,
      count: room.users.size
    });
  });

  socket.on("stroke-point", data => {
    socket.to(data.roomId).emit("stroke-point", data);
  });

  socket.on("stroke-end", data => {
    const room = getRoom(data.roomId);
    if (!room) return;

    addOperation(room.drawingState, data.operation);
    io.to(data.roomId).emit("stroke-commit", data.operation);
  });

  // 🔁 GLOBAL UNDO
  socket.on("undo", roomId => {
    const room = getRoom(roomId);
    if (!room) return;

    const ops = undo(room.drawingState);
    io.to(roomId).emit("canvas-reset", ops);
  });

  // 🔁 GLOBAL REDO
  socket.on("redo", roomId => {
    const room = getRoom(roomId);
    if (!room) return;

    const ops = redo(room.drawingState);
    io.to(roomId).emit("canvas-reset", ops);
  });

  socket.on("disconnect", () => {
    if (!currentRoom) return;

    const room = getRoom(currentRoom);
    removeUser(currentRoom, socket.id);

    if (room) {
      socket.to(currentRoom).emit("user-left", {
        userId: socket.id,
        count: room.users.size
      });
    }
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
