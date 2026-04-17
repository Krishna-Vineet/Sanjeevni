const app = require('../src/app');
const connectDB = require('../src/config/database');

// Vercel serverless function entry point
// Connect to DB and export the app
let cachedDb = null;

module.exports = async (req, res) => {
    if (!cachedDb) {
        cachedDb = await connectDB();
    }
    return app(req, res);
};
