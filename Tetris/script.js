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
var POSSIBLE_POINTS = [
	[[GRID_WIDTH / 2 - 1, 0], [GRID_WIDTH / 2, 0], [GRID_WIDTH / 2 + 1, 0], [GRID_WIDTH / 2 + 1, 1]], // J
	[[GRID_WIDTH / 2 - 1, 0], [GRID_WIDTH / 2, 0], [GRID_WIDTH / 2 + 1, 0], [GRID_WIDTH / 2, 1]],     // T
	[[GRID_WIDTH / 2 - 1, 0], [GRID_WIDTH / 2, 0], [GRID_WIDTH / 2 + 1, 0], [GRID_WIDTH / 2 - 1, 1]], // L
	[[GRID_WIDTH / 2 - 1, 1], [GRID_WIDTH / 2, 1], [GRID_WIDTH / 2 + 1, 0], [GRID_WIDTH / 2, 0]],     // S
	[[GRID_WIDTH / 2 - 1, 0], [GRID_WIDTH / 2, 0], [GRID_WIDTH / 2 + 1, 0], [GRID_WIDTH / 2 + 2, 0]], // I
	[[GRID_WIDTH / 2 + 1, 0], [GRID_WIDTH / 2, 0], [GRID_WIDTH / 2 + 1, 1], [GRID_WIDTH / 2, 1]],     // O
	[[GRID_WIDTH / 2 - 1, 0], [GRID_WIDTH / 2, 0], [GRID_WIDTH / 2 + 1, 1], [GRID_WIDTH / 2, 1]]      // Z
];

var BLOCK_TYPE = ["J","T","L","S","I","O","Z"];

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

var levelText = new PIXI.Text("Level\n0", {font:"26px Monospace", fill: "black"});
container.addChild(levelText);

var clearedLinesText = new PIXI.Text("Clear\n0", {font:"26px Monospace", fill: "black"});
clearedLinesText.position.y = Math.floor((CANVAS_HEIGHT - 56) / 3);
container.addChild(clearedLinesText);

var nextText = new PIXI.Text("Next", {font:"26px Monospace", fill: "black"});
nextText.position.y = Math.floor((CANVAS_HEIGHT - 56) * 2 / 3);
container.addChild(nextText);

var scoreText = new PIXI.Text("Score\n0", {font:"26px Monospace", fill: "black"});
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
		grid[x][y] = undefined;
	}
}

// contains the actual sprites
var spriteGrid = [];
for (var x = 0; x < GRID_WIDTH; x++) {
	spriteGrid[x] = [];
	for (var y = 0; y < GRID_HEIGHT; y++) {
		spriteGrid[x][y] = undefined;
	}
}

/**
 * MISC. VARIABLES
 */

var paused = false;

var frameCounter = 1;
var color, points, nextColor, nextPoints;

var level = 0;
var clearedLines = 0;
var score = 0;

var nextPicture = new PIXI.Sprite();
container.addChild(nextPicture);

var dropRequest; // needed in order to cancel drop()

/**
 * EVENT LISTENERS
 */

window.addEventListener("keydown", function(e) {
	if (e.keyCode === 32) { // space bar
		frameCounter = 0;
	}
	if (e.keyCode === 37) { // left
		move("left");
	}
	if (e.keyCode === 38) { // up
		rotate("counterClockwise");
	}
	if (e.keyCode === 39) { // right
		move("right");
	}
	if (e.keyCode === 40) { // down
		bottom();
	}
	if (e.keyCode === 90) { // Z
		rotate("clockwise");
	}
	if (e.keyCode === 88) { // X
		rotate("counterClockwise");
	}
});

/**
 * HELPER FUNCTIONS
 */

// checks left side, right side, bottom, and other pieces
function validSpot(newpoints) {
	for (var i = 0; i < points.length; i++) {
		if (newpoints[i][0] < 0 || newpoints[i][0] >= GRID_WIDTH || newpoints[i][1] >= GRID_HEIGHT || grid[newpoints[i][0]][newpoints[i][1]] !== undefined) {
			return false;
		}
	}
	return true;
}

