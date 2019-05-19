/**
 * General UI interaction controller
 */

// Todo: Remove global variable
let neuroEvolution = new NeuroEvolution();

document.querySelector("#btn-ml-it").addEventListener('click', function (event) {
  neuroEvolution.processGeneration([]);
}, false);

document.querySelector("#ml-pause-before-next-generation").addEventListener("change", function() {
  neuroEvolution.pauseBeforeNextGeneration = this.checked;

  if( false == neuroEvolution.pauseBeforeNextGeneration && neuroEvolution.pausedGames.length > 0 && neuroEvolution.pausedBestPlayerBrainsByFitness.length > 0 ) {
    neuroEvolution.processGeneration(neuroEvolution.pausedGames, neuroEvolution.pausedBestPlayerBrainsByFitness);
  }
});

neuroEvolution.pauseBeforeNextGeneration = document.querySelector("#ml-pause-before-next-generation").checked;

document.querySelector("#best-player-score").addEventListener("click", function() {
  console,log(ai.neuroEvolution.bestGames);
});

document.querySelector("#btn-ml-save-top-brain").addEventListener('click', function (event) {
  if( neuroEvolution.bestGames.length > 0 ) {
    neuroEvolution.bestGames[0].brain.save('brain-manual')
  }
});

document.querySelector("#btn-ml-load-top-brain-auto").addEventListener('click', function (event) {
  loadBrain('brain-auto');
});

document.querySelector("#btn-ml-load-top-brain-manual").addEventListener('click', function (event) {
  loadBrain('brain-manual');
});

const loadBrain = (key) => {
  cachedLevelSections = [];
  let games = neuroEvolution.pausedGames;
  neuroEvolution.pausedGames;
  neuroEvolution.reset();

  let brainData = localStorage.getItem(key);

  brainData = JSON.parse(brainData);

  const ai = new Ai();
  let brain = new NeuralNetwork(ai.inputs, ai.neurons, 1);
  brain.dispose();

  brain.input_weights = tf.tensor(brainData.input_weights);
  brain.output_weights = tf.tensor(brainData.output_weights);

  let brains = [];
  for ( let i = 0; i < ai.totalGames; i++ ) {
    brains.push(brain);
  }

  neuroEvolution.processGeneration(games, brains);
};
