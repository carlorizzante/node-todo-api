const {SHA256} = require("crypto-js");
const jwt = require("jsonwebtoken");
const { ObjectID } = require("mongodb");

const _id = new ObjectID();

const data = {
  _id
}

const token = jwt.sign(data, "secret_key");

console.log("_id", _id);
console.log("token", token);

const decoded = jwt.verify(token, "secret_key");

console.log("decoded", decoded);

// const msg = "I am number one";
// const hash = SHA256(msg).toString();

// console.log(msg);
// console.log(hash);
