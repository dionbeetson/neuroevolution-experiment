/**
 * AI class that essentially runs a single Evolution (Default of 9 games at once)
 */
 class Ai {
  #totalGames = 9;
  #inputs = 8;
  #neurons = 40;
  #outputs = 2;
  #games = [];
  #gamesRunning = 0;
  #sectionsToSeeAhead = 1;
  #forceDrawGameLeftCount = 3;
  #timeTakenDateStart = null;
  #completeCallback;

  constructor(completeCallback) {
    this.#completeCallback = completeCallback;
  }

  start(useImageRecognition, neuralNetworks, completeCallback) {
    this.#timeTakenDateStart = new Date();

    for ( let i = 0; i < this.#totalGames; i++ ) {
      let neuralNetwork;

      if ( undefined !== neuralNetworks && neuralNetworks[i] instanceof NeuralNetwork ) {
        neuralNetwork = neuralNetworks[i];
      } else {
        neuralNetwork = new NeuralNetwork(this.#inputs, this.#neurons, this.#outputs);
      }

      let gameApi;

      if ( useImageRecognition ) {
        gameApi = new GameImageRecognition();
      } else {
        gameApi = new GameApi();
      }

      this.#games[i] = {
        gameApi: gameApi,
        neuralNetwork: neuralNetwork,
        interval: null
      }

      // Debug look ahead
      this.#games[i].gameApi.setHighlightSectionAhead(this.#sectionsToSeeAhead)

      // Start game
      this.#gamesRunning++;
      this.#games[i].gameApi.start();

      this.#games[i].interval = setInterval(this.checkGame.bind(null, this, this.#games, this.#games[i]), 50);
    }
  }

  checkGame(ai, games, game) {
    if( game.gameApi.isOver() ) {
      clearInterval(game.interval);

      ai.#gamesRunning--;
      document.querySelector("#round-progress").style.width = ((games.length-ai.#gamesRunning)/games.length)*100 + '%';

      if( ai.areAllGamesOver(games) && 0 == ai.#gamesRunning ) {
        let timeTakenDateComplete = new Date();
        let timeTaken = (timeTakenDateComplete - ai.#timeTakenDateStart) / 1000;

        ai.#completeCallback(games, timeTaken);
      }
    } else {
      if( game.gameApi.isSetup() ) {
        ai.think(game);

        if ( ai.#gamesRunning <= ai.#forceDrawGameLeftCount ) {
          enableDrawOverride = true;
        }
      }
    }
  }

  /**
   * Method that gets the inputs from the game, and makes a prediction to jump or not to jump
   */
  think(game) {
    let inputs = [];
    let inputsNormalised = [];

    // Player y
    inputs[0] = (game.gameApi.getPlayerY());
    inputsNormalised[0] = map(inputs[0], 0, game.gameApi.getHeight(), 0, 1);

    // Player x
    inputs[1] = game.gameApi.getPlayerX();
    inputsNormalised[1] = map(inputs[1], inputs[1], game.gameApi.getWidth(), 0, 1);

    let section = game.gameApi.getSectionFromPlayer(this.#sectionsToSeeAhead);

    // 2nd closest section x
    inputs[2] = section.x + section.width;
    inputsNormalised[2] = map(inputs[2], inputs[1], game.gameApi.getWidth(), 0, 1);

    // 2nd closest section y
    inputs[3] = section.y;
    inputsNormalised[3] = map(inputs[3], 0, game.gameApi.getHeight(), 0, 1);

    // 2nd closest section y base
    inputs[4] = section.y + section.height;
    inputsNormalised[4] = map(inputs[4], 0, game.gameApi.getHeight(), 0, 1);

    section = game.gameApi.getSectionFromPlayer((this.#sectionsToSeeAhead+1));

    // Is player jumping
    inputs[5] = (game.gameApi.isPlayerJumping() ? 1 : 0);
    inputsNormalised[5] = map(inputs[5], 0, 1, 0, 1);

    // Player velocity
    inputs[6] = (game.gameApi.getPlayerVelocity() ? 1 : 0);
    inputsNormalised[6] = map(inputs[6], -1.1, 1.1, 0, 1);

    // Can play jump?
    inputs[7] = (game.gameApi.canPlayerJump() ? 1 : 0);
    inputsNormalised[7] = map(inputs[7], 0, 1, 0, 1);

    game.gameApi.setDebugPoints([
      {
        x: 0,
        y: inputs[0]
      },
      {
        x: inputs[1],
        y: 0
      },
      {
        x: inputs[2],
        y: 0
      },
      {
        x: 0,
        y: inputs[3]
      },
      {
        x: 0,
        y: inputs[4]
      }
    ]);

    let outputs = game.neuralNetwork.predict(inputsNormalised);

    if ( outputs[0] > 0.5 || outputs[1] > 0.5 ) {
      game.gameApi.jump();
    }
  }

  areAllGamesOver(games) {
    for ( let i = 0; i < this.#totalGames; i++ ) {
      if( false == games[i].gameApi.isOver() ) {
        return false;
      }
    }

    return true;
  }

  get totalGames(){
    return this.#totalGames;
  }

  get inputs(){
    return this.#inputs;
  }

  get neurons(){
    return this.#neurons;
  }

  get outputs(){
    return this.#outputs;
  }
}
