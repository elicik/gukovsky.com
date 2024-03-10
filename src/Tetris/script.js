import Swal from "sweetalert2";
import {
    Container,
    Graphics,
    Text,
    Application,
    Sprite,
    Assets,
} from "pixi.js";

/**
 * CONSTANTS
 */

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const SPRITE_WIDTH = 24;
// based off NES version values
const FRAMES_PER_LEVEL = [
    53, 49, 45, 41, 37, 33, 28, 22, 17, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 3,
];
const POINTS_FOR_LINE = [0, 40, 100, 300, 1200];

const MAX_LEVEL = 20;
const MAX_SCORE = 999999;

const MARGIN = 8;

// CONSTANT-BASED VALUES
const BLOCKS = {
    J: {
        type: "J",
        color: "blue",
        rotations: [
            [
                [3, -2],
                [3, -1],
                [4, -1],
                [5, -1],
            ],
            [
                [4, -2],
                [5, -2],
                [4, -1],
                [4, 0],
            ],
            [
                [3, -1],
                [4, -1],
                [5, -1],
                [5, 0],
            ],
            [
                [4, -2],
                [4, -1],
                [3, 0],
                [4, 0],
            ],
        ],
        wallKickTests: [
            [
                [0, 0],
                [-1, 0],
                [-1, -1],
                [0, 2],
                [-1, 2],
            ],
            [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, -2],
                [1, -2],
            ],
            [
                [0, 0],
                [1, 0],
                [1, -1],
                [0, 2],
                [1, 2],
            ],
            [
                [0, 0],
                [-1, 0],
                [-1, 1],
                [0, -2],
                [-1, -2],
            ],
        ],
    },
    T: {
        type: "T",
        color: "purple",
        rotations: [
            [
                [4, -2],
                [3, -1],
                [4, -1],
                [5, -1],
            ],
            [
                [4, -2],
                [4, -1],
                [5, -1],
                [4, 0],
            ],
            [
                [3, -1],
                [4, -1],
                [5, -1],
                [4, 0],
            ],
            [
                [4, -2],
                [3, -1],
                [4, -1],
                [4, 0],
            ],
        ],
        wallKickTests: [
            [
                [0, 0],
                [-1, 0],
                [-1, -1],
                [0, 2],
                [-1, 2],
            ],
            [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, -2],
                [1, -2],
            ],
            [
                [0, 0],
                [1, 0],
                [1, -1],
                [0, 2],
                [1, 2],
            ],
            [
                [0, 0],
                [-1, 0],
                [-1, 1],
                [0, -2],
                [-1, -2],
            ],
        ],
    },
    L: {
        type: "L",
        color: "orange",
        rotations: [
            [
                [5, -2],
                [3, -1],
                [4, -1],
                [5, -1],
            ],
            [
                [4, -2],
                [4, -1],
                [4, 0],
                [5, 0],
            ],
            [
                [3, -1],
                [4, -1],
                [5, -1],
                [3, 0],
            ],
            [
                [3, -2],
                [4, -2],
                [4, -1],
                [4, 0],
            ],
        ],
        wallKickTests: [
            [
                [0, 0],
                [-1, 0],
                [-1, -1],
                [0, 2],
                [-1, 2],
            ],
            [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, -2],
                [1, -2],
            ],
            [
                [0, 0],
                [1, 0],
                [1, -1],
                [0, 2],
                [1, 2],
            ],
            [
                [0, 0],
                [-1, 0],
                [-1, 1],
                [0, -2],
                [-1, -2],
            ],
        ],
    },
    S: {
        type: "S",
        color: "green",
        rotations: [
            [
                [4, -2],
                [5, -2],
                [3, -1],
                [4, -1],
            ],
            [
                [4, -2],
                [4, -1],
                [5, -1],
                [5, 0],
            ],
            [
                [4, -1],
                [5, -1],
                [3, 0],
                [4, 0],
            ],
            [
                [3, -2],
                [3, -1],
                [4, -1],
                [4, 0],
            ],
        ],
        wallKickTests: [
            [
                [0, 0],
                [-1, 0],
                [-1, -1],
                [0, 2],
                [-1, 2],
            ],
            [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, -2],
                [1, -2],
            ],
            [
                [0, 0],
                [1, 0],
                [1, -1],
                [0, 2],
                [1, 2],
            ],
            [
                [0, 0],
                [-1, 0],
                [-1, 1],
                [0, -2],
                [-1, -2],
            ],
        ],
    },
    I: {
        type: "I",
        color: "cyan",
        rotations: [
            [
                [3, -1],
                [4, -1],
                [5, -1],
                [6, -1],
            ],
            [
                [5, -2],
                [5, -1],
                [5, 0],
                [5, 1],
            ],
            [
                [3, 0],
                [4, 0],
                [5, 0],
                [6, 0],
            ],
            [
                [4, -2],
                [4, -1],
                [4, 0],
                [4, 1],
            ],
        ],
        wallKickTests: [
            [
                [0, 0],
                [-2, 0],
                [1, 0],
                [1, -2],
                [-2, 1],
            ],
            [
                [0, 0],
                [-2, 0],
                [1, 0],
                [-2, -1],
                [1, 1],
            ],
            [
                [0, 0],
                [2, 0],
                [-1, 0],
                [2, -1],
                [-1, 2],
            ],
            [
                [0, 0],
                [-1, 0],
                [2, 0],
                [-1, -2],
                [2, 1],
            ],
        ],
    },
    O: {
        type: "O",
        color: "yellow",
        rotations: [
            [
                [4, -2],
                [5, -2],
                [4, -1],
                [5, -1],
            ],
            [
                [4, -2],
                [5, -2],
                [4, -1],
                [5, -1],
            ],
            [
                [4, -2],
                [5, -2],
                [4, -1],
                [5, -1],
            ],
            [
                [4, -2],
                [5, -2],
                [4, -1],
                [5, -1],
            ],
        ],
        wallKickTests: [[[0, 0]], [[0, 0]], [[0, 0]], [[0, 0]]],
    },
    Z: {
        type: "Z",
        color: "red",
        rotations: [
            [
                [3, -2],
                [4, -2],
                [4, -1],
                [5, -1],
            ],
            [
                [5, -2],
                [4, -1],
                [5, -1],
                [4, 0],
            ],
            [
                [3, -1],
                [4, -1],
                [4, 0],
                [5, 0],
            ],
            [
                [4, -2],
                [3, -1],
                [4, -1],
                [3, 0],
            ],
        ],
        wallKickTests: [
            [
                [0, 0],
                [-1, 0],
                [-1, -1],
                [0, 2],
                [-1, 2],
            ],
            [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, -2],
                [1, -2],
            ],
            [
                [0, 0],
                [1, 0],
                [1, -1],
                [0, 2],
                [1, 2],
            ],
            [
                [0, 0],
                [-1, 0],
                [-1, 1],
                [0, -2],
                [-1, -2],
            ],
        ],
    },
};

