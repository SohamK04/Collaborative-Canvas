const canvas = document.getElementById("canvas");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const eraserBtn = document.getElementById("eraserBtn");
const usersLabel = document.getElementById("users");
const statusLabel = document.getElementById("status");

let roomId = null;
let joined = false;
let userCount = 0;
let lastEmit = 0;
let erasing = false;

initCanvas(canvas);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height =
    window.innerHeight - document.getElementById("toolbar").offsetHeight;
}
resize();
window.addEventListener("resize", resize);

document.getElementById("joinBtn").onclick = () => {
  roomId = document.getElementById("roomInput").value.trim();
  if (roomId) joinRoom(roomId);
};

document.getElementById("undoBtn").onclick = () => joined && undo(roomId);
document.getElementById("redoBtn").onclick = () => joined && redo(roomId);

eraserBtn.onclick = () => {
  erasing = !erasing;
  eraserBtn.innerText = erasing ? "Brush" : "Eraser";
};

canvas.addEventListener("mousedown", e => {
  if (!joined) return;
  startStroke(
    getPos(canvas, e),
    erasing ? "#ffffff" : colorPicker.value,
    brushSize.value
  );
});

canvas.addEventListener("mousemove", e => {
  const stroke = continueStroke(getPos(canvas, e));
  if (!stroke) return;

  const now = Date.now();
  if (now - lastEmit > 16) {
    sendPoint({
      roomId,
      from: stroke.points.at(-2),
      to: stroke.points.at(-1),
      color: stroke.color,
      width: stroke.width
    });
    lastEmit = now;
  }
});

canvas.addEventListener("mouseup", () => {
  const done = endStroke();
  if (done) sendStroke(done, roomId);
});

socket.on("room-joined", data => {
  joined = true;
  userCount = data.users.length;
  usersLabel.innerText = `Users online: ${userCount}`;
  redrawCanvas(canvas, data.operations);
  statusLabel.innerText = "Joined room";
});

socket.on("user-joined", data => {
  userCount = data.count;
  usersLabel.innerText = `Users online: ${userCount}`;
});

socket.on("user-left", data => {
  userCount = data.count;
  usersLabel.innerText = `Users online: ${userCount}`;
});

socket.on("stroke-point", data => {
  drawLine(data.from, data.to, data.color, data.width);
});

socket.on("canvas-reset", ops => redrawCanvas(canvas, ops));
