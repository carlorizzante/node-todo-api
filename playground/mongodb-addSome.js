const MongoClient = require("mongodb").MongoClient;

const db_url = "mongodb://localhost:27017/TodoApp";

MongoClient.connect(db_url, (err, db) => {

  if (err) {
    console.log("Unable to connect to MongoDB server:", err);
    return;
  }

  console.log("Connected to MongoDB Server...");

  db.collection("Todos").insertOne({
    text: "Eat lunch",
    completed: true
  }, (err, result) => {
    if (err) return console.log("Unable to insert data:", err);
    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  // db.collection("Users").insertOne({
  //   name: "Jon",
  //   age: 16,
  //   location: "The Wall"
  // }, (err, result) => {
  //   if (err) return console.log("Unable to insert data:", err);
  //   console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
  // });

  db.close();
  console.log("Connection to database closed.");
});
