const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: String,
  location: String,
  price: Number,
  contact: String,
  type: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Property", propertySchema);