const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../server");
const { Todo } = require("../models/todo");

const test_todos = [{
  text: "Hello from server.test.js"
}, {
  text: "Hello again from server.test.js"
}];

beforeEach(done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(test_todos);
  }).then(() => done());
});

describe("POST /todos", () => {

  it("should create a new todo", done => {
    const text = "Server.test.js";

    request(app)
      .post("/todos")
      .send({text})
      .expect(201)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) return done(err);
        Todo.find({text}).then(todos => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          // console.log(todos[todos_length]._id);
          done();
        }).catch(err => done(err));
      });
  });

  it("should not create a new todo if invalid data", done => {
    const text = "";

    request(app)
      .post("/todos")
      .send({text})
      .expect(400) // Bad Request
      .end((err, res) => {
        if (err) return done(err);
        Todo.find().then(todos => {
          expect(todos.length).toBe(2);
          done();
        }).catch(err => done(err));
      });
  });
});

describe("GET /todos", () => {
  it("should return all todos in the db", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});
