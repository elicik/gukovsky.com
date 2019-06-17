<template>
	<div id="app">
		<div>
			<p>Programmed and designed as a group effort with Taha Vasowalla. Rewritten with Vue.js by myself in 2019.</p>
		</div>
		<table id="ultimate">
			<tr v-for="(row, row_num) in grid">
				<td v-for="(col, col_num) in row">
					<table v-bind:class="big_grid[row_num][col_num]">
						<tr v-for="(i, i_num) in col">
							<td v-for="(j, j_num) in i" v-bind:class="[{possible: possible[row_num][col_num][i_num][j_num]}, j]" v-on:click="play(row_num, col_num, i_num, j_num)">
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
		<p id="TTT-turnText">It is <span id="turn" v-bind:class="turn">{{ turn }}</span>'s turn.</p>
	</div>
</template>

<script>
import swal from "sweetalert";
let create_blank_grid = function(default_value) {
	return new Array(3).fill().map(() => new Array(3).fill().map(() => new Array(3).fill().map(() => new Array(3).fill(default_value))));
};

export default {
	data: function() {
		return {
			turn: "X",
			grid: create_blank_grid(""),
			last_move: [],
		};
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
	},
}
</script>

<style lang="scss">
$red-color: #FF7B64;
$blue-color: #647BFF;

#turn.X {
	color: $red-color;
}

#turn.O {
	color: $blue-color;
}

#app {
	text-align: center;
	padding: 24px;
}

#ultimate {
	margin: auto;
	td {
		box-sizing: content-box;
	}
}

table {
	border-collapse: collapse;

	table {
		margin: 10px;

		td {
			height: 50px;
			width: 50px;
			text-align: center;

			&:after {
				content: "";
				display: inline-block;
				position: relative;
				top: 2px;
				left: 0;
				background-color: white;
				border-radius: 2px;
				width: 0px;
				height: 0px;
				transition: 0.2s linear;
			}
		}
	}
}

.possible {
	cursor: pointer;

	&:after {
		background-color: #FFF98C;
		width: 45px;
		height: 45px;
		animation: blink 2s infinite;
	}
}

@keyframes blink {
	0% {opacity: 1;}
	50% {opacity: 0.7;}
	100% {opacity: 1;}
}

.X:after {
	background-color: $red-color;
	width: 45px;
	height: 45px;
}

.O:after {
	background-color: $blue-color;
	width: 45px;
	height: 45px;
}

table.X {
	background-color: lighten($red-color, 17);
	border-radius: 5px;
}

table.O {
	background-color: lighten($blue-color, 17);
	border-radius: 5px;
}

#ultimate tr > td:nth-child(2) {
	border-left: 3px solid #555;
	border-right: 3px solid #555;
}

#ultimate tr:nth-child(2) > td {
	border-top: 3px solid #555;
	border-bottom: 3px solid #555;
}

#ultimate table td:nth-child(2) {
	border-left-width: 1px;
	border-right-width: 1px;
}

#ultimate table tr:nth-child(2) > td {
	border-top-width: 1px;
	border-bottom-width: 1px;
}

@media(max-width: 568px) {
	#ultimate table {
		margin: 5px;

		td {
			height: 25px;
			width: 25px;
		}
	}

	.possible:after {
		width: 20px;
		height: 20px;
	}

	.X:after {
		width: 20px;
		height: 20px;
	}

	.O:after {
		width: 20px;
		height: 20px;
	}
}
</style>