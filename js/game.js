import { createSpaceBackground } from "./background.js";
let spaceBackground;
import { createJoystick } from "./joystick.js";
let joystick;
import { setupLandscape, landscapeRequired } from "./landscape.js";
import { worldWidth as width, worldHeight as height, screenScale, canvasWidth, canvasHeight, updateScreen, remapPosition, screenPoint } from "./screen.js";
let mouseX = 0;
let mouseY = 0;

//MODULES
import MegaProjectile from "./megaprojectile.js";
let megaprojectiles = [];

import Projectile from "./projectile.js";
let projectiles = [];

import Ufo from "./ufo.js";
let ufox = new Ufo(450, 500);

import ShieldBuff from "./shieldbuff.js";
let shieldbuffs = [];

import HealthBuff from "./healthbuff.js";
let healthbuffs = [];

import Moon from "./moon.js";
let moonx = new Moon();

import Aura from "./aura.js";
let aurax = new Aura();

import Comet from "./comet.js";
let comets = [];

let state = "title";

let timer = 120;
let auraVisible = true;
let showFlyToWin = true;

let infiniteTimer = 0;

// GAME PHYSICS ETC
let ufoVertSpeed = 0;
let ufoHoriSpeed = 0;

let boosterStrength = 0.6;
const slowDownStrength = 0.95;

let health = 6;
let shield = false;

let showTitle = true;
let title;
let controls;

const buffup = new Audio("js/buffup.mp3");
buffup.loop = false;
buffup.volume = 0.6;
buffup.preload = "auto";
buffup.addEventListener("error", function (err) {
  console.error("Error loading audio:", err);
});

const crash = new Audio("js/click.mp3");
crash.loop = false;
crash.volume = 1;
crash.preload = "auto";
crash.addEventListener("error", function (err) {
  console.error("Error loading audio:", err);
});

const yay = new Audio("js/yay.mp3");
yay.loop = false;
yay.volume = 0.7;
yay.preload = "auto";
yay.addEventListener("error", function (err) {
  console.error("Error loading audio:", err);
});

const megacrash = new Audio("js/megahit.mp3");
megacrash.loop = false;
megacrash.volume = 0.8;
megacrash.preload = "auto";
megacrash.addEventListener("error", function (err) {
  console.error("Error loading audio:", err);
});

const aurahit = new Audio("js/aurasynth.mp3");
aurahit.loop = false;
aurahit.volume = 1;
aurahit.preload = "auto";
aurahit.addEventListener("error", function (err) {
  console.error("Error loading audio:", err);
});
//STARRY SKY INSPIRATION FROM LECTURES


// MENU BUTTON ELEMENTS
const difficultyBtn = document.getElementById("difficulty-bttn");
const infiniteBtn = document.getElementById("infinite-bttn");
const controlsBtn = document.getElementById("controls-bttn");
const menu = document.getElementById("menu");
const menuBtn = document.getElementById("menu-bttn");

// menu logic
difficultyBtn.addEventListener("click", function () {
  console.log("Normal Button Clicked!");

  menu.style.display = "none";
  if (health > 0) {
    state = "game";
  } else if (health <= 0) {
    state = "gameOver";
  }
});

infiniteBtn.addEventListener("click", function () {
  console.log("Infinite Button Clicked!");

  menu.style.display = "none";
  if (health > 0) {
    state = "infinite";
  } else if (health <= 0) {
    state = "infiniteGameOver";
  }
});

controlsBtn.addEventListener("click", function () {
  console.log("Controls Button Clicked!");

  menu.style.display = "none";
  state = "controls";
});

menuBtn.addEventListener("click", function () {
  showTitle = false;
  console.log("Menu Button Clicked!");

  menu.style.display = "block";
  state = "pause";
});

function preload() {
  title = loadImage("img/titledark2.png");
  controls = loadImage("img/controlscircles.png");
}
window.preload = preload;

