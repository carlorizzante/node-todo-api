const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET;

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
  let token = jwt.sign({_id: user._id.toHexString(), access}, JWT_SECRET).toString();

  user.tokens.push({access, token});
  return user.save().then(() => {
    return token;
  });
}

UserSchema.methods.removeToken = function(token) {
  const user = this;
  return user.update({
    $pull: {
      tokens: { token }
    }
  });
}

UserSchema.statics.findByToken = function(token) {
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch(e) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    return Promise.reject("Authentication failed");
  }

  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
}

UserSchema.statics.findByCredentials = function(credentials) {
  const User = this;
  const username = credentials.username;
  const email = credentials.email;
  const password = credentials.password;
  let credential = {}
  if (username) credential = { username }
  if (email) credential = { email }

  return User.findOne(credential).then(user => {
    if (!user) return Promise.reject(404);
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (!res) return reject(400);
        return resolve(user);
      });
    });
  });
}

UserSchema.pre("save", function (next) {
  var user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(5, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };
