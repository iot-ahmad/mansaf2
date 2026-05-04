import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
    this.levelManager = null;
  }

  init(data) {
    this.levelManager = data.levelManager;
  }

  preload() {
    this.load.spritesheet("hero", "/assets/jordanian-hero-spritesheet.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    if (!this.anims.exists("hero-walk")) {
      this.anims.create({
        key: "hero-walk",
        frames: this.anims.generateFrameNumbers("hero", { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("hero-idle")) {
      this.anims.create({
        key: "hero-idle",
        frames: [{ key: "hero", frame: 0 }],
        frameRate: 1,
        repeat: -1,
      });
    }

    this.scene.start("GameScene", { levelManager: this.levelManager });
    this.scene.launch("UIScene");
  }
}
