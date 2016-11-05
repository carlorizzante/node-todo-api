const { MongoClient, ObjectID } = require("mongodb");

const db_url = "mongodb://localhost:27017/TodoApp";

MongoClient.connect(db_url, (err, db) => {

  if (err) {
    console.log("Unable to connect to MongoDB server:", err);
    return;
  }

  console.log("Connected to MongoDB Server...");

  // db.collection("Todos").findOneAndUpdate(
  //   { _id: new ObjectID("5819c13d27753815d3a8cc27") },
  //   { $set: { completed: true }},
  //   { returnOriginal: false }
  // ).then(
  //   doc => {
  //     console.log(JSON.stringify(doc, null, 2));
  //   }
  // );

  db.collection("Users").findOneAndUpdate({
    _id: new ObjectID("5819fecfc3e51451a5649108")
  }, {
    $set: { name: "Aria" },
    $inc: { age: 2 }
    }, {
      returnOriginal: false
    }
  ).then(
    doc => {
      console.log(JSON.stringify(doc, null, 2));
    }
  );

  db.close();
  console.log("Connection to database closed.");
});
