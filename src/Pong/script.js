import { Container, Graphics, Text, Application } from "pixi.js";

// EVENT LISTENERS
let keys = {
    w: false,
    s: false,
    up: false,
    down: false,
    paddle1: false,
    paddle2: false,
};
window.addEventListener("keydown", function (e) {
    switch (e.keyCode) {
        case 87:
            keys.w = true;
            e.preventDefault();
            break;
        case 83:
            keys.s = true;
            e.preventDefault();
            break;
        case 38:
            keys.up = true;
            e.preventDefault();
            break;
        case 40:
            keys.down = true;
            e.preventDefault();
            break;
    }
});

window.addEventListener("keyup", function (e) {
    switch (e.keyCode) {
        case 87:
            keys.w = false;
            e.preventDefault();
            break;
        case 83:
            keys.s = false;
            e.preventDefault();
            break;
        case 38:
            keys.up = false;
            e.preventDefault();
            break;
        case 40:
            keys.down = false;
            e.preventDefault();
            break;
    }
});

// INTERSECTIONS
function paddleIntersects(paddle) {
    return !(
        ball.x - radius() > paddle.x + paddleWidth() ||
        paddle.x > ball.x + radius() ||
        ball.y - radius() > paddle.y + paddleHeight() ||
        paddle.y > ball.y + radius()
    );
}

// CONTAINER
let container = new Container();

let width = 160;
let height = 90;

// PADDLES
let border = function () {
    // return Math.round(width / 80);
    return 0;
};
let paddleWidth = function () {
    return Math.round(width / 80);
};
let paddleHeight = function () {
    return Math.round(height / 5);
};
let paddleSpeed = function () {
    return paddleHeight() / 8;
};
let paddle1 = new Graphics();
paddle1.rect(0, 0, paddleWidth(), paddleHeight());
paddle1.fill("black");
paddle1.position.y = height / 2 - paddleHeight() / 2;

let paddle2 = new Graphics();
paddle2.rect(0, 0, paddleWidth(), paddleHeight());
paddle2.fill("black");
paddle2.position.y = height / 2 - paddleHeight() / 2;

container.addChild(paddle1);
container.addChild(paddle2);

function snapPaddles() {
    paddle1.position.y = Math.min(
        height - border() - paddleHeight(),
        Math.max(border(), paddle1.position.y),
    );
    paddle2.position.y = Math.min(
        height - border() - paddleHeight(),
        Math.max(border(), paddle2.position.y),
    );
}

// INTERACTIVE
paddle1.interactive = true;
paddle2.interactive = true;
paddle1.buttonMode = true;
paddle2.buttonMode = true;

paddle1
    .on("mousedown", onDragStart)
    .on("touchstart", onDragStart)
    .on("mouseup", onDragEnd)
    .on("mouseupoutside", onDragEnd)
    .on("touchend", onDragEnd)
    .on("touchendoutside", onDragEnd)
    .on("mousemove", onDragMove)
    .on("touchmove", onDragMove);
paddle2
    .on("mousedown", onDragStart)
    .on("touchstart", onDragStart)
    .on("mouseup", onDragEnd)
    .on("mouseupoutside", onDragEnd)
    .on("touchend", onDragEnd)
    .on("touchendoutside", onDragEnd)
    .on("mousemove", onDragMove)
    .on("touchmove", onDragMove);

function onDragStart(event) {
    if (this === paddle1) {
        keys.paddle1 = true;
    } else if (this === paddle2) {
        keys.paddle2 = true;
    }
    this.data = event.data;
    this.dragging = true;
    this.sy = this.data.getLocalPosition(this).y;
}
function onDragEnd(event) {
    if (this === paddle1) {
        keys.paddle1 = false;
    } else if (this === paddle2) {
        keys.paddle2 = false;
    }
    this.dragging = false;
    this.data = null;
}
function onDragMove(event) {
    if (this.dragging) {
        let newPosition = this.data.getLocalPosition(this.parent);
        if (
            newPosition.y - this.sy > border() &&
            newPosition.y - this.sy < height - border() - paddleHeight()
        ) {
            this.position.y = newPosition.y - this.sy;
        }
    }
}

