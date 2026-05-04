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
    this.enemies = null;
    this.hazards = null;
    this.isRecoveringFromHit = false;
  }

  init(data) {
    this.levelManager = data.levelManager;
  }

  create() {
    this.physics.world.setBounds(0, 0, 800, 600);
    this.cameras.main.setBackgroundColor(palette.nightBlue);
    this.createBackdrop();
    this.createPlatforms();
    this.createPlayer();
    this.createFalafelPieces();
    this.createEnemies();
    this.createHazards();
    this.createMajorIngredient();
    this.createExitGate();
    this.createLevelStatusText();
    this.cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.overlap(this.player, this.falafelGroup, this.collectFalafel, null, this);
    this.physics.add.overlap(this.player, this.majorIngredient, this.collectMajorIngredient, null, this);
    this.physics.add.overlap(this.player, this.exitGate, this.tryFinishLevel, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitByDanger, null, this);
    this.physics.add.overlap(this.player, this.hazards, this.hitByDanger, null, this);

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

    this.add.text(16, 574, "Jordanian vibe: Amman stones + Badia tones + Shemagh red", {
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
    this.platforms.create(420, 300, null).setDisplaySize(180, 16).refreshBody();

    this.platforms.getChildren().forEach((platform) => {
      platform.setVisible(false);
      platform.body.updateFromGameObject();
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(90, 520, "hero-fallback");
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.05);
    this.player.setScale(1.35);
    this.player.setSize(20, 34, true);
    this.physics.add.collider(this.player, this.platforms);
  }

  createFalafelPieces() {
    this.falafelGroup = this.physics.add.group();
    const levelSeed = this.levelManager.currentLevel;
    const falafelCount = 14 + Math.floor(this.levelManager.currentLevel / 2);

    for (let i = 0; i < falafelCount; i += 1) {
      const x = 90 + ((i * 47 + levelSeed * 13) % 620);
      const y = 150 + ((i * 79 + levelSeed * 11) % 320);
      const falafel = this.add.circle(x, y, 10, 0xd18b3f, 1);
      this.physics.add.existing(falafel);
      falafel.body.setAllowGravity(false);
      this.falafelGroup.add(falafel);
    }
  }

  createEnemies() {
    this.enemies = this.physics.add.group();
    const count = this.levelManager.getEnemyCount();
    const speed = this.levelManager.getEnemySpeed();

    for (let i = 0; i < count; i += 1) {
      const enemy = this.add.rectangle(220 + i * 110, 548 - (i % 2) * 130, 26, 26, 0xb3312d, 1);
      this.physics.add.existing(enemy);
      enemy.body.setAllowGravity(false);
      enemy.body.setVelocityX(i % 2 === 0 ? speed : -speed);
      enemy.body.setCollideWorldBounds(true);
      enemy.body.setBounce(1, 0);
      this.enemies.add(enemy);
    }
  }

  createHazards() {
    this.hazards = this.physics.add.staticGroup();
    const spikes = this.add.rectangle(450, 578, 140, 20, 0x6a4b2e, 1);
    const spikes2 = this.add.rectangle(690, 578, 120, 20, 0x6a4b2e, 1);
    this.hazards.add(spikes);
    this.hazards.add(spikes2);
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
    this.statusText = this.add.text(16, 112, "", {
      fontSize: "16px",
      color: "#f2eee6",
      backgroundColor: "#1f2833",
      padding: { left: 6, right: 6, top: 4, bottom: 4 },
      fontFamily: "Tahoma, Arial, sans-serif",
    });
    this.updateStatusText("Collect Falafel, then reach the gate.");
  }

  update() {
    this.player.setVelocityX(0);
    const speed = this.levelManager.getMovementSpeed();

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.flipX = false;
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

  hitByDanger() {
    if (this.isRecoveringFromHit) {
      return;
    }
    this.isRecoveringFromHit = true;
    this.levelManager.loseLife(1);
    this.emitStats();

    if (this.levelManager.isGameOver()) {
      this.scene.stop("UIScene");
      this.scene.start("ResultScene", { levelManager: this.levelManager, outcome: "lose" });
      return;
    }

    this.updateStatusText("You got hit! Stay sharp ya bطل.");
    this.player.setPosition(90, 520);
    this.player.setTint(0xff8080);
    this.time.delayedCall(900, () => {
      this.player.clearTint();
      this.isRecoveringFromHit = false;
    });
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
        this.scene.stop("UIScene");
        this.scene.start("ResultScene", { levelManager: this.levelManager, outcome: "win" });
      } else {
        this.updateStatusText("Missing major ingredients. Keep collecting every 4th level.");
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
      this.scene.stop("UIScene");
      this.scene.start("ResultScene", { levelManager: this.levelManager, outcome: "lose" });
    } else {
      this.updateStatusText("Ouch! Life lost. Press H only for testing.");
    }
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
