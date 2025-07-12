// Constants for game settings
const MAX_ATTEMPTS = 8;
const WORD_LENGTH = 4;

// Game state
let targetWord = "";
let currentAttempts = 0;
let gameOver = false;
let startTime = 0;
let currentLevel = 1;
let cheatModeActive = false;
let difficulty = "medium"; // easy, medium, hard, raw

// Session / user info
let USER_ID = null;
let USERNAME = null;

// Current input state
let currentGuess = "";
let guessHistory = [];

// Keyboard feedback state
let correctLetters = new Set(); // Letters in correct position
let presentLetters = new Set(); // Letters in word but wrong position
let absentLetters = new Set(); // Letters not in word at all

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
const guessesHistoryElement = document.getElementById("guessesHistory");
const messageAreaElement = document.getElementById("messageArea");
const attemptsLeftElement = document.getElementById("attemptsLeft");
const newGameButtonElement = document.getElementById("newGameButton");
const levelDisplayElement = document.querySelector(".current-level-display");
const toggleLeaderboardButton = document.getElementById("toggleLeaderboardButton");
const toggleKeyboardButton = document.getElementById("toggleKeyboardButton");
const keyboardToggleText = document.getElementById("keyboardToggleText");
const leaderboardHr = document.getElementById("leaderboardHr");
const leaderboardTitle = document.getElementById("leaderboardTitle");
const leaderboardContainer = document.getElementById("leaderboard");
const difficultySelect = document.getElementById("difficultySelect");

// Graffiti overlay
const graffitiOverlayElement = document.createElement("div");
graffitiOverlayElement.id = "graffiti-overlay";
const graffitiTextElement = document.createElement("span");
graffitiTextElement.id = "graffiti-text";
graffitiOverlayElement.appendChild(graffitiTextElement);
document.body.appendChild(graffitiOverlayElement);

// Virtual keyboard state
const keyboardContainer = document.getElementById("virtual-keyboard");
let keyboardVisible = true;

// Utility Functions
function checkSecretCode() {
    const code = letterInputElements.map((input) => input.value.toUpperCase()).join("");
    return code === "DALI";
}

async function fetchWordForLevel(level) {
    try {
        const res = await fetch(`/.netlify/functions/getWordOfTheDay?level=${level}`);
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`Failed to fetch word for level ${level}`);
        }
        const { data } = await res.json();
        return await decryptWord(data);
    } catch (err) {
        console.error("Error fetching or decrypting word:", err);
        displayMessage("Could not load the next word. Please try refreshing.", "danger");
        return null;
    }
}

function base64ToUint8Array(base64) {
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
    return arr;
}

