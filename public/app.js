// Constants for game settings
const FOUR_LETTER_WORDS = ["ABLE", "ACID", "ALSO", "AREA", "ARMY", "AWAY", "BABY", "BACK", "BALL", "BAND", "BANK", "BASE", "BATH", "BEAR", "BEAT", "BEEN", "BEER", "BELL", "BELT", "BEND", "BEST", "BIRD", "BLOW", "BLUE", "BOAT", "BODY", "BOMB", "BOND", "BONE", "BOOK", "BOSS", "BOTH", "BOWL", "BURN", "BUSH", "BUSY", "CAKE", "CALL", "CALM", "CAME", "CAMP", "CARD", "CARE", "CASE", "CASH", "CAST", "CELL", "CHAT", "CHIP", "CITY", "CLUB", "COAL", "COAT", "CODE", "COLD", "COME", "COOK", "COOL", "COPY", "CORE", "CORN", "COST", "CREW", "CROP", "DARK", "DATA", "DATE", "DEAL", "DEAR", "DEBT", "DECK", "DEEP", "DEER", "DESK", "DIET", "DIRT", "DISK", "DOES", "DONE", "DOOR", "DOWN", "DRAW", "DREAM", "DRESS", "DRUM", "DUCK", "DUST", "DUTY", "EACH", "EARL", "EARN", "EARS", "EASY", "EDGE", "ELSE", "EVEN", "EVER", "FACE", "FACT", "FAIL", "FAIR", "FALL", "FARM", "FAST", "FATE", "FEAR", "FEED", "FEEL", "FEET", "FELL", "FELT", "FEW", "FILE", "FILL", "FILM", "FIND", "FINE", "FIRE", "FIRM", "FISH", "FIVE", "FLAG", "FLAT", "FLOW", "FOOD", "FOOT", "FORD", "FORE", "FORK", "FORM", "FOUR", "FREE", "FROM", "FUEL", "FULL", "FUND", "GAIN", "GAME", "GANG", "GATE", "GAVE", "GEAR", "GENE", "GIFT", "GIRL", "GIVE", "GLAD", "GOAL", "GOAT", "GOLD", "GONE", "GOOD", "GRAY", "GREW", "GREY", "GROW", "GULF", "HAIR", "HALF", "HALL", "HAND", "HANG", "HARD", "HARM", "HATE", "HAVE", "HEAD", "HEAR", "HEART", "HEAT", "HELD", "HELL", "HELP", "HERE", "HERO", "HIGH", "HILL", "HIRE", "HOLD", "HOLE", "HOLY", "HOME", "HOPE", "HOUR", "HUGE", "HUNG", "HUNT", "HURT", "IDEA", "INCH", "INTO", "IRON", "ITEM", "JACK", "JAIL", "JOIN", "JOKE", "JUMP", "JURY", "JUST", "KEEN", "KEEP", "KICK", "KILL", "KIND", "KING", "KNEE", "KNEW", "KNIT", "KNOT", "KNOW", "LACK", "LADY", "LAID", "LAKE", "LAMB", "LAMP", "LAND", "LANE", "LAST", "LATE", "LAWN", "LEAD", "LEAF", "LEAN", "LEFT", "LEND", "LESS", "LIFE", "LIFT", "LIKE", "LINE", "LINK", "LIST", "LIVE", "LOAD", "LOAN", "LOCK", "LONG", "LOOK", "LORD", "LOSE", "LOSS", "LOST", "LOUD", "LOVE", "LUCK", "MADE", "MAIL", "MAIN", "MAKE", "MALE", "MANY", "MARK", "MASS", "MEAL", "MEAN", "MEAT", "MEET", "MENU", "MILE", "MILK", "MIND", "MINE", "MISS", "MODE", "MOOD", "MOON", "MORE", "MOST", "MOVE", "MUCH", "MUST", "NAME", "NAVY", "NEAR", "NECK", "NEED", "NEWS", "NEXT", "NICE", "NINE", "NONE", "NOON", "NOSE", "NOTE", "NOUN", "OARS", "OATH", "OBEY", "OPEN", "ORAL", "ORDER", "OTHER", "OURS", "OVER", "PACE", "PACK", "PAGE", "PAID", "PAIN", "PAIR", "PALM", "PARK", "PART", "PASS", "PAST", "PATH", "PEAK", "PEAR", "PINK", "PIPE", "PLAN", "PLAY", "PLOT", "PLUS", "POEM", "POET", "POLE", "POLL", "POND", "POOL", "POOR", "PORT", "POST", "PULL", "PURE", "PUSH", "QUIT", "QUIZ", "RACE", "RACK", "RAIL", "RAIN", "RANK", "RARE", "RATE", "READ", "REAL", "REAR", "RELY", "RENT", "REST", "RICE", "RICH", "RIDE", "RING", "RISE", "RISK", "ROAD", "ROCK", "ROLE", "ROLL", "ROOF", "ROOM", "ROOT", "ROPE", "ROSE", "ROW", "RULE", "RUSH", "RUST", "SACK", "SAFE", "SAID", "SAIL", "SALE", "SALT", "SAME", "SAND", "SAVE", "SEAT", "SEED", "SEEK", "SEEM", "SELL", "SEND", "SENT", "SHIP", "SHOE", "SHOP", "SHOT", "SHOW", "SICK", "SIDE", "SIGN", "SILK", "SING", "SINK", "SIZE", "SKIN", "SLOW", "SNOW", "SOAP", "SOFT", "SOIL", "SOLD", "SOME", "SONG", "SOON", "SORT", "SOUL", "SOUP", "SPOT", "STAR", "STAY", "STEP", "STOP", "SUCH", "SUIT", "SURE", "SWIM", "TAIL", "TAKE", "TALK", "TALL", "TANK", "TAPE", "TASK", "TAXI", "TEAM", "TEAR", "TELL", "TERM", "TEST", "THAN", "THAT", "THEM", "THEN", "THIN", "THIS", "THUS", "TIDE", "TIDY", "TIED", "TIME", "TINY", "TIRE", "TONE", "TOOL", "TOUR", "TOWN", "TREE", "TRIP", "TRUE", "TUBE", "TURN", "TWIN", "TYPE", "UNIT", "UPON", "USED", "USER", "VAIN", "VAST", "VERY", "VIEW", "VOTE", "WAIT", "WAKE", "WALK", "WALL", "WANT", "WARM", "WARN", "WASH", "WAVE", "WEAK", "WEAR", "WEEK", "WELL", "WENT", "WERE", "WEST", "WHAT", "WHEN", "WHOM", "WIDE", "WIFE", "WILD", "WILL", "WIND", "WINE", "WING", "WIRE", "WISE", "WISH", "WITH", "WOOD", "WORD", "WORK", "YARD", "YEAR", "YOUR", "ZERO", "ZONE"];

