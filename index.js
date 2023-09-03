const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.PAYMENT_SECRETE_KEY);

const port = process.env.PORT || 5000;

// Middleware
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
};
app.use(cors(corsConfig));
app.use(express.json());

// mongoDb setup

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET}@cluster0.ufcjidc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

/////////////JWT verify///////////

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  //bearer token
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.SECRETE_TOKEN, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // Database collection
    const userCollection = client.db("E-ExaminationPro").collection("users");
    const shortQuestionCollection = client
      .db("E-ExaminationPro")
      .collection("shortQuestions");
    const longQuestionCollection = client
      .db("E-ExaminationPro")
      .collection("longQuestions");
    const quizQuestionCollection = client
      .db("E-ExaminationPro")
      .collection("quizQuestions");
    const fillInTheBlankCollection = client
      .db("E-ExaminationPro")
      .collection("fillInTheBlanks");
    const subjectsCollection = client
      .db("E-ExaminationPro")
      .collection("subjects");
    const testimonialCollection = client
      .db("E-ExaminationPro")
      .collection("testimonials");
    const faqCollection = client.db("E-ExaminationPro").collection("faqs");
    const instructorsCollection = client
      .db("E-ExaminationPro")
      .collection("instructors");
    const statisticsCollection = client
      .db("E-ExaminationPro")
      .collection("statistics");
    const questionCollection = client
      .db("E-ExaminationPro")
      .collection("Question_Collection");
    const subjectCollection = client
      .db("E-ExaminationPro")
      .collection("allSubjects");
    const paymentCollection = client
      .db("E-ExaminationPro")
      .collection("payments");
    const paymentHistory = client
      .db("E-ExaminationPro")
      .collection("paymentHistory");

    const resultCollection = client //---------------------------new Abir
      .db("E-ExaminationPro")
      .collection("result_Collection");

    ///// JWT /////
    app.post("/jwt", (req, res) => {
      const userEmail = req.body;
      console.log(userEmail);
      const token = jwt.sign(userEmail, `${process.env.SECRETE_TOKEN}`, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    app.get("/allSubjects", verifyJWT, async (req, res) => {
      const result = await subjectCollection.find().toArray();
      res.send(result);
    });

    app.post("/questionPaper", async (req, res) => {
      const question = req.body;
      console.log(question);
      const result = await questionCollection.insertOne(question);
      res.send(result);
    });
    app.get("/questionPaper", async (req, res) => {
      const type = req.query.type;
      const subject = req.query.subject;
      const query = { subjectName: subject, type: type };
      const result = await questionCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/questionPaper/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await questionCollection.findOne(query);
      res.send(result);
    });
    ///// post result ----------------------------------------new Abir
    app.post('/result',async(req,res)=>{
      //// need to work here
    })

    ///////////////////////////////////

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    //post user in database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send([]);
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    //////////////updatePRofile////// ----------------------------------------new abir
app.patch('/updateProfile',async(req,res)=>{
  const email=req.query.email

  const data=req.body
  const query={email:email}
  const options = { upsert: true };
  const doc={
    $set: {
      batch:data.batch,
      gender:data.gender,
      address:data.address,
      mobile:data.mobile,
      photoURL:data.photoURL
    }}
  console.log(data,email)
  const result=await userCollection.updateOne(query,doc,options)
  res.send(result)
  console.log(result)
})

    //get user info ------------------------------------------------------new abir

    app.get('/user',async(req,res)=>{
      const email=req.query.email
      const query={email:email}
      console.log('get profile info:',email)
      const result=await userCollection.findOne(query)
      res.send(result)
    })

    ///-end
    // find Admin from database
    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;

      console.log("user", req.decoded.email);
      if (req.decoded.email !== email) {
        return res.send({ admin: false });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    // find instructor from database
    app.get("/users/instructor/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        return res.send({ instructor: false });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { instructor: user?.role === "instructor" };
      res.send(result);
    });

    // make admin from user
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filterUserId = { _id: new ObjectId(id) };
      const updateStatus = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filterUserId, updateStatus);
      res.send(result);
    });

    // make instructor from user
    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const filterUserId = { _id: new ObjectId(id) };
      const updateStatus = {
        $set: {
          role: "instructor",
        },
      };
      const result = await userCollection.updateOne(filterUserId, updateStatus);
      res.send(result);
    });

    app.get("/subjects", async (req, res) => {
      const result = await subjectsCollection.find().toArray();
      res.send(result);
    });

    app.get("/testimonials", async (req, res) => {
      const result = await testimonialCollection.find().toArray();
      res.send(result);
    });

    app.get("/faqs", async (req, res) => {
      const result = await faqCollection.find().toArray();
      res.send(result);
    });

    app.get("/statistics", async (req, res) => {
      const result = await statisticsCollection.find().toArray();
      res.send(result);
    });

    // get MCQ question from database
    app.get("/quizQ", async (req, res) => {
      const result = await quizQuestionCollection.find().toArray();
      res.send(result);
    });

    // Post MCQ question from database
    app.post("/quizQ", async (req, res) => {
      const addShortQ = req.body;
      const result = await quizQuestionCollection.insertOne(addShortQ);
      res.send(result);
    });

    // Delete short question from database
    app.delete("/quizQ/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await quizQuestionCollection.deleteOne(query);
      res.send(result);
    });

    // get short question from database
    app.get("/shortQ", async (req, res) => {
      const subject = req.query.subject;
      console.log(subject);
      const query = { subject: subject };
      const result = await shortQuestionCollection.find(query).toArray();
      res.send(result);
    });

    // Post short question from database
    app.post("/shortQ", async (req, res) => {
      const addShortQ = req.body;
      const result = await shortQuestionCollection.insertOne(addShortQ);
      res.send(result);
    });

    // Delete short question from database
    app.delete("/shortQ/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await shortQuestionCollection.deleteOne(query);
      res.send(result);
    });
    /**=========================
     * Long question api's
     * ====================
     */
    // get long question from database
    app.get("/longQ", async (req, res) => {
      const subject = req.query.subject;
      console.log(subject);
      const query = { subject: subject };
      const result = await longQuestionCollection.find(query).toArray();
      res.send(result);
    });

    // Post long question from database
    app.post("/longQ", async (req, res) => {
      const addLongQ = req.body;
      const result = await longQuestionCollection.insertOne(addLongQ);
      res.send(result);
    });

    // get fill in the blank question from database
    app.get("/blankQ", async (req, res) => {
      const result = await fillInTheBlankCollection.find().toArray();
      res.send(result);
    });

    // Post fill in the blank question from database
    app.post("/blankQ", async (req, res) => {
      const addBlankQ = req.body;
      const result = await fillInTheBlankCollection.insertOne(addBlankQ);
      res.send(result);
    });

    // Delete fill in the blank question from database
    app.delete("/blankQ/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await fillInTheBlankCollection.deleteOne(query);
      res.send(result);
    });

    // get Instructors from database
    app.get("/instructors", async (req, res) => {
      const result = await instructorsCollection.find().toArray();
      res.send(result);
    });

    // payment system
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", verifyJWT, async (req, res) => {
      const payment = req.body;
      console.log(payment);
      const insertResult = await paymentCollection.insertOne(payment);
      const insertHistory = await paymentHistory.insertOne(payment);
      res.send({ insertResult, insertHistory });
    });

    app.get("/history/:email", async(req, res) => {
      const email = req.params.email;
      if(!email){
        res.send([])
      }
      const query = {email: email}
      const result = await paymentHistory.find(query).toArray()
      res.send(result)
    })

    app.get("/history", async(req, res) =>{
      const result = await paymentHistory.find().toArray()
      res.send(result)
    })

    // resolving cors issue when trying to fetch directly data from external api's to frontend so we have to use a proxy server to do that
    app.get("/api/quotes", async (req, res) => {
      try {
        const response = await axios.get("https://zenquotes.io/api/quotes");
        const data = response.data;
        // console.log(data);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("E-examPro");
});

app.listen(port, () => {
  console.log(`E-examPro Server is running on port ${port}`);
});
