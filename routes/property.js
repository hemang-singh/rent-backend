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
    req.userRole = decoded.role; // role from JWT
    next();
  } catch {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

// Add property (seller only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.userRole !== "seller") return res.status(403).json({ msg: "Only sellers can add properties" });

    const { title, location, price, contact, type, description, area } = req.body;
    if (!title || !location || !price || !contact || !type) {
      return res.status(400).json({ msg: "Required fields missing" });
    }

    const property = new Property({
      title,
      location,
      price: Number(price),
      area: area || "N/A",
      contact,
      type,
      description: description || "",
      owner: req.user,
    });

    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "name email").sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get property by ID
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("owner", "name email");
    if (!property) return res.status(404).json({ msg: "Property not found" });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete property (owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: "Property not found" });

    if (property.owner.toString() !== req.user)
      return res.status(403).json({ msg: "You can delete only your own property" });

    await Property.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;