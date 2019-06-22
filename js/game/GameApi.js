/**
 * Game API - that exposes public info to interfacing clients
 */
class GameApi {

  #game = new Game();

  constructor() {
  }

  start() {
    this.#game.start();
  }

  setHighlightSectionAhead(index) {
    this.#game.setHighlightSectionAhead(index)
  }

  isOver() {
    return this.#game.isOver;
  }

  isSetup() {
    return this.#game.isSetup;
  }

  getId() {
    return this.#game.id;
  }

  getContainer() {
    return this.#game.container;
  }

  getCanvas() {
    return this.#game.canvas;
  }

  getHeight() {
    return this.#game.getHeight();
  }

  getWidth() {
    return this.#game.getWidth();
  }

  getPlayerY() {
    return this.#game.player.y;
  }

  getPlayerX() {
    return this.#game.player.x;
  }

  getSectionFromPlayer(index) {
    return this.#game.getSectionFromPlayer(index);
  }

  getPlayerVelocity() {
    return this.#game.playerVelocity;
  }

  getProgress() {
    return this.#game.getProgress();
  }

  getScore() {
    return this.#game.score;
  }

  canPlayerJump() {
    return this.#game.player.canJump();
  }

  isPlayerJumping() {
    return this.#game.player.jumping;
  }

  jump(){
    this.#game.jump();
  }

  isLevelPassed() {
    return this.#game.isLevelPassed;
  }

  setDebugPoints(debugPoints) {
    this.#game.setDebugPoints(debugPoints);
  }

  remove() {
    this.#game.remove();
  }

  show() {
    this.#game.show();
  }
}
