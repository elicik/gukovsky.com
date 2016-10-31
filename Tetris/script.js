"use strict";

/**
 * CONSTANTS
 */

var GRID_WIDTH = 10;
var GRID_HEIGHT = 20;
var SPRITE_WIDTH = 24;
// based off NES version values
var FRAMES_PER_LEVEL = [53, 49, 45, 41, 37, 33, 28, 22, 17, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 3];
var POINTS_FOR_LINE = [0, 40, 100, 300, 1200];

var MAX_LEVEL = 20;
var MAX_SCORE = 999999;

// CONSTANT-BASED VALUES
var BLOCKS = {
	"J": {
		"type": "J",
		"color": "blue",
		"rotations": [
			[[3,-2],[3,-1],[4,-1],[5,-1]],
			[[4,-2],[5,-2],[4,-1],[4, 0]],
			[[3,-1],[4,-1],[5,-1],[5, 0]],
			[[4,-2],[4,-1],[3, 0],[4, 0]]
		],
		"wallKickTests": [
			[[0, 0],[-1, 0],[-1,-1],[0, 2],[-1, 2]],
			[[0, 0],[ 1, 0],[ 1, 1],[0,-2],[ 1,-2]],
			[[0, 0],[ 1, 0],[ 1,-1],[0, 2],[ 1, 2]],
			[[0, 0],[-1, 0],[-1, 1],[0,-2],[-1,-2]]
		]
	},
	"T": {
		"type": "T",
		"color": "purple",
		"rotations": [
			[[4,-2],[3,-1],[4,-1],[5,-1]],
			[[4,-2],[4,-1],[5,-1],[4, 0]],
			[[3,-1],[4,-1],[5,-1],[4, 0]],
			[[4,-2],[3,-1],[4,-1],[4, 0]]
		],
		"wallKickTests": [
			[[0, 0],[-1, 0],[-1,-1],[0, 2],[-1, 2]],
			[[0, 0],[ 1, 0],[ 1, 1],[0,-2],[ 1,-2]],
			[[0, 0],[ 1, 0],[ 1,-1],[0, 2],[ 1, 2]],
			[[0, 0],[-1, 0],[-1, 1],[0,-2],[-1,-2]]
		]
	},
	"L": {
		"type": "L",
		"color": "orange",
		"rotations": [
			[[5,-2],[3,-1],[4,-1],[5,-1]],
			[[4,-2],[4,-1],[4, 0],[5, 0]],
			[[3,-1],[4,-1],[5,-1],[3, 0]],
			[[3,-2],[4,-2],[4,-1],[4, 0]]
		],
		"wallKickTests": [
			[[0, 0],[-1, 0],[-1,-1],[0, 2],[-1, 2]],
			[[0, 0],[ 1, 0],[ 1, 1],[0,-2],[ 1,-2]],
			[[0, 0],[ 1, 0],[ 1,-1],[0, 2],[ 1, 2]],
			[[0, 0],[-1, 0],[-1, 1],[0,-2],[-1,-2]]
		]
	},
	"S": {
		"type": "S",
		"color": "green",
		"rotations": [
			[[4,-2],[5,-2],[3,-1],[4,-1]],
			[[4,-2],[4,-1],[5,-1],[5, 0]],
			[[4,-1],[5,-1],[3, 0],[4, 0]],
			[[3,-2],[3,-1],[4,-1],[4, 0]]
		],
		"wallKickTests": [
			[[0, 0],[-1, 0],[-1,-1],[0, 2],[-1, 2]],
			[[0, 0],[ 1, 0],[ 1, 1],[0,-2],[ 1,-2]],
			[[0, 0],[ 1, 0],[ 1,-1],[0, 2],[ 1, 2]],
			[[0, 0],[-1, 0],[-1, 1],[0,-2],[-1,-2]]
		]
	},
	"I": {
		"type": "I",
		"color": "cyan",
		"rotations": [
			[[3,-1],[4,-1],[5,-1],[6,-1]],
			[[5,-2],[5,-1],[5, 0],[5, 1]],
			[[3, 0],[4, 0],[5, 0],[6, 0]],
			[[4,-2],[4,-1],[4, 0],[4, 1]]
		],
		"wallKickTests": [
			[[0, 0],[-2, 0],[ 1, 0],[ 1,-2],[-2, 1]],
			[[0, 0],[-2, 0],[ 1, 0],[-2,-1],[ 1, 1]],
			[[0, 0],[ 2, 0],[-1, 0],[ 2,-1],[-1, 2]],
			[[0, 0],[-1, 0],[ 2, 0],[-1,-2],[ 2, 1]]
		]
	},
	"O": {
		"type": "O",
		"color": "yellow",
		"rotations": [
			[[4,-2],[5,-2],[4,-1],[5,-1]],
			[[4,-2],[5,-2],[4,-1],[5,-1]],
			[[4,-2],[5,-2],[4,-1],[5,-1]],
			[[4,-2],[5,-2],[4,-1],[5,-1]]
		],
		"wallKickTests": [
			[[0, 0]],
			[[0, 0]],
			[[0, 0]],
			[[0, 0]]
		]
	},
	"Z": {
		"type": "Z",
		"color": "red",
		"rotations": [
			[[3,-2],[4,-2],[4,-1],[5,-1]],
			[[5,-2],[4,-1],[5,-1],[4, 0]],
			[[3,-1],[4,-1],[4, 0],[5, 0]],
			[[4,-2],[3,-1],[4,-1],[3, 0]]
		],
		"wallKickTests": [
			[[0, 0],[-1, 0],[-1,-1],[0, 2],[-1, 2]],
			[[0, 0],[ 1, 0],[ 1, 1],[0,-2],[ 1,-2]],
			[[0, 0],[ 1, 0],[ 1,-1],[0, 2],[ 1, 2]],
			[[0, 0],[-1, 0],[-1, 1],[0,-2],[-1,-2]]
		]
	}
}

