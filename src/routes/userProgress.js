const express = require("express");
const router = express.Router();
const {
  updateProgress,
  getProgress,
} = require("../controllers/progressController");
const authMiddleware = require("../middlewares/authMiddleware");

router.put("/progress", authMiddleware, updateProgress);
router.get("/progress", authMiddleware, getProgress);

module.exports = router;
