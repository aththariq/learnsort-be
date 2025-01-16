const User = require("../models/userModel"); // Sesuaikan path-nya

// @desc    Update user progress
// @route   PUT /api/users/progress
// @access  Private
const updateProgress = async (req, res) => {
  const { module, percentage } = req.body; // Data dari frontend
  const userId = req.user.id; // ID user dari middleware auth

  // Validasi body request
  if (!module || typeof module !== "string") {
    return res
      .status(400)
      .json({ message: "Module is required and must be a string" });
  }
  if (
    percentage === undefined ||
    typeof percentage !== "number" ||
    percentage < 0 ||
    percentage > 100
  ) {
    return res.status(400).json({
      message: "Percentage is required and must be a number between 0 and 100",
    });
  }

  try {
    // Cari user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Inisialisasi progress jika belum ada
    if (!user.progress) {
      user.progress = new Map();
    }

    // Update progress untuk modul tertentu
    user.progress.set(module, percentage);
    await user.save();

    res.status(200).json({
      message: "Progress updated successfully",
      progress: Object.fromEntries(user.progress), // Convert Map to object for response
    });
  } catch (error) {
    console.error("Error in updateProgress:", error); // Log error untuk debugging
    res
      .status(400)
      .json({ message: "Failed to update progress", error: error.message });
  }
};

// @desc    Get user progress
// @route   GET /api/users/progress
// @access  Private
const getProgress = async (req, res) => {
  const userId = req.user.id; // ID user dari middleware auth

  try {
    // Cari user dan ambil progress
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      progress: user.progress,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to get progress", error });
  }
};

module.exports = { updateProgress, getProgress };
