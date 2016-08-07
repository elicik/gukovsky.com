"use strict";

var key = [];
var guesses = 0;

function win() {
	alert("You won! It took " + guesses + " guesses");
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
		key[i] = blocks[i].dataset.color;
	}
	setGuessMode();
}

function submitGuess() {
	guesses++;
	document.querySelector("#history-header").innerHTML = "History";

	var guess = [];
	var blocks = document.querySelectorAll("#guess > .color-selector > .preview");
	for (var i = 0; i < 4; i++) {
		guess[i] = blocks[i].dataset.color;
	}

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
	console.log(appendedString);
	var div = document.createElement('div');
	div.innerHTML = appendedString;
	document.querySelector("#history").insertBefore(div, document.querySelector("#history").firstChild);

	if (result.right === 4) {	
		win();
	}

}

function colorSelectorPreviewClick(event) {
	// Toggle dropdown
	var dropdown = event.target.parentElement.children[0];
	dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
}

function colorSelectorOptionClick(event) {
	// Set preview color
	var preview = event.target.parentElement.parentElement.children[1]
	preview.dataset.color = event.target.dataset.color;
	// Hide dropdown
	var dropdown = event.target.parentElement;
	dropdown.style.display = "none";	
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
});