const MAX_ATTEMPTS = 8;
const WORD_LENGTH = 4;

// Game state
let targetWord = "";
let currentAttempts = 0;
let gameOver = false;
let startTime = 0;

// Session / user info (populated by genUsername)
let USER_ID = null;
let USERNAME = null;

// Select DOM elements
const splashScreen = document.getElementById("splash-screen");
const startButton = document.getElementById("start-button");
const gameContainer = document.querySelector(".game-container");
const letterInputElements = [
    document.getElementById("letter1"),
    document.getElementById("letter2"),
    document.getElementById("letter3"),
    document.getElementById("letter4"),
];
const submitGuessMobileButtonElement = document.getElementById(
    "submitGuessMobileButton"
);
const messageAreaElement = document.getElementById("messageArea");
const guessesHistoryElement = document.getElementById("guessesHistory");
const attemptsLeftElement = document.getElementById("attemptsLeft");
const newGameButtonElement = document.getElementById("newGameButton");
const leaderboardContainer = document.getElementById("leaderboard");

// Graffiti overlay (unchanged from original)
const graffitiOverlayElement = document.createElement("div");
graffitiOverlayElement.id = "graffiti-overlay";
const graffitiTextElement = document.createElement("span");
graffitiTextElement.id = "graffiti-text";
graffitiOverlayElement.appendChild(graffitiTextElement);
document.body.appendChild(graffitiOverlayElement);

