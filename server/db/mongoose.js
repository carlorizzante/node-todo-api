const mongoose = require("mongoose");

// Configure Mongoose to use Promises
mongoose.Promise = global.Promise;

// Connect to database
mongoose.connect(process.env.MONGODB_URI);

module.exports = { mongoose };
