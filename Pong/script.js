// EVENT LISTENERS
var keys = [];
window.addEventListener("keydown", function(e) {
	keys[e.keyCode] = true;
	e.preventDefault();
});

window.addEventListener("keyup", function(e) {
	keys[e.keyCode] = false;
	e.preventDefault();
});

// INTERSECTIONS
function paddleIntersects(paddle) {
	return !(
		(ball.x - radius()) > (paddle.x + paddleWidth()) || 
		(paddle.x) > (ball.x + radius()) || 
		(ball.y - radius()) > (paddle.y + paddleHeight()) ||
		(paddle.y) > (ball.y + radius())
		);
}

// CONTAINER
var container = new PIXI.Container();

var width = 160;
var height = 90;


// PADDLES
var border = function() {
	return Math.round(width / 80);
}
var paddleWidth = function() {
	return Math.round(width / 80);
}
var paddleHeight = function() {
	return Math.round(height / 5);
}
var paddleSpeed = function() {
	return paddleHeight() / 8;
}
var paddle1 = new PIXI.Graphics();
paddle1.beginFill(0x000000);
paddle1.drawRect(0, 0, paddleWidth(), paddleHeight());
paddle1.endFill();
paddle1.position.y = height / 2 - paddleHeight() / 2;

var paddle2 = new PIXI.Graphics();
paddle2.beginFill(0x000000);
paddle2.drawRect(0, 0, paddleWidth(), paddleHeight());
paddle2.endFill();
paddle2.position.y = height / 2 - paddleHeight() / 2;

container.addChild(paddle1);
container.addChild(paddle2);

function snapPaddles() {
	paddle1.position.y = Math.min(height - border() - paddleHeight(), Math.max(border(), paddle1.position.y));
	paddle2.position.y = Math.min(height - border() - paddleHeight(), Math.max(border(), paddle2.position.y));
}

// INTERACTIVE
paddle1.interactive = true;
paddle2.interactive = true;
paddle1.buttonMode = true;
paddle2.buttonMode = true;

paddle1
	.on('mousedown', onDragStart)
	.on('touchstart', onDragStart)
	.on('mouseup', onDragEnd)
	.on('mouseupoutside', onDragEnd)
	.on('touchend', onDragEnd)
	.on('touchendoutside', onDragEnd)
	.on('mousemove', onDragMove)
	.on('touchmove', onDragMove);
paddle2
	.on('mousedown', onDragStart)
	.on('touchstart', onDragStart)
	.on('mouseup', onDragEnd)
	.on('mouseupoutside', onDragEnd)
	.on('touchend', onDragEnd)
	.on('touchendoutside', onDragEnd)
	.on('mousemove', onDragMove)
	.on('touchmove', onDragMove);

function onDragStart(event) {
	this.data = event.data;
	this.dragging = true;
	this.sy = this.data.getLocalPosition(this).y;
}
function onDragEnd() {
	this.dragging = false;
	this.data = null;
}
function onDragMove() {
	if(this.dragging) {
		var newPosition = this.data.getLocalPosition(this.parent);
		if (newPosition.y - this.sy > border() && newPosition.y - this.sy < height - border() - paddleHeight()) {
			this.position.y = newPosition.y - this.sy;
		}
	}
}

// DIRECTION TEXT
var directionText = new PIXI.Text(" ->", {fill:"black"});
container.addChild(directionText);

// SCORE
var score1 = 0;
var score2 = 0;
var score1text = new PIXI.Text("0", {fill:"black"});
var score2text = new PIXI.Text("0", {fill:"black"});
container.addChild(score1text);
container.addChild(score2text);

// BALL
var hits;
var wait;
var maxAngle = Math.PI / 4;
var radius = function() {
	return Math.round(Math.min(height, width) / 80);
};
var ballVelocity = radius();
var ballVelocityX;
var ballVelocityY;

