/**
 * The NeuroEvolution class that runs multiple generations of AI and breeds the best ones after each round until the game passes
 */
 class NeuroEvolution {

  #discountRate = 0.95;
  #learningRate = 0.05;
  #neuroEvolutionChart = new NeuroEvolutionChart();
  #bestScores = null;
  #bestGames = [];
  #generation = 1;
  #maxGenerations = 1500;
  #pausedGames = [];
  #pausedBestNeuralNetworksByFitness = [];
  #pauseBeforeNextGeneration = false;
  #enableMlVision = false;
  #useImageRecognition = false;

  constructor() {
    this.#bestScores = document.querySelector("#best-scores");
  }

  calculateFitness(games) {
    for ( let i = 0; i < games.length; i++ ) {
      let game = games[i];
      games[i].fitness = game.gameApi.getProgress() / 100;
      games[i].score = game.gameApi.getScore();
      games[i].progress = game.gameApi.getProgress();
    }

    // Now make the better progressed games have a higher fitness so they have a higher chance of being selected for next generation
    games.sort(this.sortByFitness);

    games.reverse();
    let prev = 0;
    for ( let i = 0; i < games.length; i++ ) {
      games[i].fitness = this.#discountRate * prev + games[i].fitness;
      prev = games[i].fitness;
    }

    games.sort(this.sortByFitness);

    return games;
  }

  pickBestGameFromFitnessPool(games) {
    let index = 0;
    let r = random(1);

    while (r > 0 ) {
      if( undefined !== games[index] ) {
        r = r - games[index].fitness;
        index++;
      } else {
        r = 0;
      }
    }
    index--;

    let game = games[index];

    return game;
  }

  pickBestGameByActualFitness(games){
    let game;
    let prevFitness = 0;
    for ( let i = 0; i < games.length; i++ ) {
      if (games[i].fitness > prevFitness) {
        game = games[i];
        prevFitness = game.fitness;
      }
    }

    return game;
  }

  didAtLeastOneGameCompleteLevel(games) {
    for ( let i = 0; i < games.length; i++ ) {
      if (games[i].gameApi.isLevelPassed() ) {
        return games[i];
      }
    }

    return false;
  }

  sortByFitness = (a, b) => {
    let comparison = 0;
    if ( a.fitness < b.fitness ) {
      comparison = 1;
    } else if ( a.fitness > b.fitness ) {
      comparison = -1;
    }
    return comparison;
  }

  mutateNeuralNetwork(b) {
		function fn(x) {
			if (random(1) < 0.05) {
				let offset = randomGaussian() * 0.5;
				let newx = x + offset;
				return newx;
			}
			return x;
		}

    let neuralNetwork = b.clone();
		let ih = neuralNetwork.input_weights.dataSync().map(fn);
		let ih_shape = neuralNetwork.input_weights.shape;
		neuralNetwork.input_weights.dispose();
		neuralNetwork.input_weights = tf.tensor(ih, ih_shape);

		let ho = neuralNetwork.output_weights.dataSync().map(fn);
		let ho_shape = neuralNetwork.output_weights.shape;
		neuralNetwork.output_weights.dispose();
		neuralNetwork.output_weights = tf.tensor(ho, ho_shape);
    return neuralNetwork;
  }

  crossoverNeuralNetwork(neuralNetworkOne, neuralNetworkTwo) {
		let parentA_in_dna = neuralNetworkOne.input_weights.dataSync();
		let parentA_out_dna = neuralNetworkOne.output_weights.dataSync();
		let parentB_in_dna = neuralNetworkTwo.input_weights.dataSync();
		let parentB_out_dna = neuralNetworkTwo.output_weights.dataSync();

		let mid = Math.floor(Math.random() * parentA_in_dna.length);
		let child_in_dna = [...parentA_in_dna.slice(0, mid), ...parentB_in_dna.slice(mid, parentB_in_dna.length)];
		let child_out_dna = [...parentA_out_dna.slice(0, mid), ...parentB_out_dna.slice(mid, parentB_out_dna.length)];

		let child = neuralNetworkOne.clone();
		let input_shape = neuralNetworkOne.input_weights.shape;
		let output_shape = neuralNetworkOne.output_weights.shape;

		child.dispose();

		child.input_weights = tf.tensor(child_in_dna, input_shape);
		child.output_weights = tf.tensor(child_out_dna, output_shape);

		return child;
	}

  start(games, bestPlayerBrainsByFitness) {
    this.updateUIRoundInformation();

    if ( this.#generation < this.#maxGenerations ) {

      if( false == this.#pauseBeforeNextGeneration ){
        for ( let i = 0; i < games.length; i++ ) {
          games[i].gameApi.remove();
        }

        games = undefined;

        this.#pausedGames = [];
        this.#pausedBestNeuralNetworksByFitness = [];

        this.#generation++;

        const ai = new Ai(this.finishGeneration.bind(this));
        ai.start(this.#useImageRecognition, bestPlayerBrainsByFitness);

      } else {
        this.#pausedGames = games;
        this.#pausedBestNeuralNetworksByFitness = bestPlayerBrainsByFitness;

        for ( let i = 0; i < games.length; i++ ) {
          games[i].gameApi.show();
        }
      }
    } else {
      this.enableSpeedInput();
    }
  }

  finishGeneration(games, timeTaken) {
    games = this.calculateFitness(games);

    // Did one of the games finish?
    let gamePassedLevel = this.didAtLeastOneGameCompleteLevel(games);

    let bestPlayerByFitness = gamePassedLevel;
    let bestPlayerBrainsByFitness = [];

    if( false === bestPlayerByFitness ){
        bestPlayerByFitness = this.pickBestGameByActualFitness(games);
    }

    this.#bestGames.push(bestPlayerByFitness);
    this.#bestGames.sort(this.sortByFitness);

    // Only keep top 5 best scores
    if( this.#bestGames.length > 5 ) {
      this.#bestGames = this.#bestGames.slice(0, 5);
    }

    // Update UI - Chart
    this.#neuroEvolutionChart.update(bestPlayerByFitness.progress, bestPlayerByFitness.score);

    // Update UI
    this.updateUIaddBestGenerationToBestScore(bestPlayerByFitness, timeTaken);
    this.updateUIBestPlayerScore(this.#bestGames[0]);
    this.updateUIRoundInformation();

    if ( false != gamePassedLevel ) {
      for ( let i = 0; i < games.length; i++ ) {
        if (games[i].gameApi.isLevelPassed() ) {
          games[i].neuralNetwork.save('neuralNetwork');
          for (let ii = 0; ii < games.length; ii++) {
            bestPlayerBrainsByFitness.push(games[i].neuralNetwork.clone());
          }
        }
      }

      console.log('Level Passed:', this.#bestGames[0], this.#bestGames.length, this.#bestGames);
      this.start(games, bestPlayerBrainsByFitness);
    } else {
      // Breeding
      for (let i = 0; i < games.length; i++) {
        let bestPlayerA = this.pickBestGameFromFitnessPool(games);
        let bestPlayerB = this.pickBestGameFromFitnessPool(games);
        let bestPlayerC = this.#bestGames[0];
        let child;

        if ( random(1) < 0.1) {
          const ai = new Ai();
          let bestPlayerD = new NeuralNetwork(ai.inputs, ai.neurons, ai.outputs);
          child = this.mutateNeuralNetwork(this.crossoverNeuralNetwork(bestPlayerC.neuralNetwork.clone(), bestPlayerD));
        } else {
          child = this.mutateNeuralNetwork(this.crossoverNeuralNetwork(bestPlayerA.neuralNetwork.clone(), bestPlayerB.neuralNetwork.clone()));
        }

        bestPlayerBrainsByFitness.push(child);
      }

      this.start(games, bestPlayerBrainsByFitness);
    }
  }

  updateUIaddBestGenerationToBestScore( pickBestPlayerByFitness, timeTaken ) {
    let bestScore = document.createElement("li");
    bestScore.innerHTML = pickBestPlayerByFitness.score + ' (' + pickBestPlayerByFitness.progress.toFixed(1) + '%) (' + pickBestPlayerByFitness.fitness.toFixed(3) + ') (' + timeTaken + 's)';
    this.#bestScores.insertBefore(bestScore, document.querySelector("li:first-child"));
  }

  updateUIRoundInformation() {
    document.querySelector("#round-current").innerHTML = this.#generation;
    document.querySelector("#round-total").innerHTML = this.#maxGenerations;
    document.querySelector("#round-progress").style.width = '0%';
    document.querySelector("#generation-progress").style.width = (this.#generation/this.#maxGenerations)*100 + '%';
  }

  updateUIBestPlayerScore( bestGame ) {
    document.querySelector("#best-player-score").innerHTML = bestGame.score + " points (" + bestGame.progress.toFixed(1) + "%)";
  }

  enableSpeedInput() {
    document.querySelector("#btn-speed").disabled = false;
  }

  disableSpeedInput() {
    document.querySelector("#btn-speed").disabled = true;
  }

  get pauseBeforeNextGeneration() {
    return this.#pauseBeforeNextGeneration;
  }

  set pauseBeforeNextGeneration( pauseBeforeNextGeneration ) {
    this.#pauseBeforeNextGeneration = pauseBeforeNextGeneration;
  }

  get pausedGames() {
    return this.#pausedGames;
  }

  get pausedBestNeuralNetworksByFitness() {
    return this.#pausedBestNeuralNetworksByFitness;
  }

  get bestGames() {
    return this.#bestGames;
  }

  set pauseBeforeNextGeneration( pauseBeforeNextGeneration ) {
    this.#pauseBeforeNextGeneration = pauseBeforeNextGeneration;
  }

  set useImageRecognition( useImageRecognition ) {
    this.#useImageRecognition = useImageRecognition;
  }

  set enableMlVision( enableMlVision ) {
    this.#enableMlVision = enableMlVision;
  }

  reset() {
    this.#bestGames = [];
    this.#generation = 1;
    this.#pausedGames = [];
    this.#pausedBestNeuralNetworksByFitness = [];
    this.#pauseBeforeNextGeneration = false;
  }
}
