"use strict";

document.addEventListener("DOMContentLoaded", function() {
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDdHC1oEV0LXuLJQGfuNQSUF1mu7KiJmEE",
		authDomain: "cdc-counter.firebaseapp.com",
		databaseURL: "https://cdc-counter.firebaseio.com",
		projectId: "cdc-counter",
		storageBucket: "",
		messagingSenderId: "451747626780"
	};
	firebase.initializeApp(config);
	// firebase.database().ref("people").set(11);
	var counter = firebase.database().ref("cdc-counter");
	counter.on("value", function(snapshot) {
		document.querySelector("#amount").innerHTML = snapshot.val();
	});
	document.querySelector("#add").addEventListener("click", function() {
		counter.once("value").then(function(snapshot) {
			var value = snapshot.val();
			if (value >= 7) {
				swal("There's too many people in the CDC! Get out!");
				counter.set(7);
			}
			else {
				counter.set(value + 1);
			}
		});
	});
	document.querySelector("#subtract").addEventListener("click", function() {
		counter.once("value").then(function(snapshot) {
			var value = snapshot.val();
			if (value <= 0) {
				swal("That doesn't seem right");
				counter.set(0);
			}
			else {
				counter.set(value - 1);
			}
		});
	});
});