var ball = new PIXI.Graphics();
ball.beginFill(0x000000);
ball.drawCircle(0, 0, radius());
ball.endFill();
container.addChild(ball);

function centerBall() {
	ball.position.x = width / 2;
	ball.position.y = height / 2;
	ballVelocityX = ballVelocity;
	ballVelocityY = 0;
}
function waitForBall(winner) {
	// wait until someone presses a key
	centerBall();
	hits = 0;
	wait = true;
	if (winner === 1 && (keys[87] || keys[83])) {
		ballVelocityX *= -1;
		wait = false;
		directionText.text = "";
	}
	else if (winner === 2 && (keys[38] || keys[40])) {
		wait = false;
		directionText.text = "";
	}
	else {
		setTimeout(waitForBall, 1, winner);
	}
}

// RENDER
var renderer = PIXI.autoDetectRenderer(width, height, {autoResize: true, transparent: true});
function render() {
	// Move paddles
	if (keys[87] && paddle1.position.y > border()) { // W
		paddle1.position.y -= paddleSpeed();
	}
	if (keys[83] && paddle1.position.y < height - border() - paddleHeight()) { // S
		paddle1.position.y += paddleSpeed();
	}
	if (keys[38] && paddle2.position.y > border()) { // Up
		paddle2.position.y -= paddleSpeed();
	}
	if (keys[40] && paddle2.position.y < height - border() - paddleHeight()) { // Down
		paddle2.position.y += paddleSpeed();
	}
	snapPaddles();
	// Paddle/ball collision
	if (paddleIntersects(paddle1)) {
		var bounceAngle = (paddle1.position.y + (paddleHeight() / 2) - ball.position.y) * maxAngle / (paddleHeight() / 2);
		ballVelocityX = ballVelocity*Math.cos(bounceAngle);
		ballVelocityY = ballVelocity*-Math.sin(bounceAngle);
		hits++;
	}
	if (paddleIntersects(paddle2)) {
		var bounceAngle = (paddle2.position.y + (paddleHeight() / 2) - ball.position.y) * maxAngle / (paddleHeight() / 2);
		ballVelocityX = ballVelocity*-Math.cos(bounceAngle);
		ballVelocityY = ballVelocity*-Math.sin(bounceAngle);
		hits++;
	}
	// Wall/ball collision
	if (ball.position.y <= border() || ball.position.y >= height - border()) {
		ballVelocityY *= -1;
	}
	// Score collision
	if (ball.position.x <= 0) {
		score2++;
		score2text.text = score2;
		directionText.text = "->";
		waitForBall(2);
	}
	else if (ball.position.x >= width) {
		score1++;
		score1text.text = score1;
		directionText.text = "<-";
		waitForBall(1);
	}
	ballVelocity = radius() * (1 + hits / 10);
	// Move ball
	if (!wait) {
		ball.position.x += ballVelocityX;
		ball.position.y += ballVelocityY;
	}
	renderer.render(container);
	requestAnimationFrame(render);
}

waitForBall(2);
resize();

// renderOptions.resolution = Math.floor(document.querySelector("#pong").offsetWidth / width);
document.addEventListener("DOMContentLoaded", function(event) {
	document.body.insertBefore(renderer.view, document.body.firstChild);
	render();
});

// RESIZE
function resize() {
	width = window.innerWidth;
	height = window.innerHeight;
	renderer.resize(width, height);

	paddle1.height = paddleHeight();
	paddle1.width = paddleWidth();

	paddle2.height = paddleHeight();
	paddle2.width = paddleWidth();

	paddle1.position.x = border();
	paddle2.position.x = width - border() - paddleWidth();
	snapPaddles();

	ball.height = 2 * radius();
	ball.width = 2 * radius();

	score1text.position.x = width/4 - score1text.width/2;
	score2text.position.x = width*3/4 - score2text.width/2;
	directionText.position.x = width/2 - directionText.width/2;
}
window.onresize = resize;