"use strict";

const MS_PER_FRAME = 1000/8;
const cell = 15;
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

  this.grid = [];
  for (var y = 0; y < this.y; y++) {
    this.grid[y] = undefined;
    for (var x = 0; x < this.x; x++) {
      this.grid[y][x] = undefined;
    }
  }
}

/**
 * @function updates the Grid object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Grid.prototype.update = function(time) {
}

/**
 * @function renders the Grid into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Grid.prototype.render = function(time, ctx) {
  for (var y = 0; y < this.y; y++) {
    for (var x = 0; x < this.x; x++) {
      ctx.strokeRect(this.width, this.height, x*this.x, y*this.y);
    }
  }
}
