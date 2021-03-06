import swal from "sweetalert";
// import { db } from "./db";

let blank_grid = function(default_value) {
	return new Array(3).fill().map(() => new Array(3).fill().map(() => new Array(3).fill().map(() => new Array(3).fill(default_value))));
};

// 	created: function() {
// 		if (this.$route.query.id && this.$route.query.player) {
// 			this.id = this.$route.query.id;
// 			this.player = this.$route.query.player;
// 			this.$bind("game", db.collection("games").doc(this.id));
// 		}
// 		else {
// 			db.collection("games").add({
// 				grid: JSON.stringify(blank_grid("")),
// 				last_move: [],
// 				turn: "X",
// 			})
// 			.then((docRef) => {
// 				this.$router.push({
// 					query: {
// 						id: docRef.id,
// 						player: "X",
// 					},
// 				});
// 				this.id = this.$route.query.id;
// 				return this.$bind("game", db.collection("games").doc(this.id));
// 			})
// 			.then(() => {
// 				let url = window.location.href.replace("player=X", "player=O");
// 				return navigator.clipboard.writeText(url);
// 			})
// 			.then(() => {
// 				swal({
// 					title: "URL saved to your clipboard",
// 					text: "Share it with your friend!",
// 					icon: "info",
// 				});
// 			});
// 		}
// 	},
// 	data: function() {
// 		return {
// 			id: "",
// 			game: {
// 				grid: JSON.stringify(blank_grid("")),
// 				last_move: [],
// 				turn: "X",
// 			},
// 			player: "X",
// 		};
// 	},
// 	watch: {
// 		game: function() {
// 			if (this.game.grid === JSON.stringify(blank_grid(""))) {
// 				swal.close();
// 			}
// 			if (this.winner) {
// 				swal({
// 					title: "Game over!",
// 					text: this.winner === this.player ? "You won! Congrats!" : "You lost. Better luck next time!",
// 					icon: this.winner === this.player ? "success" : "error",
// 					buttons: {
// 						confirm: "Play again"
// 					}
// 				}).then(this.reset);
// 			}
// 			else if(this.tie) {
// 				swal({
// 					title: "Game over!",
// 					text: "There was a tie!",
// 					icon: "info",
// 					buttons: {
// 						confirm: "Play again"
// 					}
// 				}).then(this.reset);
// 			}
// 		},
// 	},
// 	computed: {
// 		grid: function() {
// 			return JSON.parse(this.game.grid);
// 		},
// 		big_grid: function() {
// 			let result = [["","",""],["","",""],["","",""]];
// 			for (let row = 0; row < 3; row++) {
// 				for (let col = 0; col < 3; col++) {
// 					for (let player of ["X", "O"]) {
// 						for (let i = 0; i < 3; i++) {
// 							// Horizontal
// 							if (this.grid[row][col][i].every(x => x === player)) {
// 								result[row][col] = player;
// 							}
// 							// Vertical
// 							if ([this.grid[row][col][0][i], this.grid[row][col][1][i], this.grid[row][col][2][i]].every(x => x === player)) {
// 								result[row][col] = player;
// 							}
// 						}
// 						// Diagonals
// 						if ([this.grid[row][col][0][0], this.grid[row][col][1][1], this.grid[row][col][2][2]].every(x => x === player)) {
// 							result[row][col] = player;
// 						}
// 						if ([this.grid[row][col][0][2], this.grid[row][col][1][1], this.grid[row][col][2][0]].every(x => x === player)) {
// 							result[row][col] = player;
// 						}
// 					}
// 				}
// 			}
// 			return result;
// 		},
// 		possible: function() {
// 			if (this.game.last_move.length === 0) {
// 				return blank_grid(true);
// 			}
// 			if (this.big_grid[this.game.last_move[2]][this.game.last_move[3]] !== "") {
// 				return this.grid.map((row, row_num) =>
// 					row.map((col, col_num) => {
// 						if (this.big_grid[row_num][col_num] !== "") {
// 							return [[false, false, false], [false, false, false], [false, false, false]];
// 						}
// 						else {
// 							return col.map(function(i) {
// 								return i.map(function(j) {
// 									return j === "";
// 								});
// 							});
// 						}
// 					})
// 				);
// 			}
// 			else {
// 				let result = blank_grid(false);
// 				let row = this.game.last_move[2];
// 				let col = this.game.last_move[3];
// 				result[row][col] = this.grid[row][col].map(function(i) {
// 					return i.map(function(j) {
// 						return j === "";
// 					});
// 				});
// 				return result;
// 			}
// 		},
// 		winner: function() {
// 			for (let player of ["X", "O"]) {
// 				for (let i = 0; i < 3; i++) {
// 					// Horizontal
// 					if (this.big_grid[i].every(x => x === player)) {
// 						return player;
// 					}
// 					// Vertical
// 					if ([this.big_grid[0][i], this.big_grid[1][i], this.big_grid[2][i]].every(x => x === player)) {
// 						return player;
// 					}
// 				}
// 				// Diagonals
// 				if ([this.big_grid[0][0], this.big_grid[1][1], this.big_grid[2][2]].every(x => x === player)) {
// 					return player;
// 				}
// 				if ([this.big_grid[0][2], this.big_grid[1][1], this.big_grid[2][0]].every(x => x === player)) {
// 					return player;
// 				}
// 			}
// 			return false;
// 		},
// 		tie: function() {
// 			// Assuming winner() is false
// 			return !this.winner && !this.big_grid.flat().some(x => x === "");
// 		},
// 	},
// 	methods: {
// 		play: function(row, col, i, j) {
// 			if (!this.possible[row][col][i][j] || this.player !== this.game.turn) {
// 				return;
// 			}
// 			let grid = JSON.parse(this.game.grid);
// 			grid[row][col][i][j] = this.game.turn;
// 			db.collection("games").doc(this.id).update({
// 				grid: JSON.stringify(grid),
// 				last_move: [row, col, i, j],
// 				turn: this.game.turn === "O" ? "X" : "O",
// 			});
// 		},
// 		reset: function() {
// 			db.collection("games").doc(this.id).update({
// 				grid: JSON.stringify(blank_grid("")),
// 				last_move: [],
// 				turn: "X",
// 			});
// 		}
// 	},
// }

