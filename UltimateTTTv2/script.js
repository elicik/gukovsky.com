"use strict";

// TODO: Keep past versions of grid and move

function create_blank_grid(default_value) {
	return new Array(3).map(() => new Array(3).map(() => new Array(3).map(() => new Array(3).fill(default_value))));
}

var app = new Vue({
	el: "#app",
	data: {
		turn: "X",
		grid: create_blank_grid(""),
		last_move: []
	},
	computed: {
		big_grid: function() {
			let result = [["","",""],["","",""],["","",""]];
			for (let row = 0; row < 3; row++) {
				for (let col = 0; col < 3; col++) {
					for (let player of ["X", "O"]) {
						for (let i = 0; i < 3; i++) {
							// Horizontal
							if (this.grid[row][col][i].every(x => x === player)) {
								result[row][col] = player;
							}
							// Vertical
							if ([this.grid[row][col][0][i], this.grid[row][col][1][i], this.grid[row][col][2][i]].every(x => x === player)) {
								result[row][col] = player;
							}
						}
						// Diagonals
						if ([this.grid[row][col][0][0], this.grid[row][col][1][1], this.grid[row][col][2][2]].every(x => x === player)) {
							result[row][col] = player;
						}
						if ([this.grid[row][col][0][2], this.grid[row][col][1][1], this.grid[row][col][2][0]].every(x => x === player)) {
							result[row][col] = player;
						}
					}
				}
			}
			return result;
		}
		possible: function() {
			// TODO: Return possible moves
			if (this.last_move.length == 0) {
				return create_blank_grid(true);
			}
			else if (this.big_grid[last_move[2], last_move[3]] !== "") {
				return this.grid.map(function(row, row_num) {
					return row.map(function(col, col_num) {
						if (this.big_grid[row_num][col_num] !== "") {
							return [[false, false, false], [false, false, false], [false, false, false]];
						}
						else {
							return col.map(function(i) {
								return i.map(function(j) {
									return j === "";
								});
							});
						}
					});
				});
			}
			else {
				let result = create_blank_grid(false);
				let row = last_move[2];
				let col = last_move[3];
				result[row][col] = this.grid[row][col].map(function(i) {
					return i.map(function(j) {
						return j === "";
					});
				});
				return result;
			}
		}
	}
})


var turn = true; // true: Red, false: Blue
var grid = [
	[
		[["", "", ""], ["", "", ""], ["", "", ""]], // 0, 0
		[["", "", ""], ["", "", ""], ["", "", ""]], // 0, 1
		[["", "", ""], ["", "", ""], ["", "", ""]]  // 0, 2
	],
	[
		[["", "", ""], ["", "", ""], ["", "", ""]], // 1, 0
		[["", "", ""], ["", "", ""], ["", "", ""]], // 1, 1
		[["", "", ""], ["", "", ""], ["", "", ""]]  // 1, 2
	],
	[
		[["", "", ""], ["", "", ""], ["", "", ""]], // 2, 0
		[["", "", ""], ["", "", ""], ["", "", ""]], // 2, 1
		[["", "", ""], ["", "", ""], ["", "", ""]]  // 2, 2
	]
];

function reset() {
	turn = true;
	grid = [[[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]], [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]] ], [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]]];
	$(".Red").removeClass("Red");
	$(".Blue").removeClass("Blue");
	$("table table td").addClass("possible");
	$("#turn").html("Red");
	$("#turn").css("color", "red");
}

function tie() {
	// Assuming winner() is false
	return !this.big_grid.flat().some("");
}

function winner() {
	for (let player of ["X", "O"]) {
		for (let i = 0; i < 3; i++) {
			// Horizontal
			if (this.big_grid[i].every(x => x === player)) {
				return player;
			}
			// Vertical
			if ([this.big_grid[0][i], this.big_grid[1][i], this.big_grid[2][i]].every(x => x === player)) {
				return player;
			}
		}
		// Diagonals
		if ([this.big_grid[0][0], this.big_grid[1][1], this.big_grid[2][2]].every(x => x === player)) {
			return player;
		}
		if ([this.big_grid[0][2], this.big_grid[1][1], this.big_grid[2][0]].every(x => x === player)) {
			return player;
		}
	}
	return "";
}

$(document).ready(function() {
	var innerhtml = "";
	for(var row = 0; row < 3; row++) {
		innerhtml += "<tr>";
		for(var col = 0; col < 3; col++) {
			innerhtml += "<td><table data-row=\"" + row + "\" data-column=\"" + col + "\">";
			for(var i = 0; i < 3; i++) {
				innerhtml += "<tr>";
				for(var j = 0; j < 3; j++) {
					innerhtml += "<td data-row=\"" + i + "\" data-column=\"" + j + "\"></td>";
				}
				innerhtml += "</tr>";
			}
			innerhtml += "</table></td>";
		}
		innerhtml += "</tr>";
	}

	$("#ultimate").html(innerhtml);
	$("table table td").addClass("possible");

	$("table table td").click(function() {
		if($(this).hasClass("possible")) {
			var row = Number($($(this).parents("table:not(#ultimate)")[0]).data("row"));
			var col = Number($($(this).parents("table:not(#ultimate)")[0]).data("column"));
			var i = Number($(this).data("row"));
			var j = Number($(this).data("column"));
			grid[row][col][i][j] = turn ? "Red" : "Blue";
			$(".possible").removeClass("possible");
			$(this).addClass(grid[row][col][i][j]);

			if(winSquare(row, col)) { // Move won a square
				grid[row][col] = turn ? "Red" : "Blue";
				$("table table[data-row=" + row + "][data-column=" + col + "]").addClass(turn ? "Red" : "Blue");
			}
			if($.isArray(grid[row][col])) { // Tied square
				if(grid[row][col][0].indexOf("") === -1 &&
					grid[row][col][1].indexOf("") === -1 &&
					grid[row][col][2].indexOf("") === -1) {
					grid[row][col] = "";
				}
			}

			if(winner()) { // Game winner
				swal({
					title: "Game over!",
					text: (turn ? "Red" : "Blue") + " won! Congrats!",
					icon: "success",
					buttons: {
						cancel: false,
						confirm: "Play again"
					}
				}).then(reset);
			}
			else if(tie()) { // Game tied
				swal({
					title: "Game over!",
					text: "There was a tie!",
					icon: "info",
					buttons: {
						cancel: false,
						confirm: "Play again"
					}
				}).then(reset);
			}
			else { // If square is available, make it possible. If not, make everything possible
				if($.isArray(grid[i][j])) {
					$("table table[data-row=" + i + "][data-column=" + j + "] td:not(.Red, .Blue)").addClass("possible");
				}
				else {
					$("table table:not(.Red, .Blue) td:not(.Red, .Blue)").addClass("possible");
				}
				$("#turn").html(turn ? "Blue" : "Red");
				$("#turn").css("color", turn ? "blue" : "red");
			}
			turn = !turn;
		}
	});
});