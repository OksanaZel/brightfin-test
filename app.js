const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const { upload } = require("./middlewares");
const { add, getAllUsers, getUserByName } = require("./controllers");
const { controllerWrapper } = require("./middlewares");
require("dotenv").config();

const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(express.static("temp"));

app.post("/api/data", upload.single("file"), add);
app.get("/api/data", controllerWrapper(getAllUsers));
app.get("/api/data/name", controllerWrapper(getUserByName));

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Not found",
  });
});

app.use((err, req, res, next) => {
  const { status = 500, message = err.message } = err;
  res.status(status).json({ status: "error", code: status, message });
});

module.exports = app;
