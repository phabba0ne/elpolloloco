let canvas;
let ctx;
let world = new World();

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  console.log("My Character is", world.character);

  // character.src = "";
  // ctx.drawImage(character, 20, 20, 50, 150);
}
