const { Schema, model } = require("mongoose");

const userSchema = Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    person: {
      firstName: String,
      lastName: String,
    },
    amount: {
      type: Number,
    },
    date: {
      type: Date,
    },
    verifyToken: {
      costCenterNum: String,
    },
  },
  { versionKey: false, timestamps: true }
);

const User = model("user", userSchema);

module.exports = {
  User,
};
