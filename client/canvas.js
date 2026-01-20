let ctx;
let drawing = false;
let lastPoint = null;
let currentStroke = null;
let isEraser = false;

function initCanvas(canvas) {
  ctx = canvas.getContext("2d");
}

function getPos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) {
    e.preventDefault();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function startStroke(point, color, width) {
  drawing = true;
  lastPoint = point;
  currentStroke = {
    id: Math.random().toString(36).slice(2),
    color,
    width,
    points: [point]
  };
  return currentStroke;
}

function continueStroke(point) {
  if (!drawing || !currentStroke) return null;
  drawLine(lastPoint, point, currentStroke.color, currentStroke.width);
  currentStroke.points.push(point);
  lastPoint = point;
  return currentStroke;
}

function endStroke() {
  drawing = false;
  const done = currentStroke;
  currentStroke = null;
  return done;
}

function drawLine(from, to, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function redrawCanvas(canvas, ops) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ops.forEach(op => {
    for (let i = 1; i < op.points.length; i++) {
      drawLine(op.points[i - 1], op.points[i], op.color, op.width);
    }
  });
}
