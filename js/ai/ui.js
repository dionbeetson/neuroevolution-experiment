/**
 * General UI interaction controller
 */

// Todo: Remove global variable
let neuroEvolution = new NeuroEvolution();

document.querySelector("#btn-ml-start").addEventListener('click', function (event) {
  neuroEvolution.start([]);
}, false);

document.querySelector("#ml-use-object-recognition").addEventListener("change", function() {
  if ( this.checked ) {
    neuroEvolution.useImageRecognition = true;
  } else {
    neuroEvolution.useImageRecognition = false;
  }
});

document.querySelector("#ml-pause-before-next-generation").addEventListener("change", function() {
  neuroEvolution.pauseBeforeNextGeneration = this.checked;

  if( false == neuroEvolution.pauseBeforeNextGeneration && neuroEvolution.pausedGames.length > 0 && neuroEvolution.pausedBestNeuralNetworksByFitness.length > 0 ) {
    neuroEvolution.start(neuroEvolution.pausedGames, neuroEvolution.pausedBestNeuralNetworksByFitness);
  }
});

neuroEvolution.pauseBeforeNextGeneration = document.querySelector("#ml-pause-before-next-generation").checked;

document.querySelector("#btn-ml-save-neuralnetwork-localstorage").addEventListener('click', function (event) {
  if( neuroEvolution.bestGames.length > 0 ) {
    neuroEvolution.bestGames[0].neuralNetwork.save('neuralNetwork')
  }
});

document.querySelector("#btn-ml-save-neuralnetwork-disk").addEventListener('click', function (event) {
  if( neuroEvolution.bestGames.length > 0 ) {
    let neuralNetworkJSON = neuroEvolution.bestGames[0].neuralNetwork.stringify();
    let a = document.createElement("a");
    let file = new Blob([neuralNetworkJSON], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = 'neuralNetwork.json';
    a.click();
  }
});

document.querySelector("#btn-ml-load-neuralnetwork-localstorage").addEventListener('click', function (event) {
  cachedLevelSections = [];
  let games = neuroEvolution.pausedGames;
  neuroEvolution.pausedGames;
  neuroEvolution.reset();

  let neuralNetworkData = localStorage.getItem('neuralNetwork');

  loadNeuralNetwork(JSON.parse(neuralNetworkData));
});


document.querySelector("#btn-ml-load-neuralnetwork-disk").addEventListener('change', function (event) {
  let file = this.files[0];
  let reader = new FileReader()
  let textFile = /application\/json/;
  let fileText = '';

  if (file.type.match(textFile)) {
    reader.onload = function (event) {
       let importedNeuralNetwork = JSON.parse(event.target.result);

       loadNeuralNetwork(importedNeuralNetwork);
    }
  }

  reader.readAsText(file);
});

const loadNeuralNetwork = (neuralNetworkData) => {
  const ai = new Ai();
  let neuralNetwork = new NeuralNetwork(ai.inputs, ai.neurons, ai.outputs);
  neuralNetwork.dispose();

  neuralNetwork.input_weights = tf.tensor(neuralNetworkData.input_weights);
  neuralNetwork.output_weights = tf.tensor(neuralNetworkData.output_weights);

  let neuralNetworks = [];
  for ( let i = 0; i < ai.totalGames; i++ ) {
    neuralNetworks.push(neuralNetwork);
  }

  let games = neuroEvolution.pausedGames;
  neuroEvolution.pausedGames;
  neuroEvolution.reset();

  neuroEvolution.start(games, neuralNetworks);
};

document.querySelector("#ml-enable-vision").addEventListener("change", function() {
  neuroEvolution.enableMlVision = this.checked;
});

neuroEvolution.enableMlVision = document.querySelector("#ml-enable-vision").checked;
