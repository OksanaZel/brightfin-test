const path = require("path");
const fs = require("fs");
const unzipper = require("unzipper");
const { User } = require("../model");

const uploadDir = path.join(__dirname, "../", "public");

const add = async (req, res) => {
  const { path: tempName } = req.file;
  console.log(tempName);
  try {
    await fs
      .createReadStream(tempName)
      .pipe(unzipper.Extract({ path: uploadDir }))
      .on("entry", (entry) => entry.autodrain())
      .promise()
      .then(
        () => console.log("done"),
        (e) => console.log("error", e)
      );
    // await fs.unlinkSync(tempName);
    const filenames = await fs.readdirSync(uploadDir);
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
        : new Date();
      let userNormDate = new Date(userDate);
      let userAmount = Number(item[arrTitle.indexOf("amount")]);
      let userPhone = item[arrTitle.indexOf("phone")]
        ? `+380${item[arrTitle.indexOf("phone")].replace(/[^0-9]/g, "")}`
        : "undefind";
      let userCc = item[arrTitle.indexOf("cc")]
        ? item[arrTitle.indexOf("cc")].replace(/[^0-9]/g, "")
        : "";
      let userObj = {
        name: `${item[arrTitle.indexOf("last_name")]} ${
          item[arrTitle.indexOf("first_name")]
        }`,
        phone: userPhone,
        person: {
          firstName: item[arrTitle.indexOf("first_name")],
          lastName: item[arrTitle.indexOf("last_name")],
        },
        amount: Math.floor(userAmount * 100) / 100,
        date: userNormDate,
        costCenterNum: userCc,
      };
      return userObj;
    });

    const outPath = path.join(__dirname, "../", "public", "users.json");
    await fs.writeFileSync(outPath, JSON.stringify(users));
    let bulk = User.collection.initializeOrderedBulkOp();
    users.forEach((user) => bulk.insert(user));
    bulk.execute();
  } catch (error) {
    // await fs.unlinkSync(tempName);
    throw error;
  }
};

module.exports = add;
