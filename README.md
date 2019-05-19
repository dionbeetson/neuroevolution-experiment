# A Nuroevolution Experiment
This is an experimentation project I've been working on to explore NeuroEvolution within the browser. Using
NeuroEvolution, this application will learn to play a simple browser based game.

The difference I was implementing here compared to other examples on the Internet is that instead of building ML directly into the core game source code, the ML and Game source code is completely decoupled. This simulates a much more realistic real world example, as you would rarely have direct access to the source code when applying ML, you would only have access to specific inputs. To make life easier, I did expose an API/SDK from the game, but end state is to use image analysis so this solution is more adaptable to other applications.

# Call outs to borrowed/influenced code/tutorials
Huge influence from the great 5 part series on NeuroEvolution from CodeTrain
https://www.youtube.com/watch?v=c6y21FkaUqw

Dived into and dissected the CartPole TensorFlow JS example
https://github.com/tensorflow/tfjs-examples/tree/master/cart-pole

todo - add crossover and mutate call outs

Water.css for the layout/CSS
https://github.com/kognise/water.css

# Key features include
 - Completely browser based using TensorFlowJS
 - ML is applied to individually instantiated games
 - Completely browser based using TensorFlowJS
 - Multiple game levels with different complexities
 - Ability to save and load models from localStorage
 - You can even play the game manually if you would like
 - Ability to pause after a single generation (for debugging)
 - Run the game at different speeds
 - Ability to turn off canvas drawing for performance (but compared to TensorFlow it doesnt make a huge performance difference)

# TODO
 - Implement Webpack to remove manual CSS/JS includes
 - Support for image recognition
 - Speed up implementation as it is a little laggy
