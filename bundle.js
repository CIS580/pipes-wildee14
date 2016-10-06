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
  this.dead = false;
  this.direction = "right";
  this.level = 1;
  this.width = wid;
  this.height = height;
  this.water = {x:1,y:0}
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
  this.lowLeft = {x:0,y:4};
  this.lowRight = {x:3,y:4};
  this.lowRightU = {x:3,y:3};

  for (var i = 0; i < 20; i++) {
    //make sure random pipes are valid
    while(this.userPipes[i] == undefined || this.userPipes[i].y>2){
            this.userPipes[i] = {x:(Math.floor(Math.random()*4)),
                                 y:(Math.floor(Math.random()*5))};
          }

    console.log(this.userPipes[i]);
  }

  this.grid = [];
  for (var y = 0; y < this.y; y++) {
    this.grid[y] = [];
    for (var x = 0; x < this.x; x++) {
      this.grid[y][x] = undefined;
    }
  }
  this.grid[0][0] = {x:3,y:0}; //starter pipe
  this.grid[3][0] = {x:3,y:0}; //ender pipe
  this.grid[0][8] = this.userPipes[this.userPipes.length-1]; //next pipe
}

/**
 * @function updates the Grid object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Grid.prototype.update = function(time) {
  var speed = .15*this.level;
  if(!this.dead){
    switch(this.direction){
      case ("right"):
        this.water.x+=speed;
        break;
      case "left":
        this.water.x-=speed;
        break;
      case "up":
        this.water.y-=speed;
        break;
      case "down":
        this.water.y+=speed;
        break;
      default:
        break;
    }

  }
  if (!this.checkIfDefined(this.water.x,this.water.y)) {console.log(this.water.y); this.endGame();}
  if (this.inEndPipe(this.water.x,this.water.y)) {this.nextLevel();}
  this.updatePosition();
}

Grid.prototype.inEndPipe = function (pointerX,pointerY) {
  if (
        //check if in bounds of x
        0 < pointerX && 95 > pointerX &&
        //check if in bounds of y
        4*(this.y) < pointerY && 5*this.y > pointerY)
        {
            return true;
        }
  return false;
}

Grid.prototype.nextLevel = function () {
  for (var i = 0; i < 20; i++) {
    //make sure random pipes are valid
    while(this.userPipes[i] == undefined || this.userPipes[i] ==this.lowRightU ||
          this.userPipes[i] == this.lowLeft || this.userPipes[i] == this.lowRight ){
            this.userPipes[i] = {x:(Math.floor(Math.random()*4)),
                                 y:(Math.floor(Math.random()*5))};
          }
  }
  this.grid = [];
  for (var y = 0; y < this.y; y++) {
    this.grid[y] = [];
    for (var x = 0; x < this.x; x++) {
      this.grid[y][x] = undefined;
    }
  }
  this.grid[0][0] = {x:3,y:0}; //starter pipe
  this.grid[3][0] = {x:2,y:2}; //ender pipe
  this.grid[0][8] = this.userPipes[this.userPipes.length-1]; //next pipe
  this.level++;
};

Grid.prototype.endGame = function () {
  document.getElementById('score').innerHTML = "Game Over! Level "+this.level;
  this.dead = true;
};

Grid.prototype.rotate = function (x,y) {
  if(this.userPipes.length > 0){
    for (var gridY = 0; gridY < this.y; gridY++) {
      for (var gridX = 0; gridX < this.x; gridX++) {
        if (
          //check if in bounds of x
          (this.x*gridX) < pointerX && (this.x*(gridX+1)) > pointerX &&
          //check if in bounds of y
          (this.y*gridY) < pointerY && ((this.y*(gridY+1))) > pointerY)
          {
              this.grid[gridY][gridX].x++;
              return;
          }
      }
    }
  }else{
    console.log("out of pipes");
  }
};

Grid.prototype.checkIfDefined = function (pointerX, pointerY) {
  for (var gridY = 0; gridY < this.y; gridY++) {
    for (var gridX = 0; gridX < this.x; gridX++) {
      if (
        //check if in bounds of x
        (this.x*gridX) <= (pointerX) && (this.x*(gridX+1)) > (pointerX) &&
        //check if in bounds of y
        (this.y*gridY) <= (pointerY) && ((this.y*(gridY+1))) > (pointerY) &&
        //check if defined
        this.grid[gridY][gridX])
        {
            return true;
        }
    }
  }
  return false;
}

Grid.prototype.updatePosition = function () {
  for (var gridY = 0; gridY < this.y; gridY++) {
    for (var gridX = 0; gridX < this.x; gridX++) {
      if (
        //check if in bounds of x
        (this.x*gridX) <= this.water.x && (this.x*(gridX+1)) > this.water.x &&
        //check if in bounds of y
        (this.y*gridY) <= this.water.y && ((this.y*(gridX+1))) > this.water.y &&
         this.grid[gridY][gridX])
        {
          //Check direction
          //Vertical Pipes
          if ((this.grid[gridY][gridX].x == 0 && this.grid[gridY][gridX].y== 1) ||
              (this.grid[gridY][gridX].x == 0 && this.grid[gridY][gridX].y== 2)||
              (this.grid[gridY][gridX].x == 0 && this.grid[gridY][gridX].y== 3)||
              (this.grid[gridY][gridX].x == 1 && this.grid[gridY][gridX].y==2)||
              (this.grid[gridY][gridX].x == 2 && this.grid[gridY][gridX].y==3))
            {
              if (this.direction != "up" && this.direction != "down"){ this.endGame();}
            }
            else if ((this.grid[gridY][gridX].x == 0 && this.grid[gridY][gridX].y== 0) ||
                (this.grid[gridY][gridX].x == 1 && this.grid[gridY][gridX].y== 0)||
                (this.grid[gridY][gridX].x == 2 && this.grid[gridY][gridX].y== 0)||
                (this.grid[gridY][gridX].x == 3 && this.grid[gridY][gridX].y==0)||
                (this.grid[gridY][gridX].x == 3 && this.grid[gridY][gridX].y==1))
              {
                if (this.direction != "left" && this.direction != "right"){ this.endGame();}
              }
            //90 degree pipes
            else if (this.grid[gridY][gridX].x == 1 && this.grid[gridY][gridX].y== 1)   {
                if (this.direction == "left"){this.direction = "down";}
                else if (this.direction == "up"){this.direction = "right";}
                console.log("ul");
              }
            else if (this.grid[gridY][gridX].x == 1 && this.grid[gridY][gridX].y== 2)   {
                if (this.direction == "left"){this.direction = "up";}
                else if(this.direction == "down"){this.direction = "right";}
                console.log("ll");
              }
            else if (this.grid[gridY][gridX].x == 2 && this.grid[gridY][gridX].y== 1)   {
                if (this.direction == "right"){this.direction = "down";}
                else if (this.direction == "up") {this.direction = "left";}
                console.log("ur");
              }
            else if (this.grid[gridY][gridX].x == 2 && this.grid[gridY][gridX].y== 2)   {
                if (this.direction == "right"){this.direction = "up";}
                else if(this.direction == "down"){this.direction = "left";}
                console.log("lr");
              }
              console.log(this.grid[gridY][gridX].x +","+this.grid[gridY][gridX].y);
        }
    }
  }
}

Grid.prototype.place = function (pointerX, pointerY) {
  if(this.userPipes.length > 0){
    for (var gridY = 0; gridY < this.y; gridY++) {
      for (var gridX = 0; gridX < this.x; gridX++) {
        if (
          //check if in bounds of x
          (this.x*gridX) <= pointerX && (this.x*(gridX+1)) > pointerX &&
          //check if in bounds of y
          (this.y*gridY) <= pointerY && ((this.y*(gridY+1))) > pointerY &&
          !this.grid[gridY][gridX])
          {
              this.grid[gridY][gridX] = this.userPipes.pop();
              console.log(gridY+" "+gridX);
              this.grid[0][8] = this.userPipes[this.userPipes.length-1]; //next pipe
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
  ctx.fillStyle="blue";
  ctx.fillRect(0,0,this.x,this.y);
  ctx.fillRect(this.water.x,this.water.y,95,85);

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
ctx.fillText("Next Pipe",795,50);

if(this.dead){
  ctx.font = "40pt Times New Roman";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 0.1;
  ctx.fillStyle = "black";
  ctx.fillText("Game Over!",450, 450 );
}
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
