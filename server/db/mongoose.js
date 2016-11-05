const mongoose = require("mongoose");

// Configure Mongoose to use Promises
mongoose.Promise = global.Promise;

// Connect to database
mongoose.connect("mongodb://localhost:27017/TodoApp");

module.exports = { mongoose };
