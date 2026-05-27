// ============================================
// DATABASE CONNECTION
// ============================================
// This file connects our server to MongoDB.
//
// HOW IT WORKS:
// - mongoose.connect() takes a "connection string" (URL to your database)
// - We read this URL from the .env file (so passwords aren't in the code)
// - If connection succeeds → we log a success message
// - If connection fails → we log the error and stop the server
// ============================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise, so we "await" it
    // This means: "wait until the connection is established before continuing"
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // process.exit(1) stops the server — we can't run without a database!
    process.exit(1);
  }
};

// "module.exports" makes this function available to other files
// Other files can do: const connectDB = require('./config/db')
module.exports = connectDB;
