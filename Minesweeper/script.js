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
var oldFashioned = false;
var ignoreMouseUpOnce = false;


// xyzzy
var xyzzy = false;
var xyzzyIndex = 0;

window.addEventListener("keypress", testForxyzzy);
function testForxyzzy(event) {
	if (xyzzyIndex === 5 ) {
		if (event.keyCode === 13 && event.shiftKey) {
			xyzzy = true;
			window.removeEventListener("keypress", testForxyzzy);
		}
		else {
			xyzzyIndex = 0;
		}
	}

	if (String.fromCharCode(event.keyCode) === "xyzzy"[xyzzyIndex]) {
		xyzzyIndex++;
	}
	else {
		xyzzyIndex = (String.fromCharCode(event.keyCode) === "xyzzy"[0]) ? 1 : 0;
	}
}

// SETUP

var Cell = function() {
	this.bomb = false;
	this.surrounding = 0;
	this.activated = false;
	this.flagged = false;
	this.hint = false;
	this.deathBomb = false;
	this.hover = false;
}

var DIFFICULTIES = {
	BEGINNER: {
		width: 9,
		height: 9,
		bombs: 10,
		getHighscore: function() {
			return localStorage.getItem("minesweeper-highscore-beginner");
		},
		setHighscore: function(newscore) {
			localStorage.setItem("minesweeper-highscore-beginner", newscore);
		} 
	},
	INTERMEDIATE: {
		width: 16,
		height: 16,
		bombs: 40,
		getHighscore: function() {
			return localStorage.getItem("minesweeper-highscore-intermediate");
		},
		setHighscore: function(newscore) {
			localStorage.setItem("minesweeper-highscore-intermediate", newscore);
		} 
	},
	EXPERT: {
		width: 30,
		height: 16,
		bombs: 99,
		getHighscore: function() {
			return localStorage.getItem("minesweeper-highscore-expert");
		},
		setHighscore: function(newscore) {
			localStorage.setItem("minesweeper-highscore-expert", newscore);
		} 
	}
}
var selectedDifficulty = DIFFICULTIES.INTERMEDIATE;

