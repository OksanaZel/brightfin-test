const { NotFound } = require("http-errors");
const { User } = require("../model");
const { sendResponse } = require("../utils");

const getUserByName = async (req, res) => {
  const { name } = req.query;
  const user = await User.find({
    "person.lastName": name,
  });

  if (!user) {
    throw new NotFound("User not found");
  }

  sendResponse(res, { user });
};

module.exports = getUserByName;
