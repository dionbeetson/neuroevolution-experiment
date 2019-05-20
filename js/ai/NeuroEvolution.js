/**
 * The NeuroEvolution class that runs multiple generations of AI and breeds the best ones after each round until the game passes
 */
 class NeuroEvolution {

  #discountRate = 0.95;
  #learningRate = 0.05;
  #bestProgressList = [];
  #neuroEvolutionChart = new NeuroEvolutionChart();
  #bestScores = null;
  #bestGames = [];
  #generation = 1;
  #maxGenerations = 400;
  #pausedGames = [];
  #pausedBestPlayerBrainsByFitness = [];
  #inProgress = false;
  #pauseBeforeNextGeneration = false;

  constructor() {
    this.#bestScores = document.querySelector("#best-scores");
  }

  calculateFitness(games) {
    let sum = 0;

    // Iterate over all games, and get score (add to sum)
    for (let game of games ) {
      sum += game.game.getScore() * game.game.getProgress();
    }

    // make sure a number from 0-1
    for ( let i = 0; i < games.length; i++ ) {
      let game = games[i];
      games[i].fitness = (game.game.getScore() * game.game.getProgress());
      games[i].score = game.game.getScore();
      games[i].progress = game.game.getProgress();
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

  pickBestPlayerByFitnessPool(games) {
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

  pickBestPlayerByActualFitness(games){
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
      if (games[i].game.isLevelPassed() ) {
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

  mutateBrain(b) {
		function fn(x) {
			if (random(1) < 0.05) {
				let offset = randomGaussian() * 0.5;
				let newx = x + offset;
				return newx;
			}
			return x;
		}

    let brain = b.clone();
		let ih = brain.input_weights.dataSync().map(fn);
		let ih_shape = brain.input_weights.shape;
		brain.input_weights.dispose();
		brain.input_weights = tf.tensor(ih, ih_shape);

		let ho = brain.output_weights.dataSync().map(fn);
		let ho_shape = brain.output_weights.shape;
		brain.output_weights.dispose();
		brain.output_weights = tf.tensor(ho, ho_shape);
    return brain;
  }

  crossoverBrain(brainOne, brainTwo) {
		let parentA_in_dna = brainOne.input_weights.dataSync();
		let parentA_out_dna = brainOne.output_weights.dataSync();
		let parentB_in_dna = brainTwo.input_weights.dataSync();
		let parentB_out_dna = brainTwo.output_weights.dataSync();

		let mid = Math.floor(Math.random() * parentA_in_dna.length);
		let child_in_dna = [...parentA_in_dna.slice(0, mid), ...parentB_in_dna.slice(mid, parentB_in_dna.length)];
		let child_out_dna = [...parentA_out_dna.slice(0, mid), ...parentB_out_dna.slice(mid, parentB_out_dna.length)];

		let child = brainOne.clone();
		let input_shape = brainOne.input_weights.shape;
		let output_shape = brainOne.output_weights.shape;

		child.dispose();

		child.input_weights = tf.tensor(child_in_dna, input_shape);
		child.output_weights = tf.tensor(child_out_dna, output_shape);

		return child;
	}

  processGeneration(games, bestPlayerBrainsByFitness) {
    this.updateUIRoundInformation();

    if ( this.#generation < this.#maxGenerations ) {

      if( false == this.#pauseBeforeNextGeneration ){
        for ( let i = 0; i < games.length; i++ ) {
          games[i].game.remove();
        }

        games = undefined;

        this.#pausedGames = [];
        this.#pausedBestPlayerBrainsByFitness = [];

        this.#generation++;

        const ai = new Ai(this.completeGeneration.bind(this));
        ai.start(bestPlayerBrainsByFitness);

      } else {
        this.#pausedGames = games;
        this.#pausedBestPlayerBrainsByFitness = bestPlayerBrainsByFitness;

        for ( let i = 0; i < games.length; i++ ) {
          games[i].game.show();
        }
      }
    } else {
      this.enableSpeedInput();
    }
  }

  completeGeneration(games, timeTaken) {
    games = this.calculateFitness(games);

    // Did one of the games finish?
    let gamePassedLevel = this.didAtLeastOneGameCompleteLevel(games);

    let pickBestPlayerByFitness = gamePassedLevel;
    let bestPlayerBrainsByFitness = [];

    if( false === pickBestPlayerByFitness ){
        pickBestPlayerByFitness = this.pickBestPlayerByActualFitness(games);
    }

    this.updateUIaddBestGenerationToBestScore(pickBestPlayerByFitness, timeTaken);

    this.#bestGames.push(pickBestPlayerByFitness);
    this.#bestGames.sort(this.sortByFitness);

    // Only keep top 5 best scores
    if( this.#bestGames.length > 5 ) {
      this.#bestGames = this.#bestGames.slice(0, 5);
    }

    this.updateUIBestPlayerScore(this.#bestGames[0]);

    // Update round
    this.updateUIRoundInformation();

    if ( false != gamePassedLevel ) {
      // Save game
      for ( let i = 0; i < games.length; i++ ) {
        if (games[i].game.isLevelPassed() ) {
          games[i].brain.save('brain');
          for (let ii = 0; ii < games.length; ii++) {
            bestPlayerBrainsByFitness.push(games[i].brain.clone());
          }
        }
      }

      console.log('Passed: bestGames: ', this.#bestGames[0], this.#bestGames.length, this.#bestGames);
      this.processGeneration(games, bestPlayerBrainsByFitness);
    } else {
      // Breeding
      for (let i = 0; i < games.length; i++) {
        let a = this.pickBestPlayerByFitnessPool(games);
        let b = this.pickBestPlayerByFitnessPool(games);
        let c = this.#bestGames[0];
        let child;

        if ( random(1) < 0.1) {
          const ai = new Ai();
          let d = new NeuralNetwork(ai.inputs, ai.neurons, 1);
          child = bestPlayerBrainsByFitness.push(this.mutateBrain(this.crossoverBrain(c.brain.clone(), d)));
        } else {
          child = bestPlayerBrainsByFitness.push(this.mutateBrain(this.crossoverBrain(a.brain.clone(), b.brain.clone())));
        }

        bestPlayerBrainsByFitness.push(child);
      }

      this.processGeneration(games, bestPlayerBrainsByFitness);
    }
  }

  updateUIaddBestGenerationToBestScore( pickBestPlayerByFitness, timeTaken ) {
    let bestScore = document.createElement("li");
    this.#neuroEvolutionChart.update(pickBestPlayerByFitness.progress, pickBestPlayerByFitness.score);
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

  get pausedBestPlayerBrainsByFitness() {
    return this.#pausedBestPlayerBrainsByFitness;
  }

  get bestGames() {
    return this.#bestGames;
  }

  set pauseBeforeNextGeneration( pauseBeforeNextGeneration ) {
    this.#pauseBeforeNextGeneration = pauseBeforeNextGeneration;
  }

  reset() {
    this.#bestGames = [];
    this.#generation = 1;
    this.#pausedGames = [];
    this.#pausedBestPlayerBrainsByFitness = [];
    this.#pauseBeforeNextGeneration = false;
  }
}
