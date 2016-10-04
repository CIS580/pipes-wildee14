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