function createHTML(state) {
	let htmlUltimate = document.querySelector("#ultimate");
	state.htmlGrid = blank_grid();
	state.htmlBigGrid = [[,,],[,,],[,,]]; 
	for(let row = 0; row < 3; row++) {
		let htmlRow = document.createElement("tr");
		for(let col = 0; col < 3; col++) {
			let htmlCol = document.createElement("td");
			let htmlTable = document.createElement("table");
			state.htmlBigGrid[row][col] = htmlTable;
			for(let i = 0; i < 3; i++) {
				let htmlI = document.createElement("tr");
				for(let j = 0; j < 3; j++) {
					let htmlJ = document.createElement("td");
					state.htmlGrid[row][col][i][j] = htmlJ;
					htmlJ.addEventListener("click", () => play(row, col, i, j));
					htmlI.appendChild(htmlJ);
				}
				htmlTable.appendChild(htmlI);
			}
			htmlCol.appendChild(htmlTable);
			htmlRow.appendChild(htmlCol);
		}
		htmlUltimate.appendChild(htmlRow);
	}
	state.htmlPlayer = document.querySelector("#player")
	state.htmlTurn = document.querySelector("#turn")
}

function updateHTML(state) {
	state.htmlPlayer.className = state.player;
	state.htmlPlayer.textContent = state.player;
	state.htmlTurn.className = state.game.turn;
	state.htmlTurn.textContent = state.game.turn === state.player ? "your" : "not your";
	for(let row = 0; row < 3; row++) {
		for(let col = 0; col < 3; col++) {
			state.htmlBigGrid[row][col].className = state.big_grid[row][col];
			for(let i = 0; i < 3; i++) {
				for(let j = 0; j < 3; j++) {
					let className = state.grid[row][col][i][j];
					if (state.possible[row_num][col_num][i_num][j_num]) {
						className = "possible";
					}
					state.htmlGrid[row][col][i][j].className = className;
				}
			}
		}
	}
}

document.addEventListener("DOMContentLoaded", function(event) {
	createHTML({});
});