const SCOREBOARD_WIDTH = SPRITE_WIDTH * 5;

const CANVAS_WIDTH = GRID_WIDTH * SPRITE_WIDTH + SCOREBOARD_WIDTH;
const CANVAS_HEIGHT = GRID_HEIGHT * SPRITE_WIDTH;

/**
 * RENDERER
 */

let container = new Container();
let app = new Application();
app.stage.addChild(container);

/**
 * TEXT / SCOREBOARD
 */

let scoreboardBackground = new Graphics();
scoreboardBackground.rect(0, 0, SCOREBOARD_WIDTH, CANVAS_HEIGHT);
scoreboardBackground.fill(0xbbaadd);

container.addChild(scoreboardBackground);

let levelText = new Text({ text: "Level\n0", fill: "black" });
levelText.x = MARGIN;
levelText.y = MARGIN;
container.addChild(levelText);

let clearedLinesText = new Text({ text: "Clear\n0", fill: "black" });
clearedLinesText.x = MARGIN;
clearedLinesText.y = Math.floor((CANVAS_HEIGHT - 56) / 4);
container.addChild(clearedLinesText);

let nextText = new Text({ text: "Next", fill: "black" });
nextText.x = MARGIN;
nextText.y = Math.floor((CANVAS_HEIGHT - 56) / 2);
container.addChild(nextText);

let highscoreText = new Text({ text: "Hi Score\n0", fill: "black" });
highscoreText.x = MARGIN;
highscoreText.y = Math.floor(((CANVAS_HEIGHT - 56) * 3) / 4);
container.addChild(highscoreText);

let scoreText = new Text({ text: "Score\n0", fill: "black" });
scoreText.x = MARGIN;
scoreText.y = CANVAS_HEIGHT - 56 - MARGIN;
container.addChild(scoreText);

