// Y-position of the floor (ground level)
let floorY;

// Small objects the blob can bump (mischief)
let toys = [];

// Star particles for joyful landings
let stars = [];

// Flower positions for background decoration
let flowers = [];

// Object representing our player character ("blob")
let blob2 = {
  // Position
  x: 260,
  y: 0,

  // Visual properties
  r: 26, // Base radius of the blob
  points: 48, // Number of points used to draw the blob shape
  wobble: 7, // How much the blob's edge can deform
  wobbleFreq: 0.9, // Controls how smooth or noisy the wobble is

  // Time values for animation
  t: 0, // Time offset for noise animation
  tSpeed: 0.01, // How fast the blob "breathes"

  // Velocity (speed)
  vx: 0, // Horizontal velocity
  vy: 0, // Vertical velocity

  // Movement tuning
  accel: 0.5, // How quickly the blob accelerates left/right
  maxRun: 4.0, // Maximum horizontal speed
  gravity: 0.6, // Constant downward force
  jumpV: -10.5, // Initial upward velocity when jumping

  // State flags
  onGround: false, // Tracks whether the blob is touching the floor

  // Friction values
  frictionAir: 0.995, // Less friction while in the air
  frictionGround: 0.88, // More friction while on the ground
};

function setup() {
  createCanvas(520, 320);

  // Position the floor near the bottom of the canvas
  floorY = height - 40;

  noStroke();
  textFont("sans-serif");
  textSize(14);

  // Start the blob resting on the floor
  blob2.y = floorY - blob2.r - 1;

  // Create small bumpable objects (mischief toys)
  for (let i = 0; i < 6; i++) {
    toys.push({
      x: random(60, width - 60),
      y: floorY - 10,
      r: 8,
      vx: 0,
    });
  }

  // Generate flower positions for the background
  for (let i = 0; i < 12; i++) {
    flowers.push({
      x: random(20, width - 20),
      y: random(floorY - 60, floorY - 20),
      size: random(6, 12),
      petalColor: color(random(150, 255), random(100, 255), random(150, 255)),
      centerColor: color(255, 200, 50)
    });
  }
}

function draw() {
  background(240);

  // --- Draw flowers in the background ---
  for (let f of flowers) {
    drawFlower(f.x, f.y, f.size, f.petalColor, f.centerColor);
  }

  // --- Draw the floor ---
  fill(200);
  rect(0, floorY, width, height - floorY);

  // --- Draw mischief objects ---
  fill(255, 200, 80);
  for (let t of toys) {
    circle(t.x, t.y, t.r * 2);
  }

  // --- Handle horizontal input ---
  let move = 0;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) move -= 1;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) move += 1;
  blob2.vx += blob2.accel * move;

  // --- Apply friction ---
  blob2.vx *= blob2.onGround ? blob2.frictionGround : blob2.frictionAir;

  // --- Limit horizontal speed ---
  blob2.vx = constrain(blob2.vx, -blob2.maxRun, blob2.maxRun);

  // --- Gravity and movement ---
  blob2.vy += blob2.gravity;
  blob2.x += blob2.vx;
  blob2.y += blob2.vy;

  // --- Ground collision detection ---
  if (blob2.y + blob2.r >= floorY) {
    blob2.y = floorY - blob2.r;
    if (!blob2.onGround && blob2.vy > 1) {
      spawnStars(blob2.x, floorY);
    }
    blob2.vy = 0;
    blob2.onGround = true;
  } else {
    blob2.onGround = false;
  }

  // --- Mischief interaction ---
  for (let t of toys) {
    let d = dist(blob2.x, blob2.y, t.x, t.y);
    if (d < blob2.r + t.r) {
      t.vx += blob2.vx * 0.5;
    }
    t.x += t.vx;
    t.vx *= 0.9;
    t.x = constrain(t.x, t.r, width - t.r);
  }

  // --- Keep blob inside the screen horizontally ---
  blob2.x = constrain(blob2.x, blob2.r, width - blob2.r);

  // --- Animate the blob shape ---
  blob2.t += blob2.tSpeed;
  drawBlob(blob2);

  // --- Draw smiley face on blob ---
  drawSmiley(blob2.x, blob2.y, blob2.r);

  // --- Update and draw star particles ---
  updateStars();

  // --- UI text ---
  fill(0);
  text("Move: A/D or ←/→  •  Jump: Space/W/↑", 10, 18);
}

// Draws a soft, organic blob using Perlin noise
function drawBlob(b) {
  fill(20, 120, 255);
  beginShape();
  for (let i = 0; i < b.points; i++) {
    const a = (i / b.points) * TAU;
    const n = noise(
      cos(a) * b.wobbleFreq + 100,
      sin(a) * b.wobbleFreq + 100,
      b.t,
    );
    const r = b.r + map(n, 0, 1, -b.wobble, b.wobble);
    vertex(b.x + cos(a) * r, b.y + sin(a) * r);
  }
  endShape(CLOSE);
}

// --- Draw a smiley face on the blob ---
function drawSmiley(x, y, r) {
  fill(0);
  // Eyes
  circle(x - r / 3, y - r / 4, r / 5);
  circle(x + r / 3, y - r / 4, r / 5);
  // Smile
  noFill();
  stroke(0);
  strokeWeight(2);
  arc(x, y + r / 8, r / 1.5, r / 1.5, 0, PI);
  noStroke();
}

// Handle jump input
function keyPressed() {
  if ((key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) && blob2.onGround) {
    blob2.vy = blob2.jumpV;
    blob2.onGround = false;
  }
}

// --- Star particle helpers ---
function spawnStars(x, y) {
  for (let i = 0; i < 10; i++) {
    stars.push({
      x: x,
      y: y,
      vx: random(-3, 3),
      vy: random(-6, -2),
      life: 30,
      r: random(3, 5),
      rot: random(TAU),
    });
  }
}

function updateStars() {
  for (let i = stars.length - 1; i >= 0; i--) {
    const s = stars[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.2;
    s.life--;

    push();
    translate(s.x, s.y);
    rotate(s.rot);
    fill(255, 220, 80, map(s.life, 0, 30, 50, 255));
    drawStar(0, 0, s.r, s.r * 2, 5);
    pop();

    if (s.life <= 0) {
      stars.splice(i, 1);
    }
  }
}

function drawStar(x, y, r1, r2, n) {
  beginShape();
  for (let i = 0; i < n * 2; i++) {
    const a = (i * PI) / n;
    const r = i % 2 === 0 ? r2 : r1;
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape(CLOSE);
}

// --- Flower drawing helper ---
function drawFlower(x, y, size, petalColor, centerColor) {
  fill(petalColor);
  for (let i = 0; i < 5; i++) {
    ellipse(
      x + cos((i * TWO_PI) / 5) * size,
      y + sin((i * TWO_PI) / 5) * size,
      size,
      size
    );
  }
  fill(centerColor);
  circle(x, y, size);
}

/* Quick tuning notes for students:
   Slippery floor → frictionGround = 0.95
   Higher jump    → jumpV = -12
   Heavier feel   → gravity = 0.8
*/
