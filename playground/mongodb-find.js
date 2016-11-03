const {MongoClient, ObjectID} = require("mongodb");

const db_url = "mongodb://localhost:27017/TodoApp";

MongoClient.connect(db_url, (err, db) => {

  if (err) {
    console.log("Unable to connect to MongoDB server:", err);
    return;
  }

  console.log("Connected to MongoDB Server...");

  // db.collection("Todos").find({
  //   _id: new ObjectID("5819c13d27753815d3a8cc27")
  // }).toArray()
  //   .then(docs => {
  //     console.log("Todos");
  //     console.log(JSON.stringify(docs, undefined, 2));
  //   }, err => {
  //     console.log("Unable to fetch todos:", err);
  //   });
  //
  // db.collection("Todos").find().count()
  //   .then(count => {
  //     console.log(`Todos count: ${count}`);
  //     // console.log(JSON.stringify(docs, undefined, 2));
  //   }, err => {
  //     console.log("Unable to fetch todos:", err);
  //   });

  db.collection("Users").find({
    age: 16
  }).toArray()
    .then(docs => {
      console.log("Users:");
      console.log(JSON.stringify(docs, null, 2));
    }, err => {
      console.log("ERROR", err);
    });

  db.close();
  // console.log("Connection to database closed.");
});
