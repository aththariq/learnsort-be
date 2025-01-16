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
  progressHistory: [
    {
      module: {
        type: String,
        required: true,
      },
      percentageAdded: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  quizHistory: [
    {
      quizId: {
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