function newGame() {
	width = selectedDifficulty.width;
	height = selectedDifficulty.height;
	bombs = selectedDifficulty.bombs;
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
	document.querySelector("#smiley").dataset.ooh = false;
	document.querySelector("#smiley").dataset.dead = false;
	document.querySelector("#smiley").dataset.win = false;
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
function clearAllHover() {
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			var cell = grid[x][y];
			if (cell.hover) {
				cell.hover = false;
				updateHTML(x, y);
			}	
		}
	}
}
function hoverSurroundings(x, y) {
	for (var i = Math.max(x-1, 0); i <= Math.min(x+1, width - 1); i++) {
		for (var j = Math.max(y-1, 0); j <= Math.min(y+1, height - 1); j++) {
			var cell = grid[i][j];
			cell.hover = true;
			updateHTML(i, j);
		}
	}
}
function checkFlagsForReveal(x, y) {
	var cell = grid[x][y];
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

// WINNING AND LOSING
function gameOver(x, y) {
	playing = false;
	clearInterval(clockIntervalID);
	var cell = grid[x][y];
	cell.deathBomb = true;
	updateHTML(x, y);
	revealAllBombs();
	document.querySelector("#smiley").dataset.dead = true;
}
function win() {
	playing = false;
	clearInterval(clockIntervalID);
	flagAllBombs();
	document.querySelector("#smiley").dataset.win = true;

	// Highscores
	if (selectedDifficulty.getHighscore() === null || parseInt(selectedDifficulty.getHighscore(), 10) > clock) {
		alert("Congrats! You got a highscore of " + clock + "!");
		selectedDifficulty.setHighscore(clock);
	}
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
			td.addEventListener("mouseover", mouseover);
			td.addEventListener("mouseout", mouseout);
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
	td.dataset.hover = cell.hover;

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
function mouseover(event) {
	if (!playing) {
		return;
	}
	var td = event.target;
	td.addEventListener("mousedown", mousedown);
	td.addEventListener("mouseup", mouseup);
	var x = parseInt(td.dataset.x, 10);
	var y = parseInt(td.dataset.y, 10);
	var cell = grid[x][y];

	var leftButton = ((event.buttons & 0b1) === 0b1);
	var rightButton = ((event.buttons & 0b10) === 0b10);

	clearAllHover();
	if (leftButton && !rightButton) {
		if (cell.activated && !oldFashioned) {
			hoverSurroundings(x, y);
		}
		else {
			cell.hover = true;
			updateHTML(x, y);
		}
	}
	if (leftButton && rightButton) {
		if (oldFashioned) {
			hoverSurroundings(x, y);
		}
		else {
			cell.hover = true;
			updateHTML(x, y);
		}
	}
	if (xyzzy) {
		document.querySelector("#xyzzy").style.background = (cell.bomb ? "black" : "white");
	}
}
function mouseout(event) {
	if (!playing) {
		return;
	}
	var td = event.target;
	td.removeEventListener("mousedown", mousedown);
	td.removeEventListener("mouseup", mouseup);
}
function mousedown(event) {
	if (!playing) {
		return;
	}
	var td = event.target;
	var x = parseInt(td.dataset.x, 10);
	var y = parseInt(td.dataset.y, 10);
	var cell = grid[x][y];

	var leftButton = ((event.buttons & 0b1) === 0b1);
	var rightButton = ((event.buttons & 0b10) === 0b10);

	clearAllHover();
	if (leftButton && !rightButton) {
		if (cell.activated && !oldFashioned) {
			hoverSurroundings(x, y);
		}
		else {
			cell.hover = true;
			updateHTML(x, y);
		}
	}
	else if (leftButton && rightButton) {
		if (oldFashioned) {
			hoverSurroundings(x, y);
		}
		else {
			cell.hover = true;
			updateHTML(x, y);
		}
	}
	else if (!leftButton && rightButton) {
		if (!cell.activated) {
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
		}
	}

	if (leftButton) {
		document.querySelector("#smiley").dataset.ooh = true;
	}
}
function mouseup(event) {
	if (!playing) {
		return;
	}
	var td = event.target;
	var x = parseInt(td.dataset.x, 10);
	var y = parseInt(td.dataset.y, 10);
	var cell = grid[x][y];

	var leftButton = ((event.buttons & 0b1) === 0b1);
	var rightButton = ((event.buttons & 0b10) === 0b10);
	clearAllHover();
	// event.button is the button released, 0 is left, 2 is right
	if ((rightButton && event.button === 0) ||(leftButton && event.button === 2)) {
		if (cell.activated && oldFashioned) {
			checkFlagsForReveal(x, y);
		}
		ignoreMouseUpOnce = true;
		return;
	}
	if (ignoreMouseUpOnce) {
		ignoreMouseUpOnce = false;
	}
	else if (!leftButton && !rightButton && event.button === 0) {
		if (cell.activated && !oldFashioned) {
				checkFlagsForReveal(x, y);
		}
		if (!cell.activated) {
			if (firstClick) {
				prepareFirstClick(x, y);
				firstClick = false;
			}
			reveal(x, y);
		}
	}

	if (!leftButton) {
		document.querySelector("#smiley").dataset.ooh = false;
	}
}

// LOCAL STORAGE
function setOptions() {
	localStorage.setItem("minesweeper-size", document.querySelector("#size").value);
	localStorage.setItem("minesweeper-difficulty", document.querySelector("#difficulty").value);
	localStorage.setItem("minesweeper-oldfashioned", document.querySelector("#oldfashioned").checked);
}
function applyOptions() {
	document.body.id = "size-" + localStorage.getItem("minesweeper-size");
	selectedDifficulty = DIFFICULTIES[localStorage.getItem("minesweeper-difficulty")];
	oldFashioned = (localStorage.getItem("minesweeper-oldfashioned") === "true");
}

// MAIN
document.addEventListener("DOMContentLoaded", function(event) {
	document.querySelector("#smiley").addEventListener("click", newGame);

	// Prevent right clicks from interfering
	document.querySelector("#minesweeper").addEventListener("contextmenu", function(event) {
		event.preventDefault();
		return false;
	});

	// Use localstorage to store options
	if (localStorage.getItem("minesweeper-size") !== null) {
		applyOptions();
		document.querySelector("#size").value = localStorage.getItem("minesweeper-size");
		document.querySelector("#difficulty").value = localStorage.getItem("minesweeper-difficulty");
		document.querySelector("#oldfashioned").checked = (localStorage.getItem("minesweeper-oldfashioned") === "true");
	}
	else {
		setOptions();
	}

	// Bottom bar options
	document.querySelector("#size").addEventListener("change", function(event) {
		setOptions();
		applyOptions();
	});
	document.querySelector("#difficulty").addEventListener("change", function(event) {
		setOptions();
		applyOptions();
		newGame();
	});
	document.querySelector("#oldfashioned").addEventListener("change", function(event) {
		setOptions();
		applyOptions();
	});

	// Start the game!
	newGame();
});