function setup() {
  updateScreen(window.innerWidth, window.innerHeight);
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent("game-stage");
  canvas.elt.addEventListener("pointerdown", () => {
    if (state === "title" && !landscapeRequired()) showTitle = false;
  });
  fitStage();
  setupLandscape();
  spaceBackground = createSpaceBackground();
  joystick = createJoystick(document.getElementById("game-stage"));
  ufox.x = width * (450 / 1920);
  ufox.y = height * (500 / 1080);
  window.addEventListener("resize", windowResized);

  // Initialize comets
  for (let i = 0; i < 4; i++) {
    let x = Math.random() * width;
    let y = Math.random() * height;
    let speed = random(0.3, 1.5);
    comets.push(new Comet(x, y, speed));
  }

  //commenceArrowProjectiles();
  commenceShieldWallProjectiles();
  //commenceSlashProjectiles();
  setInterval(commenceShieldWallProjectiles, 6300); //6300
  setInterval(commenceArrowProjectiles, 9500); //9500
  setInterval(commenceSlashProjectiles, 5500); //5500
  setInterval(commenceMegaProjectiles, 15000); //15000
  setInterval(commenceHealthBuffs, 14000); //14000
  setInterval(commenceShieldBuffs, 20000); //20000

  // Create an audio element // HELP BY - used from Lunar Lander
  const bgMusic = new Audio("js/retrogamesambience.mp3");

  bgMusic.loop = true;
  bgMusic.volume = 0.6;
  bgMusic.preload = "auto";
  bgMusic.addEventListener("error", function (err) {
    console.error("Error loading audio:", err);
  });

  // Function to play the music and remove event listeners
  function playMusic() {
    // Play the music
    bgMusic.play().catch(function (error) {
      console.warn("Audio play failed:", error);
    });
    window.removeEventListener("mousedown", playMusic);
    window.removeEventListener("keydown", playMusic);
  }

  window.addEventListener("mousedown", playMusic);
  window.addEventListener("keydown", playMusic);
}
window.setup = setup;

function draw() {
  const portraitBlocked = landscapeRequired();
  joystick.setEnabled(!portraitBlocked && ["game", "infinite", "winState"].includes(state));
  spaceBackground.draw(performance.now(), screenScale);
  if (portraitBlocked) return;
  // Scale every drawing command, including stroke widths, text and images.
  // The world fills the viewport; artwork uses the same scale on both axes.
  mouseX = window.mouseX / screenScale;
  mouseY = window.mouseY / screenScale;
  push();
  scale(screenScale);
  // Set current state and draw based on said state
  drawGeneral();
  if (state === "pause") {
    pauseState();
    console.log("pause state");
  } else if (state === "game") {
    gameState();
    console.log("game state");
  } else if (state === "infinite") {
    infiniteState();
    console.log("infinite state");
  } else if (state === "infinitePause") {
    infinitePauseState();
  } else if (state === "title") {
    titleState();
  } else if (state === "gameOver") {
    gameOverState();
    drawGameOver();
    drawRestart();
  } else if (state === "infiniteGameOver") {
    infiniteGameOverState();
    drawGameOver();
    drawRestart();
    //Stashed changes
  } else if (state === "winState") {
    winState();
    if (ufox.x >= width + 100) {
      ufox.x = width + 100;
    } else if (ufox.x <= 150) {
      ufox.x = 150;
    } else if (ufox.y >= height - 150) {
      ufox.y = height - 150;
    } else if (ufox.y <= 150) {
      ufox.y = 150;
    }
  } else if (state === "controls") {
    controlsState();
  }

  drawTitle();
  drawCursor();
  removeTitle();
  restartGame();
  pop();
}
window.draw = draw;

// Searched how to use keyRelease rather than keyDown - help through p5's website
function keyReleased() {
  if (landscapeRequired()) return;
  if (keyCode === 27) {
    if (state === "pause") {
      state = "game";
      menu.style.display = "none";
    } else if (
      state === "game" ||
      state === "gameOver" ||
      state === "winState"
    ) {
      state = "pause";
      menu.style.display = "block";
    } else if (state === "infinite" || "infiniteGameOver") {
      state = "infinitePause";
      menu.style.display = "block";
    }
  }
}
window.keyReleased = keyReleased;

function removeTitle() {
  if (mouseIsPressed || keyIsDown(32) || keyIsDown(13)) {
    showTitle = false;
  }
}
// START TITLE
function drawTitle() {
  if (showTitle) {
    // Fit the intro inside the playfield, retaining the image's aspect ratio.
    const fit = Math.min(width * 0.60 / title.width, height * 0.78 / title.height);
    const w = title.width * fit;
    const h = title.height * fit;
    image(title, (width - w) / 2, (height - h) / 2, w, h);
  }
}
window.drawTitle = drawTitle;

