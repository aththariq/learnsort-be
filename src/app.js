const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const routes = require("./routes");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the LearnSort API!" });
});

// Routes
routes(app);

// Connect to database
connectDB();

module.exports = app;
