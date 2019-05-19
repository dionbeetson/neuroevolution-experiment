/**
 * General UI interaction controller
 */
document.querySelector("#btn-start").addEventListener('click', function (event) {
  for (let i = 0; i < existingSinglePlayerGames.length; i++){
    existingSinglePlayerGames[i].end();
    existingSinglePlayerGames[i].remove();
  }

  existingSinglePlayerGames = [];

  document.querySelector("#enable-draw").checked = true;
  enableDraw = true;

  let game = new Game();
  existingSinglePlayerGames.push(game);
  game.start();
}, false);

document.querySelector("#btn-speed").addEventListener("change", function() {
  speed = speedVariations[parseFloat(this.value)-1];//parseFloat(this.value);
});
speed = speedVariations[parseFloat(document.querySelector("#btn-speed").value)-1];

document.querySelector("#enable-draw").addEventListener("change", function() {
  enableDraw = this.checked;
});

enableDraw = document.querySelector("#enable-draw").checked;
