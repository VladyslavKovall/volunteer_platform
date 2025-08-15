require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routes/index");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", router);

const start = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Сервер працює на порту ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};
start();
