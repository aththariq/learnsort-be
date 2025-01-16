// @desc    Update user progress
// @route   PUT /api/users/progress
// @access  Private
const updateProgress = async (req, res) => {
  const { module, percentage } = req.body; // Data dari frontend
  const userId = req.user.id; // ID user dari middleware auth

  try {
    // Cari user dan update progress
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update progress untuk modul tertentu
    user.progress.set(module, percentage);
    await user.save();

    res.status(200).json({
      message: "Progress updated successfully",
      progress: user.progress,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to update progress", error });
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
