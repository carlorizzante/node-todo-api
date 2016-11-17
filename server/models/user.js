const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username required"],
    trim: true,
    minlength: 3,
    unique: true
  },
  email: {
    type: String,
    required: [true, "Email required"],
    trim: true,
    minlength: 8,
    unique: true,
    validate: {
      // validator: value => validator.isEmail(value),
      validator: validator.isEmail, // same as above, skipping the container fn
      message: "{VALUE} is not a valid email"
    }
  },
  password: {
    type: String,
    required: [true, "Password required"],
    trim: true,
    minlength: 3,
    // validate: {
    //   validator: validator.isString,
    //   message: "{VALUE} is not a valid password"
    // }
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ["_id", "username", "email"]);
}

UserSchema.methods.generateAuthToken = function() {
  let user = this;
  const access = "auth";
  let token = jwt.sign({_id: user._id.toHexString(), access}, "secret_key").toString();

  user.tokens.push({access, token});
  return user.save().then(() => {
    return token;
  });
}

const User = mongoose.model("User", UserSchema);

module.exports = { User };
