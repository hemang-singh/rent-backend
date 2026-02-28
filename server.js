const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoute = require("./routes/auth");
const propertyRoute = require("./routes/property");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRoute);
app.use("/api/property", propertyRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));