function drawGameOver() {
  textAlign(CENTER, CENTER);
  textSize(128);
  fill(255, 196, 94);
  textFont("pain-de-mie, sans-serif");
  text("GAME MEOWER", width / 2, height / 2 - 50);
}
function flytoWin() {
  textAlign(CENTER, CENTER);
  textSize(128);
  fill(255, 196, 94);
  textFont("pain-de-mie, sans-serif");
  text("fly to the meown", width / 2, height / 2 - 50);
  textSize(60);
  text("to finish the game", width / 2, height / 2 + 50);
}
function gameWon() {
  textAlign(CENTER, CENTER);
  textSize(200);
  fill(255, 196, 94);
  textFont("pain-de-mie, sans-serif");
  text("YOU WON", width / 2, height / 2 - 50);
  textSize(60);
  text("thanks for playing", width / 2, height / 2 + 50);
}

let restartWidth = 300;
let restartHeight = 100;

function drawRestart() {
  textAlign(CENTER, CENTER);

  // makes the restart text interactive by checking whether the cursor is inside or outside of the the texts area
  if (
    mouseX >= width / 2 - 150 &&
    mouseX <= width / 2 + restartWidth - 150 &&
    mouseY >= height / 1.5 - 50 &&
    mouseY <= height / 1.5 + restartHeight - 50
  ) {
    textSize(112);
  } else if (
    mouseX < width / 2 - 150 ||
    mouseX > width / 2 + restartWidth - 150 ||
    mouseY < height / 1.5 - 50 ||
    mouseY > height / 1.5 + restartHeight - 50
  ) {
    textSize(96);
  }

  fill(255, 196, 94);
  textFont("pain-de-mie, sans-serif");
  text("RESTART", width / 2, height / 1.5);
}

document.addEventListener("mousedown", (event) => {
  // help from Chatgpt with "clickX" and "clickY" events: https://chatgpt.com/share/4977b91f-2a6b-4742-9dfd-1fe95a3c28d1
  const canvas = document.querySelector("#game-stage canvas");
  if (!canvas || event.target !== canvas || landscapeRequired()) return;
  const { x: clickX, y: clickY } = screenPoint(event.clientX, event.clientY, canvas.getBoundingClientRect());

  if (
    (clickX >= width / 2 - 150 &&
      clickX <= width / 2 + restartWidth - 150 &&
      clickY >= height / 1.5 - 50 &&
      clickY <= height / 1.5 + restartHeight - 50 &&
      ["gameOver", "winState", "infiniteGameOver"].includes(state)) // Check if the mouse is on top of the restart text when the state is set to "gameOver" or "winState"
  ) {
    location.reload();
  }
});

function restartGame() {
  if (
    (state === "gameOver" ||
      state === "winState" ||
      state === "infiniteGameOver") &&
    (keyIsDown(32) || keyIsDown(13))
  ) {
    showTitle = false;
    location.reload();
  }
}

function drawControls() {
  const fit = Math.min(width * 0.8 / controls.width, height * 0.75 / controls.height);
  let w = controls.width * fit;
  let h = controls.height * fit;

  image(controls, width / 2 - w / 2, height / 2 - h / 2, w, h);

  if (
    keyIsDown(87) ||
    keyIsDown(65) ||
    keyIsDown(83) ||
    keyIsDown(68) ||
    keyIsDown(40) ||
    keyIsDown(37) ||
    keyIsDown(38) ||
    keyIsDown(39)
  ) {
    state = "game";
  }
}

function drawTimer() {
  fill(255, 196, 94);
  textFont("pain-de-mie, sans-serif");
  textSize(64);
  text(timer, width / 3.4, 80);
}

function drawInfiniteTimer() {
  fill(255, 196, 94);
  textFont("pain-de-mie, sans-serif");
  textSize(64);
  text(infiniteTimer, width / 3.4, 80);
}

function fitStage() {
  const stage = document.getElementById("game-stage");
  stage.style.width = `${canvasWidth}px`;
  stage.style.height = `${canvasHeight}px`;
}

function windowResized() {
  const previous = { width, height };
  updateScreen(window.innerWidth, window.innerHeight);
  resizeCanvas(canvasWidth, canvasHeight);
  fitStage();
  // Keep each existing object at the same relative position after rotation.
  for (const object of [ufox, ...comets, ...projectiles,
    ...megaprojectiles, ...healthbuffs, ...shieldbuffs]) {
    remapPosition(object, previous);
  }
  aurax.syncPosition();
}

