const express = require('express');
const openai = require('../config/openaiConfig'); 

// @desc    Generate quiz tentang sorting
// @route   POST /api/quiz/generate
// @access  Public
const generateQuiz = async (req, res) => {
  try {
    // Request ke OpenRouter AI
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "user",
          content: `Buatkan sebuah quiz tentang algoritma sorting dengan format berikut:
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
    const quiz = parseQuiz(quizText);

    res.status(200).json({
      message: "Quiz generated successfully",
      quiz,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to generate quiz", error: error.message });
  }
};

// Fungsi untuk parsing quiz dari teks ke JSON
const parseQuiz = (quizText) => {
  const lines = quizText.split("\n");
  const quiz = {
    question: "",
    options: {},
    answer: "",
  };

  lines.forEach((line) => {
    if (line.startsWith("- Pertanyaan:")) {
      quiz.question = line.replace("- Pertanyaan:", "").trim();
    } else if (line.startsWith("  A.")) {
      quiz.options.A = line.replace("  A.", "").trim();
    } else if (line.startsWith("  B.")) {
      quiz.options.B = line.replace("  B.", "").trim();
    } else if (line.startsWith("  C.")) {
      quiz.options.C = line.replace("  C.", "").trim();
    } else if (line.startsWith("  D.")) {
      quiz.options.D = line.replace("  D.", "").trim();
    } else if (line.startsWith("- Kunci jawaban:")) {
      quiz.answer = line.replace("- Kunci jawaban:", "").trim();
    }
  });

  return quiz;
};

// @desc    Periksa jawaban quiz
// @route   POST /api/quiz/check
// @access  Public
const checkAnswer = async (req, res) => {
  const { userAnswer, correctAnswer } = req.body;

  try {
    // Bandingkan jawaban user dengan kunci jawaban
    const isCorrect = userAnswer.toUpperCase() === correctAnswer.toUpperCase();

    res.status(200).json({
      message: isCorrect ? "Jawaban benar!" : "Jawaban salah!",
      isCorrect,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to check answer", error: error.message });
  }
};

module.exports = {
  generateQuiz,
  checkAnswer,
};
