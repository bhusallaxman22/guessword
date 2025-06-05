// functions/getLeaderboard.js
const { MongoClient } = require("mongodb");

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
        const db = client.db();
        const resultsColl = db.collection("results");

        // Sort by attempts ascending, then timeMs ascending, limit to top 10
        const topResults = await resultsColl
            .find({})
            .sort({ attempts: 1, timeMs: 1 })
            .limit(10)
            .project({ _id: 0, username: 1, attempts: 1, timeMs: 1, createdAt: 1 })
            .toArray();

        await client.close();

        return {
            statusCode: 200,
            body: JSON.stringify({ leaderboard: topResults }),
            headers: { "Content-Type": "application/json" },
        };
    } catch (err) {
        console.error("getLeaderboard error:", err);
        if (client) await client.close();
        return {
            statusCode: 500,
            body: "Internal Server Error",
        };
    }
};