//DRAW
function drawGeneral() {
  noStroke();
  clear();
  // Transparent gameplay canvas reveals the continuous, full-screen starfield.
  drawCommenceComet();
}
function drawCommenceComet() {
  for (let comet of comets) {
    comet.updatePosition();
    comet.draw();
  }
}

// How to keep specific amount of item on the screen help by AI - https://chatgpt.com/share/a280875f-ea21-4af9-a836-6a61f7dad987
//BUFFS n STUFFS
function commenceHealthBuffs() {
  if (landscapeRequired()) return;
  const healthBuffX = width + 100;
  const healthBuffY = random(height);

  if (healthbuffs.length < 1) {
    healthbuffs.push(new HealthBuff(healthBuffX, healthBuffY, 8));
  }
}
function drawHealthBuffs() {
  for (let healthbuff of healthbuffs) {
    healthbuff.updatePosition();
    healthbuff.livehpBuff();
    healthbuff.draw();
  }
}
function drawHealthBuffsStationary() {
  for (let healthbuff of healthbuffs) {
    healthbuff.livehpBuff();
    healthbuff.draw();
  }
}

function commenceShieldBuffs() {
  if (landscapeRequired()) return;
  const shieldBuffX = width + 100;
  const shieldBuffY = random(height);

  if (shieldbuffs.length < 1) {
    shieldbuffs.push(new ShieldBuff(shieldBuffX, shieldBuffY, 8));
  }
}
function drawShieldBuffs() {
  for (let shieldbuff of shieldbuffs) {
    shieldbuff.updatePosition();
    shieldbuff.liveshieldBuff();
    shieldbuff.draw();
  }
}
function drawShielfBuffsStationary() {
  for (let shieldbuff of shieldbuffs) {
    shieldbuff.liveshieldBuff();
    shieldbuff.draw();
  }
}

function commenceArrowProjectiles() {
  if (landscapeRequired()) return;
  const arrowX = width + 500;
  const arrowY = height / 2;
  const spacing = 150;

  if (projectiles.length < 8) {
    // Center
    projectiles.push(new Projectile(arrowX, arrowY, 11));
    // Upper right
    projectiles.push(
      new Projectile(arrowX + spacing, arrowY - spacing / 2, 10.5)
    );
    projectiles.push(
      new Projectile(arrowX + spacing, arrowY + spacing / 2, 10.5)
    );
    // Lower right
    projectiles.push(
      new Projectile(arrowX + spacing * 2, arrowY - spacing, 10)
    );
    projectiles.push(
      new Projectile(arrowX + spacing * 2, arrowY + spacing, 10)
    );
  }
}
function commenceSlashProjectiles() {
  if (landscapeRequired()) return;
  const arrowX = width + 500;
  const arrowY = height / 2;
  const spacing = 350;

  if (projectiles.length < 5) {
    // Center
    projectiles.push(new Projectile(arrowX, arrowY, 11.5));
    // Upper right
    projectiles.push(
      new Projectile(arrowX + spacing, arrowY - spacing / 2, 11)
    );
    projectiles.push(
      new Projectile(arrowX + spacing, arrowY + spacing / 2, 10)
    );
    // Lower right
    projectiles.push(
      new Projectile(arrowX + spacing * 2, arrowY - spacing, 11)
    );
    projectiles.push(
      new Projectile(arrowX + spacing * 2, arrowY + spacing, 10)
    );
  }
}
function commenceShieldWallProjectiles() {
  if (landscapeRequired()) return;
  const arrowX = width + 500;
  const arrowY = height / 2;
  const spacing = 350;

  if (projectiles.length < 5) {
    // Center
    projectiles.push(new Projectile(arrowX, arrowY, 10.5));
    // Upper right
    projectiles.push(
      new Projectile(arrowX - spacing - 200, arrowY - spacing / 2, 10.5)
    );
    projectiles.push(
      new Projectile(arrowX - spacing - 200, arrowY + spacing / 2, 10.5)
    );
    // Lower right
    projectiles.push(new Projectile(arrowX - spacing, arrowY - spacing, 10.5));
    projectiles.push(new Projectile(arrowX - spacing, arrowY + spacing, 10.5));
  }
}
function drawProjectiles() {
  for (let projectile of projectiles) {
    projectile.updatePosition();
    projectile.draw();
  }
}

