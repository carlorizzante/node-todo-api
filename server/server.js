const express = require("express");
const bodyParser = require("body-parser");
const {ObjectID} = require("mongodb");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

require("./server.config");
const { mongoose } = require("./db/mongoose");
const { User } = require("./models/user");
const { Todo } = require("./models/todo");
const { authenticate } = require("./middleware/authenticate");

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// ----------------------------
// Todos
// ----------------------------

app.post("/todo", (req, res) => {
  // console.log(req.body);
  const todo = new Todo({
    text: req.body.text
  });

  todo.save().then( todo => {
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
      res.status(200).send({todos});
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

// ----------------------------
// Users
// ----------------------------

app.post("/user", (req, res) => {
  const body = _.pick(req.body, ["username", "email", "password"]);
  const user = new User(body);

  user.save().then(() => {
    // console.log("Document saved");
    // console.log(JSON.stringify(user, null, 2));
    return user.generateAuthToken();
  }).then(token => {
    res.header("x-auth", token).status(200).send(user);
  }).catch(err => res.status(400).send(err));
});

app.get("/users", (req, res) => {
  const users = User.find()
    .then( users => {
      // console.log(JSON.stringify(users, null, 2));
      res.status(200).send({users});
    }, err => {
      if (e.code === 11000) { // 11000 is the error code for duplicated key
        res.status(400).send({message: 'An account already exists with that email.'});
      } else {
        res.status(400).send(e);
      }
    });
});

app.get("/user/:_id", (req, res) => {
  const _id = req.params._id;
  if (!ObjectID.isValid(_id)) return res.status(400).send("Bad request > Invalid ID");

  User.findById(_id).then(user => {
    if (!user) return res.status(404).end("User not found");
    res.status(200).send(user);
  }, err => {
    res.status(400).send(err);
  });
});

app.get("/profile", authenticate, (req, res) => {
  res.status(200).send(req.user);
});

app.post("/login", (req, res) => {
  const body = _.pick(req.body, ["username", "password", "email"]);
  const credentials = {
    username: body.username,
    password: body.password,
    email: body.email
  }

  User.findByCredentials(credentials).then(user => {
    // res.status(200).send(user);
    return user.generateAuthToken().then(token => {
      res.header("x-auth", token).send(user);
    });
  }).catch(err => {
    res.status(err).end();
  });

  // User.findOne({username: body.username}).then(user => {
  //   if (!user) return res.status(404).end("User not found");
  //   bcrypt.compare(body.password, user.password, (err, status) => {
  //     if (!status) return res.status(401).end();
  //     res.status(200).send(user);
  //   });
  // }, err => {
  //   res.status(400).send(err);
  // });
});

// ----------------------------
// Start the server
// ----------------------------

app.listen(port, () => {
  console.log(`Server listenig on port ${port}...`);
});

module.exports = { app }; // Allows testing with Expect and Supertest
