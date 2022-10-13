const canvas = document.querySelector('canvas'),
  ctx = canvas.getContext('2d');

const W = canvas.width = document.body.offsetWidth,
  H = canvas.height = document.body.offsetHeight;

let GAMEOVER = false;

const size = 25,
  canvasOffset = 5,
  cellOffset = 1;

const countH = ~~(H / size),
  countW = ~~(W / size);

let canChangeMove = true;

const colors = ['#7fa278', '#313131', '#df0513'];

let grid = [];

const snake = {
  body: [
    {
      x: ~~(countW / 2),
      y: ~~(countH / 2)
    },
    // {
    //   x: 10,
    //   y: 11
    // },
    // {
    //   x: 10,
    //   y: 12
    // },
    // {
    //   x: 11,
    //   y: 12
    // }
  ],
  dir: -90,
  addPart(x, y) {
    this.body.push({x, y});
  },
  left: function() { this.dir = 180 },
  right: function() { this.dir = 0 },
  up: function() { this.dir = -90 },
  down: function() { this.dir = 90 }
}

const apple = {
  x: ~~(Math.random() * size),
  y: ~~(Math.random() * size),
  changePos() {
    let x = ~~(Math.random() * size),
        y = ~~(Math.random() * size);
    while (this.checkNewPos(x, y)) {
      x = ~~(Math.random() * size), 
      y = ~~(Math.random() * size);
    }
    this.x = x;
    this.y = y;
  },
  checkNewPos(x, y) {
    return snake.body.find((p) => p.x == x && p.y == y);
  }
}

const directions = {'ArrowUp': -90, 'ArrowLeft': 180, 'ArrowDown': 90, 'ArrowRight': 0};

document.addEventListener('keydown', (e) => {
  if (!(isKeyAllowed(e.key) && isDirAllowed(e.key) && canChangeMove))
    return;
  canChangeMove = false;
  snake.dir = directions[e.key];
});

function isKeyAllowed(key) {
  return Object.keys(directions).includes(key)
}

function isDirAllowed(key) {
  if (key == 'ArrowUp' || key == 'ArrowDown') {
    return directions[key] != -snake.dir;
  } else {
    return directions[key] == 180 && snake.dir != 0 || directions[key] == 0 && snake.dir != 180;
  }
}

function createGrid() {
  grid = []
  for (let i = 0; i < countH; i++) {
    const line = [];
    for (let j = 0; j < countW; j++) {
      line.push({
        x: j, y: i
      })
    }
    grid.push(line);
  }
}

function gameEnded() {
  for (let i = 4; i < snake.body.length; i++) {
    if (snake.body[i].x === snake.body[0].x && snake.body[i].y === snake.body[0].y) {
      return true;
    }
  }

  return false;
}

function draw() {
  ctx.fillStyle = '#93bd8b';
  ctx.fillRect(0, 0, W, H);

  drawGrid();

  snake.body.forEach((part) => {
    drawCell(part.x, part.y, '#313131');
  });

  drawCell(apple.x, apple.y, '#df0513');
}

function drawGrid() {
  for (let i = 0; i < countH; i++) {
    for (let j = 0; j < countW; j++) {
      drawCell(grid[i][j].x, grid[i][j].y, '#7fa278');
    }
  }
}

function getSize() {
  if (W < H) {
    return countW;
  } else {
    return countW < countH ? countH : countW;
  }
}

function drawCell(x, y, color) {
  const s = (W - (canvasOffset) * 2) / getSize() - 3;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.strokeRect(
    x * (s + 3) + canvasOffset, 
    y * (s + 3) + canvasOffset, 
    s, 
    s);

  ctx.fillRect(
    x * (s + 3) + canvasOffset + 3, 
    y * (s + 3) + canvasOffset + 3, 
    s - 6, 
    s - 6);
}

function update() {  
  makeMove();
}

function getDir() {
  let x = ~~Math.cos(snake.dir * Math.PI / 180),
      y = ~~Math.sin(snake.dir * Math.PI / 180);

  return { x: x, y: y};
}

function makeMove() {
  let moves = getDir();
  let newX = snake.body[0].x + moves.x;
  let newY = snake.body[0].y + moves.y;

  if (newY < 0) {
    snake.right();
  }
  if (newX > countW - 1) {
    snake.down();
  }
  if (newY > countH - 1) {
    snake.left();
  }
  if (newX < 0) {
    snake.up();
  }
  
  moves = getDir();

  newX = snake.body[0].x + moves.x;
  newY = snake.body[0].y + moves.y;
  
  const head = { x: newX, y: newY };
  snake.body.unshift(head);

  if (apple.x == newX && apple.y == newY) {
    apple.changePos();
  } else {
    snake.body.pop()
  }
  
  canChangeMove = true;
}

createGrid();

setInterval(() => {
  if (gameEnded()) {
    ctx.fillStyle = '#fff';
    ctx.font = 'normal 48px monospace';
    ctx.fillText('GameOver', 170, 250);
    return;
  }

  update();
  draw();
}, 1000 / 10);