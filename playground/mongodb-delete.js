const {MongoClient, ObjectID} = require("mongodb");

const db_url = "mongodb://localhost:27017/TodoApp";

MongoClient.connect(db_url, (err, db) => {

  if (err) {
    console.log("Unable to connect to MongoDB server:", err);
    return;
  }

  console.log("Connected to MongoDB Server...");

  // deleteMany
  // db.collection("Todos").deleteMany({
  //   text: "Eat lunch"
  // }).then(results => {
  //   console.log(JSON.stringify(results, undefined, 2));
  //   // console.log(result);
  // });

  // deleteOne
  // db.collection("Todos").deleteOne({
  //   text: "Eat lunch"
  // }).then(results => {
  //   console.log(JSON.stringify(results, undefined, 2));
  //   // console.log(result);
  // });

  // findOneAndDelete
  db.collection("Todos").findOneAndDelete({
    text: "Eat lunch"
  }).then(results => {
    console.log(JSON.stringify(results, undefined, 2));
    // console.log(result);
  });

  db.close();
  // console.log("Connection to database closed.");
});
