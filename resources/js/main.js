/**
 * @type {HTMLInputElement}
 */
const input = document.getElementById("input");
const text = document.getElementById("text");
const timeEl = document.getElementById("time");
const wpmEl = document.getElementById("wpm");
const cpmEl = document.getElementById("cpm");
const mistypesEl = document.getElementById("mistypes");
const next_button = document.getElementById("next-button");

let already_initiated = false;
const maxTime = 60;
let time = maxTime;
let interval;
let textSplits, letters;
document.addEventListener("keydown", () => {
    input.focus();
    startTimer();
    already_initiated = true;
});

/**
 * Fetches the article and gets the article ready to be typed.
 * @returns void
 */
async function fetchArticle() {
    try {
        let response = await fetch(`http://127.0.0.1:5000/`);
        let data = await response.json();
        console.log(data);
        text.innerText = data.message;

        textSplits = text.innerText.split("");
        text.innerText = "";
        for (let i = 0; i < textSplits.length; i++) {
            text.innerHTML += `<span>${textSplits[i]}</span>`;
        }

        letters = document.querySelectorAll("span");
    } catch (error) {
        text.innerHTML =
            "There was an error fetching article: Please try reloading or check your network connection.";
    }
}

fetchArticle();

next_button.onclick = () => {
    fetchArticle();
    already_initiated = false;
    input.value = "";
    time = maxTime;
    timeEl.textContent = time;
    index = 0;
    input.disabled = false;
};

/**
 * This function handle timing stuff.
 * @returns void
 */
function startTimer() {
    if (already_initiated) return;
    interval = setInterval(() => {
        if (time <= 0) {
            input.disabled = true;
            already_initiated = false;
            clearInterval(interval);
        } else {
            time--;
            timeEl.textContent = time;
        }
    }, 1000);
}

let index = 0;

input.addEventListener("input", (e) => {
    let total_words = textSplits.filter((e) => {
        return e === " ";
    }).length;
    let value = e.target.value;
    let valueRegex = value.split("");

    // INPUT VALUE IS EMPTY OR NOT
    if (valueRegex.length <= 0) {
        index = 0;
        letters.forEach((letter) => {
            letter.classList.remove("correct");
            letter.classList.remove("incorrect");
            letter.classList.remove("next");
        });
        letters[index + 1].classList.add("next");
    }

    // PRESSED BACKSPACE OR NOT
    if (e.inputType === "deleteContentBackward") {
        if (index > 0) index--;
        letters[index].classList.remove("incorrect");
        letters[index].classList.remove("correct");
        letters[index + 1].classList.remove("next");
        letters[index].classList.add("next");
        return;
    }

    // LETTER MATCHES WITH INPUT
    if (letters[index].innerHTML === valueRegex[index]) {
        letters[index].classList.add("correct");
        letters[index].classList.remove("incorrect");
    } else {
        letters[index].classList.add("incorrect");
        letters[index].classList.remove("correct");
    }
    letters.forEach((letter) => {
        letter.classList.remove("next");
    });
    letters[index + 1].classList.add("next");
    index++;

    // Printing the mistakes
    let mistakesEl = document.querySelectorAll("span.incorrect");
    mistypesEl.textContent = mistakesEl.length;

    // Printing cpm
    let cpm = index - mistakesEl.length;
    cpmEl.innerText = cpm;

    // Printing wpm
    let estimatedTimeInMinute = (maxTime - time) / maxTime;
    let length_of_one_word = 5 || letters.length / total_words;
    let wpm = Math.round(cpm / length_of_one_word / estimatedTimeInMinute);
    wpmEl.textContent = wpm;
});
