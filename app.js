const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const unzipper = require("unzipper");
const csv = require("csvtojson");
const { rejects } = require("assert");

const tempDir = path.join(__dirname, "temp");
const uploadDir = path.join(__dirname, "public");

const uploadConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: {},
});

const uploadMiddleware = multer({
  storage: uploadConfig,
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/api/data", uploadMiddleware.single("files"), async (req, res) => {
  const { path: tempName } = req.file;
  fs.createReadStream(tempName).pipe(unzipper.Extract({ path: uploadDir }));
  fs.unlink(tempName, (err) => {
    if (err) console.log(err);
    else console.log("temp file was deleted");
  });
});

const filenames = fs.readdirSync(uploadDir);
let headers;
let arrTitle;
let data = [];
for (const file of filenames) {
  let filePath = path.join(uploadDir, file);
  let fileContent = fs.readFileSync(filePath, "utf8");
  let arr1 = fileContent.split(/\r\n|\n/);
  headers = arr1[0];
  arrTitle = arr1[0].split("||");
  for (let i = 1; i < arr1.length; i++) {
    data.push(
      arr1[i].split("||").map((item) => item.substring(1, item.length - 1))
    );
  }
  arrTitle = arrTitle.map((item) => item.substring(1, item.length - 1));
}

let users = data.map((item) => {
  let userDate = item[arrTitle.indexOf("date")]
    ? item[arrTitle.indexOf("date")].split("/").reverse().join("-")
    : "undefind";
  let normDate = new Date(userDate).toLocaleDateString("en-CA");
  let normCc = item[arrTitle.indexOf("cc")]
    ? item[arrTitle.indexOf("cc")].replace(/[^0-9]/g, "")
    : "";

  let userObj = {
    name: `${item[arrTitle.indexOf("last_name")]} ${
      item[arrTitle.indexOf("first_name")]
    }`,
    phone: item[arrTitle.indexOf("phone")],
    person: {
      firstName: item[arrTitle.indexOf("first_name")],
      lastName: item[arrTitle.indexOf("last_name")],
    },
    amount: Number(item[arrTitle.indexOf("amount")]),
    date: normDate,
    costCenterNum: normCc,
  };
  return userObj;
});

const outPath = path.join(__dirname, "public", "users.json");
fs.writeFile(outPath, JSON.stringify(users), function (err) {
  if (err) {
    console.log(err);
  }
});

app.get("/api/data", async (req, res) => {
  res.json(data);
});

app.listen(3000);
