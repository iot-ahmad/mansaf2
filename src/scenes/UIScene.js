import Phaser from "phaser";
import { palette } from "../theme/palette";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
    this.stats = {
      level: 1,
      lives: 3,
      falafel: 0,
      majorIngredientName: "Jameed",
      majorIngredientNeeded: false,
      majorIngredientUnlocked: false,
      collectedMajorIngredients: [],
    };
  }

  create() {
    this.falafelText = this.add
      .text(16, 16, "", {
        fontSize: "22px",
        color: "#ffffff",
        fontFamily: "Tahoma, Arial, sans-serif",
      })
      .setScrollFactor(0);

    this.levelText = this.add
      .text(16, 46, "", {
        fontSize: "18px",
        color: "#f2eee6",
        fontFamily: "Tahoma, Arial, sans-serif",
      })
      .setScrollFactor(0);

    this.progressText = this.add
      .text(16, 72, "", {
        fontSize: "16px",
        color: "#f2eee6",
        fontFamily: "Tahoma, Arial, sans-serif",
      })
      .setScrollFactor(0);

    this.alertBubble = this.add
      .text(400, 130, "يزم علامك ودنا نتغدا!", {
        fontSize: "24px",
        color: "#1f2833",
        backgroundColor: "#f2eee6",
        padding: { left: 12, right: 12, top: 8, bottom: 8 },
        fontFamily: "Tahoma, Arial, sans-serif",
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setVisible(false);

    this.alertBubbleBorder = this.add
      .rectangle(400, 130, 360, 58)
      .setStrokeStyle(2, palette.shemaghRed)
      .setDepth(99)
      .setVisible(false);

    this.game.events.on("stats-update", this.handleStatsUpdate, this);
    this.game.events.on("player-world-position", this.handlePlayerWorldPosition, this);

    this.refreshTexts();
  }

  handleStatsUpdate(nextStats) {
    this.stats = { ...this.stats, ...nextStats };
    this.refreshTexts();
    const isLowHealth = this.stats.lives === 1;
    this.alertBubble.setVisible(isLowHealth);
    this.alertBubbleBorder.setVisible(isLowHealth);
  }

  handlePlayerWorldPosition(position) {
    if (this.alertBubble.visible) {
      this.alertBubble.setPosition(position.x, position.y - 72);
      this.alertBubbleBorder.setPosition(position.x, position.y - 72);
    }
  }

  refreshTexts() {
    this.falafelText.setText(`Falafel: ${this.stats.falafel} / 10`);
    this.levelText.setText(`Level: ${this.stats.level}    Lives: ${this.stats.lives}`);

    const unlockHint = this.stats.majorIngredientNeeded
      ? this.stats.majorIngredientUnlocked
        ? `${this.stats.majorIngredientName} unlocked!`
        : `Collect 10 Falafel to unlock ${this.stats.majorIngredientName}`
      : "Collect Falafel and reach the gate";

    const collected = this.stats.collectedMajorIngredients.length
      ? this.stats.collectedMajorIngredients.join(", ")
      : "None";

    this.progressText.setText(`Mansaf Parts: ${collected}\n${unlockHint}`);
  }
}
