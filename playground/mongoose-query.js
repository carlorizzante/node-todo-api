const {ObjectID} = require("mongodb");

const {mongoose} = require("../server/db/mongoose");
// const {Todo} = require("../server/models/todo");
const {User} = require("../server/models/user");

// 58230ce05e4dd626c014b9c8
// const _id = "58230ce05e4dd626c014b9c8"; // Todo
const _id = "581c7ae4bc8f83042c142647"; // User

console.log(""); // give some space
// if (!ObjectID.isValid(_id)) return console.log("ID not valid");

// Todo.find({
//   _id
// }).then(todos => {
//   console.log("Find:", todos);
// });
//
// Todo.findOne({
//   _id
// }).then(todo => {
//   console.log("Find one:", todo);
// });

// Todo.findById(_id).then(todo => {
//   console.log("Find by id:", todo);
// }).catch(e => console.log(e));

User.findById(_id).then(user => {
  if (!user) return console.log("Not user found");
  console.log("User:", user);
}).catch(e => console.log("Invalid Id"));

console.log(""); // give some space
