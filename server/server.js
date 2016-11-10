const express = require("express");
const bodyParser = require("body-parser");
const {ObjectID} = require("mongodb");

const { mongoose } = require("./db/mongoose");
const { User } = require("./models/user");
const { Todo } = require("./models/todo");

const app = express();
const PORT = process.env.port || 3000;

app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  // console.log(req.body);
  const todo = new Todo({
    text: req.body.text
  });

  todo.save()
    .then( doc => {
      // console.log("Document saved");
      // console.log(JSON.stringify(doc, null, 2));
      res.status(201).send(doc);
    }, err => {
      // console.log("Unable to save document:");
      res.status(400).send(err);
    });
});

app.get("/todos", (req, res) => {
  const todos = Todo.find()
    .then( todos => {
      // console.log(counter++);
      // console.log(JSON.stringify(todos, null, 2));
      res.send({todos});
    }, err => {
      res.status(400).send(err);
    });
});

app.get("/todo/:_id", (req, res) => {
  const _id = req.params._id;
  if (!ObjectID.isValid(_id)) res.status(400).send("Bad request > Invalid ID");

  Todo.findById(_id).then(todo => {
    if (!todo) res.status(404).send("Not found.");
    res.status(200).send(todo);
  }).catch(e => {
    console.log(e);
    res.status(400).send("Some error occurred.");
  });
});

app.listen(PORT, () => {
  console.log(`Server listenig on port ${PORT}...`);
});

module.exports = { app };


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
