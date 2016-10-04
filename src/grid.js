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

  this.grid = [];
  for (var y = 0; y < this.y; y++) {
    this.grid[y] = [];
    for (var x = 0; x < this.x; x++) {
      this.grid[y][x] = undefined;
    }
  }
  this.grid[0][0] = {x:0,y:3}; //starter pipe
  this.grid[3][0] = {x:2,y:2}; //ender pipe

}

/**
 * @function updates the Grid object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Grid.prototype.update = function(time) {
}
Grid.prototype.checkIfDefined = function (x, y) {
  if (x < cell && y < cell) {
    return true
  }
  else return false;
};

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
      }

      ctx.strokeRect(x*this.x, y*this.y, this.x, this.y);

    }
  }
ctx.font="30px Verdana";
// Create gradient
var gradient=ctx.createLinearGradient(0,0,this.width,0);
gradient.addColorStop("0","white");
gradient.addColorStop("0.5","blue");
gradient.addColorStop("1.0","yellow");
// Fill with gradient
ctx.fillStyle=gradient;
ctx.fillText("Start",15,40);
ctx.fillText("End",15,320);

}
