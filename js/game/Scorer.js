/**
 * Manages rendering the score into the Game canvas
 */
class Scorer {
  #interval = undefined;
  #game = null;

  constructor(game) {
    this.#game = game;
  }

  setup() {
    let game = this.#game;
    this.#interval = setInterval(() => {
      game.container.querySelector(".score").innerHTML = game.score + ' (' + game.getProgress().toFixed(2) + '%)';
    }, 250);
  }

  cleanup() {
    clearInterval(this.#interval)
  }
}
