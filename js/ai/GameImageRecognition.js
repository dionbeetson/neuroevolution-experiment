/**
 * GameImageRecognition - that wraps GameAPI, and intercepts certain calls to use image object detection to determine inputs for ML
 */
class GameImageRecognition {

  #gameApi = new GameApi();
  #gameApiCanvas;
  #isSetup = false;
  #visualTrackingCanvas;
  #visualTrackingMap = {};
  #visualTrackingMapSize = 10;
  #playerX = 0;
  #playerY = 0;
  #playerGroundY = 0;
  #sectionAhead = [];
  #enableVision = false;
  #colors = {
    block: 'grey',
    visionOutline: 'red',
    player: 'black',
    background: 'white'
  };

  start() {
    const self = this;

    // @todo - pass this in as an argument
    this.#enableVision = document.querySelector("#ml-enable-vision").checked;

    // @todo - remove dependency on gameAPI object - although outside of scope of this example
    this.#gameApi.start();
    this.setupCanvasTracker();

    // Simulate what happens in the game
    setTimeout(() => {
      self.#isSetup = true;
    }, 100);

  }

  setupCanvasTracker(){
    this.#visualTrackingCanvas = document.createElement("canvas");
    this.#visualTrackingCanvas.setAttribute("width", this.#gameApi.getWidth());
    this.#visualTrackingCanvas.setAttribute("height", this.#gameApi.getHeight());
    this.#visualTrackingCanvas.setAttribute("class", "snapshot-canvas");

    this.#gameApi.getContainer().appendChild(this.#visualTrackingCanvas);
    this.#gameApiCanvas = this.#gameApi.getCanvas();
  }

  // Method to extract data from canvas/image and convert it into a readable format for this class to use
  extractVisualTrackingData(){
    const convertImageToGreyScale = (image) => {
      let greyImage = new ImageData(image.width, image.height);
      const channels = image.data.length / 4;
      for( let i=0; i < channels; i++ ){
        let i4 = i*4;
        let r = image.data[i4 + 0];
        let g = image.data[i4 + 1];
        let b = image.data[i4 + 2];

        greyImage.data[i4 + 0] = Math.round(0.21*r + 0.72*g + 0.07*b);
        greyImage.data[i4 + 1] = g;
        greyImage.data[i4 + 2] = b;
        greyImage.data[i4 + 3] = 255;
      }

      return greyImage;
    }

    const getRGBAFromImageByXY = (imageData, x, y) => {
      let rowStart = y * imageData.width * 4;
      let pixelIndex = rowStart + x * 4;

      return [
        imageData.data[pixelIndex],
        imageData.data[pixelIndex+1],
        imageData.data[pixelIndex+2],
        imageData.data[pixelIndex+3],
      ]
    }

    // Method to create an object indexed by xposition and yposition with the color as the value, eg: 10x40 = grey
    const generateVisualTrackingMap = (data, width, height, visualTrackingMapSize, colors) => {
      let visualTrackingMap = {};
      for( let y = 0; y < height; y+=visualTrackingMapSize ) {
        for( let x = 0; x < width; x+=visualTrackingMapSize ) {
          let col = getRGBAFromImageByXY(data, x+5, y+5)
          let key = x+'x'+y;
          visualTrackingMap[key] = colors.background;

          if ( 0 == col[0] ) {
            visualTrackingMap[key] = colors.player;
          }

          if ( col[0] > 210 && col[0] < 240 ) {
            visualTrackingMap[key] = colors.block;
          }
        }
      }

      return visualTrackingMap;
    }

    const updatePlayerPositionFromVisualTrackingMap = (visualTrackingMap, colors) => {
      for (const xy in visualTrackingMap) {
        let value = visualTrackingMap[xy];

        if ( colors.player == value) {
          let position = xy.split('x');
          this.#playerX = parseInt(position[0]);
          this.#playerY = parseInt(position[1]);

          // If we dont have a ground, then set it
          if( 0 == this.#playerGroundY ) {
            this.#playerGroundY = this.#playerY;
          }
        }
      }
    }

    const getSectionAhead = (playerX, playerY, aheadIndex, pixelMapSize, playerGroundY) => {
      let x;
      let y;
      let section;
      let aheadWidth = aheadIndex*10;

      x = Math.ceil(playerX/pixelMapSize) * pixelMapSize + aheadWidth;
      y = Math.ceil(playerY/pixelMapSize) * pixelMapSize;

      section = this.getCollisionSectionAhead(x, y);

      if( false == section ) {
        section = [x, playerGroundY+pixelMapSize, pixelMapSize, pixelMapSize];
      }

      return {
        x: section[0],
        y: section[1],
        width: section[2],
        height: section[3],
      };
    }

    let data = this.#gameApiCanvas.getContext('2d').getImageData(0, 0, this.#visualTrackingCanvas.width, this.#visualTrackingCanvas.height);
    let dataGrey = convertImageToGreyScale(data);

    this.#visualTrackingMap = generateVisualTrackingMap(dataGrey, this.#visualTrackingCanvas.width, this.#visualTrackingCanvas.height, this.#visualTrackingMapSize, this.#colors);

    updatePlayerPositionFromVisualTrackingMap(this.#visualTrackingMap, this.#colors);

    this.#sectionAhead = getSectionAhead(this.#playerX, this.#playerY, 4, this.#visualTrackingMapSize, this.#playerGroundY);
  }

  // Logic to get the xy and width/height of the section ahead that we need to use to determine if we jump over or not
  getCollisionSectionAhead(x, y) {

    const isSectionSolid = (x, y) => {
      let section = this.#visualTrackingMap[x + 'x'  +y];
      if ( this.#colors.block == section ) {
        return true;
      }

      return false;
    }

    const findTopLeftBoundsOfSolidSection = (x, y) => {
      if ( isSectionSolid(x, y) ) {
        return findTopLeftBoundsOfSolidSection(x, y-this.#visualTrackingMapSize)
      }

      return [x,y+this.#visualTrackingMapSize];
    }

    const findTopRightBoundsOfSolidSection = (x, y, counter) => {
      if ( counter < 5 && isSectionSolid(x, y) ) {
        counter++
        return findTopRightBoundsOfSolidSection(x+this.#visualTrackingMapSize, y, counter)
      }

      return [x,y];
    }

    const findBottomLeftBoundsOfSolidSection = (x, y) => {
      if ( false === isSectionSolid(x, y) && y < this.#visualTrackingCanvas.height) {
        return findBottomLeftBoundsOfSolidSection(x, y+this.#visualTrackingMapSize)
      }

      return [x,y-this.#visualTrackingMapSize];
    }

    const findBottomRightBoundsOfSolidSection = (x, y, counter) => {
      if ( counter < 5 && false === isSectionSolid(x, y) ) {
        counter++
        return findBottomRightBoundsOfSolidSection(x+this.#visualTrackingMapSize, y, counter)
      }

      return [x,y];
    }

    // Look for drop/dip section ahead we need to jump over
    y = this.#playerGroundY;

    if ( isSectionSolid(x, y) ) {
      // Look for taller section ahead we need to jump over
      let xyStart = findTopLeftBoundsOfSolidSection(x, y-this.#visualTrackingMapSize);
      let xyEnd = findTopRightBoundsOfSolidSection(xyStart[0], xyStart[1], 1);

      return [xyStart[0], xyStart[1], xyEnd[0] - x, y - xyEnd[1] + this.#visualTrackingMapSize];
    } else {

      if (  false === isSectionSolid(x, y+this.#visualTrackingMapSize) ) {
        let xyStart = findBottomLeftBoundsOfSolidSection(x, y);
        let xyEnd = findBottomRightBoundsOfSolidSection(xyStart[0], xyStart[1], 1);

        return [xyStart[0], xyEnd[1]+this.#visualTrackingMapSize, xyEnd[0] - x, this.#visualTrackingMapSize];
        // return [xyStart[0], y+this.#visualTrackingMapSize, xyEnd[0] - x, xyEnd[1]-y];
      }
    }

    return false;
  }


  drawRectOnCanvas(rect, color) {
    let context = this.#visualTrackingCanvas.getContext('2d');
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = "1";
    context.rect(rect.x, rect.y, rect.width, rect.height);
    context.stroke();
  }

  // Function responsible for drawing what the computer sees, we then use this to get the inputs for tensorflow
  drawMachineVision() {
    if( this.#enableVision ) {
      // Clear everything first
      this.#visualTrackingCanvas.getContext('2d').clearRect(0, 0, this.#visualTrackingCanvas.width, this.#visualTrackingCanvas.height);

      // Draw player
      this.drawRectOnCanvas({
        x: this.#playerX,
        y: this.#playerY,
        width: this.#visualTrackingMapSize,
        height: this.#visualTrackingMapSize,
      }, this.#colors.visionOutline);

      // Draw map sections
      for (const xy in this.#visualTrackingMap) {
        let value = this.#visualTrackingMap[xy];

        if ( this.#colors.block == value) {
          let position = xy.split('x');
          this.drawRectOnCanvas({
            x: parseInt(position[0]),
            y: parseInt(position[1]),
            width: this.#visualTrackingMapSize,
            height: this.#visualTrackingMapSize
          }, this.#colors.visionOutline)
        }
      }


      this.drawRectOnCanvas({
        x: this.#sectionAhead.x,
        y: this.#sectionAhead.y,
        width: this.#sectionAhead.width,
        height: this.#sectionAhead.height,
      }, 'blue');
    }
  }

  setHighlightSectionAhead(index) {
    // Not required for this demo
    return;
  }

  isOver() {
    // @todo - determine this without access #gameAPI
    return this.#gameApi.isOver();
  }

  isSetup() {
    return this.#isSetup;
  }

  getHeight() {
    return this.#visualTrackingCanvas.height;
  }

  getWidth() {
    return this.#visualTrackingCanvas.width;
  }

  getPlayerX() {
    this.extractVisualTrackingData();
    this.drawMachineVision();

    return this.#playerX;
  }

  getPlayerY() {
    return this.#playerY;
  }

  getSectionFromPlayer(index) {
    return {
      x: this.#sectionAhead.x,
      y: this.#sectionAhead.y,
      width: this.#visualTrackingMapSize,
      height: this.#playerY-this.#sectionAhead.y
    };
  }

  // @todo - use image recognition for this
  getPlayerVelocity() {
    return 0;
  }

  canPlayerJump() {
    if( this.isPlayerJumping() ) {
      return false;
    }

    return true;
  }

  isPlayerJumping() {
    if( this.#playerY < this.#playerGroundY ) {
      return true;
    }

    return false;
  }

  remove() {
    if( null !== this.#visualTrackingCanvas.parentNode ) {
      this.#visualTrackingCanvas.parentNode.remove();
    }
  }

  show() {
    if( null !== this.#visualTrackingCanvas.parentNode ) {
      this.#visualTrackingCanvas.parentNode.classList.remove('game-container-hide');
    }
  }

  jump(){
    // The only way to simulate this is by pressing the spacebar key, but because we have multiple games at once it isnt easily possible.
    this.#gameApi.jump();
  }

  isLevelPassed() {
    return this.#gameApi.isLevelPassed();
  }

  setDebugPoints(debugPoints) {
    this.#gameApi.setDebugPoints(debugPoints);
  }

  // @todo - use image recognition for this
  getProgress() {
    return this.#gameApi.getProgress();
  }

  // @todo - use image recognition for this
  getScore() {
    return this.#gameApi.getScore();
  }
}