function clearLine(line) {
	var newgrid = [];
	for (var x = 0; x < GRID_WIDTH; x++) {
		newgrid[x] = [];

		// lower all lines about the line to clear
		for (var y = line; y >= 0; y--) {
			newgrid[x][y + 1] = grid[x][y];
		}

		// keep other lines the same
		for (var y = line + 1; y < GRID_HEIGHT; y++) {
			newgrid[x][y] = grid[x][y];
		}
	}
	// clear top row
	for (var i = 0; i < GRID_WIDTH; i++) {
		newgrid[i][0] = undefined;
	}
	grid = newgrid;

}
function lineCanBeCleared(line) {
	for (var i = 0; i < GRID_WIDTH; i++) {
		if (typeof grid[i][line] === "undefined") {
			return false;
		}
	}
	return true;
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

	color = nextColor;
	points = nextPoints.map(function(arr) { // set points to nextPoints w/o reference
		return arr.slice();
	});
	nextColor = Math.floor(Math.random() * 7);
	nextPoints = POSSIBLE_POINTS[nextColor];

	// check for lose
	for (var i = 0; i < points.length; i++) {
		if (typeof grid[points[i][0]][points[i][1]] !== "undefined") {
			// lose();
			alert("You lose!");
			return;
		}
	}

	// put new piece in the grid
	for (var i = 0; i < points.length; i++) {
		grid[points[i][0]][points[i][1]] = color;
	}


	level = Math.floor(clearedLines / 10); // based on NES version
	score += POINTS_FOR_LINE[linesClearedThisRound] * (level + 1);

	// enforce max level/score
	level = (level > MAX_LEVEL) ? MAX_LEVEL : level;
	score = (score > MAX_SCORE) ? MAX_SCORE : score;
	
	levelText.setText("Level\n" + level);
	clearedLinesText.setText("Clear\n" + clearedLines);
	scoreText.setText("Score\n" + score);

	// set nextPicture to a picture of the next piece
	container.removeChild(nextPicture);
	nextPicture = PIXI.Sprite.fromImage("tetrominos/" + nextColor.toString() + ".png");
	nextPicture.x = SPRITE_WIDTH / 2;
	nextPicture.y = Math.floor(CANVAS_HEIGHT * 2 / 3);
	container.addChild(nextPicture);

	frameCounter = 1;
	drop();
}

function drop() {
	if (frameCounter === 0) {
		var newpoints = [];

		// set all of the points to blank
		for (var i = 0; i < points.length; i++) {
			grid[points[i][0]][points[i][1]] = undefined;
		}

		// create newpoints, one block lower
		for (var i = 0; i < points.length; i++) {
			newpoints[i] = [];
			newpoints[i][0] = points[i][0];
			newpoints[i][1] = points[i][1] + 1;
		}

		// check for collision, and stop moving if collision detected
		if (validSpot(newpoints)) {
			for (var i = 0; i < points.length; i++) {
				grid[newpoints[i][0]][newpoints[i][1]] = color;
			}
			points = newpoints; // set points correctly
		}
		else {
			for (var i = 0; i < points.length; i++) {
				grid[points[i][0]][points[i][1]] = color;
			}
			newRound();
			return; // end drop()
		}
	}
	frameCounter = (frameCounter + 1) % (FRAMES_PER_LEVEL[level]);
	dropRequest = requestAnimationFrame(drop);
}

// logic is basically the same as drop(), but uses a do-while instead of requestAnimationFrame so it happens instantly
function bottom() {
	cancelAnimationFrame(dropRequest);
	var newpoints = [];

	// set all of the points to blank
	for (var i = 0; i < points.length; i++) {
		grid[points[i][0]][points[i][1]] = undefined;
	}

	// create newpoints, one block lower
	for (var i = 0; i < points.length; i++) {
		newpoints[i] = [];
		newpoints[i][0] = points[i][0];
		newpoints[i][1] = points[i][1] + 1;
	}

	// check for collision, and stop moving if collision detected
	while (validSpot(newpoints)) {
		// create newpoints, one block lower
		for (var i = 0; i < points.length; i++) {
			newpoints[i][1]++;
		}
	}

	// set points correctly
	for (var i = 0; i < points.length; i++) {
		points[i][0] = newpoints[i][0];
		points[i][1] = newpoints[i][1] - 1;
		grid[points[i][0]][points[i][1]] = color;
	}
	newRound();
}


function move(direction) {
	var newpoints = [];

	// set all of the points to blank
	for (var i = 0; i < points.length; i++) {
		grid[points[i][0]][points[i][1]] = undefined;
	}

	// create newpoints, one block to the side
	for (var i = 0; i < points.length; i++) {
		newpoints[i] = [];
		newpoints[i][0] = points[i][0];
		newpoints[i][1] = points[i][1];
		if (direction === "right") {
			newpoints[i][0]++;
		}
		if (direction === "left") {
			newpoints[i][0]--;
		}
	}

	// check for collision, and stop moving if collision detected
	if (validSpot(newpoints)) {
		for (var i = 0; i < points.length; i++) {
			grid[newpoints[i][0]][newpoints[i][1]] = color;
		}
		points = newpoints; // set points correctly
	}
	else {
		for (var i = 0; i < points.length; i++) {
			grid[points[i][0]][points[i][1]] = color;
		}
	}
}


