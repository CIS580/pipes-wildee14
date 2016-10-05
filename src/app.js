"use strict";

/* Classes */
const Player  = require('./player');
const Game = require('./game');
const Grid = require('./grid');
/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var image = new Image();
var player = new Player();
var grid = new Grid(canvas.width, canvas.height);
image.src = "./assets/pipes.png";


var background = new Audio();
background.src = "./assets/background.mp3";
background.play();
var gameOver = new Audio();
gameOver.src = "./assets/gameOver.wav";
var nextLevel = new Audio();
nextLevel.src = "./assets/nextLevel.wav";
var noplace = new Audio();
noplace.src = "./assets/noplace.wav";
var place = new Audio();
place.src = "./assets/place.wav";
var rotate = new Audio();
rotate.src = "./assets/rotate.wav";


canvas.onclick = function(event) {
  event.preventDefault();
  if(event.which == 1){
    if(!grid.checkIfDefined(event.offsetX, event.offsetY)){
      place.play();
      grid.place(event.offsetX, event.offsetY);
    }
    else {
      console.log("miss" + " "+event.offsetX, event.offsetY);
      noplace.play();
    }
  }

  else if (event.which ==3){
    //Implement rotate
    if(grid.checkIfDefined(event.offsetX, event.offsetY)){
      rotate.play();
      grid.rotate(event.offsetX, event.offsetY);
    }
    else {
      console.log("miss" + " "+event.offsetX, event.offsetY);
      noplace.play();
    }
  }

}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());


/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTme) {
  // TODO: Advance the fluid
  player.update();
  if(player.lives < 1){ //gameOver.play();
                        background.pause();
                        console.log(player.lives);}
  grid.update();
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  grid.render(elapsedTime, ctx);
  player.render(elapsedTime, ctx);

  // TODO: Render the board
}
