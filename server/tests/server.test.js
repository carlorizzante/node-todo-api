const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../server");
const { Todo } = require("../models/todo");

describe("POST /todos", () => {

  let todos_length;

  beforeEach(done => {
    Todo.find().then(todos => {
      todos_length = todos.length;
      done();
    });
  });

  // Clean up the entire database and add a single todo
  // afterEach(done => {
  //   Todo.remove({}).then(() => done());
  //   done();
  // });

  it("should create a new todo", done => {
    const text = "Server.test.js";

    request(app)
      .post("/todos")
      .send({text})
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) return done(err);
        Todo.find().then(todos => {
          expect(todos.length).toBe(todos_length + 1);
          expect(todos[todos_length].text).toBe(text);
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
          expect(todos.length).toBe(todos_length);
          done();
        }).catch(err => done(err));
      });
  });

});
