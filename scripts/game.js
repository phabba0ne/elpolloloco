let canvas;
let world;

async function init() {
  canvas = document.getElementById("canvas");

  // Alle benötigten Assets deklarieren
  const assets = [
    "../assets/img/background/layers/air.png",
    "../assets/img/background/layers/thirdLayer/one.png",
    "../assets/img/background/layers/secondLayer/one.png",
    "../assets/img/background/layers/firstLayer/one.png",
    "../assets/img/background/layers/clouds/one.png",
    "../assets/img/enemiesChicken/chickenNormal/walk/oneW.png",
    "../assets/img/characterPepe/walk/wTwentyOne.png"
  ];

  try {
    await Loader.loadAll(assets);
    console.log("Alle Assets geladen ✅");
    world = new World(canvas);
  } catch (err) {
    console.error("Asset-Loading fehlgeschlagen:", err);
  }
}