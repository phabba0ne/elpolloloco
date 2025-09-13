export default class StompPopup {
  constructor(x, y, text = "+1") {
    this.x = x;
    this.y = y;
    this.text = text;
    this.alpha = 1;         // Transparenz
    this.lifetime = 1000;   // ms
    this.elapsed = 0;
    this.riseSpeed = 40;    // px pro Sekunde
  }

  update(delta) {
    this.elapsed += delta * 1000;
    this.y -= this.riseSpeed * delta;
    this.alpha = 1 - this.elapsed / this.lifetime;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = "#fff200";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }

  get isExpired() {
    return this.alpha <= 0;
  }
}