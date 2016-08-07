var key = [];

function changeColor(block) {
	block.dataset.color = block.dataset.color % 6 + 1;
}

function checkMastermind(key, guess) {
	var keyCopy = key.slice(0);
	var guessCopy = guess.slice(0);
	var right = 0;
	var wrong = 0;
	for (var i = 0; i < 4; i++) {
		if (keyCopy[i] === guessCopy[i]) {
			right++;
			keyCopy[i] = 0;
			guessCopy[i] = 0;
		}
	}
	n = 6; // n goes from 6 to 1
	while (n > 0) {
		var keyIndex = keyCopy.indexOf(n);
		var guessIndex = guessCopy.indexOf(n);
		if (keyIndex != -1 && guessIndex != -1) {
			wrong++;
			keyCopy[keyIndex] = 0;
			guessCopy[guessIndex] = 0;
		}
		else {
			n--;
		}
	}
	return [right, wrong];
}

function startGame() {
	console.log("startGame");
	document.getElementById("history").innerHTML = "";
	document.getElementById("set-key-dialog").open();
	var blocks = document.querySelectorAll("#key .square, #guess .square");
	for (var i = 0; i < blocks.length; i++) {
		blocks[i].dataset.color = 1;
	}
}

function submitKey() {
	console.log("submitKey");
	var blocks = document.querySelectorAll("#key .square");
	for (var i = 0; i < 4; i++) {
		key[i] = parseInt(blocks[i].dataset.color, 10);
	}
}

function submitGuess() {
	var guess = [];
	var blocks = document.querySelectorAll("#guess .square");
	for (var i = 0; i < 4; i++) {
		guess[i] = parseInt(blocks[i].dataset.color, 10);
	}

	var rightAndWrong = checkMastermind(key, guess);

	var appendedString = '<div class="row layout horizontal">';
	for (var i = 0; i < 4; i++) {
		appendedString += '<div class="square" data-color="' + guess[i] + '"></div>';
	}
	appendedString += '<div class="square layout horizontal wrap">';
	for (var i = 0; i < rightAndWrong[0]; i++) {
		appendedString += '<div class="minisquare square-right"></div>';
	}
	for (var i = 0; i < rightAndWrong[1]; i++) {
		appendedString += '<div class="minisquare square-wrong"></div>';
	}
	appendedString += '</div></div>';
	document.getElementById("history").innerHTML = appendedString + document.getElementById("history").innerHTML;

	if (rightAndWrong[0] == 4) {	
		document.getElementById("winner-dialog").open();
	}

}

document.addEventListener("DOMContentReady", function() {
	for (var colorSelector of document.querySelectorAll(".color-selector > select")) {
		colorSelector.addEventListener("change", function(e) {
			console.log(e);
		})
	}
	startGame();
});