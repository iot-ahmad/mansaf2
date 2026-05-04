import Phaser from "phaser";
import LevelManager from "./managers/LevelManager";
import BootScene from "./scenes/BootScene";
import GameScene from "./scenes/GameScene";
import UIScene from "./scenes/UIScene";
import { palette } from "./theme/palette";

const levelManager = new LevelManager(16);

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 800,
  height: 600,
  backgroundColor: palette.nightBlue,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 700 },
      debug: false,
    },
  },
  scene: [BootScene, GameScene, UIScene],
};

const game = new Phaser.Game(config);

game.scene.start("BootScene", { levelManager });
