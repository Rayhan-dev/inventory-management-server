const express = require("express");
var cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aivdt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const bookCollection = client.db("inventoryDB").collection("books");
      
    //GET BOOKS 
    app.get("/books",async(req, res) => {
      const query = {};
      const cursor = bookCollection.find(query);
      const books =await cursor.toArray();
      res.send(books);
    });
    // Getting only 6 books for homepage
    app.get("/limitedBooks",async(req, res) => {
      const query = {};
      const cursor = bookCollection.find(query).limit(6);
      const books =await cursor.toArray();
      res.send(books);
    });
    //getting a single item for showing details
    app.get("/inventory/:id", async (req, res) => {
      const itemId = req.params.id;
      const query = { _id: ObjectId(`${itemId}`) };
      const item = await bookCollection.findOne(query);
      res.send(item);
    })
    //getting items that are more than 50 in stock
    app.get("/mostInStock", async (req, res) => {
      const query = { quantity: { $gt : "50" } };
      const cursor = bookCollection.find(query);
      const topBooks =await cursor.toArray();
      res.send(topBooks);
    })
    //udpadting quantity value in database
    app.put("/inventory/:id", async (req, res) => {
      const itemId = req.params.id;
      const updatedData = req.body.newItemValue.quantity;
      const filter = { _id: ObjectId(`${itemId}`) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updatedData
        },
      };
      const result = await bookCollection.updateOne(filter, updateDoc,options);
    })
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