function commenceMegaProjectiles() {
  if (landscapeRequired()) return;
  const megaX = width + 500;
  const megaY = height / 2 + random(-height * 0.324, height * 0.324);

  if (megaprojectiles.length < 3) {
    megaprojectiles.push(new MegaProjectile(megaX, megaY, 7));
  }
}
function drawMegaProjectiles() {
  for (let megaprojectile of megaprojectiles) {
    megaprojectile.updatePosition();
    megaprojectile.draw();
  }
}

function drawProjectilesStationary() {
  for (let projectile of projectiles) {
    projectile.draw();
  }
}
function drawMegaProjectilesStationary() {
  for (let megaprojectile of megaprojectiles) {
    megaprojectile.draw();
  }
}

// OBJECTS
function drawAura() {
  if (auraVisible) {
    aurax.draw();
  }
}

function drawCursor() {
  paw(mouseX, mouseY);
}
function paw(x, y) {
  noStroke();
  if (mouseIsPressed || keyIsDown(32)) {
    fill(97, 255, 115, 80);
    ellipse(x - 5, y - 5, 45, 45);
    ellipse(x - 5, y - 5, 60, 60);
    ellipse(x - 5, y - 5, 75, 75);
    fill(0, 255, 204);
  } else {
    fill(255, 153, 51);
  }
  ellipse(x, y, 25, 25);

  function beans() {
    ellipse(x - 24, y - 5, 12, 12);
    ellipse(x - 15, y - 20, 12, 12);
    ellipse(x + 3, y - 23, 12, 12);
  }
  beans();
}
function moon() {
  moonx.draw();
  moonx.x = width - 100;
  moonx.y = height / 2;
}
function drawHealthbar6() {
  const barWidth = width * 0.2;
  const barHeight = 20;
  const barX = (width - barWidth) / 2;
  const barY = 60;
  const barPadding = 10;

  // HP BAR Background
  strokeWeight(barHeight + barPadding * 2);
  stroke(255, 255, 255, 80);

  // Draw background bar
  line(barX + barWidth + barPadding, barY, barX - barPadding, barY);

  // HP BAR
  stroke(102, 255, 153);
  strokeWeight(barHeight);

  // Draw actual health bar
  line(barX + barWidth + barPadding, barY, barX - barPadding, barY);

  // Guides
  strokeWeight(2);
  stroke(0, 0, 0, 50);
  // Guide lines
  line(barX + barWidth / 3, barY - 6, barX + barWidth / 3, barY + 7);
  line(
    barX + (barWidth * 2) / 3,
    barY - 6,
    barX + (barWidth * 2) / 3,
    barY + 7
  );
}
function drawHealthbar5() {
  const barWidth = width * 0.2;
  const barHeight = 20;
  const barX = (width - barWidth) / 2;
  const barY = 60;
  const barPadding = 10;

  // HP BAR Background
  strokeWeight(barHeight + barPadding * 2);
  stroke(255, 255, 255, 80);

  // Draw background bar
  line(barX + barWidth + barPadding, barY, barX - barPadding, barY);

  // HP BAR
  stroke(102, 255, 153);
  strokeWeight(barHeight);

  // Draw actual health bar
  line(barX + (barWidth / 3) * 2.5 + barPadding, barY, barX - barPadding, barY);

  // Guides
  strokeWeight(2);
  stroke(0, 0, 0, 50);
  // Guide lines
  line(barX + barWidth / 3, barY - 6, barX + barWidth / 3, barY + 7);
  line(
    barX + (barWidth * 2) / 3,
    barY - 6,
    barX + (barWidth * 2) / 3,
    barY + 7
  );
}
function drawHealthbar4() {
  const barWidth = width * 0.2;
  const barHeight = 20;
  const barX = (width - barWidth) / 2;
  const barY = 60;
  const barPadding = 10;

  // HP BAR Background
  strokeWeight(barHeight + barPadding * 2);
  stroke(255, 255, 255, 80);

  // Draw background bar
  line(barX + barWidth + barPadding, barY, barX - barPadding, barY);

  // HP BAR
  stroke(247, 213, 101);
  strokeWeight(barHeight);

  // Draw actual health bar
  line(barX + (barWidth / 3) * 2 + barPadding, barY, barX - barPadding, barY);

  // Guides
  strokeWeight(2);
  stroke(0, 0, 0, 50);
  // Guide lines
  line(barX + barWidth / 3, barY - 6, barX + barWidth / 3, barY + 7);
  line(
    barX + (barWidth * 2) / 3,
    barY - 6,
    barX + (barWidth * 2) / 3,
    barY + 7
  );
}
function drawHealthbar3() {
  const barWidth = width * 0.2;
  const barHeight = 20;
  const barX = (width - barWidth) / 2;
  const barY = 60;
  const barPadding = 10;

  // HP BAR Background
  strokeWeight(barHeight + barPadding * 2);
  stroke(255, 255, 255, 80);

  // Draw background bar
  line(barX + barWidth + barPadding, barY, barX - barPadding, barY);

  // HP BAR
  stroke(247, 213, 101);
  strokeWeight(barHeight);

  // Draw actual health bar
  line(barX + (barWidth / 3) * 1.5 + barPadding, barY, barX - barPadding, barY);

  // Guides
  strokeWeight(2);
  stroke(0, 0, 0, 50);
  // Guide lines
  line(barX + barWidth / 3, barY - 6, barX + barWidth / 3, barY + 7);
  line(
    barX + (barWidth * 2) / 3,
    barY - 6,
    barX + (barWidth * 2) / 3,
    barY + 7
  );
}
function drawHealthbar2() {
  const barWidth = width * 0.2;
  const barHeight = 20;
  const barX = (width - barWidth) / 2;
  const barY = 60;
  const barPadding = 10;

  // HP BAR Background
  strokeWeight(barHeight + barPadding * 2);
  stroke(255, 255, 255, 80);

  // Draw background bar
  line(barX + barWidth + barPadding, barY, barX - barPadding, barY);

  // HP BAR
  stroke(209, 51, 23);
  strokeWeight(barHeight);

  // Draw actual health bar
  line(barX + barWidth / 3 + barPadding, barY, barX - barPadding, barY);

  // Guides
  strokeWeight(2);
  stroke(0, 0, 0, 50);
  // Guide lines
  line(barX + barWidth / 3, barY - 6, barX + barWidth / 3, barY + 7);
  line(
    barX + (barWidth * 2) / 3,
    barY - 6,
    barX + (barWidth * 2) / 3,
    barY + 7
  );
}
function drawHealthbar1() {
  const barWidth = width * 0.2;
  const barHeight = 20;
  const barX = (width - barWidth) / 2;
  const barY = 60;
  const barPadding = 10;

  // HP BAR Background
  strokeWeight(barHeight + barPadding * 2);
  stroke(255, 255, 255, 80);

  // Draw background bar
  line(barX + barWidth + barPadding, barY, barX - barPadding, barY);

  // HP BAR
  stroke(209, 51, 23);
  strokeWeight(barHeight);

  // Draw actual health bar
  line(barX + barWidth / 6 - 20 + barPadding, barY, barX - barPadding, barY);

  // Guides
  strokeWeight(2);
  stroke(0, 0, 0, 50);
  // Guide lines
  line(barX + barWidth / 3, barY - 6, barX + barWidth / 3, barY + 7);
  line(
    barX + (barWidth * 2) / 3,
    barY - 6,
    barX + (barWidth * 2) / 3,
    barY + 7
  );
}

