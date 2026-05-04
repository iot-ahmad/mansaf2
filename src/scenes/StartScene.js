import Phaser from "phaser";
import { palette } from "../theme/palette";

export default class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
    this.levelManager = null;
  }

  init(data) {
    this.levelManager = data.levelManager;
  }

  create() {
    this.cameras.main.setBackgroundColor(palette.nightBlue);

    this.add.rectangle(400, 300, 760, 520, 0x000000, 0.35).setStrokeStyle(2, palette.shemaghRed);
    this.add.text(400, 130, "Mansaf Quest 2D", {
      fontSize: "48px",
      color: "#f2eee6",
      fontStyle: "bold",
      fontFamily: "Tahoma, Arial, sans-serif",
    }).setOrigin(0.5);

    this.add.text(400, 206, "رحلة إعداد المنسف الأردني", {
      fontSize: "30px",
      color: "#d9b88f",
      fontFamily: "Tahoma, Arial, sans-serif",
    }).setOrigin(0.5);

    const instructions = [
      "Collect Falafel pieces in every level.",
      "On levels 4, 8, 12, 16: unlock the major ingredient after 10 Falafel.",
      "Reach the gate to progress through 16 levels.",
      "Avoid enemies and hazards. You have 3 lives.",
      "If you drop to 1 life, the Jordanian alert appears!",
      "",
      "Press ENTER to start",
    ].join("\n");

    this.add.text(400, 340, instructions, {
      fontSize: "22px",
      color: "#f2eee6",
      align: "center",
      lineSpacing: 8,
      fontFamily: "Tahoma, Arial, sans-serif",
    }).setOrigin(0.5);

    this.input.keyboard.once("keydown-ENTER", () => {
      this.levelManager.resetGame();
      this.scene.start("BootScene", { levelManager: this.levelManager });
      this.scene.launch("UIScene");
    });
  }
}
