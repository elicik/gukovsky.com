import swal from "sweetalert";
import { db } from "./db";

let state = {
	id: "",
	game: {
		grid: JSON.stringify(blank_grid("")),
		last_move: [],
		turn: "X",
	},
	player: "X",
};

function blank_grid(default_value) {
	return new Array(3).fill().map(() => new Array(3).fill().map(() => new Array(3).fill().map(() => new Array(3).fill(default_value))));
};

function compute_grid() {
	return JSON.parse(state.game.grid);
}
function compute_big_grid() {
	let result = [["","",""],["","",""],["","",""]];
	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			for (let player of ["X", "O"]) {
				for (let i = 0; i < 3; i++) {
					// Horizontal
					if (state.grid[row][col][i].every(x => x === player)) {
						result[row][col] = player;
					}
					// Vertical
					if ([state.grid[row][col][0][i], state.grid[row][col][1][i], state.grid[row][col][2][i]].every(x => x === player)) {
						result[row][col] = player;
					}
				}
				// Diagonals
				if ([state.grid[row][col][0][0], state.grid[row][col][1][1], state.grid[row][col][2][2]].every(x => x === player)) {
					result[row][col] = player;
				}
				if ([state.grid[row][col][0][2], state.grid[row][col][1][1], state.grid[row][col][2][0]].every(x => x === player)) {
					result[row][col] = player;
				}
			}
		}
	}
	return result;
}
function compute_possible() {
	if (state.game.last_move.length === 0) {
		return blank_grid(true);
	}
	if (state.big_grid[state.game.last_move[2]][state.game.last_move[3]] !== "") {
		return state.grid.map((row, row_num) =>
			row.map((col, col_num) => {
				if (state.big_grid[row_num][col_num] !== "") {
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
		let result = blank_grid(false);
		let row = state.game.last_move[2];
		let col = state.game.last_move[3];
		result[row][col] = state.grid[row][col].map(function(i) {
			return i.map(function(j) {
				return j === "";
			});
		});
		return result;
	}
}
function compute_winner() {
	for (let player of ["X", "O"]) {
		for (let i = 0; i < 3; i++) {
			// Horizontal
			if (state.big_grid[i].every(x => x === player)) {
				return player;
			}
			// Vertical
			if ([state.big_grid[0][i], state.big_grid[1][i], state.big_grid[2][i]].every(x => x === player)) {
				return player;
			}
		}
		// Diagonals
		if ([state.big_grid[0][0], state.big_grid[1][1], state.big_grid[2][2]].every(x => x === player)) {
			return player;
		}
		if ([state.big_grid[0][2], state.big_grid[1][1], state.big_grid[2][0]].every(x => x === player)) {
			return player;
		}
	}
	return false;
}
function compute_tie() {
	// Assuming winner() is false
	return !state.winner && !state.big_grid.flat().some(x => x === "");
}

function reset() {
	state.game.grid = JSON.stringify(blank_grid("")),
	state.game.last_move = [];
	state.game.turn = "X";
	db.collection("games").doc(state.id).update(state.game)
	update();
}

function play(row, col, i, j) {
	if (!state.possible[row][col][i][j] || state.player !== state.game.turn) {
		return;
	}
	let grid = JSON.parse(state.game.grid);
	grid[row][col][i][j] = state.game.turn;
	state.game.grid = JSON.stringify(grid);
	state.game.last_move = [row, col, i, j];
	state.game.turn = state.game.turn === "O" ? "X" : "O";
	db.collection("games").doc(state.id).update(state.game);
	update();
}

function calculateChanges() {
	state.grid = compute_grid();
	state.big_grid = compute_big_grid();
	state.possible = compute_possible();
	state.winner = compute_winner();
	state.tie = compute_tie();
}

function createHTML() {
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

function updateHTML() {
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
					if (state.possible[row][col][i][j]) {
						className = "possible";
					}
					state.htmlGrid[row][col][i][j].className = className;
				}
			}
		}
	}
}

function initialize() {
	createHTML();

	let params = (new URL(document.location)).searchParams;
	if (params.has("id") && params.has("player")) {
		state.id = params.get("id");
		state.player = params.get("player");
		update();
		db.collection("games").doc(state.id).onSnapshot((docRef) => {
			Object.assign(state.game, docRef.data());
			update();
		});
	}
	else {
		db.collection("games").add({
			grid: JSON.stringify(blank_grid("")),
			last_move: [],
			turn: "X",
		})
		.then((docRef) => {
			params.append("id", docRef.id);
			params.append("player", "X");
			state.id = docRef.id;
			window.history.replaceState({}, '', `${location.pathname}?${params}`);
		})
		.then(() => {
			let url = window.location.href.replace("player=X", "player=O");
			return navigator.clipboard.writeText(url);
		})
		.then(() => {
			return swal({
				title: "URL saved to your clipboard",
				text: "Share it with your friend!",
				icon: "info",
			});
		})
		.then(() => {
			db.collection("games").doc(state.id).onSnapshot((docRef) => {
				Object.assign(state.game, docRef.data());
				update();
			});
		});
	}
}

function update() {
	calculateChanges();
	if (state.game.grid === JSON.stringify(blank_grid("")) && swal.getState().isOpen) {
		swal.close();
	}
	if (state.winner) {
		swal({
			title: "Game over!",
			text: state.winner === state.player ? "You won! Congrats!" : "You lost. Better luck next time!",
			icon: state.winner === state.player ? "success" : "error",
			buttons: {
				confirm: "Play again"
			}
		}).then(reset);
	}
	else if(state.tie) {
		swal({
			title: "Game over!",
			text: "There was a tie!",
			icon: "info",
			buttons: {
				confirm: "Play again"
			}
		}).then(reset);
	}
	updateHTML();
}

document.addEventListener("DOMContentLoaded", function(event) {
	initialize();
});