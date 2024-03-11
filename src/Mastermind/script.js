import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

let key = [];
let guesses = 0;

async function win() {
    await Swal.fire({
        title: "You won! It took " + guesses + " guesses",
        icon: "success",
    });
    await selectGameType();
}

function setKeyMode() {
    document.querySelector("#key-mode").style.display = "block";
    document.querySelector("#guess-mode").style.display = "none";
    document.querySelector("#mode").innerHTML = "KEY MODE";
}
function setGuessMode() {
    document.querySelector("#key-mode").style.display = "none";
    document.querySelector("#guess-mode").style.display = "block";
    document.querySelector("#mode").innerHTML = "GUESS MODE";
    document.querySelector("#history").innerHTML = "";
    document.querySelector("#history-header").innerHTML = "";
    guesses = 0;
}
function checkMastermind(guess) {
    let right = 0;
    let wrong = 0;

    let keyObject = {};
    let guessObject = {};

    for (let i = 0; i < key.length; i++) {
        if (!keyObject[key[i]]) {
            keyObject[key[i]] = 1;
        } else {
            keyObject[key[i]]++;
        }
    }
    for (let i = 0; i < guess.length; i++) {
        if (!guessObject[guess[i]]) {
            guessObject[guess[i]] = 1;
        } else {
            guessObject[guess[i]]++;
        }
    }

    for (let i in keyObject) {
        if (guessObject[i]) {
            while (keyObject[i] > 0 && guessObject[i] > 0) {
                wrong++;
                keyObject[i]--;
                guessObject[i]--;
            }
        }
    }

    for (let i = 0; i < key.length; i++) {
        if (key[i] === guess[i]) {
            right++;
            wrong--;
            keyObject[key[i]]--;
            guessObject[guess[i]]--;
        }
    }
    return { right: right, wrong: wrong };
}

function submitKey(event) {
    let blocks = document.querySelectorAll("#key > .color-selector > .preview");
    for (let i = 0; i < 4; i++) {
        if (blocks[i].dataset.color) {
            key[i] = blocks[i].dataset.color;
        } else {
            Swal.fire(
                "Error",
                "Make sure every color in the key is set",
                "error",
            );
            return;
        }
    }
    setGuessMode();
}

async function submitGuess() {
    let guess = [];
    let blocks = document.querySelectorAll(
        "#guess > .color-selector > .preview",
    );
    for (let i = 0; i < 4; i++) {
        if (blocks[i].dataset.color) {
            guess[i] = blocks[i].dataset.color;
        } else {
            await Swal.fire(
                "Error",
                "Make sure every color in your guess is set",
                "error",
            );
            return;
        }
    }

    guesses++;
    document.querySelector("#history-header").innerHTML = "History";

    let result = checkMastermind(guess);

    let appendedString = "";
    for (let i = 0; i < 4; i++) {
        appendedString +=
            '<div class="color-selector"><div class="square" data-color="' +
            guess[i] +
            '"></div></div> ';
    }
    appendedString += '<div class="square">';
    for (let i = 0; i < result.right; i++) {
        appendedString += '<div class="minisquare right"></div>';
    }
    for (let i = 0; i < result.wrong; i++) {
        appendedString += '<div class="minisquare wrong"></div>';
    }
    appendedString += "</div>";
    let div = document.createElement("div");
    div.innerHTML = appendedString;
    document
        .querySelector("#history")
        .insertBefore(div, document.querySelector("#history").firstChild);

    if (result.right === 4) {
        await win();
    }
}

function colorSelectorPreviewClick(event) {
    // Remove color
    let preview = event.target;
    delete preview.dataset.color;
    // Toggle dropdown
    let dropdown = event.target.parentElement.children[0];
    dropdown.style.display = "block";
}

function colorSelectorOptionClick(event) {
    // Set preview color
    let preview = event.target.parentElement.parentElement.children[1];
    preview.dataset.color = event.target.dataset.color;
    // Hide dropdown
    let dropdown = event.target.parentElement;
    dropdown.style.display = "none";
}

async function selectGameType() {
    let swalResult = await Swal.fire({
        title: "Choose a game type",
        text: "You can either play against a computer, or against a friend",
        confirmButtonText: "Play against a person",
        cancelButtonText: "Play against a computer",
        showConfirmButton: true,
        showCancelButton: true,
    });

    if (swalResult.isConfirmed) {
        await Swal.fire({
            title: "Get ready!",
            text: "Don't let the other person look before you've submitted your key!",
        });
        setKeyMode();
    } else {
        // Computer opponent
        let colors = ["red", "orange", "yellow", "green", "blue", "purple"];
        for (let i = 0; i < 4; i++) {
            key[i] = colors[Math.floor(Math.random() * colors.length)];
        }
        setGuessMode();
    }
}

document.addEventListener("astro:page-load", async function (event) {
    if (event.target.title === "Mastermind") {
        for (let colorSelectorPreview of document.querySelectorAll(
            ".color-selector > .preview",
        )) {
            colorSelectorPreview.addEventListener(
                "click",
                colorSelectorPreviewClick,
            );
        }
        for (let colorSelectorOption of document.querySelectorAll(
            ".color-selector > .dropdown > div",
        )) {
            colorSelectorOption.addEventListener(
                "click",
                colorSelectorOptionClick,
            );
        }
        document
            .querySelector('button[name="submitKey"]')
            .addEventListener("click", submitKey);
        document
            .querySelector('button[name="submitGuess"]')
            .addEventListener("click", submitGuess);

        await selectGameType();
    }
});
