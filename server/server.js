const express = require("express");
const bodyParser = require("body-parser");

const { mongoose } = require("./db/mongoose");
const { User } = require("./models/user");
const { Todo } = require("./models/todo");

const app = express();
const PORT = process.env.port || 3000;

app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  console.log(req.body);
  const todo = new Todo({
    text: req.body.text
  });
  todo.save()
    .then( doc => {
      console.log("Document saved");
      console.log(JSON.stringify(doc, null, 2));
      res.send(doc);
    }, err => {
      console.log("Unable to save document:", err);
      res.status(400).send(err);
    });
});

app.listen(PORT, () => {
  console.log(`Server listenig on port ${PORT}...`);
});


// const newTodo = new Todo({
//   text: "sdknfksd"
// });
//
// newTodo.save()
//   .then( doc => {
//     console.log(JSON.stringify(doc, null, 2));
//   }, err => {
//     console.log("Unable to save document:", err);
//   });
//
// const otherTodo = new Todo({
//   text: "nsdfksdfsld",
//   completed: true
// });
//
// otherTodo.save()
//   .then( doc => {
//     console.log(JSON.stringify(doc, null, 2));
//   }, err => {
//     console.log("Unable to save document:", err);
//   });



// const newUser = new User({
//   username: "janedove",
//   email: "jane@dove.com"
// });
//
// newUser.save()
//   .then( doc => {
//     console.log(JSON.stringify(doc, null, 2));
//   }, err => {
//     console.log("Unable to save document:", err);
//   });