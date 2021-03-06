import * as firebase from "firebase/app";
import "firebase/firestore";

let firebaseConfig = {
	projectId: "ultimatetictactoe-6e5c3",
};
export const db = firebase.initializeApp(firebaseConfig).firestore();