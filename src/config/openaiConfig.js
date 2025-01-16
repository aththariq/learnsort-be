require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // Ganti dengan URL aplikasi Anda
    "X-Title": "Quiz App", // Ganti dengan nama aplikasi Anda
  },
});

module.exports = openai;
