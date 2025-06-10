const crypto = require("crypto");

const FOUR_LETTER_WORDS = require("./utils/dictionary.json");
exports.handler = async function (event, context) {
    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // 1) Determine today's word exactly as before:
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based
    const day = now.getDate();
    const seed = year * 10000 + (month + 1) * 100 + day;
    const idx = seed % FOUR_LETTER_WORDS.length;
    const word = FOUR_LETTER_WORDS[idx].toUpperCase();

    // 2) Load the 32-byte AES key (base64) from env:
    const base64Key = process.env.WORD_SECRET_KEY;
    if (!base64Key) {
        console.error("WORD_SECRET_KEY not set");
        return { statusCode: 500, body: "Server misconfiguration" };
    }
    const key = Buffer.from(base64Key, "base64"); // 32 bytes

    // 3) Generate a random 16-byte IV:
    const iv = crypto.randomBytes(16);

    // 4) Encrypt with AES-256-CBC:
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(word, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // 5) Prepend IV (16 bytes) to ciphertext, then base64 the whole thing:
    const payload = Buffer.concat([iv, encrypted]).toString("base64");

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
    };
};