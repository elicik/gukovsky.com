import { Scene, PerspectiveCamera, SpotLight, AmbientLight, MeshPhongMaterial, Mesh, BoxGeometry, Object3D, WebGLRenderer } from "three";

// SCENE
const scene = new Scene();

// CAMERA
const camera = new PerspectiveCamera(45, 2, 0.1, 100);
camera.position.set(6, 6, 6);
camera.rotation.x = -Math.PI / 4;
camera.rotation.y = Math.PI / 5;
camera.rotation.z = Math.PI / 6;

// LIGHTS
const lights = []
for (let i = 0; i < 6; i++) {
	lights[i] = new SpotLight(0xFFFFFF);
	lights[i].castShadow = true;
	lights[i].position.setComponent(i % 3, 4 * (i > 2 ? -1 : 1));
	lights[i].intensity = 1.5;
	lights[i].exponent = 3;
	scene.add(lights[i]);
}
const ambientLight = new AmbientLight(0x333333);
scene.add(ambientLight);

// CUBE COLORS
const cubeColors = [];
// x+,x-,y+,y-,z+,z-
cubeColors.push(new MeshPhongMaterial({ color: 0xFF0000})); // red
cubeColors.push(new MeshPhongMaterial({ color: 0xFF6600})); // orange
cubeColors.push(new MeshPhongMaterial({ color: 0xFFFFFF})); // white
cubeColors.push(new MeshPhongMaterial({ color: 0xFFFF00})); // yellow
cubeColors.push(new MeshPhongMaterial({ color: 0x006600})); // green
cubeColors.push(new MeshPhongMaterial({ color: 0x0000FF})); // blue
cubeColors.push(new MeshPhongMaterial({ color: 0x000000})); // black

// CUBES
let cubes = [];
for (let x = 0; x < 3; x++) {
	for (let y = 0; y < 3; y++) {
		for (let z = 0; z < 3; z++) {
			let cube = cubes[9*x + 3*y + z];
			let cubeMaterialArray = [];
			// x+,x-,y+,y-,z+,z-
			// Make everything not on the outside black
			switch (x) {
				case 0:
					cubeMaterialArray.push(cubeColors[6]);
					cubeMaterialArray.push(cubeColors[1]);
					break;
				case 1:
					cubeMaterialArray.push(cubeColors[6]);
					cubeMaterialArray.push(cubeColors[6]);
					break;
				case 2:
					cubeMaterialArray.push(cubeColors[0]);
					cubeMaterialArray.push(cubeColors[6]);
					break;
			}
			switch (y) {
				case 0:
					cubeMaterialArray.push(cubeColors[6]);
					cubeMaterialArray.push(cubeColors[3]);
					break;
				case 1:
					cubeMaterialArray.push(cubeColors[6]);
					cubeMaterialArray.push(cubeColors[6]);
					break;
				case 2:
					cubeMaterialArray.push(cubeColors[2]);
					cubeMaterialArray.push(cubeColors[6]);
					break;
			}
			switch (z) {
				case 0:
					cubeMaterialArray.push(cubeColors[6]);
					cubeMaterialArray.push(cubeColors[5]);
					break;
				case 1:
					cubeMaterialArray.push(cubeColors[6]);
					cubeMaterialArray.push(cubeColors[6]);
					break;
				case 2:
					cubeMaterialArray.push(cubeColors[4]);
					cubeMaterialArray.push(cubeColors[6]);
					break;
			}
			cubes[9*x + 3*y + z] = new Mesh(new BoxGeometry(0.9, 0.9, 0.9, 15, 15, 15), cubeMaterialArray);
			cubes[9*x + 3*y + z].position.x = x - 1;
			cubes[9*x + 3*y + z].position.y = y - 1;
			cubes[9*x + 3*y + z].position.z = z - 1;
			scene.add(cubes[9*x + 3*y + z]);
		}
	}
}

// ROTATIONS

let activeRotations = 0;
let angle = 0;
let speed = Math.PI / 16; // angle per frame
let side = new Object3D();
let zComponent;
let zPosition;
let rotationMultiplier; // used for direction of turn

