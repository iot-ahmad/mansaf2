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
    this.load.image("hero-sheet", "/assets/jordanian-hero-spritesheet.png");
  }

  create() {
    this.createFallbackHeroTexture();

    if (!this.scene.isActive("UIScene")) {
      this.scene.launch("UIScene");
    }

    this.scene.start("GameScene", { levelManager: this.levelManager });
  }

  createFallbackHeroTexture() {
    if (this.textures.exists("hero-fallback")) {
      return;
    }

    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(0xb3312d, 1);
    gfx.fillRect(6, 0, 20, 8);
    gfx.fillStyle(0xf2d2b0, 1);
    gfx.fillRect(8, 8, 16, 12);
    gfx.fillStyle(0xf2eee6, 1);
    gfx.fillRect(4, 20, 24, 12);
    gfx.fillStyle(0x6a4b2e, 1);
    gfx.fillRect(6, 32, 8, 10);
    gfx.fillRect(18, 32, 8, 10);
    gfx.generateTexture("hero-fallback", 32, 42);
    gfx.destroy();
  }
}
