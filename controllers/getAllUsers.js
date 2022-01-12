const { NotFound } = require("http-errors");
const { User } = require("../model");
const { sendResponse } = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await User.find({}, "name");

  if (!users) {
    throw new NotFound("Categories not found");
  }

  sendResponse(res, { users });
};

module.exports = getAllUsers;
