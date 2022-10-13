const canvas = document.querySelector('canvas'),
  ctx = canvas.getContext('2d');

const W = canvas.width = 500,
  H = canvas.height = 500;

let GAMEOVER = false;

const size = 15,
  canvasOffset = 10,
  cellOffset = 1;

let canChangeMove = true;

const colors = ['#7fa278', '#313131', '#df0513'];

let grid = [];

const snake = {
  body: [
    {
      x: ~~(size / 2),
      y: ~~(size / 2)
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
  for (let i = 0; i < size; i++) {
    const line = [];
    for (let j = 0; j < size; j++) {
      let type = 0;
      if (snake.body[0].x == j && snake.body[0].y == i) { type = 1 }
      if (apple.x == j && apple.y == i) { type = 2 }
      line.push({
        x: j, y: i, type: type, s: (W - (canvasOffset) * 2) / size - 3
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

  if (!GAMEOVER) {
    drawGrid();
  
    snake.body.forEach((part) => {
      const {x,y} = part;
      grid[y][x].type = 1;
    })
  } else {
    ctx.fillText('GAMEOVER', 10, 10);
  }
}

function drawGrid() {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const {x, y, s, type} = grid[i][j];
      ctx.fillStyle = colors[type];
      ctx.strokeStyle = colors[type];
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
  }
}

function update() {
  if (GAMEOVER)
    return;
  
  // GAMEOVER = gameEnded();
  makeMove();
  // console.log(GAMEOVER)
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
  if (newX > size - 1) {
    snake.down();
  }
  if (newY > size - 1) {
    snake.left();
  }
  if (newX < 0) {
    snake.up();
  }
  
  moves = getDir();

  newX = snake.body[0].x + moves.x;
  newY = snake.body[0].y + moves.y;
  
  const head = { x: newX, y: newY };
  // let last = ;
  snake.body.unshift(head);

  
  if (apple.x == newX && apple.y == newY) {
    snake.addPart(apple.x, apple.y);
    apple.changePos(grid);
    grid[apple.y][apple.x].type = 2;
  } else {
    let last = snake.body.pop()
    grid[last.y][last.x].type = 0;
  }
  
  grid[newY][newX].type = 1;
  canChangeMove = true;
}

createGrid();

setInterval(() => {
  update();
  draw();
}, 1000 / 10);