function ufo() {
  ufox.draw();
  movement();
}
function ufoStationary() {
  ufox.draw();
}
function drawShield() {
  push();
  translate(0, 0);
  stroke(102, 255, 255, 30);
  strokeWeight(30);
  fill(102, 255, 255, 70);
  ellipse(ufox.x, ufox.y, ufox.diameter + 70, ufox.diameter + 70);
  pop();
}

// GAME STATES
//TITLE
function titleState() {
  drawAura();
  moon();
  ufoStationary();
  drawTitle();
  if (showTitle === false) {
    state = "pause";
    menu.style.display = "block";
  }
}
window.titleState = titleState;

//GAME
function gameState() {
  drawAura();
  moon();
  if (health === 6) {
    drawHealthbar6();
  } else if (health === 5) {
    drawHealthbar5();
  } else if (health === 4) {
    drawHealthbar4();
  } else if (health === 3) {
    drawHealthbar3();
  } else if (health === 2) {
    drawHealthbar2();
  } else if (health === 1) {
    drawHealthbar1();
  }
  ufo();
  drawProjectiles();
  drawMegaProjectiles();
  drawHealthBuffs();
  drawShieldBuffs();
  if (shield === true) {
    drawShield();
  }
  borderCheck();
  checkCollisions();
  // Countdown help from P5 - https://editor.p5js.org/denaplesk2/sketches/S1OAhXA-M
  if (frameCount % 60 === 0 && timer > 0) {
    // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
    timer--;
  }
  if (timer <= 0) {
    state = "winState";
    auraVisible = false;
  }

  drawTimer();
}
window.gameState = gameState;
function infiniteState() {
  drawAura();
  moon();
  if (health === 6) {
    drawHealthbar6();
  } else if (health === 5) {
    drawHealthbar5();
  } else if (health === 4) {
    drawHealthbar4();
  } else if (health === 3) {
    drawHealthbar3();
  } else if (health === 2) {
    drawHealthbar2();
  } else if (health === 1) {
    drawHealthbar1();
  }
  ufo();
  drawProjectiles();
  drawMegaProjectiles();
  drawHealthBuffs();
  drawShieldBuffs();
  if (shield === true) {
    drawShield();
  }
  borderCheck();
  checkCollisions();

  // Countdown help from P5 - https://editor.p5js.org/denaplesk2/sketches/S1OAhXA-M
  if (frameCount % 60 === 0) {
    // if the frameCount is divisible by 60, then a second has passed. it will keep increasing until the player dies
    infiniteTimer++;
  }

  drawInfiniteTimer();
}
window.infiniteState = infiniteState;

