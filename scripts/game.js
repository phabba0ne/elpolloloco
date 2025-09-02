async function init() {
  keyboard = new Keyboard();
  canvas = document.getElementById("canvas");
  await document.fonts.load("32px Boogaloo");
  console.log("Font Boogaloo loaded ✅");

  try {
    world = new World(canvas, keyboard);
  } catch (err) {
    console.error("Asset loading failed ❌:", err);
  }
}
