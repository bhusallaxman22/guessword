// functions/recordResult.js
const { MongoClient, ObjectId } = require("mongodb");

exports.handler = async function (event, context) {
    // Only accept POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        return { statusCode: 500, body: "Missing MongoDB URI" };
    }

    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch {
        return {
            statusCode: 400,
            body: "Invalid JSON in request body",
        };
    }

    const { userId, attempts, timeMs } = payload;
    if (!userId || typeof attempts !== "number" || typeof timeMs !== "number") {
        return {
            statusCode: 400,
            body: "Missing or invalid fields (userId, attempts, timeMs)",
        };
    }

    let client;
    try {
        client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await client.connect();
        const db = client.db();

        const usersColl = db.collection("users");
        const resultsColl = db.collection("results");

        // Look up username
        const userDoc = await usersColl.findOne({ _id: new ObjectId(userId) });
        if (!userDoc) {
            await client.close();
            return {
                statusCode: 404,
                body: "User not found",
            };
        }

        // Insert result with username, attempts, timeMs, and timestamp
        await resultsColl.insertOne({
            userId: new ObjectId(userId),
            username: userDoc.username,
            attempts,
            timeMs,
            createdAt: new Date(),
        });

        await client.close();
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
            headers: { "Content-Type": "application/json" },
        };
    } catch (err) {
        console.error("recordResult error:", err);
        if (client) await client.close();
        return {
            statusCode: 500,
            body: "Internal Server Error",
        };
    }
};