//PAUSE
function pauseState() {
  drawAura();
  moon();
  if (health === 6) {
    drawHealthbar6();
  } else if (health === 5) {
    drawHealthbar5();
  } else if (health === 4) {
    drawHealthbar4();
  } else if (health === 3) {
    drawHealthbar3();
  } else if (health === 2) {
    drawHealthbar2();
  } else if (health === 1) {
    drawHealthbar1();
  }

  ufoStationary();

  if (health > 0) {
    drawProjectilesStationary();
    drawMegaProjectilesStationary();
    drawHealthBuffsStationary();
    drawShielfBuffsStationary();
    if (shield === true) {
      drawShield();
    }
  }
  drawTimer();
}
window.pauseStateState = pauseState;
function infinitePauseState() {
  drawAura();
  moon();
  if (health === 6) {
    drawHealthbar6();
  } else if (health === 5) {
    drawHealthbar5();
  } else if (health === 4) {
    drawHealthbar4();
  } else if (health === 3) {
    drawHealthbar3();
  } else if (health === 2) {
    drawHealthbar2();
  } else if (health === 1) {
    drawHealthbar1();
  }

  ufoStationary();

  if (health > 0) {
    drawProjectilesStationary();
    drawMegaProjectilesStationary();
    drawHealthBuffsStationary();
    drawShielfBuffsStationary();
    if (shield === true) {
      drawShield();
    }
  }
  drawInfiniteTimer();
}
window.infinitePauseState = infinitePauseState;

//GAMEOVER
function gameOverState() {
  drawAura();
  moon();
  ufoStationary();
  drawTitle();
  drawCursor();
  drawTimer();
}
window.gameOverStateState = gameOverState;

function infiniteGameOverState() {
  drawAura();
  moon();
  ufoStationary();
  drawTitle();
  drawCursor();
  drawInfiniteTimer();
}
window.infiniteGameOverState = infiniteGameOverState;

//WINSTATE
function winState() {
  drawAura();
  moon();
  ufo();
  drawTitle();
  drawCursor();
  if (showFlyToWin === true) {
    flytoWin();
    boosterStrength = 1;
    if (ufox.x >= width) {
      showFlyToWin = false;
    }
  } else {
    if (ufox.x >= width) {
      gameWon();
      drawRestart();
    }
  }
}
window.winState = winState;

//CONSTROLS
function controlsState() {
  drawAura();
  moon();
  if (health === 6) {
    drawHealthbar6();
  } else if (health === 5) {
    drawHealthbar5();
  } else if (health === 4) {
    drawHealthbar4();
  } else if (health === 3) {
    drawHealthbar3();
  } else if (health === 2) {
    drawHealthbar2();
  } else if (health === 1) {
    drawHealthbar1();
  }
  ufoStationary();
  if (health > 0) {
    drawProjectilesStationary();
    drawMegaProjectilesStationary();
    drawHealthBuffsStationary();
    drawShielfBuffsStationary();
    if (shield === true) {
      drawShield();
    }
  }

  drawControls();
}

