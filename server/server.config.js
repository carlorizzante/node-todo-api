process.env.PORT = process.env.PORT || 3000;
const env = process.env.NODE_ENV || "development";

switch (env) {

  case "development":
    process.env.MONGODB_URI = "mongodb://localhost:27017/TodoApp";
    break;

  case "test":
    process.env.MONGODB_URI = "mongodb://localhost:27017/TodoAppTEST";
    break;

  default:
    break;
}
