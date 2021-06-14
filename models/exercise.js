const mongoose = require("mongoose");
const User = require("../models/user");

const schema = mongoose.Schema({
  user: User.schema,
  description: { type: String, required: true },
  duration: { type: Number },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Exercise", schema);
