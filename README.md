# A NeuroEvolution Experiment
This is an experimentation project I've been working on to explore NeuroEvolution within the browser. This used TensorFlow JS and will learn to play a simple browser based game (of jumping blocks and gaps).

The difference in this solution compared to other solutions on the Internet is that instead of building ML directly into the core game source code, the ML and Game source code are completely decoupled. This simulates a much more realistic real world example, as you would rarely have direct access to the source code when applying ML (you would only have access to specific inputs). I created an an API/SDK for the browser based game to expose some key functionality, but end state is to use image analysis so this solution is more adaptable to other applications.

# Requirements
None, this is entirely browser based. Well maybe just grab the latest version of Chrome.

# Getting started
```
npm install
npm run dev
```

This will open `http://127.0.0.1:8080/` within your browser.

Then (to watch the neuroevolution in action)
1. Choose level
2. Press 'Start evolution' button

Or (to load an existing model)
1. 'Choose a file/model' to load from disk from model/ directory

# Call outs on borrowed/influenced code/tutorials
I borrowed a lot from existing tutorials out there on this topic.

Huge influence from the great 5 part series on NeuroEvolution at CodeTrain
https://www.youtube.com/watch?v=c6y21FkaUqw

Dived into and dissected the CartPole TensorFlow JS example
https://github.com/tensorflow/tfjs-examples/tree/master/cart-pole

Used the mutate and crossover methods from
https://github.com/llSourcell/Modeling_Evolution_with_TensorflowJS

Water.css for the layout/CSS
https://github.com/kognise/water.css

# Tutorial
https://dionbeetson.blogspot.com/2019/05/neuroevolution-using-tensorflowjs-part-1.html

# Key features include
 - Completely browser based using TensorFlowJS
 - ML is applied to individually instantiated games
 - Supports multiple game levels with different complexities
 - Ability to save and load models from localStorage
 - You can even play the game manually if you would like to
 - Ability to pause after a single generation (normally for debugging)
 - Run the game at different speeds
 - Ability to turn off canvas drawing for performance (but compared to TensorFlow JS performance, it doesn't make a huge performance improvement)

# TODO
 - Implement Webpack to remove manual CSS/JS includes
 - Support for image recognition for gathering inputs
 - Speed up implementation as it is a little laggy
 - Remove the last few global variables
