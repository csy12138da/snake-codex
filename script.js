const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const speedEl = document.getElementById("speed");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const GRID = 20;
const CELL = canvas.width / GRID;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let best = 0;
let tickMs = 160;
let loopId = null;
let paused = true;

function resetGame() {
  snake = [
    { x: 6, y: 10 },
    { x: 5, y: 10 },
    { x: 4, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  tickMs = 160;
  paused = true;
  placeFood();
  updateUI();
  render();
}

function placeFood() {
  let valid = false;
  while (!valid) {
    food = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
    valid = !snake.some((seg) => seg.x === food.x && seg.y === food.y);
  }
}

function updateUI() {
  scoreEl.textContent = score;
  bestEl.textContent = best;
  speedEl.textContent = `${Math.round(160 / tickMs)}x`;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#1f7a8c";
  snake.forEach((seg, idx) => {
    const inset = idx === 0 ? 3 : 1;
    ctx.fillRect(
      seg.x * CELL + inset,
      seg.y * CELL + inset,
      CELL - inset * 2,
      CELL - inset * 2
    );
  });

  ctx.fillStyle = "#f25c54";
  ctx.beginPath();
  ctx.arc(
    food.x * CELL + CELL / 2,
    food.y * CELL + CELL / 2,
    CELL / 2.6,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function step() {
  if (paused) return;

  direction = nextDirection;
  const head = snake[0];
  const next = { x: head.x + direction.x, y: head.y + direction.y };

  if (next.x < 0 || next.x >= GRID || next.y < 0 || next.y >= GRID) {
    pauseGame();
    return;
  }

  if (snake.some((seg) => seg.x === next.x && seg.y === next.y)) {
    pauseGame();
    return;
  }

  snake.unshift(next);

  if (next.x === food.x && next.y === food.y) {
    score += 10;
    if (score > best) best = score;
    tickMs = Math.max(70, tickMs - 6);
    placeFood();
  } else {
    snake.pop();
  }

  updateUI();
  render();
  schedule();
}

function schedule() {
  clearTimeout(loopId);
  loopId = setTimeout(step, tickMs);
}

function pauseGame() {
  paused = true;
  clearTimeout(loopId);
}

function toggleGame() {
  if (paused) {
    paused = false;
    schedule();
  } else {
    pauseGame();
  }
}

function setDirection(x, y) {
  if (direction.x === -x && direction.y === -y) return;
  nextDirection = { x, y };
}

startBtn.addEventListener("click", () => toggleGame());
restartBtn.addEventListener("click", () => {
  resetGame();
  paused = false;
  schedule();
});

window.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "arrowup":
    case "w":
      setDirection(0, -1);
      break;
    case "arrowdown":
    case "s":
      setDirection(0, 1);
      break;
    case "arrowleft":
    case "a":
      setDirection(-1, 0);
      break;
    case "arrowright":
    case "d":
      setDirection(1, 0);
      break;
    case " ":
      toggleGame();
      break;
    default:
      return;
  }
  e.preventDefault();
});

const storedBest = window.localStorage.getItem("snake_best");
if (storedBest) best = Number(storedBest);

setInterval(() => {
  if (best > 0) window.localStorage.setItem("snake_best", String(best));
}, 1000);

resetGame();