var SCOREBOARD_WIDTH = SPRITE_WIDTH * 5;

var CANVAS_WIDTH = GRID_WIDTH * SPRITE_WIDTH + SCOREBOARD_WIDTH;
var CANVAS_HEIGHT = GRID_HEIGHT * SPRITE_WIDTH;

/**
 * RENDERER
 */

var container = new PIXI.Container();
var renderer = PIXI.autoDetectRenderer(CANVAS_WIDTH, CANVAS_HEIGHT);

/**
 * TEXT / SCOREBOARD
 */

var scoreboardBackground = new PIXI.Graphics();
scoreboardBackground.beginFill(0x7E7215);
scoreboardBackground.drawRect(0, 0, SCOREBOARD_WIDTH, CANVAS_HEIGHT);
scoreboardBackground.endFill();
container.addChild(scoreboardBackground);

var levelText = new PIXI.Text("Level\n0", {fill: "black"});
container.addChild(levelText);

var clearedLinesText = new PIXI.Text("Clear\n0", {fill: "black"});
clearedLinesText.position.y = Math.floor((CANVAS_HEIGHT - 56) / 3);
container.addChild(clearedLinesText);

var nextText = new PIXI.Text("Next", {fill: "black"});
nextText.position.y = Math.floor((CANVAS_HEIGHT - 56) * 2 / 3);
container.addChild(nextText);

var scoreText = new PIXI.Text("Score\n0", {fill: "black"});
scoreText.position.y = CANVAS_HEIGHT - 56;
container.addChild(scoreText);

/**
 * GRID
 */

// contains a number, the color
var grid = [];
for (var x = 0; x < GRID_WIDTH; x++) {
	grid[x] = [];
	for (var y = 0; y < GRID_HEIGHT; y++) {
		grid[x][y] = {
			color: null,
			exists: false,
			sprite: null
		};
	}
}

var offsetX = 0;
var offsetY = 0;
var offsetGhost = 0;

/**
 * MISC. VARIABLES
 */

var paused = false;

var frameCounter = 1;
var block = getRandomBlock();
var nextBlock = getRandomBlock();
var rotation = 0;

var blockSprites = [];
var ghostSprites = [];

var level = 0;
var clearedLines = 0;
var score = 0;

var nextPicture = new PIXI.Sprite();
container.addChild(nextPicture);

// Action queue to store all functions so they don't run simultaneously 
var actions = [];

/**
 * EVENT LISTENERS
 */

