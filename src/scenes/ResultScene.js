import Phaser from "phaser";
import { palette } from "../theme/palette";

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
    this.levelManager = null;
    this.outcome = "win";
  }

  init(data) {
    this.levelManager = data.levelManager;
    this.outcome = data.outcome ?? "win";
  }

  create() {
    const isWin = this.outcome === "win";
    this.cameras.main.setBackgroundColor(isWin ? palette.ochre : palette.nightBlue);
    this.add.rectangle(400, 300, 760, 520, 0x000000, 0.45).setStrokeStyle(3, palette.stoneWhite);

    this.add.text(400, 150, isWin ? "Mansaf Complete!" : "Game Over", {
      fontSize: "54px",
      color: "#f2eee6",
      fontStyle: "bold",
      fontFamily: "Tahoma, Arial, sans-serif",
    }).setOrigin(0.5);

    const parts = this.levelManager.collectedMajorIngredients.length
      ? this.levelManager.collectedMajorIngredients.join(", ")
      : "None";

    this.add.text(400, 260, `Collected Parts: ${parts}`, {
      fontSize: "28px",
      color: "#f2eee6",
      fontFamily: "Tahoma, Arial, sans-serif",
    }).setOrigin(0.5);

    this.add.text(400, 315, `Reached Level: ${this.levelManager.currentLevel}/16`, {
      fontSize: "26px",
      color: "#f2eee6",
      fontFamily: "Tahoma, Arial, sans-serif",
    }).setOrigin(0.5);

    this.add.text(400, 400, "Press ENTER to play again", {
      fontSize: "24px",
      color: "#d9b88f",
      fontFamily: "Tahoma, Arial, sans-serif",
    }).setOrigin(0.5);

    this.input.keyboard.once("keydown-ENTER", () => {
      this.levelManager.resetGame();
      this.scene.start("StartScene", { levelManager: this.levelManager });
    });
  }
}
