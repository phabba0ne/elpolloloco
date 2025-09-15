import World from "../models/World.js";
import Keyboard from "../services/Keyboard.js";
import level1 from "../levels/level1.js";
import Character from "../models/Character.js";
import AssetManager from "../services/AssetManager.js";
import AudioHub from "../services/AudioHub.js";

let world;
let keyboard;
let character;
let level = level1;
let gameStarted = false;
let canvas;
let ctx;

// Start screen configuration
const startScreen = {
  backgroundImage: null, 
  isVisible: true,
};

async function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  keyboard = new Keyboard();

  await AssetManager.preload();
AudioHub.playOne("AMBIENT","titleSong");

  // Load start screen background image (adjust path as needed)
  startScreen.backgroundImage = new Image();
  startScreen.backgroundImage.src = "assets/img/background/startImage.png"; // Update with your image path

  // Set up start screen event listeners
  setupStartScreen();

  // Draw initial start screen
  drawStartScreen();
}

function setupStartScreen() {
  const startGameHandler = async () => {
    if (!gameStarted && startScreen.isVisible) {
      // Play title song only once on first interaction
      AudioHub.playOne("AMBIENT", "titleSong");
      
      startGame();
      AudioHub.playOne("AMBIENT","");
      document.removeEventListener("keydown", startGameHandler);
    }
  };

  document.addEventListener("keydown", startGameHandler);
  document.addEventListener("click", startGameHandler);

  // Optional: touchstart für mobile Geräte
  document.addEventListener("touchstart", startGameHandler, { once: true });
}

function drawStartScreen() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background image if loaded
  if (startScreen.backgroundImage && startScreen.backgroundImage.complete) {
    ctx.drawImage(
      startScreen.backgroundImage,
      0,
      0,
      canvas.width,
      canvas.height
    );
  } else {
    // Fallback desert gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#eeb668bb");
    gradient.addColorStop(0.5, "#d98e2da9");
    gradient.addColorStop(1, "#8b4513a3");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Add stylish overlay with gradient
  const overlayGradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    Math.max(canvas.width, canvas.height) / 2
  );
  overlayGradient.addColorStop(0, "rgba(0, 0, 0, 0.3)");
  overlayGradient.addColorStop(1, "rgba(0, 0, 0, 0.7)");
  ctx.fillStyle = overlayGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Game title with shadow effect
  ctx.font = "bold 64px Boogaloo, sans-serif";
  ctx.textAlign = "center";

  // Title shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillText("DESERT ADVENTURE", canvas.width / 2 + 3, 123);

  // Title main text with gradient
  const titleGradient = ctx.createLinearGradient(0, 80, 0, 140);
  titleGradient.addColorStop(0, "#FFD700");
  titleGradient.addColorStop(1, "#FFA500");
  ctx.fillStyle = titleGradient;
  ctx.fillText("DESERT ADVENTURE", canvas.width / 2, 120);

  // Controls section with background box
  const controlsBoxY = 180;
  const controlsBoxHeight = 160;
  const controlsBoxWidth = 400;
  const controlsBoxX = canvas.width / 2 - controlsBoxWidth / 2;

  // Controls background box
  ctx.fillStyle = "rgba(139, 69, 19, 0.8)";
  ctx.fillRect(controlsBoxX, controlsBoxY, controlsBoxWidth, controlsBoxHeight);

  // Controls border
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    controlsBoxX,
    controlsBoxY,
    controlsBoxWidth,
    controlsBoxHeight
  );

  // Controls title
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 28px Boogaloo, sans-serif";
  ctx.fillText("CONTROLS", canvas.width / 2, 210);

  // Controls list with better styling
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "22px Boogaloo, sans-serif";
  ctx.textAlign = "left";

  const controlsStartX = canvas.width / 2 - 170;
  const controlsStartY = 240;
  const lineHeight = 30;

  const controls = [
    "WALK: ← / →",
    "JUMP: SPACE",
    "THROW: F",
    "PAUSE: P",
  ];

  controls.forEach((control, index) => {
    // Add bullet points
    ctx.fillStyle = "#FFD700";
    ctx.fillText("●", controlsStartX - 20, controlsStartY + index * lineHeight);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(control, controlsStartX, controlsStartY + index * lineHeight);
  });

  // Mobile landscape reminder
  ctx.fillStyle = "#FF6B6B";
  ctx.font = "24px Boogaloo, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "📱 MOBILE: Turn your device to landscape mode for best experience!",
    canvas.width / 2,
    canvas.height - 20
  );

  // Start instruction with pulsing effect
  const time = Date.now();
  const pulseScale = 1 + Math.sin(time / 300) * 0.1;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height - 80);
  ctx.scale(pulseScale, pulseScale);

  // Start text shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.font = "bold 32px Boogaloo, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Press any key to start!", 2, 2);

  // Start text main with blinking effect
  if (Math.floor(time / 600) % 2 === 0) {
    ctx.fillStyle = "#00FF88";
  } else {
    ctx.fillStyle = "#FFFF00";
  }
  ctx.fillText("Press any key to start!", 0, 0);

  ctx.restore();

  // Add decorative elements
  drawDecorations();
}

function drawDecorations() {
  const time = Date.now();

  // Animated stars
  for (let i = 0; i < 20; i++) {
    const x = (i * 37 + time / 50) % canvas.width;
    const y = 20 + Math.sin(time / 1000 + i) * 10;
    const alpha = 0.3 + Math.sin(time / 800 + i * 2) * 0.3;

    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }


  // Corner decorations
  ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
  ctx.font = "48px Boogaloo, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("🌵", 20, 50);
  ctx.textAlign = "right";
  ctx.fillText("☀️", canvas.width - 20, 50);
}

function startGame() {
  gameStarted = true;
  startScreen.isVisible = false;

  // Initialize game objects
  character = new Character({ x: 200, y: 370 });
  world = new World({
    canvas,
    keyboard,
    level,
    character,
    debug: true,
  });

  console.log("Game started!");
}

// Animation loop for start screen
function gameLoop() {
  if (!gameStarted && startScreen.isVisible) {
    drawStartScreen();
  }
  requestAnimationFrame(gameLoop);
}

// Start the animation loop
window.addEventListener("load", () => {
  init();
  gameLoop();
});