// ─── Section B: Utility Functions ───────────────────────────────────────

/**
 * Randomly picks the word of the day based on current date.
 */
function getWordOfTheDay(wordList) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const seed = year * 10000 + (month + 1) * 100 + day;
    const randomIndex = seed % wordList.length;
    return wordList[randomIndex].toUpperCase();
}

/**
 * Compute green/yellow scores.
 */
function calculateScores(guess, target) {
    let green = 0;
    let yellow = 0;
    const n = target.length;
    const guessChars = guess.split("");
    const targetChars = target.split("");

    const usedTargetIndices = new Array(n).fill(false);
    const usedGuessIndices = new Array(n).fill(false);

    // Pass 1: greens
    for (let i = 0; i < n; i++) {
        if (guessChars[i] === targetChars[i]) {
            green++;
            usedTargetIndices[i] = true;
            usedGuessIndices[i] = true;
        }
    }
    // Pass 2: yellows
    for (let i = 0; i < n; i++) {
        if (!usedGuessIndices[i]) {
            for (let j = 0; j < n; j++) {
                if (!usedTargetIndices[j] && guessChars[i] === targetChars[j]) {
                    yellow++;
                    usedTargetIndices[j] = true;
                    break;
                }
            }
        }
    }
    return { green, yellow };
}

/**
 * Display a Bootstrap alert in #messageArea.
 */
