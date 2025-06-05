// functions/utils/db.js (optional)
const { MongoClient } = require("mongodb");

let cachedClient = null;

async function getDb() {
    if (cachedClient && cachedClient.isConnected && cachedClient.isConnected()) {
        return cachedClient.db();
    }
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    return client.db();
}

module.exports = { getDb };