window.addEventListener("keydown", function(e) {
	if (paused) {
		return;
	}
	var key = e.which || e.keyCode;
	if (key === 37) { // left
		actions.push(wrapFunction(move, this, ["left"]));
	}
	if (key === 38) { // up
		actions.push(wrapFunction(rotate, this, ["counterClockwise"]));
	}
	if (key === 39) { // right
		actions.push(wrapFunction(move, this, ["right"]));
	}
	if (key === 40) { // down
		actions.push(wrapFunction(bottom, this, []));
	}
	if (key === 90) { // Z
		actions.push(wrapFunction(rotate, this, ["clockwise"]));
	}
	if (key === 88) { // X
		actions.push(wrapFunction(rotate, this, ["counterClockwise"]));
	}
});

/**
 * HELPER FUNCTIONS
 */

// checks left side, right side, bottom, and other pieces
function wrapFunction(fn, context, params) {
	return function() {
		fn.apply(context, params);
	};
}

function getRandomBlock() {
	var keys = Object.keys(BLOCKS)
	var index = Math.floor(Math.random() * keys.length);
	return JSON.parse(JSON.stringify(BLOCKS[keys[index]]));
}

function validSpot(offX, offY) {
	var points = block.rotations[rotation];
	for (var i = 0; i < points.length; i++) {
		var newX = points[i][0] + offX;
		var newY = points[i][1] + offY;
		if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT || (newY >= 0 && grid[newX][newY].exists)) {
			return false;
		}
	}
	return true;
}

function clearLine(line) {
	for (var x = 0; x < GRID_WIDTH; x++) {
		// remove all sprites from line
		container.removeChild(grid[x][line].sprite);
		// lower all lines above the line
		for (var y = line; y > 0; y--) {
			grid[x][y] = grid[x][y-1];
		}
	}
	// clear top row
	for (var i = 0; i < GRID_WIDTH; i++) {
		grid[i][0] = {
			color: null,
			exists: false,
			sprite: null
		}
	}

}
function lineCanBeCleared(line) {
	for (var i = 0; i < GRID_WIDTH; i++) {
		if (!grid[i][line].exists) {
			return false;
		}
	}
	return true;
}
function calculateOffsetGhost() {
	offsetGhost = offsetY;
	while (validSpot(offsetX, offsetGhost+1)) {
		offsetGhost++;
	}
}

/**
 * FUNCTIONS
 *
 * newRound() is run at the beginning of each round
 * at the end it calls drop()
 * drop() ends, after movement like move(), rotate(), and bottom() are run
 * newRound() is called again, until the player loses
 *
 * All functions modify grid, and everything sprite related is handled by render()
 */

function newRound() {
	var linesClearedThisRound = 0;

	for (var i = 0; i < GRID_HEIGHT; i++) {
		if (lineCanBeCleared(i)) {
			clearLine(i);
			clearedLines++;
			linesClearedThisRound++;
		}
	}

	block = nextBlock;
	nextBlock = getRandomBlock();
	offsetX = 0;
	offsetY = 0;

	// check for lose
	var points = block.rotations[rotation];
	for (var i = 0; i < points.length; i++) {
		var x = points[i][0];
		var y = points[i][1];
		if (y < 0) {
			y = 0;
		}
		if (grid[x][y].exists) {
			// lose();
			paused = true;
			alert("Taha");
			return;
		}
	}

	level = Math.floor(clearedLines / 10); // based on NES version
	score += POINTS_FOR_LINE[linesClearedThisRound] * (level + 1);

	// enforce max level/score
	level = (level > MAX_LEVEL) ? MAX_LEVEL : level;
	score = (score > MAX_SCORE) ? MAX_SCORE : score;
	
	levelText.text = "Level\n" + level;
	clearedLinesText.text = "Clear\n" + clearedLines;
	scoreText.text = "Score\n" + score;

	// set nextPicture to a picture of the next piece
	container.removeChild(nextPicture);
	nextPicture = PIXI.Sprite.fromImage("tetrominos/" + nextBlock.type + ".png");
	nextPicture.x = SPRITE_WIDTH / 2;
	nextPicture.y = Math.floor(CANVAS_HEIGHT * 2 / 3);
	container.addChild(nextPicture);

	frameCounter = 1;
}

