const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { generateQuiz, checkAnswer } = require("../controllers/quizController");

router.post("/generate", authMiddleware, generateQuiz);

router.post("/check", authMiddleware, checkAnswer);

module.exports = router;