/**
 * Neural Network
 * Mostly taken from https://github.com/llSourcell/Modeling_Evolution_with_TensorflowJS/blob/master/Docs/NeuroEvolution_nn.js.html
 */
class NeuralNetwork {
  constructor(input_nodes, hidden_nodes, output_nodes) {
    // The amount of inputs (eg: player y position, height of next block etc..)
    this.input_nodes = input_nodes;
    // Amount of hidden nodes within the Neural Network)
    this.hidden_nodes = hidden_nodes;
    // The amount of outputs, we will use 2 (will be needed for level 3)
    this.output_nodes = output_nodes;

    // Initialize random weights
    this.input_weights = tf.randomNormal([this.input_nodes, this.hidden_nodes]);
    this.output_weights = tf.randomNormal([this.hidden_nodes, this.output_nodes]);
  }

  /**
   * Takes in a 1D array and feed forwards through the network
   * @param {array} - Array of inputs
   */
  predict(user_input) {
    let output;
    tf.tidy(() => {
      let input_layer = tf.tensor(user_input, [1, this.input_nodes]);
      let hidden_layer = input_layer.matMul(this.input_weights).sigmoid();
      let output_layer = hidden_layer.matMul(this.output_weights).sigmoid();
      output = output_layer.dataSync();
    });
    return output;
  }

  /**
   * Returns a new network with the same weights as this Neural Network
   * @returns {NeuralNetwork}
   */
  clone() {
    return tf.tidy(() => {
      let clonie = new NeuralNetwork(this.input_nodes, this.hidden_nodes, this.output_nodes);
      clonie.dispose();
      clonie.input_weights = tf.clone(this.input_weights);
      clonie.output_weights = tf.clone(this.output_weights);
      return clonie;
    });
  }

  /**
   * Dispose the input and output weights from the memory
   */
  dispose() {
    this.input_weights.dispose();
    this.output_weights.dispose();
  }

  stringify() {
    let neuralNetworkToSave = {
      input_weights: this.input_weights.arraySync(),
      output_weights: this.output_weights.arraySync()
    };

    return JSON.stringify(neuralNetworkToSave);
  }

  save( key ) {
    localStorage.setItem(key, this.stringify());
  }
}
