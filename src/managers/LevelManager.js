const MAJOR_INGREDIENT_ORDER = ["Jameed", "Meat", "Rice", "Shrak"];

export default class LevelManager {
  constructor(maxLevels = 16) {
    this.maxLevels = maxLevels;
    this.resetGame();
  }

  resetGame() {
    this.currentLevel = 1;
    this.lives = 3;
    this.falafelCount = 0;
    this.collectedMajorIngredients = [];
  }

  resetFalafelForLevel() {
    this.falafelCount = 0;
  }

  addFalafel(amount = 1) {
    this.falafelCount += amount;
  }

  canSpawnMajorIngredient() {
    return this.falafelCount >= 10;
  }

  getCurrentMajorIngredientName() {
    const index = Math.floor((this.currentLevel - 1) / 4);
    return MAJOR_INGREDIENT_ORDER[index];
  }

  collectCurrentMajorIngredient() {
    const ingredientName = this.getCurrentMajorIngredientName();
    if (!this.collectedMajorIngredients.includes(ingredientName)) {
      this.collectedMajorIngredients.push(ingredientName);
    }
  }

  shouldOfferMajorIngredientThisLevel() {
    return this.currentLevel % 4 === 0;
  }

  getMovementSpeed() {
    // Difficulty ramps up after level 8 as requested.
    return this.currentLevel > 8 ? 235 : 190;
  }

  getEnemySpeed() {
    return 60 + this.currentLevel * 9;
  }

  getEnemyCount() {
    return 2 + Math.floor((this.currentLevel - 1) / 3);
  }

  goToNextLevel() {
    if (this.currentLevel < this.maxLevels) {
      this.currentLevel += 1;
      this.resetFalafelForLevel();
      return true;
    }
    return false;
  }

  loseLife(amount = 1) {
    this.lives = Math.max(0, this.lives - amount);
    return this.lives;
  }

  hasWonGame() {
    return this.collectedMajorIngredients.length === MAJOR_INGREDIENT_ORDER.length;
  }

  isGameOver() {
    return this.lives <= 0;
  }
}
