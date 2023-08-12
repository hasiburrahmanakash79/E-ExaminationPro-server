const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middle ware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('E-examPro')
})

app.listen(port, () => {
  console.log(`E-examPro Server is running on port ${port}`)
})