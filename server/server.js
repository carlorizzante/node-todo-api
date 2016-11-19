const express = require("express");
const bodyParser = require("body-parser");
const {ObjectID} = require("mongodb");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

require("./config");

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

// Creates a new todo
app.post("/todo", authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  todo.save().then( todo => {
    res.status(200).send(todo);
  }, err => {
    res.status(400).send(err);
  });
});

// Returns all todos
app.get("/todos", authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then( todos => {
      res.status(200).send({todos});
    }, err => {
      res.status(400).send(err);
    });
});

// Returns a specific todo by _id
app.get("/todo/:_id", authenticate, (req, res) => {
  const _id = req.params._id;
  if (!ObjectID.isValid(_id)) return res.status(400).send("Bad request > Invalid ID");
  Todo.findOne({
    _id,
    _creator: req.user._id
  }).then(todo => {
    if (!todo) return res.status(404).send("Not found.");
    res.status(200).send(todo);
  }, err => {
    // Empty error handler, see catch below
  }).catch(e => {
    res.status(400).send("Some error occurred.");
  });
});

// Deletes a specific todo by _id
app.delete("/todo/:_id", authenticate, (req, res) => {
  const _id = req.params._id;
  if (!ObjectID.isValid(_id)) return res.status(400).send("Bad request > Invalid ID");
  Todo.findOneAndRemove({
    _id,
    _creator: req.user._id
  }).then(todo => {
    if (!todo) return res.status(404).send("Not found");
    res.status(200).send(todo);
  }, err => {
    // Empty error handler, see catch below
  }).catch(e => {
    res.status(400).send("Some error occurred.");
  });
});

// Updates a specific todo by _id
app.patch("/todo/:_id", authenticate, (req, res) => {
  const _id = req.params._id;
  const body = _.pick(req.body, ["text", "completed"]);
  if (!ObjectID.isValid(_id)) return res.status(400).send("bad request > Invalid ID");
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
  Todo.findOneAndUpdate({
    _id,
    _creator: req.user._id
  }, {$set: body}, {new: true, runValidators: true}).then(todo => {
    if (!todo) return res.status(404).send();
    res.status(200).send(todo);
  }).catch(e => {
    res.status(400).send();
  })
});

// ----------------------------
// Users
// ----------------------------

// Creates a new user
app.post("/user", (req, res) => {
  const body = _.pick(req.body, ["username", "email", "password"]);
  const user = new User(body);
  // const verify_username = new User.findOne({
  //   username: body.username
  // });
  // const verify_email = new User.findOne({
  //   username: body.email
  // });
  // return Promise.race([verify_username, verify_email]).then((resolve, reject) => {
  //   return reject("Username or password already taken.");
  // });
  user.save().then(() => {
    return user.generateAuthToken();
  }).then(token => {
    res.header("x-auth", token).status(200).send(user);
  }).catch(err => res.status(400).send(err));
});

// Returns all users
app.get("/users", (req, res) => {
  const users = User.find()
    .then( users => {
      res.status(200).send({users});
    }, err => {
      if (e.code === 11000) { // 11000 is the error code for duplicated key
        res.status(400).send({message: 'An account already exists with that email.'});
      } else {
        res.status(400).send(e);
      }
    });
});

// Returns a specific user by _id
app.get("/user/:_id", (req, res) => {
  const _id = req.params._id;
  if (!ObjectID.isValid(_id)) return res.status(400).send("Bad request > Invalid ID");
  User.findById(_id).then(user => {
    if (!user) return res.status(404).send("User not found");
    res.status(200).send(user);
  }, err => {
    res.status(400).send(err);
  });
});

// Returns profile for current user
app.get("/profile", authenticate, (req, res) => {
  res.status(200).send(req.user);
});

// Login for current user
app.post("/login", (req, res) => {
  const body = _.pick(req.body, ["username", "password", "email"]);
  const credentials = {
    username: body.username,
    password: body.password,
    email: body.email
  }

  User.findByCredentials(credentials).then(user => {
    return user.generateAuthToken().then(token => {
      res.header("x-auth", token).send();
    });
  }).catch(err => {
    res.status(err).send();
  });
});

// Logout for current user
app.delete("/logout", authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, err => {
    res.status(400).send();
  });
});

// ----------------------------
// Start up the server
// ----------------------------

app.listen(port, () => {
  console.log(`Server listenig on port ${port}...\n`);
});

module.exports = { app }; // Allows testing with Expect and Supertest
