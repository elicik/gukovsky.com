"use strict";

// Settings
var width;
var height;
var bombs;
var hints;
var playing;
var clock;
var bombsFlagged;
var clockIntervalID;
var grid;
var firstClick;

// SETUP

var Cell = function() {
	this.bomb = false;
	this.surrounding = 0;
	this.activated = false;
	this.flagged = false;
	this.hint = false;
	this.deathBomb = false;
}

function newGame() {
	width = 30;
	height = 16;
	bombs = 99;
	hints = false;
	playing = true;
	clock = 0;
	bombsFlagged = 0;
	grid = [];
	firstClick = true;
	clearInterval(clockIntervalID);
	clearHTML();
	generateGrid();
	calculateSurroundings();
	generateHTML();
}

// GAME BASICS
function generateGrid() {
	for (var x = 0; x < width; x++) {
		grid[x] = [];
		for (var y = 0; y < height; y++) {
			grid[x][y] = new Cell();
		}
	}
	for (var i = 0; i < bombs; i++) {
		placeBomb();
	}
}
function calculateSurroundings() {
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			// Check surrounding
			if (grid[x][y].bomb) {
				grid[x][y].surrounding = null;
			}
			var surrounding = 0;
			for (var i = Math.max(x-1, 0); i <= Math.min(x+1, width - 1); i++) {
				for (var j = Math.max(y-1, 0); j <= Math.min(y+1, height - 1); j++) {
					if (grid[i][j].bomb) {
						surrounding++;
					}
				}
			}
			grid[x][y].surrounding = surrounding;
		}
	}
}
function placeBomb() {
	var bombPlaced = false;
	while (!bombPlaced) {
		var x = Math.floor(Math.random() * width);
		var y = Math.floor(Math.random() * height);
		if (!grid[x][y].bomb) {
			grid[x][y].bomb = true;
			bombPlaced = true;
		}
	}
}
function reveal(x, y) {
	var cell = grid[x][y];
	if (!cell.activated && !cell.flagged && !cell.hint) {
		if (cell.bomb) {
			gameOver(x, y);
		}
		else {
			cell.activated = true;
			if (cell.surrounding === 0) {
				revealSurroundings(x, y);
			}
		}
	}
	updateHTML(x, y);
	if (checkWin()) {
		win();
	}
}
function revealSurroundings(x, y) {
	for (var i = Math.max(x-1, 0); i <= Math.min(x+1, width - 1); i++) {
		for (var j = Math.max(y-1, 0); j <= Math.min(y+1, height - 1); j++) {
			reveal(i, j);
		}
	}
}
function revealAllBombs() {
	// Assumes loss
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			var cell = grid[x][y];
			if (cell.bomb !== cell.flagged) {
				cell.activated = true;
				updateHTML(x, y);
			}	
		}
	}
}
function flagAllBombs() {
	// Assumes win
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			var cell = grid[x][y];
			if (cell.bomb && !cell.flagged) {
				cell.flagged = true;
				bombsFlagged++;
				updateHTML(x, y);
			}
		}
	}
	updateBombsFlagged();
}

// WINNING AND LOSING
function gameOver(x, y) {
	playing = false;
	clearInterval(clockIntervalID);
	var cell = grid[x][y];
	cell.deathBomb = true;
	updateHTML(x, y);
	revealAllBombs();
	alert("YOU LOSE");
}
function win() {
	playing = false;
	clearInterval(clockIntervalID);
	flagAllBombs();
	alert("YOU WIN");
}
function checkWin() {
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			var cell = grid[x][y];
			if (cell.activated === cell.bomb) {
				return false;
			}
		}
	}
	return true;
}

