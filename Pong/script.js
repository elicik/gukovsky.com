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
		(ball.x - radius) > (paddle.x + paddleWidth) || 
		(paddle.x) > (ball.x + radius) || 
		(ball.y - radius) > (paddle.y + paddleHeight) ||
		(paddle.y) > (ball.y + radius)
	);
}

// STAGE
var stage = new PIXI.Stage(0x000000);

// RENDERER
var renderOptions = {
	resolution: 1
}
var width = 160;
var height = 90;
renderOptions.resolution = Math.floor(document.querySelector("#pong").offsetWidth / width);
var renderer = PIXI.autoDetectRenderer(width, height, renderOptions);
document.querySelector("#pong").appendChild(renderer.view);

// PADDLES
var border = 2;
var paddleWidth = 2;
var paddleHeight = 16;
var paddleSpeed = 2.5;
var paddle1 = new PIXI.Graphics();
paddle1.beginFill(0xFFFFFF);
paddle1.drawRect(0, 0, paddleWidth, paddleHeight);
paddle1.endFill();
paddle1.position.x = border;
paddle1.position.y = height / 2 - paddleHeight / 2;

var paddle2 = new PIXI.Graphics();
paddle2.beginFill(0xFFFFFF);
paddle2.drawRect(0, 0, paddleWidth, paddleHeight);
paddle2.endFill();
paddle2.position.x = width - border - paddleWidth;
paddle2.position.y = height / 2 - paddleHeight / 2;

stage.addChild(paddle1);
stage.addChild(paddle2);

// INTERACTIVE
paddle1.interactive = true;
paddle2.interactive = true;
paddle1.buttonMode = true;
paddle2.buttonMode = true;
// use the mousedown and touchstart
paddle1.mousedown = paddle1.touchstart = paddle2.mousedown = paddle2.touchstart = function(data) {
	this.data = data;
	this.dragging = true;
	this.sy = this.data.getLocalPosition(this).y;
};

// set the events for when the mouse is released or a touch is released
paddle1.mouseup = paddle1.mouseupoutside = paddle1.touchend = paddle1.touchendoutside = paddle2.mouseup = paddle2.mouseupoutside = paddle2.touchend = paddle2.touchendoutside = function(data)
{
	this.dragging = false;
	// set the interaction data to null
	this.data = null;
};

// set the callbacks for when the mouse or a touch moves
paddle1.mousemove = paddle1.touchmove = paddle2.mousemove = paddle2.touchmove = function(data) {
	if(this.dragging) {
		var newPosition = this.data.getLocalPosition(this.parent);
		if (newPosition.y - this.sy > border && newPosition.y - this.sy < height - border - paddleHeight) {
			this.position.y = newPosition.y - this.sy;
		}
	}
}

// DIRECTION TEXT
var directionText = new PIXI.Text(" ->", {font:"5px Monospace", fill:"white"});
directionText.position.x = width/2 - 1.25;
stage.addChild(directionText);

// SCORE
var score1 = 0;
var score2 = 0;
var score1text = new PIXI.Text("0", {font:"5px Monospace", fill:"white"});
var score2text = new PIXI.Text("0", {font:"5px Monospace", fill:"white"});
score1text.position.x = width / 4;
score2text.position.x = width * 3 / 4 - 2.5;
stage.addChild(score1text);
stage.addChild(score2text);

// BALL
var hits;
var wait;
var maxAngle = Math.PI / 4;
var radius = 1;
var ballVelocity = 1;
var ballVelocityX;
var ballVelocityY;

var ball = new PIXI.Graphics();
ball.beginFill(0xFFFFFF);
ball.drawCircle(0, 0, radius);
ball.endFill();
stage.addChild(ball);


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
		directionText.setText("");
	}
	else if (winner === 2 && (keys[38] || keys[40])) {
		wait = false;
		directionText.setText("");
	}
	else {
		setTimeout(waitForBall, 1, winner);
	}
}


// RENDER
function render() {
	// Move paddles
	if (keys[87] && paddle1.position.y > border) { // W
		paddle1.position.y -= paddleSpeed;
	}
	if (keys[83] && paddle1.position.y < height - border - paddleHeight) { // S
		paddle1.position.y += paddleSpeed;
	}
	if (keys[38] && paddle2.position.y > border) { // Up
		paddle2.position.y -= paddleSpeed;
	}
	if (keys[40] && paddle2.position.y < height - border - paddleHeight) { // Down
		paddle2.position.y += paddleSpeed;
	}
	// Paddle/ball collision
	if (paddleIntersects(paddle1)) {
		var bounceAngle = (paddle1.position.y + (paddleHeight / 2) - ball.position.y) * maxAngle / (paddleHeight / 2);
		ballVelocityX = ballVelocity*Math.cos(bounceAngle);
		ballVelocityY = ballVelocity*-Math.sin(bounceAngle);
		hits++;
	}
	if (paddleIntersects(paddle2)) {
		var bounceAngle = (paddle2.position.y + (paddleHeight / 2) - ball.position.y) * maxAngle / (paddleHeight / 2);
		ballVelocityX = ballVelocity*-Math.cos(bounceAngle);
		ballVelocityY = ballVelocity*-Math.sin(bounceAngle);
		hits++;
	}
	// Wall/ball collision
	if (ball.position.y <= border || ball.position.y >= height - border) {
		ballVelocityY *= -1;
	}
	// Score collision
	if (ball.position.x <= 0) {
		score2++;
		score2text.setText(score2);
		directionText.setText(" ->");
		waitForBall(2);
	}
	else if (ball.position.x >= width) {
		score1++;
		score1text.setText(score1);
		directionText.setText("<- ");
		waitForBall(1);
	}
	ballVelocity = 1 + hits / 10;
	// Move ball
	if (!wait) {
		ball.position.x += ballVelocityX;
		ball.position.y += ballVelocityY;
	}
	renderer.render(stage);
	requestAnimationFrame(render);
}

waitForBall(2);
render();