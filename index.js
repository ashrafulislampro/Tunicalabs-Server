const express = require("express");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

/* ----------------------------------- MONGO DB CLIENT SETUP --------------------------- */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q0pfb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


async function server () {
  try {
    await client.connect();
    const database = client.db(`${process.env.DB_NAME}`);
    const studentCollection = database.collection(`${process.env.DB_CONNECT}`);
    
    console.log("database is connected");
  
    // REQUEST POST A NEW STUDENT DATA
    app.post("/addEvent", async (req, res) => {
        const event = req.body;
        console.log(event);
        const result = await studentCollection.insertOne(event);
        res.json(result);
    })

    // REQUEST TO GET ALL STUDENTS
    app.get("/events", async (req, res) => {
        const result = await studentCollection.find({}).toArray();
        res.send(result);
    })

    //REQUST TO GET SINGLE DATA
    app.get("/singleData/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await studentCollection.findOne(query);
      res.send(result);
    }) 

  // REQUEST TO DELETE A STUDENT INFO
  app.delete("/remove_info/:id", async (req, res) =>{
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result = await studentCollection.deleteOne(query);
    res.json(result);
  });
  
  // REQUEST TO UPDATE A STUDENT INFO
  app.put("/update_info/:id", async (req, res) => {
    const id = req.params.id;
    const event = req.body;
    const query = {_id: ObjectId(id)};
    const options = {upsert: true};
    const update = {
      $set: {
        name: event.name,
        school: event.school,
        class: event.class,
        radio: event.radio,
        divison: event.divison,
        date: event.date
      }
    }
    const result = await studentCollection.updateOne(query, update, options);
    res.json(result);
  });

  // REQUEST FOR SEARCH FIELD DATA
  app.get("/search", async (req, res) =>{
    const value = req.query;
    const stData = await studentCollection.filter((data) =>{
      data.name.toLowerCase().includes(value.toLowerCase());
    })
    console.log(value);
    // res.send(stData);
  })
  
  } finally{
    // await client.close();
  }
}

server().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Tunicalabs Media Server");
});

app.listen(port, () => {
  console.log("Server running on", port);
});
