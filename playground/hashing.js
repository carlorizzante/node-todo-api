const {SHA256} = require("crypto-js");
const jwt = require("jsonwebtoken");
const { ObjectID } = require("mongodb");
const bcrypt = require("bcryptjs");

const _id = new ObjectID();

const data = {
  _id
}

const token = jwt.sign(data, "secret_key");

// console.log("_id", _id);
// console.log("token", token);

const decoded = jwt.verify(token, "secret_key");

// console.log("decoded", decoded);

// const msg = "I am number one";
// const hash = SHA256(msg).toString();

// console.log(msg);
// console.log(hash);

const password = "123abc!";
bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log("hash", hash);

    bcrypt.compare(password, hash, (err, res) => {
      console.log(res);
    });
  });
});