/**
 * TEXTURES
 */

let assetsManifest = {
    bundles: [
        { name: "blocks", assets: [] },
        { name: "tetrominos", assets: [] },
    ],
};

for (let block of Object.values(BLOCKS)) {
    assetsManifest.bundles[0].assets.push({
        alias: block.color,
        src: `/Tetris/assets/blocks/${block.color}.png`,
    });
    assetsManifest.bundles[1].assets.push({
        alias: block.type,
        src: `/Tetris/assets/tetrominos/${block.type}.png`,
    });
}
assetsManifest.bundles[0].assets.push({
    alias: "grey",
    src: "/Tetris/assets/blocks/grey.png",
});

/**
 * GRID
 */

// contains a number, the color
let grid = [];
for (let x = 0; x < GRID_WIDTH; x++) {
    grid[x] = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        grid[x][y] = {
            color: null,
            exists: false,
            sprite: null,
        };
    }
}

let offsetX = 0;
let offsetY = 0;
let offsetGhost = 0;

/**
 * MISC. VARIABLES
 */

let paused = false;

let frameCounter = 1;
let block = getRandomBlock();
let nextBlock = getRandomBlock();
let rotation = 0;

let blockSprites = [];
let ghostSprites = [];

let level = 0;
let startingLevel = 0;
let clearedLines = 0;
let score = 0;
let highscore = 0;

let fastDrop = false;

let renderRequest;

let nextPicture = new Sprite();
container.addChild(nextPicture);

// Action queue to store all functions so they don't run simultaneously
let actions = [];

/**
 * EVENT LISTENERS
 */

window.addEventListener("keydown", function (e) {
    let key = e.which || e.keyCode;
    if (key === 80) {
        // P
        paused = !paused;
    }
    if (!paused) {
        switch (key) {
            case 37: // left
                actions.push(wrapFunction(move, this, ["left"]));
                break;
            case 39: // right
                actions.push(wrapFunction(move, this, ["right"]));
                break;
            case 40: // down
                actions.push(wrapFunction(bottom, this, []));
                break;
            case 32: // space
                fastDrop = true;
                break;
            case 38: // up
            case 90: // Z
                actions.push(wrapFunction(rotate, this, ["clockwise"]));
                break;
            case 88: // X
                actions.push(wrapFunction(rotate, this, ["counterClockwise"]));
                break;
            default:
                break;
        }
    }
});
window.addEventListener("keyup", function (e) {
    let key = e.which || e.keyCode;
    if (key === 32) {
        // space
        fastDrop = false;
    }
});

/**
 * HELPER FUNCTIONS
 */

// checks left side, right side, bottom, and other pieces
function wrapFunction(fn, context, params) {
    return function () {
        fn.apply(context, params);
    };
}

function getRandomBlock() {
    let keys = Object.keys(BLOCKS);
    let index = Math.floor(Math.random() * keys.length);
    return JSON.parse(JSON.stringify(BLOCKS[keys[index]]));
}

function validSpot(offX, offY) {
    let points = block.rotations[rotation];
    for (let i = 0; i < points.length; i++) {
        let newX = points[i][0] + offX;
        let newY = points[i][1] + offY;
        if (
            newX < 0 ||
            newX >= GRID_WIDTH ||
            newY >= GRID_HEIGHT ||
            (newY >= 0 && grid[newX][newY].exists)
        ) {
            return false;
        }
    }
    return true;
}

function clearLine(line) {
    for (let x = 0; x < GRID_WIDTH; x++) {
        // remove all sprites from line
        if (grid[x][line].sprite !== null) {
            container.removeChild(grid[x][line].sprite);
        }
        // lower all lines above the line
        for (let y = line; y > 0; y--) {
            grid[x][y] = grid[x][y - 1];
        }
    }
    // clear top row
    for (let i = 0; i < GRID_WIDTH; i++) {
        grid[i][0] = {
            color: null,
            exists: false,
            sprite: null,
        };
    }
}
function lineCanBeCleared(line) {
    for (let i = 0; i < GRID_WIDTH; i++) {
        if (!grid[i][line].exists) {
            return false;
        }
    }
    return true;
}
function calculateOffsetGhost() {
    offsetGhost = offsetY;
    while (validSpot(offsetX, offsetGhost + 1)) {
        offsetGhost++;
    }
}

