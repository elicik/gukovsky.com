"use strict";

function generateXML() {
	var file = document.querySelector("#file-picker").files[0];
	var reader = new FileReader();
	reader.addEventListener("loadend", function(event) {
		var text = event.target.result;
		var parser = new DOMParser();
		generateDecklist(parser.parseFromString(text, "text/xml"));
	});
	reader.readAsText(file);
}
function generateDecklist(cardXML) {
	var cards = cardXML.querySelectorAll("Cards");
	var deck = {};
	var sideboard = {};
	var xhrCounter = cards.length;
	for (var i = 0; i < cards.length; i++) {
		var name = cards[i].attributes["Name"].nodeValue;
		var cardInSideboard = cards[i].attributes["Sideboard"].nodeValue === "true";

		var xhr = new XMLHttpRequest();

		// ugly way to handle sideboard, don't know a better way
		if (!cardInSideboard) {
			deck[name] = {
				"name": name,
				"quantity": parseInt(cards[i].attributes["Quantity"].nodeValue)
			};
			xhr.onload = function(event) {
				var card = JSON.parse(event.target.response)[0];
				xhrCounter--;
				deck[card["name"]]["manaCost"] = card["cost"];
				if (xhrCounter === 0) {
					generateVisuals(deck, sideboard);
				}
			};
		}
		else {
			sideboard[name] = {
				"name": name,
				"quantity": parseInt(cards[i].attributes["Quantity"].nodeValue)
			};
			xhr.onload = function(event) {
				var card = JSON.parse(event.target.response)[0];
				xhrCounter--;
				sideboard[card["name"]]["manaCost"] = card["cost"];
				if (xhrCounter === 0) {
					generateVisuals(deck, sideboard);
				}
			};
		}
		xhr.open("GET", "https://api.deckbrew.com/mtg/cards?name=" + name);
		xhr.send();
	}
}

function generateVisuals(deck, sideboard) {
	console.log(deck);
	console.log(sideboard);
}

document.addEventListener("DOMContentLoaded", function(event) {
	document.querySelector("#file-picker").addEventListener("change", generateXML);
});