// Five rotate functions
// Use rotate()

function rotateSide() {
	angle += speed;
	let rotationArray = side.rotation.toArray();
	rotationArray[zComponent] += speed * rotationMultiplier;
	side.rotation.fromArray(rotationArray);
}

function rotateReset() {
	angle = 0;
	for (let i = side.children.length - 1; i >= 0; i--) {
		scene.attach(side.children[i]);
	}
	scene.remove(side);
	// Round to say screw you to floating points
	for (let i = 0; i < cubes.length; i++) {
		cubes[i].position.x = Math.round(cubes[i].position.x);
		cubes[i].position.y = Math.round(cubes[i].position.y);
		cubes[i].position.z = Math.round(cubes[i].position.z);
		cubes[i].rotation.x = Math.round(cubes[i].rotation.x / Math.PI * 2) * Math.PI / 2;
		cubes[i].rotation.y = Math.round(cubes[i].rotation.y / Math.PI * 2) * Math.PI / 2;
		cubes[i].rotation.z = Math.round(cubes[i].rotation.z / Math.PI * 2) * Math.PI / 2;
	}
	activeRotations = 0;
}
function rotate(sideLetter, prime) {
	activeRotations++;
	if (activeRotations > 1) {
		return;
	}
	switch (sideLetter) {
		case "L":
			zComponent = 0;
			zPosition = -1;
			rotationMultiplier = 1;
			break;
		case "R":
			zComponent = 0;
			zPosition = 1;
			rotationMultiplier = -1;
			break;
		case "U":
			zComponent = 1;
			zPosition = 1;
			rotationMultiplier = -1;
			break;
		case "D":
			zComponent = 1;
			zPosition = -1;
			rotationMultiplier = 1;
			break;
		case "F":
			zComponent = 2;
			zPosition = 1;
			rotationMultiplier = -1;
			break;
		case "B":
			zComponent = 2;
			zPosition = -1;
			rotationMultiplier = 1;
			break;
		case "M":
			zComponent = 0;
			zPosition = 0;
			rotationMultiplier = 1;
			break;
		case "E":
			zComponent = 1;
			zPosition = 0;
			rotationMultiplier = 1;
			break;
		case "S":
			zComponent = 2;
			zPosition = 0;
			rotationMultiplier = -1;
			break;
		// axis rotations
		case "x":
			zComponent = 0;
			zPosition = null;
			rotationMultiplier = -1;
			break;
		case "y":
			zComponent = 1;
			zPosition = null;
			rotationMultiplier = -1;
			break;
		case "z":
			zComponent = 2;
			zPosition = null;
			rotationMultiplier = -1;
			break;
	}
	if (prime) {
		rotationMultiplier *= -1;
	}
	side = new Object3D();
	side.rotation.set(0, 0, 0);
	for (let i = 0; i < cubes.length; i++) {
		if (zPosition == null || cubes[i].position.getComponent(zComponent) == zPosition) {
			side.attach(cubes[i]);
		}
	}
	scene.add(side);
	rotateAnimationFrame();
}
function rotateAnimationFrame() {
	if (angle < Math.PI / 2) {
		rotateSide();
		requestAnimationFrame(rotateAnimationFrame);
	}
	else {
		rotateReset();
	}
}


// RENDERER
let renderer = new WebGLRenderer({ alpha : true, antialias: true });

// RENDER
function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

document.addEventListener("DOMContentLoaded", function(event) {
	// EVENT LISTENERS
	window.addEventListener("resize", function(event) {
		renderer.setSize(document.getElementById("rubikscube").offsetWidth, Math.floor(document.getElementById("rubikscube").offsetWidth / 2));
	});

	for (let button of document.querySelectorAll("#buttons button")) {
		button.addEventListener("click", function(event) {
			rotate(event.target.dataset.side, (event.target.dataset.prime === ""));
		});
	}

	renderer.setSize(document.getElementById("rubikscube").offsetWidth, Math.floor(document.getElementById("rubikscube").offsetWidth / 2));
	document.getElementById("rubikscube").appendChild(renderer.domElement);
	render();
});