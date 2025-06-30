// Constants for game settings
const MAX_ATTEMPTS = 8;
const WORD_LENGTH = 4;

// Game state
let targetWord = "";
let currentAttempts = 0;
let gameOver = false;
let startTime = 0;
let currentLevel = 1;
let cheatModeActive = false; // Track if cheat mode is active

// Session / user info (populated by genUsername or localStorage)
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
const levelDisplayElement = document.createElement("p"); // For displaying current level
levelDisplayElement.classList.add("current-level-display", "mt-2", "mb-0"); // Added some basic styling classes
const toggleLeaderboardButton = document.getElementById("toggleLeaderboardButton"); // Added
const leaderboardHr = document.getElementById("leaderboardHr"); // Added
const leaderboardTitle = document.getElementById("leaderboardTitle"); // Added

// Graffiti overlay (unchanged from original)
const graffitiOverlayElement = document.createElement("div");
graffitiOverlayElement.id = "graffiti-overlay";
const graffitiTextElement = document.createElement("span");
graffitiTextElement.id = "graffiti-text";
graffitiOverlayElement.appendChild(graffitiTextElement);
document.body.appendChild(graffitiOverlayElement);

// ─── Section B: Utility Functions ───────────────────────────────────────

/**
 * Check if the secret code "DALI" is entered in the input boxes
 * This will help debug or test the game
 */
function checkSecretCode() {
    // Get the values from the input boxes
    const code = letterInputElements.map(input => input.value.toUpperCase()).join('');
    return code === "DALI";
}

async function fetchWordForLevel(level) { // Renamed and modified
    try {
        const res = await fetch(`/.netlify/functions/getWordOfTheDay?level=${level}`); // Pass level
        if (!res.ok) {
            if (res.status === 404) { // Handle case where no more levels/words
                return null; // Indicate no more words
            }
            throw new Error(`Failed to fetch word for level ${level}`);
        }
        const { data } = await res.json(); // data = base64(IV + ciphertext)
        const plaintext = await decryptWord(data);
        return plaintext; // e.g. "BIRD"
    } catch (err) {
        console.error("Error fetching or decrypting word:", err);
        displayMessage("Could not load the next word. Please try refreshing.", "danger");
        return null; // Indicate failure
    }
}
function base64ToUint8Array(base64) {
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) {
        arr[i] = raw.charCodeAt(i);
    }
    return arr;
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
            `🎉 Congratulations, ${USERNAME}! You guessed "${targetWord}" in ${currentAttempts} tries! Level ${currentLevel} completed! 🎉`, // Updated message
            "success"
        );
        // After displaying the success message, record the result:
        const timeMs = Date.now() - startTime;
        postResult(USER_ID, currentAttempts, timeMs).then(() => {
            fetchAndRenderLeaderboard(); // Refresh leaderboard
        });

        submitGuessMobileButtonElement.disabled = true;
        letterInputElements.forEach((input) => (input.disabled = true));
        newGameButtonElement.textContent = "Next Level"; // Change button text
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
        triggerGraffitiAnimation(targetWord); // Win condition
    } else if (currentAttempts >= MAX_ATTEMPTS) {
        gameOver = true;
        displayMessage(
            `😥 Game Over, ${USERNAME}! The word was "${targetWord}". You reached Level ${currentLevel}.`, // Updated message
            "danger"
        );
        submitGuessMobileButtonElement.disabled = true;
        letterInputElements.forEach((input) => (input.disabled = true));
        newGameButtonElement.textContent = "Play Again (Level " + currentLevel + ")"; // Offer to replay current level
        newGameButtonElement.style.display = "block";
    } else {
        clearAndFocusInput();
    }
}

/**
 * Initialize/reset the game board for a new round or next level.
 */
