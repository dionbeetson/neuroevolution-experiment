/**
 * Manages the Game orchestration
 */
class Game {
  #container = null;
  #canvas = null;
  #ctx = null;
  #id = null;
  #fps = 60;
  #loggerEnabled = false;
  #isSetup = false;
  #isOver = false;
  #isLevelPassed = false;
  #gameAnimationFrame = null;
  #player = null;
  #levels = {};
  #level = null;
  #scorer = null;
  #controller = null;
  #score = 0;
  #scoreItems = [];
  #currentSpeed = speed;
  #fpsInterval;
  #sectionActiveIndex = 0;
  #sectionsFromPlayerCurrent = -1;
  #sectionsFromPlayer = [];
  #highlightSectionsAheadOfPlayer = [];
  #playerCollisionSection;
  #playerVelocity = 0;
  #playerGravity;
  #playerLift;
  #gravity = 0.63;
  #lift = -7.2;
  #speedCurrent;
  #colors = {};

  #debugPoints = [];
  #debug = false;
  #debugFps = [];

  constructor() {
    this.#colors = {
      progressBar: '#A1CFBC',
      debugPoint: '#A1CFBC'
    };
    this.#levels = {
      1: new LevelOne(),
      2: new LevelTwo(),
      3: new LevelThree()
    };
  }

  setup() {
    const d = new Date();
    this.#id = d.getTime() + '-' + random(1, 1000000);
    const gamesContainer = document.querySelector("#games-container");
    this.#container = document.createElement("div");
    this.#container.setAttribute('class', 'game-container');
    gamesContainer.appendChild(this.#container);

    this.#canvas = document.createElement("canvas");
    this.#canvas.setAttribute("id", "game-" + this.#id);
    this.#canvas.setAttribute("width", "300");
    this.#canvas.setAttribute("height", "150");
    this.#container.appendChild(this.#canvas);

    let scoreContainer = document.createElement("div");
    scoreContainer.setAttribute("class", "score-container");
    let score = document.createElement("span");
    score.setAttribute("class", "score");
    let scoreText = document.createElement("span");
    scoreText.innerHTML = "progress";
    scoreContainer.appendChild(score);
    scoreContainer.appendChild(scoreText);

    this.#container.appendChild(scoreContainer);

    let fps = document.createElement("span");
    fps.setAttribute("class", "fps-container");
    this.#container.appendChild(fps);

    this.#ctx = this.#canvas.getContext("2d");
  }

  process() {
    let sections = this.#level.sections;
    for(var i=0; i < sections.length; i++) {
      sections[i].x -= 4;
    }

    for(var i=(sections.length-1); i>0; i--) {

      sections[i].fillStyle = this.#level.colors.section;

      // Is current section in player bounds
      // Is player within a section (this could be 2 sections if transitioning)
      if( (this.#player.x+this.#player.radius) > sections[i].x && (this.#player.x) < (sections[i].x + sections[i].width) ) {
        // Previous section that player is just exiting
        if( this.#player.x > sections[i].x && (this.#player.x) < (sections[i].x + sections[i].width) ) {
          if ( false == this.#player.isJumping() ) {
            // Player isn't jumping, and section height is less, reset ground so gravity drops player
            if( (this.#canvas.height - sections[i].height) > (this.#player.y+this.#player.radius) && undefined !== sections[(i+1)] && sections[i].height > sections[(i+1)].height) {
             this.#player.ground = this.#canvas.height-sections[i].height - this.#player.radius;
            }
          }
        }

        // Current section
        if( (this.#player.x+this.#player.radius) > sections[i].x && (this.#player.x+this.#player.radius) < (sections[i].x + sections[i].width) ) {

          // Check for collision first
          if( this.didPlayerCollideWithSection( this.#player, sections[i] ) ) {
            this.#playerCollisionSection = sections[i];
            sections[i].fillStyle = this.#level.colors.sectionCollide;

            this.#isOver = true;
            if( sections[i].end ) {
              this.#isLevelPassed = true;
              this.addScore(40);
              this.log("Level complete!");
            } else {

              this.#isLevelPassed = false;

              // Call a draw once to get last frame
              enableDrawOverride = true;
              this.draw();
              enableDrawOverride = false;

              this.log("GAME OVER :-(", this.#sectionActiveIndex);
            }
            this.cleanup();

            return;
          }

          if( sections[i].height != this.#level.lastSectionHeight ) {
            // Just passed a jump
            if( sections[i].height < this.#level.lastSectionHeight ) {
              this.addScore(4);
            }

            // Just passed a dip
            if( sections[i].height > this.#level.lastSectionHeight ) {
              this.addScore(4);
            }

            this.#level.lastSectionHeight = sections[i].height;
          }

          // Set active section index
          this.#sectionActiveIndex = i;

          // Color active section
          sections[i].fillStyle = this.#level.colors.sectionActive;

          if( i != this.#sectionsFromPlayerCurrent ) {
            this.addScore(1);
            this.#sectionsFromPlayer[0] = sections[i];
            this.#sectionsFromPlayer[1] = sections[i+1];
            this.#sectionsFromPlayer[2] = sections[i+2];
            this.#sectionsFromPlayer[3] = sections[i+3];
            this.#sectionsFromPlayer[4] = sections[i+4];
            this.#sectionsFromPlayerCurrent = i;
            if( this.#player.jumpCounter > 0 ) {
              this.#player.jumpCounter -= 0.1;
            }
          }

          if ( this.#highlightSectionsAheadOfPlayer.length > 0 ) {
            for(let ii=0; ii< this.#highlightSectionsAheadOfPlayer.length; ii++) {
              const highlightSectionAheadOfPlayer = this.#highlightSectionsAheadOfPlayer[ii];
              if( undefined !== sections[i+highlightSectionAheadOfPlayer] ) {
                sections[i+highlightSectionAheadOfPlayer].fillStyle = this.#level.colors.sectionLookAheadHighlight;
              }
            }
          }

          if ( this.#player.isJumping() ) {
            // If jumping, reset player.ground
            // Also check if player in section based off player.x only
            if( ((this.#player.x + this.#player.radius) > sections[i].x) && this.#player.x < (sections[i].x + sections[i].width) ) {
              const potentialNewPlayerGround = this.#canvas.height-sections[i].height - this.#player.radius;

              if ( potentialNewPlayerGround > this.#player.y) {
               this.#player.ground = potentialNewPlayerGround
              }
            }
          }

          // Previous section that player is just exiting
          if ( false == this.#player.isJumping() ) {
            if( (this.#canvas.height - sections[i].height) > (this.#player.y+this.#player.radius/2) ) {
              if( sections[i].x < (this.#player.x - this.#player.radius / 2) ) {
                this.#player.ground = this.#canvas.height-sections[i].height - this.#player.radius;
              }
            }
          }
        }
      }
    }

    if ( false == this.#player.jumping && this.#player.ground > this.#player.y ){
      if ( (this.#player.y + (this.#playerVelocity+this.#playerGravity)) < this.#player.ground ) {
        this.#playerVelocity += this.#playerGravity;
        this.#player.y += this.#playerVelocity;
      } else {
        this.#player.y = this.#player.ground;
      }
    }

    if(this.#controller.spaceBarPressed) {
      this.#controller.spaceBarPressed = false;
      let skipAllFutureJumps = false;

      this.addScore(-3);

      if ( this.#player.jumping ) {
        skipAllFutureJumps = true;
      }

      if ( this.#player.canJump() && false == skipAllFutureJumps ){
        this.#player.jumping = true;
        this.#player.jumpCounter++;

        this.#playerGravity = this.#gravity;
        this.#playerLift = this.#lift;

        this.#playerVelocity = this.#playerLift;
      }
    }

    if( this.#player.jumping ) {
      this.#playerVelocity += (this.#playerGravity);
      this.#player.y += this.#playerVelocity;

      if ( this.#player.y > (this.#player.ground - this.#playerVelocity) ) {
        this.#player.jumping = false;
        this.#player.y = this.#player.ground;
        this.#player.jumpCounter--;
      }
    }
  }

  canDraw() {
    if ( enableDraw || enableDrawOverride ) {
      return true;
    }

    return false;
  }

  draw() {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    if( this.canDraw() ) {
      this.#level.draw(this.#ctx);
      this.drawProgress();
      this.drawDebugPoints();
      this.#player.draw(this.#ctx);
    }
  }

  drawProgress() {
    this.#ctx.beginPath();
    this.#ctx.moveTo(0, this.#canvas.height);
    this.#ctx.strokeStyle = this.#colors.progressBar;
    this.#ctx.lineTo((this.#canvas.width * (this.getProgress()/100)), this.#canvas.height);
    this.#ctx.stroke();
  }


  drawDebugPoints() {
    for(var i=0; i < this.#debugPoints.length; i++) {

      let x = this.#debugPoints[i].x;
      let y = this.#debugPoints[i].y;

      // remove aliasing
      x = Math.floor(x) + 0.5;
      y = Math.floor(y) + 0.5;

      if ( this.canDraw() ) {
        this.#ctx.strokeWidth = 1;

        this.#ctx.moveTo(x, y - 6);
        this.#ctx.lineTo(x, y + 6);

        this.#ctx.moveTo(x - 6,  y);
        this.#ctx.lineTo(x + 6,  y);

        // Line color
        this.#ctx.strokeStyle = this.#colors.debugPoint;

        this.#ctx.stroke();
        this.#ctx.closePath;
      }
    }
  }

  didPlayerCollideWithSection(player, mapSection) {
      var distX = Math.abs(player.x - mapSection.x - mapSection.width / 2);
      var distY = Math.abs(player.y - 1 - mapSection.y - mapSection.height / 2);

      if (distX > (mapSection.width / 2 + player.radius)) {
          return false;
      }
      if (distY > (mapSection.height / 2 + player.radius)) {
          return false;
      }

      if (distX <= (mapSection.width / 2)) {
          return true;
      }
      if (distY <= (mapSection.height / 2)) {
          return true;
      }

      var dx = distX - mapSection.width / 2;
      var dy = distY - mapSection.height / 2;
      return (dx * dx + dy * dy <= (player.radius * player.radius));
  }

  log(log) {
    if ( this.#loggerEnabled ) {
      console.log(log)
    }
  }

  addScore(amount) {
    if( (this.#score + amount) < 0 ) {
      return;
    }

    this.#score += amount;
    let scoreDate = new Date();
    this.#scoreItems.push({
      time: scoreDate.getTime(),
      score: amount,
      totalScore: this.#score
    })
  }

  getProgress() {
    return (this.#sectionActiveIndex / this.#level.sections.length) * 100;
  }

  start() {
    let self = this;
    let mapBaseline = 40;

    this.setup();
    this.setupDebug();

    this.#controller = new Controller();
    this.#controller.setup();

    let tempLevelSections = [];
    if( cachedLevelSections.length > 0 ) {
      for ( let i = 0; i < cachedLevelSections.length; i++ ) {
        tempLevelSections.push(clone(cachedLevelSections[i]));
      }
    }

    let level = document.querySelector("#level").value;
    this.#level = this.#levels[level];

    this.#level.setup(this.#canvas, tempLevelSections);
    if( 0 == cachedLevelSections.length ) {
      tempLevelSections = this.#level.sections;
      for ( let i = 0; i < tempLevelSections.length; i++ ) {
        cachedLevelSections.push(clone(tempLevelSections[i]));
      }
    }

    this.#player = new Player(this.#canvas, this.#level.levelBaseline);

    this.#scorer = new Scorer(this);
    this.#scorer.setup();

    let processGameFunction = async () => {
      if( false === this.#isOver ) {
        this.#speedCurrent = speed;

        let d = new Date();
        let s = d.getSeconds();
        if ( undefined === this.#debugFps[s] ) {
          this.#debugFps[s] = 1;
        } else {
          this.#debugFps[s]++;
        }

        this.process();

        await sleep(this.#speedCurrent);
        processGameFunction();
      }
    };
    processGameFunction();

    this.#fpsInterval = setInterval(() => {
      let d = new Date();
      let s = d.getSeconds();
      if ( s > 2 ) {
        s--;
      }

      this.#container.querySelector(".fps-container").innerHTML = this.#debugFps[s] + 'fps';
    }, 1000);

    // The game drawer
    let gameRedraw = () => {

      setTimeout(function(){
        self.draw();
        self.#isSetup = true;

        if( false == self.#isOver ) {
          self.gameAnimationFrame = requestAnimationFrame(gameRedraw)
        }
      }, 1000/this.#fps);
    };

    requestAnimationFrame(gameRedraw)
  }

  get id(){
    return this.#id;
  }

  getHeight() {
    return this.#canvas.height;
  }

  getWidth() {
    return this.#canvas.width;
  }

  get player() {
    return this.#player;
  }

  get score() {
    return this.#score;
  }

  get container() {
    return this.#container;
  }

  get level() {
    return this.#level;
  }

  get isOver() {
    return this.#isOver;
  }

  get isSetup() {
    return this.#isSetup;
  }

  get isLevelPassed() {
    return this.#isLevelPassed;
  }

  jump() {
    this.#controller.spaceBarPressed = true;
  }

  getSectionFromPlayer(indexFromPlayer) {
    if ( undefined != this.#sectionsFromPlayer[indexFromPlayer] ) {
      return this.#sectionsFromPlayer[indexFromPlayer];
    } else {
      console.log('Section ahead not found', indexFromPlayer)
    }
    return this.#sectionsFromPlayer[0];
  }

  setHighlightSectionAhead(index) {
    this.#highlightSectionsAheadOfPlayer.push(index);
  }

  set loggerEnabled(loggerEnabled) {
    console.log('loggerEnabled')
    this.#loggerEnabled = loggerEnabled;
  }

  hide() {
    if( null !== this.#container ) {
      this.#container.classList.add('game-container-hide');
    }
  };

  show() {
    if( null !== this.#container ) {
      this.#container.classList.remove('game-container-hide');
    }
  };

  end() {
    this.#isOver = true;
    this.#isLevelPassed = false;
  };

  cleanup() {
    cancelAnimationFrame(this.#gameAnimationFrame);
    // clearInterval(this.#scorer.interval);
    this.#scorer.cleanup();
    clearInterval(this.#fpsInterval);
  };

  remove() {
    if( null !== this.#container ) {
      this.#container.remove();
    }
  };

  setDebugPoints(debugPoints) {
    this.#debugPoints = debugPoints;
  };

  setupDebug() {
    const self = this;
    this.#container.addEventListener("click", function(){
      if( false == self.debug ) {
        self.debug = true;
      } else {
        self.debug = false;
      }
      console.log('score', self.score);
      console.log('scoreItems', self.#scoreItems);
      console.log('player.y', self.#player.y);
      console.log('player.x', self.#player.x);
      console.log('player.jumping', self.player.jumping);
      console.log('player.ground', self.player.ground);
      console.log('mapSections', self.#level.sections);
      console.log('mapSectionActiveIndex', self.#sectionActiveIndex);
      console.log('mapSectionsactive', self.#level.sections[self.#sectionActiveIndex]);
      console.log('lastMapSectionHeight', self.#level.lastSectionHeight);
      console.log('playerCollisionSection', self.#playerCollisionSection);
      console.log('progress', self.getProgress(), ((self.#sectionActiveIndex / self.#level.sections.length) * 100), self.#id);
      console.log('FPS', self.#debugFps);

      if ( self.isOver ) {
        enableDrawOverride = true;
        self.draw();
        enableDrawOverride = false;
      }

    }, false);
  }
}
