const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// Middleware
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}
app.use(cors(corsConfig))
app.use(express.json())


// mongoDb setup

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET}@cluster0.ufcjidc.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // Database collection 
    const shortQuestion = client.db("E-ExaminationPro").collection("shortQuestion");
    const fillInTheBlank = client.db("E-ExaminationPro").collection("fillInTheBlank")
    const subjectsCollection = client.db("E-ExaminationPro").collection("subjects")
    const testimonialCollection = client.db("E-ExaminationPro").collection("testimonials")
    const faqCollection = client.db("E-ExaminationPro").collection("faqs")
    const statisticsCollection = client.db("E-ExaminationPro").collection("statistics")


    app.get('/subjects', async(req, res) =>{
      const result = await subjectsCollection.find().toArray();
      res.send(result);
    })
  
    app.get('/testimonials', async(req, res) =>{
      const result = await testimonialCollection.find().toArray();
      res.send(result);
    })
    
    app.get('/faqs', async(req, res) =>{
      const result = await faqCollection.find().toArray();
      res.send(result);
    })
    
    app.get('/statistics', async(req, res) =>{
      const result = await statisticsCollection.find().toArray();
      res.send(result);
    })

    // get short question from database
    app.get('/shortQ', async(req, res) =>{
      const result = await shortQuestion.find().toArray();
      res.send(result);
    })

    // get fill in the blank question from database
    app.get('/blankQ', async(req, res) => {
      const result = await fillInTheBlank.find().toArray();
      res.send(result)
    })

    
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('E-examPro')
})

app.listen(port, () => {
  console.log(`E-examPro Server is running on port ${port}`)
})