async function initGame(advanceLevel = false) { // Added parameter to control level advancement
    if (advanceLevel) {
        currentLevel++;
    }
    localStorage.setItem("guessword_currentLevel", currentLevel.toString()); // Save currentLevel

    // Reset cheat mode when starting a new game/level
    cheatModeActive = false;
    const cheatWordBox = document.getElementById('cheat-word-box');
    if (cheatWordBox) {
        cheatWordBox.classList.remove('show');
    }

    targetWord = await fetchWordForLevel(currentLevel);

    if (!targetWord) { // Handle case where no more words/levels
        displayMessage(`🎉 Congratulations, ${USERNAME}! You have completed all available levels! 🎉`, "success");
        submitGuessMobileButtonElement.disabled = true;
        letterInputElements.forEach((input) => (input.disabled = true));
        newGameButtonElement.style.display = "none"; // Hide button or change to "Restart Game"
        // Potentially reset to level 1 or show a final message
        levelDisplayElement.textContent = "All Levels Cleared!";
        return;
    }

    levelDisplayElement.textContent = `Level: ${currentLevel}`; // Update level display

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
    newGameButtonElement.textContent = "Play Again (Same Word)"; // Reset button text for cases where it's shown before level completion (e.g. game over)


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
        localStorage.setItem("guessword_USER_ID", USER_ID); // Save USER_ID
        localStorage.setItem("guessword_USERNAME", USERNAME); // Save USERNAME
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

async function decryptWord(payloadBase64) {
    // 1) Convert the combined (IV + ciphertext) from base64 → Uint8Array
    const combined = base64ToUint8Array(payloadBase64);
    // 2) Extract the first 16 bytes as IV, the rest as ciphertext
    const iv = combined.slice(0, 16);
    const ciphertext = combined.slice(16);

    // 3) Convert the base64 secret key into a CryptoKey
    const base64Key = "sZWs+NciBq/DOwBm+csybg22zeVZTxTmatVHs+0cats=";
    // ──────────────────────────────────────────────────────────────────────────────
    //    IMPORTANT: Replace the string above with your actual WORD_SECRET_KEY (base64).
    //    e.g. const base64Key = "wJ8oX+KM2z9Gh+Yt2xJzI4eQfM3KTrhXH+VZ4a9M5g=";
    // ──────────────────────────────────────────────────────────────────────────────

    const rawKeyBytes = base64ToUint8Array(base64Key);
    const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        rawKeyBytes.buffer,
        { name: "AES-CBC", length: 256 },
        false,
        ["decrypt"]
    );

    // 4) Decrypt using WebCrypto:
    let decryptedBuffer;
    try {
        decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-CBC", iv: iv.buffer },
            cryptoKey,
            ciphertext.buffer
        );
    } catch (err) {
        console.error("Decryption failed:", err);
        throw new Error("Cannot decrypt word");
    }

    // 5) Convert ArrayBuffer → UTF-8 string
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(decryptedBuffer);
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
    // Try to load user data and level from localStorage
    const storedUserId = localStorage.getItem("guessword_USER_ID");
    const storedUsername = localStorage.getItem("guessword_USERNAME");
    const storedLevel = localStorage.getItem("guessword_currentLevel");

    if (storedUserId && storedUsername) {
        USER_ID = storedUserId;
        USERNAME = storedUsername;
        console.log("Loaded user from localStorage:", USERNAME, USER_ID);
    } else {
        await fetchUsername(); // Fetch new if not in localStorage
    }

    if (storedLevel) {
        currentLevel = parseInt(storedLevel, 10);
        if (isNaN(currentLevel) || currentLevel < 1) {
            currentLevel = 1; // Fallback if stored level is invalid
            localStorage.setItem("guessword_currentLevel", currentLevel.toString());
        }
        console.log("Loaded level from localStorage:", currentLevel);
    } else {
        localStorage.setItem("guessword_currentLevel", currentLevel.toString()); // Save initial level if not present
    }

    // Insert the level display element into the DOM, e.g., before the guess input area
    const guessInputArea = document.querySelector(".guess-input-submission-area");
    if (guessInputArea && guessInputArea.parentNode) {
        guessInputArea.parentNode.insertBefore(levelDisplayElement, guessInputArea);
    }
    await initGame(); // Initial game setup for level 1
    // Leaderboard is initially hidden, fetchAndRenderLeaderboard will be called by button
}

// ─── Section E: Event Listeners & Initialization ──────────────────────

// Auto-uppercase/tabbing, backspace handling, arrow keys, and Enter key
letterInputElements.forEach((input, index) => {
    // Improve mobile experience with touch events
    input.addEventListener("focus", () => {
        // Select all text when focused (better for mobile)
        setTimeout(() => {
            input.select();
        }, 10);
    });

    input.addEventListener("input", (e) => {
        // Convert to uppercase
        input.value = input.value.toUpperCase();

        // Move to next input if current one is filled and there's a next input
        if (input.value.length === 1 && index < letterInputElements.length - 1) {
            letterInputElements[index + 1].focus();
        }

        // If cheat mode was active, hide the cheat box when user starts typing a new guess
        if (cheatModeActive) {
            const cheatWordBox = document.getElementById('cheat-word-box');
            if (cheatWordBox) {
                cheatWordBox.classList.remove('show');
            }
            cheatModeActive = false;
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

// "Play Again" or "Next Level" button
newGameButtonElement.addEventListener("click", () => {
    // Check if the game was won by looking at the button's text, which is set accordingly
    if (gameOver && newGameButtonElement.textContent === "Next Level") {
        initGame(true); // Advance to next level
    } else {
        initGame(false); // Replay current level (e.g., after game over or if "Play Again" was clicked)
    }
});

// Toggle Leaderboard visibility and fetch data if showing
toggleLeaderboardButton.addEventListener("click", () => {
    const isHidden = leaderboardContainer.style.display === "none";
    if (isHidden) {
        leaderboardContainer.style.display = "block";
        leaderboardHr.style.display = "block";
        leaderboardTitle.style.display = "block";
        fetchAndRenderLeaderboard(); // Fetch and display when showing
        toggleLeaderboardButton.textContent = "Hide Leaderboard";
    } else {
        leaderboardContainer.style.display = "none";
        leaderboardHr.style.display = "none";
        leaderboardTitle.style.display = "none";
        toggleLeaderboardButton.textContent = "Show Leaderboard";
    }
});

// Add event listener for the instructions modal being shown
document.getElementById('instructionsModal').addEventListener('show.bs.modal', function () {
    // Check if the secret code DALI is entered
    if (checkSecretCode()) {
        cheatModeActive = true;
        const cheatWordBox = document.getElementById('cheat-word-box');
        cheatWordBox.textContent = `Current word: ${targetWord}`;
        cheatWordBox.classList.add('show');
    } else {
        // Make sure cheat box is hidden if code is not active
        const cheatWordBox = document.getElementById('cheat-word-box');
        cheatWordBox.classList.remove('show');
        cheatModeActive = false;
    }
});

// When DOM is ready, handle the splash screen
document.addEventListener("DOMContentLoaded", () => {
    // Hide graffiti overlay if somehow it's visible
    graffitiOverlayElement.classList.remove("show");
    document.body.classList.remove("no-scroll");
    handleSplashScreen();
});
