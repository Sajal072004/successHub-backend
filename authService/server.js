const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const registerRoute = require("./routes/auth/register");

const app = express();
app.use(cors());
app.use(bodyParser.json()); // To parse incoming JSON bodies
app.use("/auth", registerRoute);

app.get("/" , (req , res) => {
  console.log("hello there");
  return res.json("hello there");
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
