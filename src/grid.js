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
  this.level = 1;
  this.width = wid;
  this.height = height;
  this.water = {x:40,y:0}
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
  this.grid[0][8] = this.userPipes[this.userPipes.length-1]; //next pipe
}

/**
 * @function updates the Grid object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Grid.prototype.update = function(time) {
  if(!this.dead)this.water.x+=.25;
  if (!this.checkIfDefined(this.water.x,this.water.y)) {console.log(this.userPipes[1][0]); this.endGame();}
}

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
        (this.x*gridX) <= pointerX && (this.x*(gridX+1)) >= pointerX &&
        //check if in bounds of y
        (this.y*gridY) <= pointerY && ((this.y*(gridX+1))) >= pointerY &&
        //check if defined
        this.grid[gridY][gridX])
        {
            return true;
        }
    }
  }
  return false;
}

Grid.prototype.place = function (pointerX, pointerY) {
  if(this.userPipes.length > 0){
    for (var gridY = 0; gridY < this.y; gridY++) {
      for (var gridX = 0; gridX < this.x; gridX++) {
        if (
          //check if in bounds of x
          (this.x*gridX) < pointerX && (this.x*(gridX+1)) > pointerX &&
          //check if in bounds of y
          (this.y*gridY) < pointerY && ((this.y*(gridY+1))) > pointerY &&
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
  ctx.fillRect(this.water.x,this.water.y,15,15);

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