/**
 * FUNCTIONS
 *
 * newRound() is run at the beginning of each round
 * drop()/render() runs, movement like move(), rotate(), and bottom() is also
 * newRound() is called again, until the player loses
 *
 * All functions modify grid, and everything sprite related is handled by render()
 */
async function newGame() {
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (grid[x][y].sprite !== null) {
                container.removeChild(grid[x][y].sprite);
            }
            grid[x][y] = {
                color: null,
                exists: false,
                sprite: null,
            };
        }
    }
    for (let i = 0; i < blockSprites.length; i++) {
        container.removeChild(blockSprites[i]);
        container.removeChild(ghostSprites[i]);
    }

    // RESET
    offsetX = 0;
    offsetY = 0;
    offsetGhost = 0;
    paused = false;
    frameCounter = 1;
    block = getRandomBlock();
    nextBlock = getRandomBlock();
    rotation = 0;
    blockSprites = [];
    ghostSprites = [];
    level = 0;
    clearedLines = 0;
    score = 0;
    fastDrop = false;

    startingLevel = parseInt(localStorage.getItem("tetris-startingLevel"));
    highscore = parseInt(localStorage.getItem("tetris-highscore"));
    app.ticker.add((time) => render());
    await newRound();
}

async function newRound() {
    let linesClearedThisRound = 0;

    for (let i = 0; i < GRID_HEIGHT; i++) {
        if (lineCanBeCleared(i)) {
            clearLine(i);
            clearedLines++;
            linesClearedThisRound++;
        }
    }

    block = nextBlock;
    nextBlock = getRandomBlock();
    offsetX = 0;
    offsetY = 0;

    // check for lose
    let points = block.rotations[rotation];
    for (let i = 0; i < points.length; i++) {
        let x = points[i][0];
        let y = points[i][1];
        if (y < 0) {
            y = 0;
        }
        if (grid[x][y].exists) {
            await lose();
            return;
        }
    }

    level = Math.floor(clearedLines / 10) + startingLevel; // based on NES version
    score += POINTS_FOR_LINE[linesClearedThisRound] * (level + 1);

    // enforce max level/score
    level = level > MAX_LEVEL ? MAX_LEVEL : level;
    score = score > MAX_SCORE ? MAX_SCORE : score;

    levelText.text = "Level\n" + level;
    clearedLinesText.text = "Clear\n" + clearedLines;
    scoreText.text = "Score\n" + score;
    highscoreText.text = "Hi Score\n" + highscore;

    // set nextPicture to a picture of the next piece
    container.removeChild(nextPicture);
    nextPicture = new Sprite({ texture: Assets.get(nextBlock.type) });
    nextPicture.x = SPRITE_WIDTH / 2;
    nextPicture.y = Math.floor(CANVAS_HEIGHT / 2 + SPRITE_WIDTH / 2);
    container.addChild(nextPicture);

    frameCounter = 1;
}

async function drop() {
    if (frameCounter === 0 || fastDrop) {
        if (validSpot(offsetX, offsetY + 1)) {
            offsetY++;
        } else {
            let points = block.rotations[rotation];
            for (let i = 0; i < points.length; i++) {
                let x = points[i][0] + offsetX;
                let y = points[i][1] + offsetY;
                if (x >= 0 && y >= 0) {
                    grid[x][y].exists = true;
                    grid[x][y].color = block.color;
                }
            }
            await newRound();
            return; // end drop()
        }
    }
    frameCounter = (frameCounter + 1) % FRAMES_PER_LEVEL[level];
}

// logic is basically the same as drop(), but uses a do-while instead of requestAnimationFrame so it happens instantly
async function bottom() {
    while (validSpot(offsetX, offsetY + 1)) {
        offsetY++;
    }
    let points = block.rotations[rotation];
    for (let i = 0; i < points.length; i++) {
        let x = points[i][0] + offsetX;
        let y = points[i][1] + offsetY;
        if (x >= 0 && y >= 0) {
            grid[x][y].exists = true;
            grid[x][y].color = block.color;
        }
    }
    await newRound();
}

function move(direction) {
    let offX = offsetX;

    if (direction === "right") {
        offX++;
    }
    if (direction === "left") {
        offX--;
    }

    if (validSpot(offX, offsetY)) {
        offsetX = offX;
    }
}

