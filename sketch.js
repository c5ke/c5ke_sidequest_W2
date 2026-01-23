// Y-position of the floor (ground level)
let floorY;

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
}

function draw() {
  background(240);

  // --- Draw the floor ---
  fill(200);
  rect(0, floorY, width, height - floorY);

  // --- Handle horizontal input ---
  // move will be:
  // -1 for left, +1 for right, 0 for no input
  let move = 0;

  // A key or left arrow → move left
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) move -= 1;

  // D key or right arrow → move right
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) move += 1;

  // Apply acceleration based on input
  blob2.vx += blob2.accel * move;

  // --- Apply friction ---
  // Use stronger friction on the ground, weaker in the air
  blob2.vx *= blob2.onGround ? blob2.frictionGround : blob2.frictionAir;

  // --- Limit horizontal speed ---
  blob2.vx = constrain(blob2.vx, -blob2.maxRun, blob2.maxRun);

  // --- Gravity and movement ---
  // Gravity always increases downward velocity
  blob2.vy += blob2.gravity;

  // Update position using velocity
  blob2.x += blob2.vx;
  blob2.y += blob2.vy;

  // --- Ground collision detection ---
  // Check if the blob has gone below the floor
  if (blob2.y + blob2.r >= floorY) {
    // Snap blob back to the floor
    blob2.y = floorY - blob2.r;

    // Stop downward movement
    blob2.vy = 0;

    // Blob is now grounded
    blob2.onGround = true;
  } else {
    blob2.onGround = false;
  }

  // --- Keep blob inside the screen horizontally ---
  blob2.x = constrain(blob2.x, blob2.r, width - blob2.r);

  // --- Animate the blob shape ---
  // Advance time for noise-based wobble
  blob2.t += blob2.tSpeed;

  // Draw the blob
  drawBlob(blob2);

  // --- UI text ---
  fill(0);
  text("Move: A/D or ←/→  •  Jump: Space/W/↑", 10, 18);
}

// Draws a soft, organic blob using Perlin noise
function drawBlob(b) {
  fill(20, 120, 255);
  beginShape();

  // Loop around a full circle
  for (let i = 0; i < b.points; i++) {
    // Angle around the circle
    const a = (i / b.points) * TAU;

    // Sample Perlin noise using the angle and time
    // This creates smooth, animated deformation
    const n = noise(
      cos(a) * b.wobbleFreq + 100,
      sin(a) * b.wobbleFreq + 100,
      b.t,
    );

    // Map noise value to a radius offset
    const r = b.r + map(n, 0, 1, -b.wobble, b.wobble);

    // Convert polar coordinates to screen space
    vertex(b.x + cos(a) * r, b.y + sin(a) * r);
  }

  endShape(CLOSE);
}

// Handle jump input (only triggers once per key press)
function keyPressed() {
  // Jump only if the blob is on the ground
  if (
    (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) &&
    blob2.onGround
  ) {
    // Apply an instant upward velocity
    blob2.vy = blob2.jumpV;

    // Blob is now airborne
    blob2.onGround = false;
  }
}

/* Quick tuning notes for students:
   Slippery floor → frictionGround = 0.95
   Higher jump    → jumpV = -12
   Heavier feel   → gravity = 0.8
*/
