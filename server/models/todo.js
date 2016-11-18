const mongoose = require("mongoose");

const Todo = mongoose.model("Todo", {
 text: {
   type: String,
   required: true,
   minlength: 1,
   trim: true // trims white spaces at the beginning and end of the string
 },
 completed: {
   type: Boolean,
   default: false
 },
 completedAt: {
   type: Number,
   default: null
 },
 _creator: {
   type: mongoose.Schema.Types.ObjectId,
   required: true
 }
});

module.exports = { Todo };
