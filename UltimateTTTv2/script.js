"use strict";

function create_blank_grid(default_value) {
	return new Array(3).fill().map(() => new Array(3).fill().map(() => new Array(3).fill().map(() => new Array(3).fill(default_value))));
}

var app = new Vue({
	el: "#app",
	data: {
		turn: "X",
		grid: create_blank_grid(""),
		last_move: [],
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
		},
		possible: function() {
			if (this.last_move.length === 0) {
				return create_blank_grid(true);
			}
			if (this.big_grid[this.last_move[2]][this.last_move[3]] !== "") {
				return this.grid.map((row, row_num) =>
					row.map((col, col_num) => {
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
					})
				);
			}
			else {
				let result = create_blank_grid(false);
				let row = this.last_move[2];
				let col = this.last_move[3];
				result[row][col] = this.grid[row][col].map(function(i) {
					return i.map(function(j) {
						return j === "";
					});
				});
				return result;
			}
		}
	},
	methods: {
		play: function(row, col, i, j) {
			// Use splice because editing the array directly does not trigger update
			if (this.grid[row][col][i][j] !== "" || this.big_grid[row][col] !== "") {
				return;
			}
			this.grid[row][col][i].splice(j, 1, this.turn);
			this.last_move = [row, col, i, j];
			if(this.winner()) { // Game winner
				swal({
					title: "Game over!",
					text: `${this.turn}  won! Congrats!`,
					icon: "success",
					buttons: {
						cancel: false,
						confirm: "Play again"
					}
				}).then(this.reset);
			}
			else if(this.tie()) { // Game tied
				swal({
					title: "Game over!",
					text: "There was a tie!",
					icon: "info",
					buttons: {
						cancel: false,
						confirm: "Play again"
					}
				}).then(this.reset);
			}
			this.turn = this.turn === "O" ? "X" : "O";

		},
		tie: function() {
			// Assuming winner() is false
			return !this.big_grid.flat().some(x => x === "");
		},
		winner: function() {
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
		},
		reset: function() {
			this.turn = "X";
			this.grid = create_blank_grid("");
		}
	}
})