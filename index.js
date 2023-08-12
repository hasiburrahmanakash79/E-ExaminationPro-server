import express, { json } from "express";
import cors from "cors";
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middleware
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}
app.use(cors(corsConfig))
app.use(express.json())


// mongo setup

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET}@cluster0.ufcjidc.mongodb.net/?retryWrites=true&w=majority`;

app.get('/', (req, res) => {
  res.send('E-examPro')
})

app.listen(port, () => {
  console.log(`E-examPro Server is running on port ${port}`)
})