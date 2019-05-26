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

document.querySelector("#btn-ml-save-brain-localstorage").addEventListener('click', function (event) {
  if( neuroEvolution.bestGames.length > 0 ) {
    neuroEvolution.bestGames[0].brain.save('brain')
  }
});

document.querySelector("#btn-ml-save-brain-disk").addEventListener('click', function (event) {
  if( neuroEvolution.bestGames.length > 0 ) {
    let brainJSON = neuroEvolution.bestGames[0].brain.stringify();
    let a = document.createElement("a");
    let file = new Blob([brainJSON], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = 'brain.json';
    a.click();
  }
});

document.querySelector("#btn-ml-load-brain-localstorage").addEventListener('click', function (event) {
  cachedLevelSections = [];
  let games = neuroEvolution.pausedGames;
  neuroEvolution.pausedGames;
  neuroEvolution.reset();

  let brainData = localStorage.getItem('brain');

  loadBrain(JSON.parse(brainData));
});


document.querySelector("#btn-ml-load-brain-disk").addEventListener('change', function (event) {
  let file = this.files[0];
  let reader = new FileReader()
  let textFile = /application\/json/;
  let fileText = '';

  if (file.type.match(textFile)) {
    reader.onload = function (event) {
       let importedBrain = JSON.parse(event.target.result);

       console.log(importedBrain);

       loadBrain(importedBrain);
    }
  }

  reader.readAsText(file);
});

const loadBrain = (brainData) => {
  const ai = new Ai();
  let brain = new NeuralNetwork(ai.inputs, ai.neurons, ai.outputs);
  brain.dispose();

  brain.input_weights = tf.tensor(brainData.input_weights);
  brain.output_weights = tf.tensor(brainData.output_weights);

  let brains = [];
  for ( let i = 0; i < ai.totalGames; i++ ) {
    brains.push(brain);
  }

  let games = neuroEvolution.pausedGames;
  neuroEvolution.pausedGames;
  neuroEvolution.reset();

  neuroEvolution.processGeneration(games, brains);
};
