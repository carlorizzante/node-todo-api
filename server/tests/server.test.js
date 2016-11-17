const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../server");
const { Todo } = require("../models/todo");
const { User } = require("../models/user");

const test_todos = [{
  _id: new ObjectID(),
  text: "Hello from server.test.js"
}, {
  _id: new ObjectID(),
  text: "Hello again from server.test.js",
  completed: true,
  completedAt: 333
}];

const test_users = [{
  _id: new ObjectID(),
  username: "test_user_1",
  password: "123",
  email: "test_1@example.com"
}, {
  _id: new ObjectID(),
  username: "test_user_2",
  password: "456",
  email: "test_2@example.com"
}];

beforeEach(done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(test_todos);
  }).then(() => done());
});

beforeEach(done => {
  User.remove({}).then(() => {
    return User.insertMany(test_users);
  }).then(() => done());
});

describe("POST /todo", () => {

  it("should create a new todo", done => {

    const text = "Server.test.js";

    request(app)
      .post("/todo")
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
      .post("/todo")
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
        done();
      }).catch(err => done(err));
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

describe("PATCH /todo/:_id", () => {
  it("should update the todo if completed", done => {

    const hexId = test_todos[0]._id.toHexString();
    const text = "Testing PATCH /todo/:_id";

    request(app)
      .patch(`/todo/${hexId}`)
      .send({"completed": true, text})
      .expect(200)
      .expect(res => {
        expect(res.body.completed).toBe(true);
        expect(res.body.text).toBe(text);
        expect(res.body.completedAt).toBeA("number");
      })
      .end(done);
  });

  it("shouod clear completedAt when todo not completed", done => {

    const hexId = test_todos[1]._id.toHexString();

    request(app)
      .patch(`/todo/${hexId}`)
      .send({"completed": false})
      .expect(200)
      .expect(res => {
        expect(res.body.completed).toBe(false);
        expect(res.body.completedAt).toNotExist();
      })
      .end(done);
  });

  it("should return 404 if todo no found", done => {

    const hexId = new ObjectID().toHexString();

    request(app)
      .patch(`/todo/${hexId}`)
      .expect(404)
      .end(done);
  });

  it("should return 400 if invalid id", done => {
    request(app)
      .patch("/todo/INVALID_ID")
      .expect(400)
      .end(done);
  });
})

describe("POST /user", () => {

  it("should save a new user", done => {

    const new_user = {
      username: "test_user_3",
      password: "789",
      email: "test_3@example.com"
    }

    request(app)
      .post("/user")
      .send(new_user)
      .expect(200)
      .expect(res => {
        expect(res.body.username).toBe(new_user.username);
        // expect(res.body.password).toBe(new_user.password); // password is no longer passed
        expect(res.body.email).toBe(new_user.email);
      }).end((err, res) => {
        if (err) return done(err);
        User.find({username: new_user.username}).then(users => {
          expect(users.length).toBe(1);
          expect(users[0].username).toBe(new_user.username);
          done();
        }).catch(err => done(err));
      });
  });

  it("should not save a duplicated username", done => {

    const new_user = {
      username: "test_user_1",
      password: "xxx",
      email: "xxx@example.com"
    }

    request(app)
      .post("/user")
      .send(new_user)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        User.find().then(users => {
          expect(users.length).toBe(2);
          done();
        }).catch(err => done(err));
      });
  });

  it("should not save a duplicated email", done => {

    const new_user = {
      username: "test_user_3",
      password: "xxx",
      email: "test_1@example.com"
    }

    request(app)
      .post("/user")
      .send(new_user)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        User.find().then(users => {
          expect(users.length).toBe(2);
          done();
        }).catch(err => done(err));
      });
  });
});

describe("GET /users", () => {
  it("should return all users in the db", done => {
    request(app)
      .get("/users")
      .expect(200)
      .expect(res => {
        expect(res.body.users.length).toBe(2);
        done();
      }).catch(err => done(err));
  });
});

describe("Get /user/:_id", () => {

  it("should get an user by ID", done => {

    const hexId = test_users[0]._id.toHexString();

    request(app)
      .get(`/user/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(hexId);
        expect(res.body.username).toBe(test_users[0].username);
        expect(res.body.email).toBe(test_users[0].email);
      }).end(done);
  });

  it("should return a 404 if user not found", done => {
    const hexId = new ObjectID().toHexString();
    request(app)
      .get(`/user/${hexId}`)
      .expect(404)
      .end(done);
  });

  it("should return a 400 if invalid id", done => {
    request(app)
      .get("/user/INVALID_ID")
      .expect(400)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe("Get /profile", () => {
  it("should return the current user by token");
});
