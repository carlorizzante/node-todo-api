const {ObjectID} = require("mongodb");

const {mongoose} = require("../server/db/mongoose");
const {Todo} = require("../server/models/todo");
const {User} = require("../server/models/user");

console.log(""); // give some space

// Remove all todos (empty query)
// Todo.remove({}).then(result => {
//   console.log(result);
// });

// Todo.findOneAndRemove({}).then(result => {
//
// });

Todo.findByIdAndRemove({
  _id: "58297a7fb87cc147a33ab446"
}).then(doc => {
  console.log(doc);
});

console.log(""); // give some space