function movement() {
  // Analog input: push farther for stronger thrust, including diagonals.
  ufoHoriSpeed += joystick.axes.x * boosterStrength;
  ufoVertSpeed += joystick.axes.y * boosterStrength;
  if (keyIsDown(38) || keyIsDown(32) || keyIsDown(87)) {
    ufoVertSpeed -= boosterStrength;
  }
  if (keyIsDown(40) || keyIsDown(83)) {
    ufoVertSpeed += boosterStrength;
  }

  if (keyIsDown(37) || keyIsDown(65)) {
    ufoHoriSpeed -= boosterStrength;
  }

  if (keyIsDown(39) || keyIsDown(68)) {
    ufoHoriSpeed += boosterStrength;
  }

  ufox.y += ufoVertSpeed;
  ufox.x += ufoHoriSpeed;

  slowDown();
}
window.movement = movement;

function slowDown() {
  ufoVertSpeed *= slowDownStrength;
  ufoHoriSpeed *= slowDownStrength;
}
window.slowDown = slowDown;

function borderCheck() {
  if (ufox.x >= width - 110) {
    ufox.x = width - 110;
  }

  if (ufox.x <= 105) {
    ufox.x = 105;
  }

  if (ufox.y >= height - 60) {
    ufox.y = height - 60;
  }

  if (ufox.y <= 65) {
    ufox.y = 65;
  }
}
window.borderCheck = borderCheck;

//COLLISION FUNCTION
function checkCollisions() {
  /* Removing items from arrays using backwards iteration help from w3 Schools - https://www.w3schools.com/jsref/jsref_for.asp*/
  //COLLISION WITH PROJETCILES
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let projectile = projectiles[i];
    if (isColliding(ufox, projectile)) {
      projectiles.splice(i, 1); // Remove from array
      crash.play();

      if (shield === true) {
        shield = false;
      } else if (shield === false) {
        health -= 1;
      }

      if (health <= 0 && state === "game") {
        state = "gameOver";
      } else if (health <= 0 && state === "infinite") {
        state = "infiniteGameOver";
      }
    }
  }

  //COLLISION WITH MEGA PROJECTILES
  for (let i = megaprojectiles.length - 1; i >= 0; i--) {
    let megaprojectile = megaprojectiles[i];
    if (isColliding(ufox, megaprojectile)) {
      megaprojectiles.splice(i, 1); // Remove from array
      megacrash.play();

      if (shield === true) {
        shield = false;
      } else if (shield === false) {
        health -= 2;
      }

      if (health <= 0 && state === "game") {
        state = "gameOver";
      } else if (health <= 0 && state === "infinite") {
        state = "infiniteGameOver";
      }
    }
  }

  //COLLISION WITH SHIELD BUFFS
  for (let i = shieldbuffs.length - 1; i >= 0; i--) {
    let shiledbuff = shieldbuffs[i];
    if (isColliding(ufox, shiledbuff)) {
      shieldbuffs.splice(i, 1);
      yay.play();

      shield = true;

      if (health <= 0 && state === "game") {
        state = "gameOver";
      } else if (health <= 0 && state === "infinite") {
        state = "infiniteGameOver";
      }
    }
  }

  //COLLISION WITH HEALTH BUFFS
  for (let i = healthbuffs.length - 1; i >= 0; i--) {
    let healthbuff = healthbuffs[i];
    if (isColliding(ufox, healthbuff)) {
      healthbuffs.splice(i, 1);
      buffup.play();

      if (health <= 5) {
        health += 1;
        if (health >= 6) {
          health = 6;
        }
      }
      if (health <= 0 && state === "game") {
        state = "gameOver";
      } else if (health <= 0 && state === "infinite") {
        state = "infiniteGameOver";
      }
    }
  }

  //COLLISION WITH AURA
  if (isColliding(ufox, aurax)) {
    if (frameCount % 45 === 0) {
      aurahit.play();

      if (shield === true) {
        shield = false;
        health -= 1;
      } else {
        health -= 1;
      }
    }
    if (health <= 0 && state === "game") {
      state = "gameOver";
    } else if (health <= 0 && state === "infinite") {
      state = "infiniteGameOver";
    }
  }
}

// searched how to integrate diameter into objects by AI - https://chatgpt.com/share/dc8fe364-de04-40aa-a212-fa9aa4533a61
function isColliding(objectufo, objects) {
  let distance = dist(objectufo.x, objectufo.y, objects.x, objects.y);
  console.log("beep");

  let combinedRadius = objectufo.diameter / 2 + objects.diameter / 2;

  return distance < combinedRadius;
}
