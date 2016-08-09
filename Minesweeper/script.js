"use strict";

// Settings
var width = 30;
var height = 16;
var bombs = 99;
var hints = false;

var grid = [];

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


// console.table(grid.map(function(arr) {
// 	return arr.map(function(obj) {
// 		return obj.surrounding;
// 	});
// }));
// console.table(grid.map(function(arr) {
// 	return arr.map(function(obj) {
// 		return obj.bomb;
// 	});
// }));



document.addEventListener("DOMContentLoaded", function(event) {
	generateGrid();
	calculateSurroundings();
	
});