function drop() {
	if (frameCounter === 0) {
		if (validSpot(offsetX, offsetY+1)) {
			offsetY++;
		}
		else {
			var points = block.rotations[rotation];
			for (var i = 0; i < points.length; i++) {
				var x = points[i][0] + offsetX;
				var y = points[i][1] + offsetY;
				if (x >= 0 && y >= 0) {
					grid[x][y].exists = true;
					grid[x][y].color = block.color;
				}
			}
			newRound();
			return; // end drop()
		}
	}
	frameCounter = (frameCounter + 1) % FRAMES_PER_LEVEL[level];
}

// logic is basically the same as drop(), but uses a do-while instead of requestAnimationFrame so it happens instantly
function bottom() {
	while (validSpot(offsetX, offsetY+1)) {
		offsetY++;
	}
	var points = block.rotations[rotation];
	for (var i = 0; i < points.length; i++) {
		var x = points[i][0] + offsetX;
		var y = points[i][1] + offsetY;
		if (x >= 0 && y >= 0) {
			grid[x][y].exists = true;
			grid[x][y].color = block.color;
		}
	}
	newRound();
}


function move(direction) {
	var offX = offsetX;

	if (direction === "right") {
		offX++;
	}
	if (direction === "left") {
		offX--;
	}

	if (validSpot(offX, offsetY)) {
		offsetX = offX;
	}
}


// Rotation follows Akira Super Rotation System
function rotate(direction) {
	var multiplier;
	var originalRotation = rotation;
	if (direction === "counterClockwise") {
		rotation = (rotation - 1 + 4) % 4;
		multiplier = -1;
	}
	if (direction === "clockwise") {
		rotation = (rotation + 1) % 4;
		multiplier = 1;
	}

	// check wall kicks
	var validSpotFound = false;
	for (var i = 0; i < block.wallKickTests[rotation].length; i++) {
		var offX = offsetX + block.wallKickTests[rotation][i][0] * multiplier;
		var offY = offsetY + block.wallKickTests[rotation][i][1] * multiplier;
		if (validSpot(offX, offY)) {
			offsetX = offX;
			offsetY = offY;
			validSpotFound = true;
			break;
		}
	}
	if (!validSpotFound) {
		rotation = originalRotation;
	}
}

function pause() {
	paused = !paused;
}
/**
 * RENDER
 */

function render() {
	while (actions.length > 0) {
		(actions.shift())();
	}
	if (!paused) {
		drop();
	}
	for (var x = 0; x < GRID_WIDTH; x++) {
		for (var y = 0; y < GRID_HEIGHT; y++) {
			if (grid[x][y].sprite !== null) {
				container.removeChild(grid[x][y].sprite);
				grid[x][y].sprite = null;
			}
			if (grid[x][y].exists) {
				grid[x][y].sprite = PIXI.Sprite.fromImage("blocks/" + grid[x][y].color + ".png");
				grid[x][y].sprite.x = x * SPRITE_WIDTH + SCOREBOARD_WIDTH;
				grid[x][y].sprite.y = y * SPRITE_WIDTH;
				container.addChild(grid[x][y].sprite);
			}
		}
	}
	calculateOffsetGhost();
	for (var i = 0; i < blockSprites.length; i++) {
		container.removeChild(blockSprites[i]);
		container.removeChild(ghostSprites[i]);
	}
	var points = block.rotations[rotation];
	for (var i = 0; i < points.length; i++) {
		var x = points[i][0] + offsetX;
		var ghostY = points[i][1] + offsetGhost;
		ghostSprites[i] = PIXI.Sprite.fromImage("blocks/grey.png");
		ghostSprites[i].x = x * SPRITE_WIDTH + SCOREBOARD_WIDTH;
		ghostSprites[i].y = ghostY * SPRITE_WIDTH;
		container.addChild(ghostSprites[i]);

		// add ghosts before blocks in order for the ghost not to cover the block
		var y = points[i][1] + offsetY;
		blockSprites[i] = PIXI.Sprite.fromImage("blocks/" + block.color + ".png");
		blockSprites[i].x = x * SPRITE_WIDTH + SCOREBOARD_WIDTH;
		blockSprites[i].y = y * SPRITE_WIDTH;
		container.addChild(blockSprites[i]);
	}

	renderer.render(container);
	requestAnimationFrame(render);
}

/**
 * RUN!
 */

document.addEventListener("DOMContentLoaded", function(event) {
	document.querySelector("#container").insertBefore(renderer.view, document.querySelector("#container").lastChild);
	requestAnimationFrame(render);
});