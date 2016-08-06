// SCENE
var scene = new THREE.Scene();

// CAMERA
var camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
camera.position.set(6, 6, 6);
camera.rotation.x = -Math.PI / 4;
camera.rotation.y = Math.PI / 5;
camera.rotation.z = Math.PI / 6;

// LIGHTS
var lights = []
for (var i = 0; i < 6; i++) {
	lights[i] = new THREE.SpotLight(0xFFFFFF);
	lights[i].castShadow = true;
	lights[i].position.setComponent(i % 3, 4 * (i > 2 ? -1 : 1));
	lights[i].intensity = 1.5;
	lights[i].exponent = 3;
	scene.add(lights[i]);
}
var ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// CUBE COLORS
var cubeColors = [];
// x+,x-,y+,y-,z+,z-
cubeColors.push(new THREE.MeshPhongMaterial({ color: 0xFF0000})); // red
cubeColors.push(new THREE.MeshPhongMaterial({ color: 0xFF6600})); // orange
cubeColors.push(new THREE.MeshPhongMaterial({ color: 0xFFFFFF})); // white
cubeColors.push(new THREE.MeshPhongMaterial({ color: 0xFFFF00})); // yellow
cubeColors.push(new THREE.MeshPhongMaterial({ color: 0x006600})); // green
cubeColors.push(new THREE.MeshPhongMaterial({ color: 0x0000FF})); // blue
cubeColors.push(new THREE.MeshPhongMaterial({ color: 0x000000})); // black

// CUBES
var cubes = [];
for (var x = 0; x < 3; x++) {
	for (var y = 0; y < 3; y++) {
		for (var z = 0; z < 3; z++) {
			var cube = cubes[9*x + 3*y + z];
			var cubeMaterialArray = [];
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
			var material = new THREE.MeshFaceMaterial(cubeMaterialArray);
			cubes[9*x + 3*y + z] = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9, 15, 15, 15), material);
			cubes[9*x + 3*y + z].position.x = x - 1;
			cubes[9*x + 3*y + z].position.y = y - 1;
			cubes[9*x + 3*y + z].position.z = z - 1;
			scene.add(cubes[9*x + 3*y + z]);
		}
	}
}

// ROTATIONS

var activeRotations = 0;
var angle = 0;
var speed = Math.PI / 16; // angle per frame
var side = new THREE.Object3D();
var zComponent;
var zPosition;
var rotationMultiplier; // used for direction of turn

// Five rotate functions
// Use rotate()

function rotateSide() {
	angle += speed;
	var rotationArray = side.rotation.toArray();
	rotationArray[zComponent] += speed * rotationMultiplier;
	side.rotation.fromArray(rotationArray);
}

function rotateReset() {
	angle = 0;
	for (var i = side.children.length - 1; i >= 0; i--) {
		THREE.SceneUtils.detach(side.children[i], side, scene);
	}
	scene.remove(side);
	// Round to say screw you to floating points
	for (var i = 0; i < cubes.length; i++) {
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
	side = new THREE.Object3D();
	side.rotation.set(0, 0, 0);
	for (var i = 0; i < cubes.length; i++) {
		if (zPosition == null || cubes[i].position.getComponent(zComponent) == zPosition) {
			THREE.SceneUtils.attach(cubes[i], scene, side);
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
var renderer = new THREE.WebGLRenderer({ alpha : true });

// RENDER
function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

// EVENT LISTENERS
document.addEventListener("DOMContentLoaded", function(event) {
	window.addEventListener("resize", function(event) {
		renderer.setSize(document.getElementById("rubikscube").offsetWidth, Math.floor(document.getElementById("rubikscube").offsetWidth / 2));
	});

	for (var button of document.querySelectorAll("#buttons button")) {
		button.addEventListener("click", function(event) {
			rotate(event.target.dataset.side, (event.target.dataset.prime === ""));
		});
	}
	
	renderer.setSize(document.getElementById("rubikscube").offsetWidth, Math.floor(document.getElementById("rubikscube").offsetWidth / 2));
	document.getElementById("rubikscube").appendChild(renderer.domElement);
	render();
});