// Rotation follows Akira Super Rotation System
function rotate(direction) {
    let multiplier;
    let originalRotation = rotation;
    if (direction === "counterClockwise") {
        rotation = (rotation - 1 + 4) % 4;
        multiplier = -1;
    }
    if (direction === "clockwise") {
        rotation = (rotation + 1) % 4;
        multiplier = 1;
    }

    // check wall kicks
    let validSpotFound = false;
    for (let i = 0; i < block.wallKickTests[rotation].length; i++) {
        let offX = offsetX + block.wallKickTests[rotation][i][0] * multiplier;
        let offY = offsetY + block.wallKickTests[rotation][i][1] * multiplier;
        if (validSpot(offX, offY)) {
            offsetX = offX;
            offsetY = offY;
            validSpotFound = true;
            break;
        }
    }
    if (!validSpotFound) {
        rotation = originalRotation;
    }
}

async function lose() {
    paused = true;
    let swalOptions;
    if (score >= highscore) {
        highscore = score;
        localStorage.setItem("tetris-highscore", highscore);
        swalOptions = {
            title: "Congrats!",
            text: "You got a new highscore of " + score + "!",
            icon: "success",
            confirmButtonText: "New Game",
        };
    } else {
        swalOptions = {
            title: "Game Over",
            text: "You got a score of " + score + ".",
            icon: "info",
            confirmButtonText: "New Game",
        };
    }
    await Swal.fire(swalOptions);
    await newGame();
}

/**
 * RENDER
 */

async function render() {
    if (!paused) {
        while (actions.length > 0) {
            actions.shift()();
        }
        await drop();
    }
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (grid[x][y].sprite !== null) {
                container.removeChild(grid[x][y].sprite);
                grid[x][y].sprite = null;
            }
            if (grid[x][y].exists) {
                grid[x][y].sprite = new Sprite({
                    texture: Assets.get(grid[x][y].color),
                });
                grid[x][y].sprite.x = x * SPRITE_WIDTH + SCOREBOARD_WIDTH;
                grid[x][y].sprite.y = y * SPRITE_WIDTH;
                container.addChild(grid[x][y].sprite);
            }
        }
    }
    calculateOffsetGhost();
    for (let i = 0; i < blockSprites.length; i++) {
        container.removeChild(blockSprites[i]);
        container.removeChild(ghostSprites[i]);
    }
    let points = block.rotations[rotation];
    for (let i = 0; i < points.length; i++) {
        let x = points[i][0] + offsetX;
        let ghostY = points[i][1] + offsetGhost;
        ghostSprites[i] = new Sprite({ texture: Assets.get("grey") });
        ghostSprites[i].x = x * SPRITE_WIDTH + SCOREBOARD_WIDTH;
        ghostSprites[i].y = ghostY * SPRITE_WIDTH;
        container.addChild(ghostSprites[i]);

        // add ghosts before blocks in order for the ghost not to cover the block
        let y = points[i][1] + offsetY;
        blockSprites[i] = new Sprite({ texture: Assets.get(block.color) });
        blockSprites[i].x = x * SPRITE_WIDTH + SCOREBOARD_WIDTH;
        blockSprites[i].y = y * SPRITE_WIDTH;
        container.addChild(blockSprites[i]);
    }
}

/**
 * Local Storage
 */

/**
 * RUN!
 */
let initialLoad = true;
document.addEventListener("astro:page-load", async function (event) {
    if (event.target.title === "Tetris") {
        // Use localstorage to store options
        if (localStorage.getItem("tetris-highscore") !== null) {
            document.querySelector("#startingLevel").value =
                localStorage.getItem("tetris-startingLevel");
        } else {
            // Default
            localStorage.setItem("tetris-startingLevel", 0);
            localStorage.setItem("tetris-highscore", 0);
        }

        // Bottom bar options
        document
            .querySelector("#startingLevel")
            .addEventListener("change", function (event) {
                startingLevel = Math.max(
                    0,
                    Math.min(
                        MAX_LEVEL,
                        parseInt(
                            document.querySelector("#startingLevel").value,
                        ),
                    ),
                );
                localStorage.setItem("tetris-startingLevel", startingLevel);
            });

        if (initialLoad) {
            await app.init({
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
            });

            await Assets.init({ manifest: assetsManifest });
            await Assets.loadBundle("blocks");
            await Assets.loadBundle("tetrominos");
            initialLoad = false;
        }

        document
            .querySelector("#container")
            .insertBefore(
                app.canvas,
                document.querySelector("#container").lastChild,
            );
        await newGame();
    }
});
