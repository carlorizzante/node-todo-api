const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../server");
const { Todo } = require("../models/todo");
const { User } = require("../models/user");
const { test_todos, populate_test_todos } = require("./seed_test_todos");
const { users, populateUsers } = require("./seed_test_users");

// -------------------------------
describe("\n TODOS \n", () => {
// -------------------------------

  beforeEach(populate_test_todos);

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
        .end(err => {
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
  });
});


// -------------------------------
describe("\n USERS \n", () => {
// -------------------------------

  beforeEach(populateUsers);

  describe("POST /user", () => {

    it("should create a new user", done => {
      const new_user = {
        username: "test_user_3",
        password: "789",
        email: "test_user_3@example.com"
      }
      request(app)
        .post("/user")
        .send(new_user)
        .expect(200)
        .expect(res => {
          expect(res.headers["x-auth"]).toExist();
          // console.log("header", res.header);
          // console.log("headers", res.headers);
          // expect(res.header).toNotEqual(res.headers);
          expect(res.body.username).toBe(new_user.username);
          expect(res.body.email).toBe(new_user.email);
          expect(res.body.password).toNotExist(); // Password needs to not be passed back
        }).end(err => {
          if (err) return done(err);
          User.find({username: new_user.username}).then(users => {
            expect(users.length).toBe(1);
            expect(users[0].username).toBe(new_user.username);
            expect(users[0].password).toNotBe(new_user.password);
            done();
          }).catch(err => done(err));
        });
    });

    it("should not create a new user if invalid email", done => {
      const new_user = {
        username: "test_user_3",
        password: "789",
        email: "example.com"
      }
      request(app)
        .post("/user")
        .send(new_user)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          User.find({username: new_user.username}).then(users => {
            expect(users.length).toBe(0);
            done();
          }).catch(err => done(err));
        });
    });

    it("should not create a new user if invalid password", done => {
      const new_user = {
        username: "test_user_3",
        password: "12",
        email: "test_user_3@example.com"
      }
      request(app)
        .post("/user")
        .send(new_user)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          User.find({username: new_user.username}).then(users => {
            expect(users.length).toBe(0);
            done();
          }).catch(err => done(err));
        });
    });

    it("should not create an user with duplicated username", done => {
      const new_user = {
        username: users[0].username,
        password: "135",
        email: "NEW_EMAIL@example.com"
      }
      request(app)
        .post("/user")
        .send(new_user)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          User.find({email: new_user.email}).then(users => {
            expect(users.length).toBe(0);
            done();
          }).catch(err => done(err));
        });
    });

    it("should not create a new user with duplicated email", done => {
      const new_user = {
        username: "UNUSED_USERNAME",
        password: "246",
        email: users[0].email
      }
      request(app)
        .post("/user")
        .send(new_user)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          User.find({username: new_user.username}).then(users => {
            expect(users.length).toBe(0);
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
      const hexId = users[0]._id.toHexString();
      request(app)
        .get(`/user/${hexId}`)
        .expect(200)
        .expect(res => {
          expect(res.body._id).toBe(hexId);
          expect(res.body.username).toBe(users[0].username);
          expect(res.body.email).toBe(users[0].email);
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
        }).end(done);
    });
  });

  describe("Get /profile", () => {

    it("should return current user if authenticated", done => {
      request(app)
        .get("/profile")
        .set("x-auth", users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.body._id).toBe(users[0]._id.toHexString());
          expect(res.body.username).toBe(users[0].username);
          expect(res.body.email).toBe(users[0].email);
          expect(res.body.password).toNotExist();
          done();
        }).catch(err => done(err));
    });

    it("should return 401 if current user not authenticated", done => {
      request(app)
      .get("/profile")
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      }).end(done);
    });

    it("should return 401 if invalid token", done => {
      request(app)
      .get("/profile")
      .set("x-auth", users[0].tokens[0].token + 1)
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      }).end(done);
    });

  });
});