function displayMessage(message, type = "info") {
    messageAreaElement.innerHTML = "";
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type === "info" ? "primary" : type
        } alert-dismissible fade show`;
    alertDiv.setAttribute("role", "alert");
    alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
    messageAreaElement.appendChild(alertDiv);
}

/**
 * Clear any existing message.
 */
function clearMessage() {
    messageAreaElement.innerHTML = "";
}

/**
 * Append the guess + score to history.
 */
function displayGuessInHistory(guess, scores) {
    const guessRow = document.createElement("div");
    guessRow.classList.add("guess-row");

    // Word display
    const wordDisplay = document.createElement("div");
    wordDisplay.classList.add("guessed-word-display");
    guess.split("").forEach((letter) => {
        const letterDiv = document.createElement("span");
        letterDiv.classList.add("letter-box");
        letterDiv.textContent = letter;
        wordDisplay.appendChild(letterDiv);
    });

    // Score badges
    const scoresDisplay = document.createElement("div");
    scoresDisplay.classList.add("scores");
    const greenBadge = document.createElement("span");
    greenBadge.classList.add("score-badge", "score-badge-green");
    greenBadge.textContent = scores.green;
    const yellowBadge = document.createElement("span");
    yellowBadge.classList.add("score-badge", "score-badge-yellow");
    yellowBadge.textContent = scores.yellow;
    scoresDisplay.appendChild(greenBadge);
    scoresDisplay.appendChild(yellowBadge);

    guessRow.appendChild(wordDisplay);
    guessRow.appendChild(scoresDisplay);
    guessesHistoryElement.appendChild(guessRow);
    guessesHistoryElement.scrollTop = guessesHistoryElement.scrollHeight;
}

/**
 * Update the "attempts left" display.
 */
function updateAttemptsDisplay() {
    attemptsLeftElement.textContent = MAX_ATTEMPTS - currentAttempts;
}

/**
 * Clear input boxes and focus on the first one.
 */
function clearAndFocusInput() {
    letterInputElements.forEach((input) => (input.value = ""));
    letterInputElements[0].focus();
}

/**
 * Show graffiti animation on win.
 */
function triggerGraffitiAnimation(word) {
    graffitiTextElement.textContent = word;
    graffitiOverlayElement.classList.add("show");
    document.body.classList.add("no-scroll");

    setTimeout(() => {
        graffitiOverlayElement.classList.remove("show");
        document.body.classList.remove("no-scroll");
        displayMessage(
            `🎉 Congratulations, ${USERNAME}! You guessed "${targetWord}" in ${currentAttempts} tries! 🎉`,
            "success"
        );
        // After displaying the success message, record the result:
        const timeMs = Date.now() - startTime;
        postResult(USER_ID, currentAttempts, timeMs).then(() => {
            fetchAndRenderLeaderboard();
        });

        submitGuessMobileButtonElement.disabled = true;
        letterInputElements.forEach((input) => (input.disabled = true));
        newGameButtonElement.style.display = "block";
    }, 2800);
}

/**
 * Handle one guess attempt.
 */
async function handleGuess() {
    if (gameOver) return;
    clearMessage();

    let guess = "";
    for (const inputEl of letterInputElements) {
        guess += inputEl.value.toUpperCase();
    }

    if (guess.length !== WORD_LENGTH) {
        displayMessage(
            `Your guess must be ${WORD_LENGTH} letters long. Please fill all boxes.`,
            "warning"
        );
        return;
    }
    if (!/^[A-Z]+$/.test(guess)) {
        displayMessage("Your guess must contain only letters.", "warning");
        return;
    }

    currentAttempts++;
    const scores = calculateScores(guess, targetWord);
    displayGuessInHistory(guess, scores);
    updateAttemptsDisplay();

    if (scores.green === WORD_LENGTH) {
        gameOver = true;
        triggerGraffitiAnimation(targetWord);
    } else if (currentAttempts >= MAX_ATTEMPTS) {
        gameOver = true;
        displayMessage(
            `😥 Game Over, ${USERNAME}! The word was "${targetWord}". Better luck next time!`,
            "danger"
        );
        submitGuessMobileButtonElement.disabled = true;
        letterInputElements.forEach((input) => (input.disabled = true));
        newGameButtonElement.style.display = "block";
        // (Optionally record losses as well if you want.)
    } else {
        clearAndFocusInput();
    }
}

/**
 * Initialize/reset the game board for a new round.
 */
function initGame() {
    targetWord = getWordOfTheDay(FOUR_LETTER_WORDS);
    currentAttempts = 0;
    gameOver = false;
    guessesHistoryElement.innerHTML = "";
    clearMessage();

    if (graffitiOverlayElement.classList.contains("show")) {
        graffitiOverlayElement.classList.remove("show");
        document.body.classList.remove("no-scroll");
    }

    updateAttemptsDisplay();

    letterInputElements.forEach((input) => {
        input.value = "";
        input.disabled = false;
    });
    submitGuessMobileButtonElement.disabled = false;
    newGameButtonElement.style.display = "none";

    letterInputElements[0].focus();
    startTime = Date.now(); // start the timer for this round
}

// ─── Section C: Netlify-function POSTs/GETs ──────────────────────────────

/**
 * Fetch a new username/session ID from Netlify function.
 */
async function fetchUsername() {
    try {
        const res = await fetch("/.netlify/functions/genUsername");
        if (!res.ok) throw new Error("Failed to get username");
        const data = await res.json();
        USER_ID = data.userId;
        USERNAME = data.username;
    } catch (err) {
        console.error("Error fetching username:", err);
        USERNAME = "Anonymous";
    }
}

/**
 * POST the result (userId, attempts, timeMs) to recordResult function.
 */
async function postResult(userId, attempts, timeMs) {
    try {
        const res = await fetch("/.netlify/functions/recordResult", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, attempts, timeMs }),
        });
        if (!res.ok) {
            console.error("recordResult failed:", await res.text());
        }
    } catch (err) {
        console.error("Error in postResult:", err);
    }
}

/**
 * GET the leaderboard from Netlify function and render it as a table.
 */
async function fetchAndRenderLeaderboard() {
    leaderboardContainer.innerHTML = "<p>Loading leaderboard…</p>";

    try {
        const res = await fetch("/.netlify/functions/getLeaderboard");
        if (!res.ok) throw new Error(`Leaderboard fetch failed: ${res.status}`);
        const data = await res.json();
        const { leaderboard } = data;

        if (leaderboard.length === 0) {
            leaderboardContainer.innerHTML = "<p>No entries yet.</p>";
            return;
        }

        // Build a table
        let html = `
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Attempts</th>
            <th>Time (s)</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
    `;
        leaderboard.forEach((entry, idx) => {
            const seconds = (entry.timeMs / 1000).toFixed(2);
            const date = new Date(entry.createdAt).toLocaleDateString();
            html += `
        <tr>
          <td>${idx + 1}</td>
          <td>${entry.username}</td>
          <td>${entry.attempts}</td>
          <td>${seconds}</td>
          <td>${date}</td>
        </tr>
      `;
        });
        html += `
        </tbody>
      </table>
    `;
        leaderboardContainer.innerHTML = html;
    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        leaderboardContainer.innerHTML =
            "<p>Unable to load leaderboard at this time.</p>";
    }
}

// ─── Section D: Splash Screen Logic ────────────────────────────────────

/**
 * Show the splash screen on first launch only. On subsequent page loads,
 * skip straight to showing .game-container and run startup logic.
 */
function handleSplashScreen() {
    const alreadySeen = localStorage.getItem("guessword_firstLaunchDone");
    if (alreadySeen) {
        // Hide splash and show game immediately
        splashScreen.style.display = "none";
        gameContainer.style.display = "block";
        afterSplashInit();
    } else {
        // Show splash; wait until user clicks "Start"
        splashScreen.style.display = "flex";
        gameContainer.style.display = "none";
        startButton.addEventListener("click", () => {
            localStorage.setItem("guessword_firstLaunchDone", "true");
            splashScreen.style.display = "none";
            gameContainer.style.display = "block";
            afterSplashInit();
        });
    }
}

/**
 * Called once the splash is dismissed (or skipped). We:
 * 1) Fetch username from the function
 * 2) Initialize the game
 * 3) Fetch the leaderboard
 */
async function afterSplashInit() {
    await fetchUsername();
    initGame();
    fetchAndRenderLeaderboard();
}

// ─── Section E: Event Listeners & Initialization ──────────────────────

// Auto-uppercase/tabbing, backspace handling, arrow keys, and Enter key
letterInputElements.forEach((input, index) => {
    input.addEventListener("input", (e) => {
        input.value = input.value.toUpperCase();
        if (input.value.length === 1 && index < letterInputElements.length - 1) {
            letterInputElements[index + 1].focus();
        }
    });
    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value === "" && index > 0) {
            letterInputElements[index - 1].focus();
        }
        if (e.key === "ArrowLeft" && index > 0) {
            letterInputElements[index - 1].focus();
            e.preventDefault();
        }
        if (e.key === "ArrowRight" && index < letterInputElements.length - 1) {
            letterInputElements[index + 1].focus();
            e.preventDefault();
        }
        if (e.key === "Enter") {
            e.preventDefault();
            handleGuess();
        }
    });
});

// Click "➔" to submit a guess
submitGuessMobileButtonElement.addEventListener("click", handleGuess);

// "Play Again" resets with the same daily word
newGameButtonElement.addEventListener("click", initGame);

// When DOM is ready, handle the splash screen
document.addEventListener("DOMContentLoaded", () => {
    // Hide graffiti overlay if somehow it's visible
    graffitiOverlayElement.classList.remove("show");
    document.body.classList.remove("no-scroll");
    handleSplashScreen();
});