// Rotation follows Nintendo Rotation System (NES version)
function rotate(direction) {
	var newpoints = [];
	// set all of the points to blank
	for (var i = 0; i < points.length; i++) {
		grid[points[i][0]][points[i][1]] = undefined;
	}

	var minX = GRID_WIDTH;
	var maxX = 0;
	var minY = GRID_HEIGHT;
	var maxY = 0;

	// calculate mins/maxes
	for (var i = 0; i < points.length; i++) {
		if (points[i][0] > maxX) {
			maxX = points[i][0];
		}
		if (points[i][0] < minX) {
			minX = points[i][0];
		}
		if (points[i][1] > maxY) {
			maxY = points[i][1];
		}
		if (points[i][1] < minY) {
			minY = points[i][1];
		}
	}

	var shiftX = 0;
	var shiftY = 0;

	/*
	switch (BLOCK_TYPE[color]) {
		case "J":
			shiftX = 0;
			shiftY = 0;
			break;
		case "T":
			shiftX = 0;
			shiftY = 0;
			break;
		case "L":
			shiftX = 0;
			shiftY = 0;
			break;
		case "S":
			shiftX = 0;
			shiftY = 0;
			break;
		case "I":
			if (maxX > maxY) {
				shiftX = 2;
				shiftY = -2;
			}
			if (maxY > maxX) {
				shiftX = -2;
				shiftY = 2;
			}
			break;
		case "O":
			shiftX = 0;
			shiftY = 0;
			break;
		case "Z":
			shiftX = 0;
			shiftY = 0;
			break;
	}
	*/

	// rotation logic
	if (direction === "counterClockwise") {
		for (var i = 0; i < points.length; i++) {
			newpoints[i] = [];
			var pointX = points[i][0] - minX;
			var pointY = points[i][1] - minY;
			newpoints[i][0] = pointY;
			newpoints[i][1] = -pointX + maxX - minX;
			newpoints[i][0] += minX + shiftX;
			newpoints[i][1] += minY + shiftY;
		}
	}
	if (direction === "clockwise") {
		for (var i = 0; i < points.length; i++) {
			newpoints[i] = [];
			var pointX = points[i][0] - minX;
			var pointY = points[i][1] - minY;
			newpoints[i][0] = -pointY + maxY - minY;
			newpoints[i][1] = pointX;
			newpoints[i][0] += minX + shiftX;
			newpoints[i][1] += minY + shiftY;
		}
	}

	// check for collision, and stop moving if collision detected
	if (validSpot(newpoints)) {
		for (var i = 0; i < points.length; i++) {
			grid[newpoints[i][0]][newpoints[i][1]] = color;
		}
		points = newpoints; // set points correctly
	}
	else {
		for (var i = 0; i < points.length; i++) {
			grid[points[i][0]][points[i][1]] = color;
		}
	}
}

function pause() {
	if (paused) {
		drop();
	}
	if (!paused) {
		cancelAnimationFrame(dropRequest);
	}
	paused = !paused;
}
/**
 * RENDER
 */

function render() {
	for (var x = 0; x < GRID_WIDTH; x++) {
		for (var y = 0; y < GRID_HEIGHT; y++) {
			if (spriteGrid[x][y]) {
				container.removeChild(spriteGrid[x][y]);
			}
			if (typeof grid[x][y] !== "undefined") {
				spriteGrid[x][y] = PIXI.Sprite.fromImage("blocks/" + grid[x][y].toString() + ".png");
				spriteGrid[x][y].x = x * SPRITE_WIDTH + SCOREBOARD_WIDTH;
				spriteGrid[x][y].y = y * SPRITE_WIDTH;
				container.addChild(spriteGrid[x][y]);
			}
		}
	}

	renderer.render(container);
	requestAnimationFrame(render);
}

/**
 * RUN!
 */

// need to set nextColor and nextPoints initially because newRound() relies on them
nextColor = Math.floor(Math.random() * 7);
nextPoints = POSSIBLE_POINTS[nextColor];


document.addEventListener("DOMContentLoaded", function(event) {
	document.querySelector("#container").insertBefore(renderer.view, document.querySelector("#container").lastChild);
	render();
	render();
	newRound();

});