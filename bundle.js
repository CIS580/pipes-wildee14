(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    rotate.play();
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

},{"./game":2,"./grid":3,"./player":4}],2:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],3:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;
const cell = 10;


/**
 * @module exports the Grid class
 */
module.exports = exports = Grid;

/**
 * @constructor Grid
 * Creates a new Grid object
 * @param {Postition} position object specifying an x and y
 */
function Grid(wid, height) {
  this.width = wid;
  this.height = height;
  this.x = Math.floor(wid /cell);
  this.y = Math.floor(height /cell);
  var self = this;
  this.userPipes = [];
  this.pipe = new Image();
  this.pipe.src = "./assets/pipes.png";
  /*
  pipes are 4 x 5
  png is 127 x 160
  [0] [0]=all [1]=left flat [2]=flat [3]=right flat
  [1] [0]=flat vert top [1]=up to right [2]=left to down [3]=equal flat
  [2] [0]=flat vert [1]=down to right [2]=left to up [3]=vert both
  [3] [0]=flat vert down [1]=all but top [2]=all but right
  [4] [1]=all but left [2]=all but bottom
  */

  for (var i = 0; i < 10; i++) {
    //make sure random pipes are valid
    while(this.userPipes[i] == undefined || this.userPipes[i] =={x:3,y:3} ||
          this.userPipes[i] == {x:0,y:4} || this.userPipes[i] =={x:3,y:4}){
            this.userPipes[i] = {x:(Math.floor(Math.random()*4)),
                                 y:(Math.floor(Math.random()*5))};
          };
    console.log(this.userPipes[i]);
  }

  this.grid = [];
  for (var y = 0; y < this.y; y++) {
    this.grid[y] = [];
    for (var x = 0; x < this.x; x++) {
      this.grid[y][x] = undefined;
    }
  }
  this.grid[0][0] = {x:0,y:3}; //starter pipe
  this.grid[3][0] = {x:2,y:2}; //ender pipe
  this.grid[0][5] = this.userPipes[this.userPipes.length-1]; //next pipe
}

/**
 * @function updates the Grid object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Grid.prototype.update = function(time) {
}



Grid.prototype.checkIfDefined = function (pointerX, pointerY) {
  for (var gridY = 0; gridY < this.y; gridY++) {
    for (var gridX = 0; gridX < this.x; gridX++) {
      if (
        //check if in bounds of x
        (this.x*gridX) < pointerX && (this.x*(gridX+1)) > pointerX &&
        //check if in bounds of y
        (this.y*gridY) < pointerY && ((this.y*(gridX+1))) > pointerY &&
        //check if defined
        this.grid[gridY][gridX])
        {
            console.log(gridY + " "+gridX + " "+pointerY+" "+pointerX);
            return true;
        }
    }
  }
  return false;
}

Grid.prototype.place = function (pointerX, pointerY) {
  if(this.userPipes.length > 1){
    for (var gridY = 0; gridY < this.y; gridY++) {
      for (var gridX = 0; gridX < this.x; gridX++) {
        if (
          //check if in bounds of x
          (this.x*gridX) < pointerX && (this.x*(gridX+1)) > pointerX &&
          //check if in bounds of y
          (this.y*gridY) < pointerY && ((this.y*(gridX+1))) > pointerY &&
          !this.grid[gridY][gridX])
          {
              this.grid[gridY][gridX] = this.userPipes.pop();
              this.grid[0][5] = this.userPipes[this.userPipes.length-1]; //next pipe
              return;
          }
      }
    }
  }else{
    console.log("out of pipes");
  }
}



/**
 * @function renders the Grid into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Grid.prototype.render = function(time, ctx) {
  for (var y = 0; y < this.y; y++) {
    for (var x = 0; x < this.x; x++) {
      if(this.grid[y][x]){
        ctx.drawImage(this.pipe,
                      31.75*this.grid[y][x].x,32*this.grid[y][x].y, 31.75,32,
                      x*this.x,y*this.y, this.x,this.y);

        ctx.strokeStyle="red";
        ctx.strokeRect(x*this.x, y*this.y, this.x, this.y);
      }else{
        ctx.strokeStyle="black";
        ctx.strokeRect(x*this.x, y*this.y, this.x, this.y);

      }


    }
  }
ctx.font="30px Verdana";


// gradient
var gradient=ctx.createLinearGradient(0,0,this.width,0); gradient.addColorStop("0","black");
// Fields
ctx.fillStyle=gradient;
ctx.fillText("Start",15,40);
ctx.fillText("End",15,320);
ctx.fillText("Next Pipe",495,30);


}

},{}],4:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player() {
  this.lives = 3;
  this.level = 1;
  this.x = 400;
  this.y = 400;
  this.width = 100;
  this.height = 100;
  this.cursor = new Image();
  this.cursor.src = "./assets/cursor.png";

var self = this;

window.onmousedown = function(event) {
  event.preventDefault();
  self.x = event.offsetX;
  self.y = event.offsetY;

}

}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
      ctx.drawImage(
        // image
        this.cursor,
        // source rectangle
        0, 0, this.width, this.height,
        // destination rectangle
        this.x, this.y, this.width, this.height
      );
}

},{}]},{},[1]);
