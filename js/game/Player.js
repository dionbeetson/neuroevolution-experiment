/**
 * The Player within the game
 */
class Player {
  #x = 0;
  #y = 0;
  #radius = 5;
  #jumping = false;
  #ground = 0;
  #colors = {
    player: '#54494B',
    playerCantJump: '#B33951'
  }

  constructor(canvas, levelGround) {
    this.#x = (canvas.width-(this.#radius))/2;
    this.#y = canvas.height-(levelGround + (this.#radius));

    this.#ground = this.#y;
  }

  isJumping() {
    return this.#jumping;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.#x, this.#y, this.#radius, 0, Math.PI*2);
    ctx.fillStyle = this.#colors.player;
    ctx.fill();
    ctx.closePath();
  }

  isPlayerOnGround() {
    if ( this.#y == this.#ground ) {
      return true;
    }

    return false;
  }

  canJump() {
    if ( this.#y != this.#ground ) {
      return false;
    }

    return true;
  };

  get radius() {
    return this.#radius;
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  set y(y) {
    this.#y = y;
  }

  get jumping() {
    return this.#jumping;
  }

  set jumping(jumping) {
    this.#jumping = jumping;
  }

  get ground() {
    return this.#ground;
  }

  set ground( ground ) {
    this.#ground = ground;
  }
}
