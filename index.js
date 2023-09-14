const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.PAYMENT_SECRETE_KEY);

const port = process.env.PORT || 4000;

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
    return res.status(401).send({ error: true, message: "unauthorized access" });
  }
  //bearer token
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.SECRETE_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: "unauthorized access" });
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
    let tempCollection;
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
    const noticeCollection = client.db("E-ExaminationPro").collection("notices");
    const appliedLiveExamCollection = client.db("E-ExaminationPro").collection("appliedLiveExam");
    const liveExamQuestionCollection = client.db("E-ExaminationPro").collection("liveExamQuestions");
    const resultCollection = client.db("E-ExaminationPro").collection("result_Collection");
    const blogsCollection = client.db("E-ExaminationPro").collection("blogs");
    const commentCollection = client
      .db("E-ExaminationPro")
      .collection("comments");

    //---------showing comments---------------------------------------------------------------------------COMMENT--------------------------
    app.post("/comments", async (req, res) => {
      const comment = req.body;
      console.log(comment,'.................................123');
      const result = await commentCollection.insertOne(comment);
      res.send(result);
    })

    app.get('/comments', async (req, res) => {
      const blogId = req.query.id;
      const userEmail=req.query.userEmail
      const query_0 = { BlogId:blogId}
      const query_1 = { BlogId:blogId,userEmail:userEmail}
      const allUserComments = await commentCollection.find(query_0).toArray()
      const userComments = await commentCollection.find(query_1).toArray();
      res.send({allUserComments,userComments})
    })


    // app.get('/comments/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await commentCollection.findOne(query).toArray();
    //   res.send(result)
    // })


    //------------for adding blogs by instructor
    app.post('/blogs', async (req, res) => {
      const addedBlog = req.body;
      console.log(addedBlog);
      const result = await blogsCollection.insertOne(addedBlog);
      res.send(result)
    })

    app.get("/blogs", async (req, res) => {
      const cursor = blogsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id
      console.log(id,'---------------------------------------160')
      const query = {_id:new ObjectId(id)}
      // const cursor = blogsCollection.find();
      const result = await blogsCollection.findOne(query);
      res.send(result)
    })

    const forumCollection = client
      .db("E-ExaminationPro")
      .collection("forumCommunity")
    const pricingCollection = client.db("E-ExaminationPro").collection("packagePricing");

    ///// JWT /////
    app.post("/jwt", (req, res) => {
      console.log('hit jwt 107')
      const userEmail = req.body;
      console.log(userEmail);
      const token = jwt.sign(userEmail, `${process.env.SECRETE_TOKEN}`, {
        expiresIn: "7d",
      });
      res.send({ token });
    });

    app.get("/allSubjects", verifyJWT, async (req, res) => {
      const result = await subjectCollection.find().toArray();
      res.send(result);
    });

    app.post("/allsubjects", async (req, res) => {
      const data = req.body
      const query = { subject_code: data.subject_code, subject_name: data.subject_name }
      const existingSubject = await subjectCollection.findOne(query);

      if (existingSubject) {
        console.log('hit line 413')
        return res.send({ msg: "Already Created" });
      }
      const result = await subjectCollection.insertOne(data)
      res.send(result);
      console.log(data, '--------------------------410')
    });

    app.post("/questionPaper", async (req, res) => {
      const question = req.body;
      console.log(question);
      const query = { exam_code: question.exam_code }
      const existingUser = await questionCollection.findOne(query);
      if (existingUser) {
        const result = { code: 'duplicate' }
        return res.send(result);
      }
      const result = await questionCollection.insertOne(question);
      res.send(result);
    });
    ///----------------------------------------------------------------------applied live exam list
    app.post("/appliedLiveExam", async (req, res) => {
      const info = req.body;
      const studentEmail = req.query.studentEmail
      const exam_id = req.query.examId
      const query = {
        $and: [
          { student_email: studentEmail },
          { examID: exam_id }
        ]
      }
      const existingUser = await appliedLiveExamCollection.findOne(query);
      if (existingUser) {
        return res.send({ msg: "Already Applied" });
      }
      else {
        const result = await appliedLiveExamCollection.insertOne(info);
        res.send(result);
      }
    });

    app.get('/appliedLiveExam', async (req, res) => {
      const email = req.query.studentEmail
      if (email) {
        const query = { student_email: email }
        const result = await appliedLiveExamCollection.find(query).toArray();
        res.send(result);
      }
      const examId = req.query.examID
      if (examId) {
        console.log(examId, '------------------------219')
        const query = { examID: examId }
        const result = await appliedLiveExamCollection.find(query).toArray();
        return res.send(result);
      }

      const instructor_email = req.query.instructor_email
      if (instructor_email) {
        console.log(instructor_email, '------------------------219')
        const query = { _id: new ObjectId(examId), instructor_email: instructor_email }
        const result = await appliedLiveExamCollection.find(query).toArray();
        return res.send(result);
      }

    })

    app.get("/questionPaper", async (req, res) => {
      const instructor_email = req.query.instructor_email
      const type = req.query.type;
      const subject = req.query.subject;
      console.log(instructor_email, '-------------line 160')
      const query0 = { email: instructor_email }
      const result1 = await userCollection.findOne(query0)

      const stu_Batch = req.query.batch

      if (result1?.role == 'instructor') {
        const query = { email: instructor_email, type: type, subjectName: subject };
        const result = await questionCollection.find(query).toArray()
        return res.send(result);
      }
      else if (result1?.role == 'admin') {
        const query = { type: type, subjectName: subject };
        const result = await questionCollection.find(query).toArray()
        return res.send(result);
      }
      else {
        console.log('hit-170')
        const query = { subjectName: subject, type: type, batch: stu_Batch };
        const allQuestion = await questionCollection.find(query).toArray();
        //console.log(allQuestion,'-------------------------------------173')
        const query2 = {
          stu_email: instructor_email
        }
        const examResult = await resultCollection.find(query2).toArray();
        console.log(examResult)
        const response2 = allQuestion.map((question) => console.log(question._id.toString(), '-------------line 175'))
        const response1 = examResult.map((question) => console.log(question.examID.toString(), '-------------line 176'))

        const response = allQuestion.map((question) => ({
          ...question,
          isCompleted: examResult.some(
            (result) =>
              result.examID === question._id.toString()
          )
            ? true
            : false,
        }))
        console.log(response, '.......................................237')
        res.send(response)
      }

    });

    app.get("/questionCode", async (req, res) => {
      const code = req.query.code;
      console.log(code)
      const query = { exam_code: code };
      const result = await questionCollection.findOne(query);
      console.log(result, '---------------------242')
      if (result) {
        res.send({ result: true });
      }
      else {
        res.send({ result: false });
      }
    });

    app.get("/questionPaper/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await questionCollection.findOne(query);
      res.send(result);
    });

    ///// post get result ----------------------------------------new Abir result
    app.get("/result", async (req, res) => {
      const examId = req.query.examId;
      console.log('int id', examId);
      const query = { examID: examId }
      // const result = await resultCollection.find().toArray()
      const result = await resultCollection.findOne(query)
      res.send(result)
    });
    app.post("/examdata", async (req, res) => {
      const data = req.body;
      const result = await resultCollection.insertOne(data);
      res.send(result);
      console.log(data);
    });
    //---------------------------------------------------------------------------------get user exam data
    app.get("/userGivenExam/:email", async (req, res) => {
      const email=req.params.email
      const query={stu_email:email}
      const result=await resultCollection.find(query).sort({_id: -1 }).toArray()
      res.send(result);
      console.log(email,'-----------------------------------------------line 298')
    });


    ////////////////User Get,///////////////////--------------------------------------------abir
    app.get("/users", async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      if (email) {
        const result = await userCollection.findOne(query)
        return res.send(result);
      }
      else {
        const result = await userCollection.find().toArray();
        return res.send(result);
      }
    });

    app.get("/userBatch", async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const result = await userCollection.findOne(query)
      return res.send(result);
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

    // Delete User
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query)
      res.send(result)
    });

    //////////////updatePRofile////// ----------------------------------------new abir
    app.patch("/updateProfile", async (req, res) => {
      const email = req.query.email;
      const data = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const doc = {
        $set: {
          batch: data.batch,
          gender: data.gender,
          address: data.address,
          mobile: data.mobile,
          photoURL: data.photoURL,
        },
      };
      const result = await userCollection.updateOne(query, doc, options);
      res.send(result);
    });

    //get user info ------------------------------------------------------new abir
    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };

      const result = await userCollection.findOne(query);
      res.send(result);
    });

    ///-end
    // find Admin from database
    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      console.log(req.decoded.email, 'line 205')
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
      console.log(req.decoded.email, 'line 218')
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
      const result = await testimonialCollection.find().sort({_id:-1}).limit(10).toArray();
      res.send(result);
    });

    app.post("/testimonials", async (req, res) => {
      const data=req.body
      const result = await testimonialCollection.insertOne(data);
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

    ////////////////// Notice ////////////////////----------HR
    app.post('/notice', async (req, res) => {
      const noticeInfo = req.body;
      const result = await noticeCollection.insertOne(noticeInfo)
      res.send(result)
    })
    //---------------------------------------------------------------------------also abir
    app.get("/notice", async (req, res) => {
      const selectedID = req.query.selectedID
      console.log(selectedID, 'hit-----')
      if (selectedID) {
        const query4 = { _id: new ObjectId(selectedID) }
        const result = await noticeCollection.findOne(query4)
        return res.send(result)
      }
      const instructorEmail = req.query.instructor
      query0 = { email: instructorEmail }
      result = await userCollection.findOne(query0)
      console.log(result)
      if (result?.role == 'instructor') {
        const result = await noticeCollection.find(query0).toArray()
        return res.send(result)
      }
      const exam_id = req.query.id
      const student_email = req.query.student_email
      if (exam_id) {

        const query1 = {
          $and: [
            { student_email: student_email },
            { examID: exam_id }
          ]
        }
        const existingUser = await appliedLiveExamCollection.findOne(query1);
        console.log(existingUser, 'line 412', exam_id, student_email)
        if (existingUser) {
          console.log('hit line 413')
          return res.send({ msg: "Already Applied" });
        }
        const query2 = { _id: new ObjectId(exam_id) }
        const result = await noticeCollection.findOne(query2)
        return res.send(result)
      }
      else {
        const result = await noticeCollection.find().toArray()
        return res.send(result)
      }
    })

    /////////////////live exam QUes////////////////////
    app.get('/liveQuestionPaper', async (req, res) => {
      const id = req.query.id
      const examCode = req.query.examCode
      const query = {
        $and: [
          { examID: id },
          { examCode: examCode }
        ]
      }
      const result = await liveExamQuestionCollection.findOne(query)
      console.log(result)
      res.send({ code: result?.secretCode })
    })

    app.post('/liveQuestionPaper', async (req, res) => {
      const data = req.body
      console.log(data)
      const result = await liveExamQuestionCollection.insertOne(data)
      res.send(result)
    })

    // Pricing 
    app.get("/price", async (req, res) => {
      const price = await pricingCollection.find().toArray()
      res.send(price)
    })

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
      console.log("Payment", payment);
      const insertResult = await paymentCollection.insertOne(payment);
      const insertHistory = await paymentHistory.insertOne(payment);
      res.send({ insertResult, insertHistory });
    });

    app.get("/history/:email", async (req, res) => {
      const email = req.params.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await paymentHistory.find(query).toArray();
      res.send(result);
    });

    app.get("/history", async (req, res) => {
      const result = await paymentHistory.find().toArray();
      res.send(result);
    });

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

    /* forum communication */
    app.post("/forumPost", async (req, res) => {
      const forum = req.body;
      const result = await forumCollection.insertOne(forum)
      res.send(result)
    })
    app.get("/forumPost", async (req, res) => {
      const result = await forumCollection.find().toArray()
      res.send(result)
    })
    app.patch("/forumPost/:id", async (req, res) => {
      const commentId = req.params.id; // Get comment ID from the URL
      const updatedComment = req.body; // Get the updated comment data from the request body

      const filterCommentId = { _id: new ObjectId(commentId) };
      const updateStatus = {
        $set: {
          article: updatedComment.article,
        },
      };
      try {
        const result = await forumCollection.updateOne(filterCommentId, updateStatus);
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Comment not found" });
        }
        res.status(200).json({ message: "Comment updated successfully" });
      } catch (error) {
        console.error(error);
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
