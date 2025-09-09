import Chicken from "./Chicken.js";
import AssetManager from "../services/AssetManager.js";
import StateMachine from "../services/StateMachine.js";

export default class ChickenSmall extends Chicken {
  width = 48;
  height = 48;
  speedX = 48;
  strength = 5;
  y = 396;

  constructor(x = null) {
    super(x, 396); // ruft den Chicken-Konstruktor auf
    this.type = "chickenSmall"; // wichtig für World/Kollisionslogik

    // Override StateMachine für Small Chicken
    this.stateMachine = new StateMachine(
      AssetManager.CHICKENSMALL_SPRITES,
      "walk",
      12
    );

    this.loadSprites(AssetManager.CHICKENSMALL_SPRITES);
  }

  async loadSprites(sprites) {
    // Preload alle Sprites und setze Startframe
    await AssetManager.loadAll(Object.values(sprites).flat());
    this.img = this.stateMachine.getFrame();
  }

  update(deltaTime, character) {
    if (!this.isDead) {
      this.x -= this.speedX * deltaTime;
    }
    super.update(deltaTime, character);
  }
}
