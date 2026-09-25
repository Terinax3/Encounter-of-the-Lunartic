import { worldWidth as width, worldHeight as height } from "./screen.js";
export default class Aura {
  constructor() {
    this.auraMove = 0;
    this.direction = "forward";
    this.x = this.auraMove;
    this.y = 540;
    this.diameter = 1100;
  }

  syncPosition() {
    this.x = width - 120 + this.auraMove;
    this.y = height / 2;
  }

  bgcolor() {
    this.syncPosition();
    const scaleFactor = 1;

    noStroke();
    fill(153, 0, 51, 35);
    stroke(255, 0, 116, 35);
    strokeWeight(80);
    ellipse(
      this.x * scaleFactor,
      height / 2,
      1100 * scaleFactor,
      1100 * scaleFactor
    );
    noStroke();
    fill(153, 0, 51, 35);
    ellipse(
      (this.x - 25) * scaleFactor,
      height / 2,
      1400 * scaleFactor,
      1400 * scaleFactor
    );
    fill(153, 0, 51, 35);
    ellipse(
      (this.x - 150) * scaleFactor,
      height / 2,
      1600 * scaleFactor,
      1600 * scaleFactor
    );
  }

  draw() {
    this.bgcolor();
    if (this.direction === "forward") {
      if (this.auraMove < 100) {
        this.auraMove += 0.3;
      } else {
        this.direction = "backwards";
      }
    } else if (this.direction === "backwards") {
      if (this.auraMove > 0) {
        this.auraMove -= 0.2;
      } else {
        this.direction = "forward";
      }
    }

    //HITBOX
    //fill(0, 255, 0, 70);
    //ellipse(this.x, this.y, this.diameter, this.diameter);
  }
}
