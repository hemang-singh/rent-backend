const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

// Add property
router.post("/", auth, async (req, res) => {
  try {
    const property = new Property({ ...req.body, owner: req.user });
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "name email");
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete property
router.delete("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: "Property not found" });

    if (property.owner.toString() !== req.user)
      return res.status(403).json({ msg: "Forbidden: not owner" });

    await Property.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;