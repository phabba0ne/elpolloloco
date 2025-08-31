async function init() {
  canvas = document.getElementById("canvas");

  await document.fonts.load("32px Boogaloo");
  console.log("Font Boogaloo loaded ✅");

  const assets = [
    "assets/img/background/layers/air.png",
    "assets/img/background/layers/thirdLayer/one.png",
    "assets/img/background/layers/secondLayer/one.png",
    "assets/img/background/layers/firstLayer/one.png",
    "assets/img/background/layers/clouds/one.png",
    "assets/img/enemiesChicken/chickenNormal/walk/oneW.png",
    "assets/img/enemiesChicken/chickenNormal/walk/twoW.png",
    "assets/img/enemiesChicken/chickenNormal/walk/threeW.png",
    "assets/img/enemiesChicken/chickenNormal/dead/dead.png",
    "assets/img/characterPepe/walk/wTwentyOne.png"
  ];

  try {
    await AssetManager.loadAll(assets);
    console.log("All assets loaded ✅");
    world = new World(canvas);
  } catch (err) {
    console.error("Asset loading failed ❌:", err);
  }
}