function calculateScores(guess, target) {
    let green = 0,
        yellow = 0;
    const n = target.length;
    const guessChars = guess.split(""),
        targetChars = target.split("");
    const usedTargetIndices = Array(n).fill(false),
        usedGuessIndices = Array(n).fill(false);

    // Greens
    for (let i = 0; i < n; i++) {
        if (guessChars[i] === targetChars[i]) {
            green++;
            usedTargetIndices[i] = usedGuessIndices[i] = true;
        }
    }
    // Yellows
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

function displayMessage(message, type = "info") {
    messageAreaElement.innerHTML = "";
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type === "info" ? "primary" : type} alert-dismissible fade show`;
    alertDiv.setAttribute("role", "alert");
    alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
    messageAreaElement.appendChild(alertDiv);
}

function clearMessage() {
    messageAreaElement.innerHTML = "";
}

function displayGuessInHistory(guess, scores) {
    const guessRow = document.createElement("div");
    guessRow.classList.add("guess-row");

    const wordDisplay = document.createElement("div");
    wordDisplay.classList.add("guessed-word-display");
    guess.split("").forEach((letter) => {
        const letterDiv = document.createElement("span");
        letterDiv.classList.add("letter-box");
        letterDiv.textContent = letter;
        wordDisplay.appendChild(letterDiv);
    });

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

function updateAttemptsDisplay() {
    attemptsLeftElement.textContent = MAX_ATTEMPTS - currentAttempts;
}

function clearAndFocusInput() {
    letterInputElements.forEach((input) => (input.value = ""));
    letterInputElements[0].focus();
}

// Render QWERTY keyboard
function renderKeyboard() {
    keyboardContainer.innerHTML = "";
    const rows = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
    ];
    rows.forEach((rowKeys) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "vk-row";
        rowKeys.forEach((key) => {
            const btn = document.createElement("button");
            btn.textContent = key;
            btn.setAttribute("data-key", key);

            // Apply keyboard feedback classes based on difficulty
            if (key !== "ENTER" && key !== "⌫" && difficulty !== "raw") {
                if (correctLetters.has(key)) {
                    btn.classList.add("key-correct");
                } else if (presentLetters.has(key)) {
                    btn.classList.add("key-present");
                } else if (absentLetters.has(key)) {
                    btn.classList.add("key-absent");
                }
            }

            if (key === "⌫") {
                btn.addEventListener("click", handleVirtualDelete);
            } else if (key === "ENTER") {
                btn.addEventListener("click", handleGuess);
            } else {
                btn.addEventListener("click", () => handleVirtualLetter(key));
            }
            rowDiv.appendChild(btn);
        });
        keyboardContainer.appendChild(rowDiv);
    });
}

function toggleKeyboard() {
    keyboardVisible = !keyboardVisible;

    if (keyboardVisible) {
        keyboardContainer.classList.remove("hidden");
        keyboardToggleText.textContent = "Hide Keyboard";
        document.body.classList.remove("keyboard-hidden");
    } else {
        keyboardContainer.classList.add("hidden");
        keyboardToggleText.textContent = "Show Keyboard";
        document.body.classList.add("keyboard-hidden");
    }

    // Save preference
    localStorage.setItem("guessword_keyboardVisible", keyboardVisible.toString());
}

function handleVirtualLetter(letter) {
    if (gameOver || currentGuess.length >= WORD_LENGTH) return;

    currentGuess += letter;

    // Update input elements for display
    if (currentGuess.length <= WORD_LENGTH) {
        letterInputElements[currentGuess.length - 1].value = letter;
    }
}

function handleVirtualDelete() {
    if (gameOver || currentGuess.length === 0) return;

    currentGuess = currentGuess.slice(0, -1);

    // Update input elements for display
    if (currentGuess.length < WORD_LENGTH) {
        letterInputElements[currentGuess.length].value = "";
    }
}

function triggerGraffitiAnimation(word) {
    graffitiTextElement.textContent = word;
    graffitiOverlayElement.classList.add("show");
    document.body.classList.add("no-scroll");
    setTimeout(() => {
        graffitiOverlayElement.classList.remove("show");
        document.body.classList.remove("no-scroll");
        displayMessage(
            `🎉 Congratulations, ${USERNAME}! You guessed "${targetWord}" in ${currentAttempts} tries! Level ${currentLevel} completed! 🎉`,
            "success"
        );
        const timeMs = Date.now() - startTime;
        postResult(USER_ID, currentAttempts, timeMs).then(fetchAndRenderLeaderboard);
        letterInputElements.forEach((input) => (input.disabled = true));
        newGameButtonElement.textContent = "Next Level";
        newGameButtonElement.style.display = "block";
    }, 2800);
}

function updateKeyboardFeedback(guess, scores) {
    if (difficulty === "raw") return; // No feedback for RAW mode

    const guessChars = guess.split("");
    const targetChars = targetWord.split("");

    // Track which letters are correct (green) and present (yellow)
    for (let i = 0; i < guessChars.length; i++) {
        const letter = guessChars[i];

        if (letter === targetChars[i]) {
            // Letter is in correct position
            correctLetters.add(letter);
            // Remove from present if it was there
            presentLetters.delete(letter);
        } else if (targetChars.includes(letter)) {
            // Letter is in word but wrong position
            if (!correctLetters.has(letter)) {
                presentLetters.add(letter);
            }
        }
    }

    // Handle absent letters based on difficulty
    if (difficulty === "easy") {
        // Easy: Grey out any letter not in the word
        for (const letter of guessChars) {
            if (!targetChars.includes(letter)) {
                absentLetters.add(letter);
            }
        }
    } else if (difficulty === "medium") {
        // Medium: Only grey out if ALL 4 letters of a guess are not in the word
        if (scores.green === 0 && scores.yellow === 0) {
            for (const letter of guessChars) {
                absentLetters.add(letter);
            }
        }
    } else if (difficulty === "hard") {
        // Hard: Only grey out letters that are confirmed not in the word
        for (const letter of guessChars) {
            if (!targetChars.includes(letter)) {
                absentLetters.add(letter);
            }
        }
    }

    // Re-render keyboard to apply visual feedback
    renderKeyboard();
}

async function handleGuess() {
    if (gameOver) return;
    clearMessage();

    const guess = currentGuess.toUpperCase();

    if (guess.length !== WORD_LENGTH) {
        displayMessage(`Your guess must be ${WORD_LENGTH} letters long. Please fill all boxes.`, "warning");
        return;
    }
    if (!/^[A-Z]+$/.test(guess)) {
        displayMessage("Your guess must contain only letters.", "warning");
        return;
    }

    currentAttempts++;
    const scores = calculateScores(guess, targetWord);

    // Display the guess in history with scores
    displayGuessInHistory(guess, scores);

    // Store the guess
    guessHistory.push({ guess, scores });

    // Update keyboard feedback based on difficulty
    updateKeyboardFeedback(guess, scores);

    updateAttemptsDisplay();

    // Clear the input for next guess
    currentGuess = "";
    letterInputElements.forEach(input => input.value = "");

    if (scores.green === WORD_LENGTH) {
        gameOver = true;
        triggerGraffitiAnimation(targetWord);
    } else if (currentAttempts >= MAX_ATTEMPTS) {
        gameOver = true;
        displayMessage(
            `😥 Game Over, ${USERNAME}! The word was "${targetWord}". You reached Level ${currentLevel}.`,
            "danger"
        );
        newGameButtonElement.textContent = "Play Again (Level " + currentLevel + ")";
        newGameButtonElement.style.display = "block";
    }
}

async function initGame(advanceLevel = false) {
    if (advanceLevel) currentLevel++;
    localStorage.setItem("guessword_currentLevel", currentLevel.toString());

    cheatModeActive = false;
    const cheatWordBox = document.getElementById("cheat-word-box");
    if (cheatWordBox) cheatWordBox.classList.remove("show");

    // Clear all keyboard feedback state
    correctLetters.clear();
    presentLetters.clear();
    absentLetters.clear();
    renderKeyboard();

    targetWord = await fetchWordForLevel(currentLevel);

    if (!targetWord) {
        displayMessage(`🎉 Congratulations, ${USERNAME}! You have completed all available levels! 🎉`, "success");
        newGameButtonElement.style.display = "none";
        levelDisplayElement.textContent = "All Levels Cleared!";
        return;
    }

    levelDisplayElement.textContent = `Level: ${currentLevel}`;
    currentAttempts = 0;
    currentGuess = "";
    guessHistory = [];
    gameOver = false;
    clearMessage();

    if (graffitiOverlayElement.classList.contains("show")) {
        graffitiOverlayElement.classList.remove("show");
        document.body.classList.remove("no-scroll");
    }

    // Clear guess history display
    guessesHistoryElement.innerHTML = "";

    // Clear input elements
    letterInputElements.forEach(input => input.value = "");

    updateAttemptsDisplay();
    newGameButtonElement.style.display = "none";
    newGameButtonElement.textContent = "Play Again (Same Word)";
    letterInputElements[0].focus();
    startTime = Date.now();
}

// Netlify-function interactions
async function fetchUsername() {
    try {
        const res = await fetch("/.netlify/functions/genUsername");
        if (!res.ok) throw new Error("Failed to get username");
        const data = await res.json();
        USER_ID = data.userId;
        USERNAME = data.username;
        localStorage.setItem("guessword_USER_ID", USER_ID);
        localStorage.setItem("guessword_USERNAME", USERNAME);
    } catch {
        USERNAME = "Anonymous";
    }
}

async function postResult(userId, attempts, timeMs) {
    try {
        await fetch("/.netlify/functions/recordResult", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, attempts, timeMs }),
        });
    } catch (err) {
        console.error("Error in postResult:", err);
    }
}

async function fetchAndRenderLeaderboard() {
    leaderboardContainer.innerHTML = "<p>Loading leaderboard…</p>";
    try {
        const res = await fetch("/.netlify/functions/getLeaderboard");
        if (!res.ok) throw new Error(`Leaderboard fetch failed: ${res.status}`);
        const { leaderboard } = await res.json();
        if (!leaderboard.length) {
            leaderboardContainer.innerHTML = "<p>No entries yet.</p>";
            return;
        }
        let html = `
      <table>
        <thead>
          <tr><th>Rank</th><th>Username</th><th>Attempts</th><th>Time (s)</th><th>Date</th></tr>
        </thead>
        <tbody>`;
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
          </tr>`;
        });
        html += `</tbody></table>`;
        leaderboardContainer.innerHTML = html;
    } catch (err) {
        leaderboardContainer.innerHTML = "<p>Unable to load leaderboard at this time.</p>";
        console.error(err);
    }
}

