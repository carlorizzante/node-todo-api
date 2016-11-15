const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../server");
const { Todo } = require("../models/todo");

const test_todos = [{
  _id: new ObjectID(),
  text: "Hello from server.test.js"
}, {
  _id: new ObjectID(),
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
      .expect(200)
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

describe("GET /todo/:_id", () => {
  it("should find and return a todo by id", done => {
    const hexId = test_todos[0]._id.toHexString();
    // const _id = new ObjectID("58230ce05e4dd626c014b9c9"); // random valid _id
    request(app)
      .get(`/todo/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(hexId);
        expect(res.body.text).toBe(test_todos[0].text);
      })
      .end(done);
  });

  it("should return a 404 if todo not found", done => {
    const hexId = new ObjectID().toHexString();
    request(app)
      .get(`/todo/${hexId}`)
      .expect(404)
      .end(done);
  });

  it("should return a 400 if invalid id", done => {
    request(app)
      .get("/todo/INVALID_ID")
      .expect(400)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe("DELETE /todo/:_id", () => {
  it("should remove a todo", done => {
    const hexId = test_todos[0]._id.toHexString();
    request(app)
      .delete(`/todo/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toEqual(hexId);
      })
      .end((err, res) => {
        if (err) return done(err);

        Todo.findById(hexId).then(todo => {
          expect(todo).toNotExist();
          done();
        }).catch(e => done(e));
      });
  });

  it("should return 404 if todo no found", done => {
    const hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/todo/${hexId}`)
      .expect(404)
      .end(done);
  });

  it("should return 400 if invalid id", done => {
    request(app)
      .delete("/todo/INVALID_ID")
      .expect(400)
      .end(done);
  });
});
