const openai = require("../config/openaiConfig");
const User = require("../models/userModel");
const { v4: uuidv4 } = require("uuid");

const generateQuiz = async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "user",
          content: `Buatkan 8 soal quiz tentang algoritma sorting dengan format berikut untuk setiap soal:
- Pertanyaan: [Pertanyaan tentang sorting]
- Pilihan jawaban:
  A. [Jawaban A]
  B. [Jawaban B]
  C. [Jawaban C]
  D. [Jawaban D]
- Kunci jawaban: [Huruf jawaban yang benar]`,
        },
      ],
    });

    console.log("API Response:", completion);

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("No choices returned from the API");
    }

    const quizText = completion.choices[0].message.content;
    if (!quizText) {
      throw new Error("Invalid response format from the API");
    }

    const quizzes = parseQuiz(quizText);

    const quizzesWithId = quizzes.map((quiz, index) => ({
      id: (index + 1).toString(),
      ...quiz,
    }));

    const quizId = uuidv4();

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.quizHistory.push({
      quizId,
      quizzes: quizzesWithId,
      score: 0,
      totalQuestions: quizzesWithId.length,
      correctAnswers: 0,
      startTime: new Date(),
      endTime: null,
    });

    await user.save();

    res.status(200).json({
      message: "Quiz generated successfully",
      quizId,
      quizzes: quizzesWithId,
    });
  } catch (error) {
    console.error("Error in generateQuiz:", error);
    res
      .status(500)
      .json({ message: "Failed to generate quiz", error: error.message });
  }
};

const parseQuiz = (quizText) => {
  const quizzes = [];
  const lines = quizText.split("\n");
  let currentQuiz = null;

  lines.forEach((line) => {
    if (line.startsWith("- Pertanyaan:")) {
      if (currentQuiz) quizzes.push(currentQuiz);
      currentQuiz = {
        question: line.replace("- Pertanyaan:", "").trim(),
        options: {},
        answer: "",
      };
    } else if (line.startsWith("  A.")) {
      currentQuiz.options.A = line.replace("  A.", "").trim();
    } else if (line.startsWith("  B.")) {
      currentQuiz.options.B = line.replace("  B.", "").trim();
    } else if (line.startsWith("  C.")) {
      currentQuiz.options.C = line.replace("  C.", "").trim();
    } else if (line.startsWith("  D.")) {
      currentQuiz.options.D = line.replace("  D.", "").trim();
    } else if (line.startsWith("- Kunci jawaban:")) {
      currentQuiz.answer = line.replace("- Kunci jawaban:", "").trim();
    }
  });

  if (currentQuiz) quizzes.push(currentQuiz);
  return quizzes;
};

const checkAnswer = async (req, res) => {
  const { quizId, userAnswers } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("quizId from request:", quizId);
    console.log("quizHistory:", user.quizHistory);

    const quiz = user.quizHistory.find((q) => q.quizId === quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let correctAnswers = 0;
    quiz.quizzes.forEach((q) => {
      const userAnswer = userAnswers[q.id];
      if (userAnswer && userAnswer.toUpperCase() === q.answer.toUpperCase()) {
        correctAnswers++;
      }
    });

    const totalQuestions = quiz.quizzes.length;
    const score = (correctAnswers / totalQuestions) * 100;

    quiz.score = score;
    quiz.correctAnswers = correctAnswers;
    quiz.endTime = new Date();

    await user.save();

    res.status(200).json({
      message: "Quiz checked successfully",
      quizId,
      score,
      correctAnswers,
      totalQuestions,
    });
  } catch (error) {
    console.error("Error in checkAnswer:", error);
    res
      .status(400)
      .json({ message: "Failed to check quiz", error: error.message });
  }
};

const getQuizHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const quizHistory = user.quizHistory.map((quiz) => ({
      quizId: quiz.quizId,
      score: quiz.score,
      totalQuestions: quiz.totalQuestions,
      correctAnswers: quiz.correctAnswers,
      startTime: quiz.startTime,
      endTime: quiz.endTime,
    }));

    res.status(200).json({
      message: "Quiz history retrieved successfully",
      quizHistory,
    });
  } catch (error) {
    console.error("Error in getQuizHistory:", error);
    res.status(500).json({
      message: "Failed to retrieve quiz history",
      error: error.message,
    });
  }
};

module.exports = {
  generateQuiz,
  checkAnswer,
  getQuizHistory,
};
