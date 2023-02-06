require("./database");
const express = require("express");
const cors = require("cors");
const index = require("./routes/index");
const app = express();

const PORT = 3001;
app.use(express.json());
app.use(cors());

app.use("/", index);

app.listen(PORT, (req, res) => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
