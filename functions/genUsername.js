// functions/genUsername.js
const { MongoClient } = require("mongodb");

// Allow Netlify to wait for the lambda to finish
exports.handler = async function (event, context) {
    // Only allow GET
    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        return { statusCode: 500, body: "Missing MongoDB URI" };
    }

    let client;
    try {
        client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await client.connect();
        const db = client.db(); // default database from URI

        // Generate a random username, e.g. "User1234"
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const username = `User${randomNum}`;

        // Insert into a "users" collection
        const usersColl = db.collection("users");
        const now = new Date();
        const insertResult = await usersColl.insertOne({
            username,
            createdAt: now,
        });

        await client.close();

        return {
            statusCode: 200,
            body: JSON.stringify({
                userId: insertResult.insertedId.toString(),
                username,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (err) {
        console.error("genUsername error:", err);
        if (client) await client.close();
        return {
            statusCode: 500,
            body: "Internal Server Error",
        };
    }
};
