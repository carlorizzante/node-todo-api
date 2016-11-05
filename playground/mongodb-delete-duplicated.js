const {MongoClient, ObjectID} = require("mongodb");

const db_url = "mongodb://localhost:27017/TodoApp";

MongoClient.connect(db_url, (err, db) => {

  if (err) {
    console.log("Unable to connect to MongoDB server:", err);
    return;
  }

  console.log("Connected to MongoDB Server...");

  db.collection("Todos").find().toArray()
    .then(docs => {
      let duplicated_ids = docs.map(doc => {
        
      });
    });

  db.close();
  // console.log("Connection to database closed.");
});
