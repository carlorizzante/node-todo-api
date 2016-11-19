const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../server");
const { Todo } = require("../models/todo");
const { User } = require("../models/user");
const { test_users, test_todos, populateUsers, populateTodos } = require("./seed");

// -------------------------------
describe("TODOS............ \n", () => {
// -------------------------------

  // Creates set of todos and users at the same time
  // because we need the correct _ids and tokens
  beforeEach(populateTodos);
  beforeEach(populateUsers);

  describe("POST /todo", () => {

    it("should create a new todo", done => {
      const text = "Server.test.js";
      request(app)
        .post("/todo")
        .set("x-auth", test_users[0].tokens[0].token)
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
        .set("x-auth", test_users[0].tokens[0].token)
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

    it("should return todos created by current user", done => {
      request(app)
        .get("/todos")
        .set("x-auth", test_users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.body.todos.length).toBe(1);
          done();
        }).catch(err => done(err));
    });
  });

  describe("GET /todo/:_id", () => {

    it("should find and return todo by id", done => {
      const hexId = test_todos[0]._id.toHexString();
      request(app)
        .get(`/todo/${hexId}`)
        .set("x-auth", test_users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.body._id).toBe(hexId);
          expect(res.body.text).toBe(test_todos[0].text);
          done();
        }).catch(err => done(err));
    });

    it("should not return todo created by another user", done => {
      const hexId = test_todos[0]._id.toHexString();
      request(app)
        .get(`/todo/${hexId}`)
        .set("x-auth", test_users[1].tokens[0].token)
        .expect(404)
        .expect(res => {
          expect(res.body).toEqual({});
          done();
        }).catch(err => done(err));
    });

    it("should return a 404 if todo not found", done => {
      const hexId = new ObjectID().toHexString();
      request(app)
        .get(`/todo/${hexId}`)
        .set("x-auth", test_users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it("should return a 400 if invalid id", done => {
      request(app)
        .get("/todo/INVALID_ID")
        .set("x-auth", test_users[0].tokens[0].token)
        .expect(400)
        .expect(res => {
          expect(res.body).toEqual({});
          done();
        }).catch(err => done(err));
    });

    it("should return a 401 if not authorized (not logged in)", done => {
      request(app)
        .get("/todo/INVALID_ID")
        .expect(401)
        .expect(res => {
          expect(res.body).toEqual({});
          done();
        }).catch(err => done(err));
    });
  });

  describe("DELETE /todo/:_id", () => {

    it("should remove a todo", done => {
      const hexId = test_todos[0]._id.toHexString();
      request(app)
        .delete(`/todo/${hexId}`)
        .set("x-auth", test_users[0].tokens[0].token)
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

    it("should not remove todo created by other user", done => {
      const hexId = test_todos[0]._id.toHexString();
      request(app)
        .delete(`/todo/${hexId}`)
        .set("x-auth", test_users[1].tokens[0].token)
        .expect(404)
        .expect(res => {
          expect(res.body).toEqual({});
        })
        .end((err, res) => {
          if (err) return done(err);
          Todo.findById(hexId).then(todo => {
            expect(todo).toExist();
            done();
          }).catch(e => done(e));
        });
    });

    it("should return 404 if todo no found", done => {
      const hexId = new ObjectID().toHexString();
      request(app)
        .delete(`/todo/${hexId}`)
        .set("x-auth", test_users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it("should return 400 if invalid id", done => {
      request(app)
        .delete("/todo/INVALID_ID")
        .set("x-auth", test_users[0].tokens[0].token)
        .expect(400)
        .end(done);
    });
  });

  describe("PATCH /todo/:_id", () => {

    it("should update todo text", done => {
      const hexId = test_todos[0]._id.toHexString();
      const text = "Testing PATCH /todo/:_id";
      request(app)
        .patch(`/todo/${hexId}`)
        .set("x-auth", test_users[0].tokens[0].token)
        .send({text})
        .expect(200)
        .expect(res => {
          expect(res.body.text).toBe(text);
          expect(res.body.completed).toNotBe();
          done();
        }).catch(err => done(err));
    });

    it("should update todo if completed", done => {
      const hexId = test_todos[0]._id.toHexString();
      request(app)
        .patch(`/todo/${hexId}`)
        .set("x-auth", test_users[0].tokens[0].token)
        .send({"completed": true})
        .expect(200)
        .expect(res => {
          expect(res.body.text).toBe(test_todos[0].text);
          expect(res.body.completed).toBe(true);
          expect(res.body.completedAt).toBeA("number");
          done();
        }).catch(err => done(err));
    });

  it("should not update todo created by other user", done => {
      const hexId = test_todos[1]._id.toHexString();
      const text = "Unauthorized change";
      request(app)
        .patch(`/todo/${hexId}`)
        .set("x-auth", test_users[0].tokens[0].token)
        .send({"completed": true, text})
        .expect(404)
        .expect(res => {
          expect(res.body).toEqual({});
        })
        .end((err, res) => {
          if (err) return done(err);
          Todo.findById(hexId).then(todo => {
            expect(todo.text).toBe(test_todos[1].text)
            expect(todo.completed).toBe(test_todos[1].completed);
            done();
          }).catch(err => done(err));
        });
    });

    it("should clear completedAt when todo not completed", done => {
      const hexId = test_todos[0]._id.toHexString();
      request(app)
        .patch(`/todo/${hexId}`)
        .send({"completed": false})
        .set("x-auth", test_users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.body.completed).toBe(false);
          expect(res.body.completedAt).toNotExist();
          done();
        }).catch(err => done(err));
    });

    it("should not clear todo created by other user", done => {
      const hexId = test_todos[1]._id.toHexString();
      request(app)
        .patch(`/todo/${hexId}`)
        .send({"completed": false})
        .set("x-auth", test_users[0].tokens[0].token)
        .expect(404)
        .expect(res => {
          expect(res.body).toEqual({});
        })
        .end((err, res) => {
          if (err) return done(err);
          Todo.findById(hexId).then(todo => {
            expect(todo._id.toHexString()).toBe(hexId);
            done();
          }).catch(err => done(err));
        });
    });

    it("should return 404 if todo no found", done => {
      const hexId = new ObjectID().toHexString();
      request(app)
        .patch(`/todo/${hexId}`)
        .set("x-auth", test_users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it("should return 400 if invalid id", done => {
      request(app)
        .patch("/todo/INVALID_ID")
        .set("x-auth", test_users[0].tokens[0].token)
        .expect(400)
        .end(done);
    });
  });
});


// -------------------------------
describe("USERS............ \n", () => {
// -------------------------------

  // To test users we need to create only dummy users, no todos
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
        username: test_users[0].username,
        password: "135",
        email: "NEW_EMAIL@example.com"
      }
      request(app)
        .post("/user")
        .send(new_user)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          User.find({}).then(users => {
            expect(users.length).toBe(2);
            done();
          }).catch(err => done(err));
        });
    });

    it("should not create a new user with duplicated email", done => {
      const new_user = {
        username: "NEW_USERNAME",
        password: "246",
        email: test_users[0].email
      }
      request(app)
        .post("/user")
        .send(new_user)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          User.find({}).then(users => {
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
          done();
        }).catch(err => done(err));
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
          done();
        }).catch(err => done(err));
    });
  });

  describe("Get /profile", () => {

    it("should return current user if authenticated", done => {
      request(app)
        .get("/profile")
        .set("x-auth", test_users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.body._id).toBe(test_users[0]._id.toHexString());
          expect(res.body.username).toBe(test_users[0].username);
          expect(res.body.email).toBe(test_users[0].email);
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
          done();
        }).catch(err => done(err));
    });

    it("should return 401 if invalid token", done => {
      request(app)
        .get("/profile")
        .set("x-auth", test_users[0].tokens[0].token + 1)
        .expect(401)
        .expect(res => {
          expect(res.body).toEqual({});
          done();
        }).catch(err => done(err));
    });
  });

  describe("POST /login", () => {

    it("should login user and return auth-token if valid username", done => {
      const login_user = {
        username: test_users[0].username,
        password: test_users[0].password
      }
      request(app)
        .post("/login")
        .send(login_user)
        .expect(200)
        .expect(res => {
          expect(res.headers["x-auth"]).toExist();
          expect(res.body).toEqual({});
        })
        .end((err, res) => {
          if (err) return done(err);
          User.findById(test_users[0]._id).then(user => {
            expect(user.tokens[1]).toInclude({
              access: "auth",
              token: res.headers["x-auth"]
            });
            done();
          }).catch(err => done(err));
        });
    });

    it("should login user and return auth-token if valid email", done => {
      const login_user = {
        email: test_users[1].email,
        password: test_users[1].password
      }
      request(app)
        .post("/login")
        .send(login_user)
        .expect(200)
        .expect(res => {
          expect(res.headers["x-auth"]).toExist();
          expect(res.body).toEqual({});
        })
        .end((err, res) => {
          if (err) return done(err);
          User.findById(test_users[1]._id).then(user => {
            expect(user.tokens[1]).toInclude({
              access: "auth",
              token: res.headers["x-auth"]
            });
            done();
          }).catch(err => done(err));
        });
    });

    it("should reject login (404) if invalid username", done => {
      const login_user = {
        username: "INVALID_USERNAME",
        password: test_users[0].password
      }
      request(app)
        .post("/login")
        .send(login_user)
        .expect(404)
        .expect(res => {
          expect(res.headers["x-auth"]).toNotExist();
          expect(res.body).toEqual({});
          done();
        }).catch(err => done(err));
    });

    it("should reject login (404) if invalid email", done => {
      const login_user = {
        email: "INVALID_EMAIL",
        password: test_users[0].password
      }
      request(app)
        .post("/login")
        .send(login_user)
        .expect(404)
        .expect(res => {
          expect(res.headers["x-auth"]).toNotExist();
          expect(res.body).toEqual({});
          done();
        }).catch(err => done(err));
    });

    it("should reject login (400) if invalid password", done => {
      const login_user = {
        username: test_users[1].username,
        password: "INVALID_PASSWORD"
      }
      request(app)
        .post("/login")
        .send(login_user)
        .expect(400)
        .expect(res => {
          expect(res.headers["x-auth"]).toNotExist();
          expect(res.body).toEqual({});
        })
        .end((err, res) => {
          if (err) return done(err);
          User.findById(test_users[1]._id).then(user => {
            expect(user.tokens.length).toBe(1);
            done();
          }).catch(err => done(err));
        });
    });

    it("should return 400 if no credentials", done => {
      request(app)
        .post("/login")
        .expect(400)
        .expect(res => {
          expect(res.headers["x-auth"]).toNotExist();
          expect(res.body).toEqual({});
          done();
        }).catch(err => done(err));
    });
  });

  describe("DELETE /logout", () => {

    it("should remove auth token on logout", done => {
      request(app)
        .delete("/logout")
        .set("x-auth", test_users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.headers["x-auth"]).toNotExist();
        })
        .end((err, res) => {
          if (err) done(err);
          User.findById(test_users[0]._id).then(user => {
            expect(user.tokens[0]).toNotExist();
            expect(user.tokens.length).toBe(0);
            done();
          }).catch(err => done(err));
        });
      });

  });
});
