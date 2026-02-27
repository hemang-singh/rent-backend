const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ msg: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

// Add property
router.post("/", auth, async (req, res) => {
  try {
    const prop = new Property({ ...req.body, owner: req.user });
    await prop.save();
    res.json(prop);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all properties
router.get("/", async (req, res) => {
  const props = await Property.find().populate("owner", "name email");
  res.json(props);
});

// Delete property
router.delete("/:id", auth, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ msg: "Not found" });
    if (prop.owner.toString() !== req.user)
      return res.status(403).json({ msg: "Forbidden" });

    await Property.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;