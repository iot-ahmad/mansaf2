import Phaser from "phaser";
import { palette } from "../theme/palette";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.levelManager = null;
    this.player = null;
    this.cursors = null;
    this.falafelGroup = null;
    this.majorIngredient = null;
    this.exitGate = null;
    this.statusText = null;
  }

  init(data) {
    this.levelManager = data.levelManager;
  }

  create() {
    this.cameras.main.setBackgroundColor(palette.nightBlue);
    this.createBackdrop();
    this.createPlatforms();
    this.createPlayer();
    this.createFalafelPieces();
    this.createMajorIngredient();
    this.createExitGate();
    this.createLevelStatusText();
    this.cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.overlap(this.player, this.falafelGroup, this.collectFalafel, null, this);
    this.physics.add.overlap(this.player, this.majorIngredient, this.collectMajorIngredient, null, this);
    this.physics.add.overlap(this.player, this.exitGate, this.tryFinishLevel, null, this);

    this.input.keyboard.on("keydown-H", this.debugLoseLife, this);
    this.emitStats();
  }

  createBackdrop() {
    this.add.rectangle(400, 120, 800, 240, palette.stoneWhite, 1);
    this.add.rectangle(400, 300, 800, 140, palette.sand, 1);
    this.add.rectangle(400, 420, 800, 120, palette.ochre, 1);

    for (let i = 0; i < 9; i += 1) {
      this.add.rectangle(60 + i * 90, 190, 58, 90, 0xffffff, 0.5);
      this.add.rectangle(60 + i * 90, 150, 58, 20, palette.stoneWhite, 0.9);
    }

    this.add.text(16, 540, "Jordanian palette: Ochre, Sand, Stone White, Shemagh Red", {
      fontSize: "14px",
      color: "#f2eee6",
      fontFamily: "Tahoma, Arial, sans-serif",
    });
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 590, null).setDisplaySize(800, 20).refreshBody();
    this.platforms.create(170, 460, null).setDisplaySize(220, 16).refreshBody();
    this.platforms.create(620, 380, null).setDisplaySize(220, 16).refreshBody();

    this.platforms.getChildren().forEach((platform) => {
      platform.setVisible(false);
      platform.body.updateFromGameObject();
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(90, 520, "hero", 0);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.05);
    this.player.setScale(1.2);
    this.physics.add.collider(this.player, this.platforms);
  }

  createFalafelPieces() {
    this.falafelGroup = this.physics.add.group();
    const levelSeed = this.levelManager.currentLevel;

    for (let i = 0; i < 14; i += 1) {
      const x = 90 + ((i * 47 + levelSeed * 13) % 620);
      const y = 150 + ((i * 79 + levelSeed * 11) % 320);
      const falafel = this.add.circle(x, y, 10, 0xd18b3f, 1);
      this.physics.add.existing(falafel);
      falafel.body.setAllowGravity(false);
      this.falafelGroup.add(falafel);
    }
  }

  createMajorIngredient() {
    const ingredientName = this.levelManager.getCurrentMajorIngredientName();
    this.majorIngredient = this.add.rectangle(700, 180, 44, 44, palette.shemaghRed, 0.9);
    this.physics.add.existing(this.majorIngredient);
    this.majorIngredient.body.setAllowGravity(false);

    this.majorIngredientLabel = this.add.text(700, 150, ingredientName, {
      fontSize: "14px",
      color: "#ffffff",
      fontFamily: "Tahoma, Arial, sans-serif",
    });
    this.majorIngredientLabel.setOrigin(0.5);

    this.refreshMajorIngredientVisibility();
  }

  createExitGate() {
    this.exitGate = this.add.rectangle(760, 520, 36, 100, palette.desertBrown, 0.9);
    this.physics.add.existing(this.exitGate);
    this.exitGate.body.setAllowGravity(false);
    this.exitGate.body.setImmovable(true);
  }

  createLevelStatusText() {
    this.statusText = this.add.text(16, 508, "", {
      fontSize: "16px",
      color: "#f2eee6",
      fontFamily: "Tahoma, Arial, sans-serif",
    });
    this.updateStatusText("Collect Falafel, then reach the gate.");
  }

  update() {
    this.player.setVelocityX(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-190);
      this.player.flipX = true;
      this.player.play("hero-walk", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(190);
      this.player.flipX = false;
      this.player.play("hero-walk", true);
    } else {
      this.player.play("hero-idle", true);
    }

    if (this.cursors.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-360);
    }

    this.game.events.emit("player-world-position", { x: this.player.x, y: this.player.y });
  }

  collectFalafel(_player, falafelPiece) {
    falafelPiece.destroy();
    this.levelManager.addFalafel(1);
    this.refreshMajorIngredientVisibility();
    this.emitStats();
  }

  refreshMajorIngredientVisibility() {
    const levelNeedsMajorIngredient = this.levelManager.shouldOfferMajorIngredientThisLevel();
    if (!levelNeedsMajorIngredient) {
      this.majorIngredient.setVisible(false);
      this.majorIngredient.body.enable = false;
      this.majorIngredientLabel.setVisible(false);
      return;
    }

    // Falafel gate:
    // The major ingredient object exists in the scene, but it stays hidden and non-collidable
    // until the player has collected at least 10 Falafel in the current level.
    // This guarantees the "Falafel Rule" before any Mansaf part can be picked up.
    const unlocked = this.levelManager.canSpawnMajorIngredient();
    this.majorIngredient.setVisible(unlocked);
    this.majorIngredient.body.enable = unlocked;
    this.majorIngredientLabel.setVisible(unlocked);

    if (!unlocked) {
      this.updateStatusText(`Need 10 Falafel to unlock ${this.levelManager.getCurrentMajorIngredientName()}.`);
    } else {
      this.updateStatusText(`${this.levelManager.getCurrentMajorIngredientName()} is now available!`);
    }
  }

  collectMajorIngredient() {
    this.levelManager.collectCurrentMajorIngredient();
    this.majorIngredient.destroy();
    this.majorIngredientLabel.destroy();
    this.updateStatusText("Major ingredient collected! Head to the gate.");
    this.emitStats();
  }

  tryFinishLevel() {
    if (this.levelManager.shouldOfferMajorIngredientThisLevel()) {
      const currentIngredient = this.levelManager.getCurrentMajorIngredientName();
      const hasIngredient = this.levelManager.collectedMajorIngredients.includes(currentIngredient);
      if (!hasIngredient) {
        this.updateStatusText(`You must collect ${currentIngredient} first.`);
        return;
      }
    }

    if (this.levelManager.currentLevel === this.levelManager.maxLevels) {
      if (this.levelManager.hasWonGame()) {
        this.showEndingMessage("Mansaf platter complete! Jordanian feast ready!");
      } else {
        this.showEndingMessage("Final gate reached, but not all ingredients were collected.");
      }
      return;
    }

    this.levelManager.goToNextLevel();
    this.scene.restart({ levelManager: this.levelManager });
  }

  debugLoseLife() {
    this.levelManager.loseLife(1);
    this.emitStats();

    if (this.levelManager.isGameOver()) {
      this.showEndingMessage("Game over! Try your Mansaf journey again.");
    } else {
      this.updateStatusText("Ouch! Life lost. Press H only for testing.");
    }
  }

  showEndingMessage(message) {
    this.physics.pause();
    this.add
      .rectangle(400, 300, 540, 180, 0x000000, 0.7)
      .setStrokeStyle(2, palette.shemaghRed);
    this.add
      .text(400, 300, message, {
        fontSize: "24px",
        color: "#ffffff",
        align: "center",
        fontFamily: "Tahoma, Arial, sans-serif",
        wordWrap: { width: 500 },
      })
      .setOrigin(0.5);
  }

  updateStatusText(text) {
    this.statusText.setText(text);
  }

  emitStats() {
    this.game.events.emit("stats-update", {
      level: this.levelManager.currentLevel,
      lives: this.levelManager.lives,
      falafel: this.levelManager.falafelCount,
      majorIngredientName: this.levelManager.getCurrentMajorIngredientName(),
      majorIngredientNeeded: this.levelManager.shouldOfferMajorIngredientThisLevel(),
      majorIngredientUnlocked: this.levelManager.canSpawnMajorIngredient(),
      collectedMajorIngredients: [...this.levelManager.collectedMajorIngredients],
    });
  }
}