// DIRECTION TEXT
let directionText = new Text({ text: " ->", fill: "black" });
container.addChild(directionText);

// SCORE
let score1 = 0;
let score2 = 0;
let score1text = new Text({ text: "0", fill: "black" });
let score2text = new Text({ text: "0", fill: "black" });
container.addChild(score1text);
container.addChild(score2text);

// BALL
let hits;
let wait;
let maxAngle = Math.PI / 4;
let radius = function () {
    return Math.round(Math.min(height, width) / 80);
};
let ballVelocity = radius();
let ballVelocityX;
let ballVelocityY;

let ball = new Graphics();
ball.circle(0, 0, radius());
ball.fill("black");
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
    if (winner === 1 && (keys.w || keys.s || keys.paddle1)) {
        ballVelocityX *= -1;
        wait = false;
        directionText.text = "";
    } else if (winner === 2 && (keys.up || keys.down || keys.paddle2)) {
        wait = false;
        directionText.text = "";
    } else {
        setTimeout(waitForBall, 1, winner);
    }
}

// RENDER
let app = new Application();
app.stage.addChild(container);

function render() {
    // Move paddles
    if (keys.w && paddle1.position.y > border()) {
        paddle1.position.y -= paddleSpeed();
    }
    if (keys.s && paddle1.position.y < height - border() - paddleHeight()) {
        paddle1.position.y += paddleSpeed();
    }
    if (keys.up && paddle2.position.y > border()) {
        paddle2.position.y -= paddleSpeed();
    }
    if (keys.down && paddle2.position.y < height - border() - paddleHeight()) {
        paddle2.position.y += paddleSpeed();
    }
    snapPaddles();
    // Paddle/ball collision
    if (paddleIntersects(paddle1)) {
        let bounceAngle =
            ((paddle1.position.y + paddleHeight() / 2 - ball.position.y) *
                maxAngle) /
            (paddleHeight() / 2);
        ballVelocityX = ballVelocity * Math.cos(bounceAngle);
        ballVelocityY = ballVelocity * -Math.sin(bounceAngle);
        hits++;
    }
    if (paddleIntersects(paddle2)) {
        let bounceAngle =
            ((paddle2.position.y + paddleHeight() / 2 - ball.position.y) *
                maxAngle) /
            (paddleHeight() / 2);
        ballVelocityX = ballVelocity * -Math.cos(bounceAngle);
        ballVelocityY = ballVelocity * -Math.sin(bounceAngle);
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
    } else if (ball.position.x >= width) {
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
}

// RESIZE
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    let bodyComputedStyle = window.getComputedStyle(document.body, null);
    width -= parseInt(bodyComputedStyle.getPropertyValue("padding-left"), 10);
    width -= parseInt(bodyComputedStyle.getPropertyValue("padding-right"), 10);
    height -= parseInt(bodyComputedStyle.getPropertyValue("padding-top"), 10);
    height -= parseInt(
        bodyComputedStyle.getPropertyValue("padding-bottom"),
        10,
    );

    paddle1.height = paddleHeight();
    paddle1.width = paddleWidth();

    paddle2.height = paddleHeight();
    paddle2.width = paddleWidth();

    paddle1.position.x = border();
    paddle2.position.x = width - border() - paddleWidth();
    snapPaddles();

    ball.height = 2 * radius();
    ball.width = 2 * radius();

    score1text.position.x = width / 4 - score1text.width / 2;
    score2text.position.x = (width * 3) / 4 - score2text.width / 2;
    directionText.position.x = width / 2 - directionText.width / 2;
}

waitForBall(2);

let initialLoad = true;
document.addEventListener("astro:page-load", async function (event) {
    if (event.target.title === "Pong") {
        if (initialLoad) {
            await app.init({
                resizeTo: window,
                backgroundAlpha: 0,
            });

            initialLoad = false;
        }

        document.body.insertBefore(app.canvas, document.body.firstChild);
        window.addEventListener("resize", resize);
        resize();
        app.ticker.add((time) => render());
    }
});
