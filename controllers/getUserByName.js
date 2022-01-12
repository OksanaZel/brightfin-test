const { NotFound } = require("http-errors");
const { User } = require("../model");
const { sendResponse } = require("../utils");

const getUserByName = async (req, res) => {
  const { name } = req.body;
  const user = await User.findOne({
    name,
  });

  if (!user) {
    throw new NotFound("User not found");
  }

  sendResponse(res, { user });
};

module.exports = getUserByName;
