const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  progress: {
    type: Map,
    of: Number,
    default: {},
  },
  quizHistory: [
    {
      quizId: {
        // Tambahkan field quizId
        type: String,
        required: true,
      },
      quizzes: [
        {
          id: String,
          question: String,
          options: {
            A: String,
            B: String,
            C: String,
            D: String,
          },
          answer: String,
        },
      ],
      score: Number,
      totalQuestions: Number,
      correctAnswers: Number,
      startTime: Date,
      endTime: Date,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
