const { ObjectID } = require("mongodb");

const { Todo } = require("../models/todo");

const test_todos = [{
  _id: new ObjectID(),
  text: "Hello from server.test.js"
}, {
  _id: new ObjectID(),
  text: "Hello again from server.test.js",
  completed: true,
  completedAt: 333
}];

const populate_test_todos = done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(test_todos);
  }).then(() => done());
}

module.exports = { test_todos, populate_test_todos };