async function decryptWord(payloadBase64) {
    const combined = base64ToUint8Array(payloadBase64);
    const iv = combined.slice(0, 16),
        ciphertext = combined.slice(16);
    const base64Key = "sZWs+NciBq/DOwBm+csybg22zeVZTxTmatVHs+0cats=";
    const rawKeyBytes = base64ToUint8Array(base64Key);
    const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        rawKeyBytes.buffer,
        { name: "AES-CBC", length: 256 },
        false,
        ["decrypt"]
    );
    let decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-CBC", iv: iv.buffer },
        cryptoKey,
        ciphertext.buffer
    );
    return new TextDecoder("utf-8").decode(decryptedBuffer);
}

// Splash screen logic
function handleSplashScreen() {
    const alreadySeen = localStorage.getItem("guessword_firstLaunchDone");
    if (alreadySeen) {
        splashScreen.style.display = "none";
        gameContainer.style.display = "block";
        afterSplashInit();
    } else {
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

async function afterSplashInit() {
    const storedUserId = localStorage.getItem("guessword_USER_ID");
    const storedUsername = localStorage.getItem("guessword_USERNAME");
    const storedLevel = localStorage.getItem("guessword_currentLevel");
    const storedKeyboardVisible = localStorage.getItem("guessword_keyboardVisible");

    if (storedUserId && storedUsername) {
        USER_ID = storedUserId;
        USERNAME = storedUsername;
    } else {
        await fetchUsername();
    }
    if (storedLevel) {
        currentLevel = parseInt(storedLevel, 10);
        if (isNaN(currentLevel) || currentLevel < 1) {
            currentLevel = 1;
            localStorage.setItem("guessword_currentLevel", "1");
        }
    } else {
        localStorage.setItem("guessword_currentLevel", "1");
    }

    // Initialize difficulty from localStorage
    const storedDifficulty = localStorage.getItem("guessword_difficulty");
    if (storedDifficulty && ["easy", "medium", "hard", "raw"].includes(storedDifficulty)) {
        difficulty = storedDifficulty;
        difficultySelect.value = difficulty;
    } else {
        difficulty = "easy"; // default
        difficultySelect.value = difficulty;
        localStorage.setItem("guessword_difficulty", difficulty);
    }

    // Initialize keyboard visibility
    if (storedKeyboardVisible !== null) {
        keyboardVisible = storedKeyboardVisible === "true";
    }

    if (!keyboardVisible) {
        keyboardContainer.classList.add("hidden");
        keyboardToggleText.textContent = "Show Keyboard";
        document.body.classList.add("keyboard-hidden");
    }

    const guessInputArea = document.querySelector(".guess-input-submission-area");
    if (guessInputArea && guessInputArea.parentNode) {
        guessInputArea.parentNode.insertBefore(levelDisplayElement, guessInputArea);
    }
    await initGame();
}

// Input handlers
letterInputElements.forEach((input, index) => {
    input.addEventListener("focus", () => setTimeout(() => input.select(), 10));
    input.addEventListener("input", () => {
        const newValue = input.value.toUpperCase();
        input.value = newValue;

        // Update current guess
        currentGuess = letterInputElements.map(inp => inp.value).join("");

        if (newValue.length === 1 && index < letterInputElements.length - 1) {
            letterInputElements[index + 1].focus();
        }
        if (cheatModeActive) {
            const cb = document.getElementById("cheat-word-box");
            if (cb) cb.classList.remove("show");
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

// Add global keyboard listeners
document.addEventListener("keydown", (e) => {
    if (gameOver) return;

    // Handle letter keys
    if (/^[A-Za-z]$/.test(e.key)) {
        handleVirtualLetter(e.key.toUpperCase());
        e.preventDefault();
    }
    // Handle backspace
    else if (e.key === "Backspace") {
        handleVirtualDelete();
        e.preventDefault();
    }
    // Handle enter
    else if (e.key === "Enter") {
        handleGuess();
        e.preventDefault();
    }
    // Toggle keyboard shortcut
    else if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        toggleKeyboard();
        e.preventDefault();
    }
});

newGameButtonElement.addEventListener("click", () => {
    if (gameOver && newGameButtonElement.textContent === "Next Level") {
        initGame(true);
    } else {
        initGame(false);
    }
});

toggleLeaderboardButton.addEventListener("click", () => {
    const isHidden = leaderboardContainer.style.display === "none";
    if (isHidden) {
        leaderboardContainer.style.display = "block";
        leaderboardHr.style.display = "block";
        leaderboardTitle.style.display = "block";
        fetchAndRenderLeaderboard();
        toggleLeaderboardButton.textContent = "Hide Leaderboard";
    } else {
        leaderboardContainer.style.display = "none";
        leaderboardHr.style.display = "none";
        leaderboardTitle.style.display = "none";
        toggleLeaderboardButton.textContent = "Show Leaderboard";
    }
});

toggleKeyboardButton.addEventListener("click", toggleKeyboard);

// Add difficulty select change handler
difficultySelect.addEventListener("change", (e) => {
    difficulty = e.target.value;
    // Clear keyboard feedback state when difficulty changes
    correctLetters.clear();
    presentLetters.clear();
    absentLetters.clear();
    // Re-render keyboard to remove any existing feedback
    renderKeyboard();
    // Save difficulty preference
    localStorage.setItem("guessword_difficulty", difficulty);
});

document.getElementById("instructionsModal").addEventListener("show.bs.modal", function () {
    if (checkSecretCode()) {
        cheatModeActive = true;
        const cheatWordBox = document.getElementById("cheat-word-box");
        cheatWordBox.textContent = `Current word: ${targetWord}`;
        cheatWordBox.classList.add("show");
    } else {
        const cheatWordBox = document.getElementById("cheat-word-box");
        cheatWordBox.classList.remove("show");
        cheatModeActive = false;
    }
});

// Add keyboard shortcuts for better accessibility
document.addEventListener("keydown", (e) => {
    // Toggle keyboard with Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        toggleKeyboard();
    }

    // Submit guess with Enter
    if (e.key === "Enter" && !gameOver) {
        e.preventDefault();
        handleGuess();
    }

    // Clear input with Escape
    if (e.key === "Escape" && !gameOver) {
        e.preventDefault();
        clearAndFocusInput();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    graffitiOverlayElement.classList.remove("show");
    document.body.classList.remove("no-scroll");
    renderKeyboard();
    handleSplashScreen();
});
