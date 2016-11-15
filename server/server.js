const express = require("express");
const bodyParser = require("body-parser");
const {ObjectID} = require("mongodb");
const _ = require("lodash");

require("./server.config");
const { mongoose } = require("./db/mongoose");
const { User } = require("./models/user");
const { Todo } = require("./models/todo");

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  // console.log(req.body);
  const todo = new Todo({
    text: req.body.text
  });

  todo.save()
    .then( todo => {
      // console.log("Document saved");
      // console.log(JSON.stringify(todo, null, 2));
      res.status(200).send(todo);
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
  if (!ObjectID.isValid(_id)) return res.status(400).send("Bad request > Invalid ID");

  Todo.findById(_id).then(todo => {
    if (!todo) return res.status(404).end("Not found.");
    res.status(200).send(todo);
  }, err => {
    // Empty error handler, see catch below
  }).catch(e => {
    // console.log(e);
    res.status(400).send("Some error occurred.");
  });
});

app.delete("/todo/:_id", (req, res) => {
  const _id = req.params._id;
  if (!ObjectID.isValid(_id)) return res.status(400).send("Bad request > Invalid ID");

  Todo.findByIdAndRemove(_id).then(todo => {
    if (!todo) return res.status(404).end("Not found");
    res.status(200).send(todo);
  }, err => {
    // Empty error handler, see catch below
  }).catch(e => {
    res.status(400).send("Some error occurred.");
  });
});

app.patch("/todo/:_id", (req, res) => {
  const _id = req.params._id;
  const body = _.pick(req.body, ["text", "completed"]);

  if (!ObjectID.isValid(_id)) return res.status(400).send("bad request > Invalid ID");

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(_id, {$set: body}, {new: true, runValidators: true}).then(todo => {
    if (!todo) return res.status(404).send();
    res.status(200).send(todo);
  }).catch(e => {
    res.status(400).send();
  })
});

app.listen(port, () => {
  console.log(`Server listenig on port ${port}...`);
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
