const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

const _id = new ObjectID();
const access = "auth";
const token = jwt.sign({_id, access}, "secret_key").toString();

const users = [{
  // Valid user with tokens
  _id,
  username: "test_user_1",
  password: "123abc!",
  email: "test_user_1@example.com",
  tokens: [{
    access,
    token
  }]
}, {
  // Invalid user without tokens
  _id: new ObjectID(),
  username: "test_user_2",
  password: "456def?",
  email: "test_user_2@example.com"
}];

const populateUsers = done => {
  User.remove({}).then(() => {
    let user_1 = new User(users[0]).save();
    let user_2 = new User(users[1]).save();
    return Promise.all([user_1, user_2]);
  }).then(() => done());
}

module.exports = { users, populateUsers };
