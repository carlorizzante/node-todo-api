const mongoose = require("mongoose");

// Configure Mongoose to use Promises
mongoose.Promise = global.Promise;

// Connect to database
const db_url = process.env.MONGODB_URI || "mongodb://localhost:27017/TodoApp";
mongoose.connect(db_url);

module.exports = { mongoose };
