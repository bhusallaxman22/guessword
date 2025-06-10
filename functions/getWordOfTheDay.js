const crypto = require("crypto");

const FOUR_LETTER_WORDS_ORIGINAL = require("./utils/dictionary.json");

// Shuffle the array to randomize level order (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const FOUR_LETTER_WORDS = shuffleArray([...FOUR_LETTER_WORDS_ORIGINAL]);


exports.handler = async function (event, context) {
    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // 1) Get level from query parameters
    const level = event.queryStringParameters && parseInt(event.queryStringParameters.level, 10);

    if (!level || level < 1) {
        return { statusCode: 400, body: "Missing or invalid level parameter" };
    }

    // 2) Determine the word for the given level
    const wordIndex = (level - 1) % FOUR_LETTER_WORDS.length;
    if (wordIndex < 0 || wordIndex >= FOUR_LETTER_WORDS.length) {
        return { statusCode: 404, body: "Word for the level not found or level out of bounds" };
    }
    const word = FOUR_LETTER_WORDS[wordIndex].toUpperCase();

    // 3) Load the 32-byte AES key (base64) from env:
    const base64Key = process.env.WORD_SECRET_KEY;
    if (!base64Key) {
        console.error("WORD_SECRET_KEY not set");
        return { statusCode: 500, body: "Server misconfiguration" };
    }
    const key = Buffer.from(base64Key, "base64"); // 32 bytes

    // 4) Generate a random 16-byte IV:
    const iv = crypto.randomBytes(16);

    // 5) Encrypt with AES-256-CBC:
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(word, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // 6) Prepend IV (16 bytes) to ciphertext, then base64 the whole thing:
    const payload = Buffer.concat([iv, encrypted]).toString("base64");

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload, level: level }),
    };
};