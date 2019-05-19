/**
 * Manages the Keyboard controls for the game
 */
class Controller {
  #spaceBarPressed = false;

  setup() {
    const self = this;
    document.addEventListener("keydown", (e) => {
      self.keyDownHandler(e, self)
    }, false);
    document.addEventListener("keyup", (e) => {
      this.keyUpHandler(e, self)
    }, false);
  }

  keyDownHandler(e, self) {
    if(e.key == " ") {
      e.preventDefault();
      this.#spaceBarPressed = true;
    }
  }

  keyUpHandler(e, self) {
    if(e.key == " " ) {
      self.#spaceBarPressed = false;
    }
  }

  get spaceBarPressed() {
    return this.#spaceBarPressed;
  }

  set spaceBarPressed( spaceBarPressed ) {
    this.#spaceBarPressed = spaceBarPressed;
  }
}
