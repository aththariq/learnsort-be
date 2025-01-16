const authRoutes = require("./authRoutes");
const quizRoutes = require("./quizRoutes");
const userProgress = require("./userProgress");

module.exports = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/quiz", quizRoutes);
  app.use("/api/user", userProgress);
};
