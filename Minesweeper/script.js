"use strict";

// Settings
var width = 30;
var height = 16;
var bombs = 99;
var hints = false;

var grid = [];
var firstClick = true;

var Cell = function() {
	this.bomb = false;
	this.surrounding = 0;
	this.activated = false;
	this.flagged = false;
	this.hint = false;
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

function generateHTML() {
	var table = document.createElement("table");
	table.id = "minesweeper";
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
	document.body.insertBefore(table, document.body.firstChild);
	updateAllHTML();
}

function updateHTML(x, y) {
	var td = document.querySelector('#minesweeper td[data-x="'+x+'"][data-y="'+y+'"]');
	var cell = grid[x][y];
	td.dataset.bomb = cell.bomb;
	td.dataset.surrounding = cell.surrounding;
	td.dataset.activated = cell.activated;
	td.dataset.flagged = cell.flagged;
	td.dataset.hint = cell.hint;

	if (cell.activated && cell.surrounding >= 1) {
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

function reveal(x, y) {
	var cell = grid[x][y];
	if (!cell.activated && !cell.flagged && !cell.hint) {
		if (cell.bomb) {
			gameOver();
		}
		else {
			cell.activated = true;
			if (cell.surrounding === 0) {
				revealSurroundings(x, y);
			}
		}
	}
	updateHTML(x, y);
	// TODO: check win
}
function revealSurroundings(x, y) {
	for (var i = Math.max(x-1, 0); i <= Math.min(x+1, width - 1); i++) {
		for (var j = Math.max(y-1, 0); j <= Math.min(y+1, height - 1); j++) {
			reveal(i, j);
		}
	}
}

function gameOver() {
	// TODO: revealAllBombs();
	alert("YOU LOSE");
}

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
}

function cellLeftClick(event) {
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
	var td = event.target;
	var x = parseInt(td.dataset.x, 10);
	var y = parseInt(td.dataset.y, 10);
	var cell = grid[x][y];

	if (cell.activated) {
		event.preventDefault();
		return false;
	}

	if (hints) {
		// !flag, !hint -> flag, !hint
		// flag, !hint -> !flag, hint
		// !flag, hint -> !flag, !hint
		var hint = !cell.flagged;
		var flagged = !cell.flagged && !cell.hint;
		cell.hint = hint;
		cell.flagged = flagged;
	}
	else {
		cell.flagged = !cell.flagged;
	}
	updateHTML(x, y);

	event.preventDefault();
	return false;
}

document.addEventListener("DOMContentLoaded", function(event) {
	generateGrid();
	calculateSurroundings();
	generateHTML();
});