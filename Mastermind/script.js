"use strict";

var key = [];
var guesses = 0;

function win() {
	swal({
		title: "You won! It took " + guesses + " guesses",
		type: "success",
		allowEscapeKey: false,
		closeOnConfirm: false
	}, function() {
		selectGameType();
	});
}

function setKeyMode() {
	document.querySelector("#key-mode").style.display = "block";
	document.querySelector("#guess-mode").style.display = "none";
	document.querySelector("#mode").innerHTML = "KEY MODE";
}
function setGuessMode() {
	document.querySelector("#key-mode").style.display = "none";
	document.querySelector("#guess-mode").style.display = "block";
	document.querySelector("#mode").innerHTML = "GUESS MODE";
	document.querySelector("#history").innerHTML = "";
	document.querySelector("#history-header").innerHTML = "";
	guesses = 0;
}
function checkMastermind(guess) {
	var right = 0;
	var wrong = 0;

	var keyObject = {};
	var guessObject = {};

	for (var i = 0; i < key.length; i++) {
		if (!keyObject[key[i]]) {
			keyObject[key[i]] = 1;
		}
		else {
			keyObject[key[i]]++;
		}
	}
	for (var i = 0; i < guess.length; i++) {
		if (!guessObject[guess[i]]) {
			guessObject[guess[i]] = 1;
		}
		else {
			guessObject[guess[i]]++;
		}
	}

	for (var i in keyObject) {
		if (guessObject[i]) {
			while (keyObject[i] > 0 && guessObject[i] > 0) {
				wrong++;
				keyObject[i]--;
				guessObject[i]--;
			}
		}
	}

	for (var i = 0; i < key.length; i++) {
		if (key[i] === guess[i]) {
			right++;
			wrong--;
			keyObject[key[i]]--;
			guessObject[guess[i]]--;
		}
	}
	return {"right": right, "wrong": wrong};
}

function submitKey(event) {
	var blocks = document.querySelectorAll("#key > .color-selector > .preview");
	for (var i = 0; i < 4; i++) {
		if (blocks[i].dataset.color) {
			key[i] = blocks[i].dataset.color;
		}
		else {
			swal("Error", "Make sure every color in the key is set", "error");
			return;
		}
	}
	setGuessMode();
}

function submitGuess() {

	var guess = [];
	var blocks = document.querySelectorAll("#guess > .color-selector > .preview");
	for (var i = 0; i < 4; i++) {
		if (blocks[i].dataset.color) {
			guess[i] = blocks[i].dataset.color;
		}
		else {
			swal("Error", "Make sure every color in your guess is set", "error");
			return;
		}
	}

	guesses++;
	document.querySelector("#history-header").innerHTML = "History";
	
	var result = checkMastermind(guess);

	var appendedString = '';
	for (var i = 0; i < 4; i++) {
		appendedString += '<div class="color-selector"><div class="square" data-color="' + guess[i] + '"></div></div> ';
	}
	appendedString += '<div class="square">';
	for (var i = 0; i < result.right; i++) {
		appendedString += '<div class="minisquare right"></div>';
	}
	for (var i = 0; i < result.wrong; i++) {
		appendedString += '<div class="minisquare wrong"></div>';
	}
	appendedString += '</div>';
	var div = document.createElement('div');
	div.innerHTML = appendedString;
	document.querySelector("#history").insertBefore(div, document.querySelector("#history").firstChild);

	if (result.right === 4) {	
		win();
	}

}

function colorSelectorPreviewClick(event) {
	// Remove color
	var preview = event.target;
	delete preview.dataset.color;
	// Toggle dropdown
	var dropdown = event.target.parentElement.children[0];
	dropdown.style.display = "block";
}

function colorSelectorOptionClick(event) {
	// Set preview color
	var preview = event.target.parentElement.parentElement.children[1]
	preview.dataset.color = event.target.dataset.color;
	// Hide dropdown
	var dropdown = event.target.parentElement;
	dropdown.style.display = "none";	
}

function selectGameType() {
	swal({
		title: "Choose a game type",
		text: "You can either play against a computer, or against a friend",
		showCancelButton: true,
		confirmButtonText: "Play against a friend",
		cancelButtonText: "Play against a computer",
		allowEscapeKey: false,
		closeOnConfirm: false,
		closeOnCancel: true,
	}, function(isConfirm) {
		if (isConfirm) {
			swal({
				title: "Get ready!",
				text: "Don't let the other person look before you've submitted your key!",
				allowEscapeKey: false,
			}, setKeyMode);
		}
		else {
			// Computer opponent
			var colors = ["red", "orange", "yellow", "green", "blue", "purple"];
			for (var i = 0; i < 4; i++) {
				key[i] = colors[Math.floor(Math.random() * colors.length)];
			}
			setGuessMode();
		}
	});
}

document.addEventListener("DOMContentLoaded", function() {
	for (var colorSelectorPreview of document.querySelectorAll(".color-selector > .preview")) {
		colorSelectorPreview.addEventListener("click", colorSelectorPreviewClick);
	}
	for (var colorSelectorOption of document.querySelectorAll(".color-selector > .dropdown > div")) {
		colorSelectorOption.addEventListener("click", colorSelectorOptionClick);
	}
	document.querySelector('button[name="submitKey"]').addEventListener("click", submitKey);
	document.querySelector('button[name="submitGuess"]').addEventListener("click", submitGuess);
	selectGameType();
});