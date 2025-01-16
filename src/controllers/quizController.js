const express = require("express");
const openai = require("../config/openaiConfig");
const User = require("../models/userModel");
const { v4: uuidv4 } = require("uuid");

// @desc    Generate quiz tentang sorting
// @route   POST /api/quiz/generate
// @access  Private
const generateQuiz = async (req, res) => {
  try {
    // Request ke OpenRouter AI
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

    // Ambil respons dari AI
    const quizText = completion.choices[0].message.content;

    // Parsing respons AI ke format JSON
    const quizzes = parseQuiz(quizText);

    // Tambahkan ID unik ke setiap pertanyaan
    const quizzesWithId = quizzes.map((quiz, index) => ({
      id: (index + 1).toString(), // ID pertanyaan
      ...quiz,
    }));

    // Buat ID unik untuk kuis ini
    const quizId = uuidv4();

    // Simpan quiz ke history user
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.quizHistory.push({
      quizId, // ID unik untuk kuis ini
      quizzes: quizzesWithId,
      score: 0, // Nilai awal 0
      totalQuestions: quizzesWithId.length,
      correctAnswers: 0, // Jawaban benar awal 0
      startTime: new Date(),
      endTime: null, // Waktu selesai diisi saat pengecekan
    });

    await user.save();

    res.status(200).json({
      message: "Quiz generated successfully",
      quizId, // Kirim ID kuis ke frontend
      quizzes: quizzesWithId,
    });
  } catch (error) {
    console.error("Error in generateQuiz:", error);
    res
      .status(500)
      .json({ message: "Failed to generate quiz", error: error.message });
  }
};

// Fungsi untuk parsing quiz dari teks ke JSON
const parseQuiz = (quizText) => {
  const quizzes = [];
  const lines = quizText.split("\n");
  let currentQuiz = null;

  lines.forEach((line) => {
    if (line.startsWith("- Pertanyaan:")) {
      if (currentQuiz) quizzes.push(currentQuiz); // Simpan quiz sebelumnya
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

  if (currentQuiz) quizzes.push(currentQuiz); // Simpan quiz terakhir
  return quizzes;
};

// @desc    Periksa jawaban quiz
// @route   POST /api/quiz/check
// @access  Private
const checkAnswer = async (req, res) => {
  const { quizId, userAnswers } = req.body; // Data dari frontend
  const userId = req.user.id; // ID user dari middleware auth

  try {
    // Ambil data user dari database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Debugging: Log quizId dari request dan quizHistory
    console.log("quizId from request:", quizId);
    console.log("quizHistory:", user.quizHistory);

    // Cari kuis berdasarkan quizId
    const quiz = user.quizHistory.find((q) => q.quizId === quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Hitung jumlah jawaban yang benar
    let correctAnswers = 0;
    quiz.quizzes.forEach((q) => {
      const userAnswer = userAnswers[q.id]; // Ambil jawaban user berdasarkan ID pertanyaan
      if (userAnswer && userAnswer.toUpperCase() === q.answer.toUpperCase()) {
        correctAnswers++;
      }
    });

    // Hitung nilai akhir
    const totalQuestions = quiz.quizzes.length;
    const score = (correctAnswers / totalQuestions) * 100;

    // Update hasil quiz di database
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

// @desc    Get quiz history for a user
// @route   GET /api/quiz/history
// @access  Private
const getQuizHistory = async (req, res) => {
  const userId = req.user.id; // ID user dari middleware auth

  try {
    // Ambil data user dari database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format history kuis
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
