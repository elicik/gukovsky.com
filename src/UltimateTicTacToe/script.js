import Vue from "vue";
import VueRouter from "vue-router";
// import * as firebase from "firebase/app";
import { firestorePlugin } from "vuefire";
import App from "./App.vue";

Vue.use(firestorePlugin)
Vue.use(VueRouter);

let router = new VueRouter({
	routes: [],
	mode: "history",
});

document.addEventListener("DOMContentLoaded", function(event) {
	new Vue({
		router: router,
		el: "#app",
		render: h => h(App),
	})
});