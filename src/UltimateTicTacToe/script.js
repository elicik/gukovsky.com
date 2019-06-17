import Vue from "vue";
import App from "./App.vue";

document.addEventListener("DOMContentLoaded", function(event) {
	new Vue({
		el: "#app",
		render: h => h(App),
	})
});