// HTML
function generateHTML() {
	var table = document.querySelector("#minesweeper");
	table.innerHTML = "";
	for (var y = 0; y < height; y++) {
		var tr = document.createElement("tr");
		for (var x = 0; x < width; x++) {
			var td = document.createElement("td");
			td.dataset.x = x;
			td.dataset.y = y;
			td.addEventListener("click", cellLeftClick);
			td.addEventListener("contextmenu", cellRightClick);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	updateAllHTML();
	updateBombsFlagged();
}
function clearHTML() {
	// Also clears all eventListeners from the cells
	var table = document.querySelector("#minesweeper");
	while (table.firstChild) {
	    table.removeChild(table.firstChild);
	}
}
function updateHTML(x, y) {
	var td = document.querySelector('#minesweeper td[data-x="'+x+'"][data-y="'+y+'"]');
	var cell = grid[x][y];
	td.dataset.bomb = cell.bomb;
	td.dataset.surrounding = cell.surrounding;
	td.dataset.activated = cell.activated;
	td.dataset.flagged = cell.flagged;
	td.dataset.hint = cell.hint;
	td.dataset.deathBomb = cell.deathBomb;

	if (cell.activated && cell.surrounding >= 1 && !cell.bomb && !cell.flagged) {
		td.innerHTML = cell.surrounding;
	}
	else {
		td.innerHTML = "";
	}
}
function updateAllHTML() {
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			updateHTML(x, y);
		}
	}
}
function updateClock() {
	clock++;
	if (clock > 999) {
		clearInterval(clockIntervalID);
	}
	document.querySelector("#clock").innerHTML = ("00" + clock).slice(-3);
}
function updateBombsFlagged() {
	var numBombs = bombs - bombsFlagged;
	var numBombsString = ("00" + Math.abs(numBombs)).slice(-3);
	if (numBombs < 0) {
		numBombsString = "-" + numBombsString.slice(1);
	}

	document.querySelector("#numBombs").innerHTML = numBombsString;
}

// EVENT LISTENERS
function prepareFirstClick(x, y) {
	var bombs = 0;
	// Add up # of bombs, set all bombs to prevent bomb placement
	for (var i = Math.max(x-1, 0); i <= Math.min(x+1, width - 1); i++) {
		for (var j = Math.max(y-1, 0); j <= Math.min(y+1, height - 1); j++) {
			if (grid[i][j].bomb) {
				bombs++;
			}
			else {
				grid[i][j].bomb = true;
			}
		}
	}
	// Place bombs
	for (var i = 0; i < bombs; i++) {
		placeBomb();
	}
	// Remove bombs from first click
	for (var i = Math.max(x-1, 0); i <= Math.min(x+1, width - 1); i++) {
		for (var j = Math.max(y-1, 0); j <= Math.min(y+1, height - 1); j++) {
			grid[i][j].bomb = false;
		}
	}
	calculateSurroundings();
	updateAllHTML();
	document.querySelector("#clock").innerHTML = ("000");
	clockIntervalID = setInterval(updateClock, 1000);
}
function cellLeftClick(event) {
	if (!playing) {
		return;
	}
	var td = event.target;
	var x = parseInt(td.dataset.x, 10);
	var y = parseInt(td.dataset.y, 10);

	if (firstClick) {
		prepareFirstClick(x, y);
		firstClick = false;
	}

	var cell = grid[x][y];
	if (cell.activated) {
		var surroundingFlags = 0;
		for (var i = Math.max(x-1, 0); i <= Math.min(x+1, width - 1); i++) {
			for (var j = Math.max(y-1, 0); j <= Math.min(y+1, height - 1); j++) {
				if (grid[i][j].flagged) {
					surroundingFlags++;
				}
			}
		}
		if (cell.surrounding === surroundingFlags) {
			revealSurroundings(x, y);
		}
	}
	else {
		reveal(x, y);
	}
}
function cellRightClick(event) {
	if (!playing) {
		event.preventDefault();
		return false;
	}
	var td = event.target;
	var x = parseInt(td.dataset.x, 10);
	var y = parseInt(td.dataset.y, 10);
	var cell = grid[x][y];

	if (cell.activated) {
		event.preventDefault();
		return false;
	}

	if (hints) {
		// Cycle flag -> hint -> nothing
		if (cell.flagged) {
			cell.flagged = false;
			bombsFlagged--;
			updateBombsFlagged();

			cell.hint = true;
		}
		else if (cell.hint) {
			cell.hint = false;
		}
		else {
			cell.flagged = true;
			bombsFlagged++;
			updateBombsFlagged();
		}
	}
	else {
		cell.flagged = !cell.flagged;
		bombsFlagged += (cell.flagged ? 1 : -1);
		updateBombsFlagged();
	}
	updateHTML(x, y);

	event.preventDefault();
	return false;
}

// MAIN
document.addEventListener("DOMContentLoaded", function(event) {
	newGame();
	document.querySelector("#smiley").addEventListener("click", newGame);
});