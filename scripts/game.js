let canvas;
let world;

function init() {
  canvas = document.getElementById("canvas");
  world = new World(canvas);

  console.log("My Character is", world.character);

  // character.src = "";
  // ctx.drawImage(character, 20, 20, 50, 150);
}
