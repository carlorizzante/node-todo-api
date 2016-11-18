const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");

const { Todo } = require("../models/todo");
const { User } = require("../models/user");

const _id_one = new ObjectID();
const _id_two = new ObjectID();
const access = "auth";

const test_users = [{
  // Valid user with tokens
  _id: _id_one,
  username: "test_user_1",
  password: "123abc!",
  email: "test_user_1@example.com",
  tokens: [{
    access,
    token: jwt.sign({_id: _id_one, access}, "secret_key").toString()
  }]
}, {
  // Invalid user without tokens
  _id: _id_two,
  username: "test_user_2",
  password: "456def?",
  email: "test_user_2@example.com",
  tokens: [{
    access,
    token: jwt.sign({_id: _id_two, access}, "secret_key").toString()
  }]
}];

const test_todos = [{
  _id: new ObjectID(),
  text: "Hello from server.test.js",
  _creator: test_users[0]._id
}, {
  _id: new ObjectID(),
  text: "Hello again from server.test.js",
  completed: true,
  completedAt: 333,
  _creator: test_users[1]._id
}];

const populateUsers = done => {
  User.remove({}).then(() => {
    let user_1 = new User(test_users[0]).save();
    let user_2 = new User(test_users[1]).save();
    return Promise.all([user_1, user_2]);
  }).then(() => done());
}

const populateTodos = done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(test_todos);
  }).then(() => done());
}

module.exports = { test_users, test_todos, populateUsers, populateTodos };
