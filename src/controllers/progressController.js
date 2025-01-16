const User = require("../models/userModel");

// @desc    Update user progress
// @route   PUT /api/users/progress
// @access  Private
const updateProgress = async (req, res) => {
  const { module } = req.body; // Data dari frontend (hanya module yang dikirim)
  const userId = req.user.id; // ID user dari middleware auth

  // Validasi body request
  if (!module || typeof module !== "string") {
    return res
      .status(400)
      .json({ message: "Module is required and must be a string" });
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

    // Hitung persentase baru
    const currentPercentage = user.progress.get(module) || 0; // Ambil persentase saat ini (default 0)
    const newPercentage = currentPercentage + 12.5; // Tambahkan 12.5%

    // Batasan 1: Pastikan progress untuk modul tidak melebihi 25%
    if (newPercentage > 25) {
      return res.status(400).json({
        message: `Progress for ${module} cannot exceed 25%`,
      });
    }

    // Batasan 2: Hitung total progress keseluruhan
    let totalProgress = 0;
    user.progress.forEach((value) => {
      totalProgress += value;
    });

    // Pastikan total progress tidak melebihi 100%
    if (totalProgress + 12.5 > 100) {
      return res.status(400).json({
        message: "Total progress cannot exceed 100%",
      });
    }

    // Update progress untuk modul tertentu
    user.progress.set(module, newPercentage);

    // Tambahkan riwayat progress
    user.progressHistory.push({
      module: module,
      percentageAdded: 12.5,
      timestamp: new Date(),
    });

    // Simpan perubahan ke database
    await user.save();

    // Kirim respons ke frontend
    res.status(200).json({
      message: "Progress updated successfully",
      progress: Object.fromEntries(user.progress), // Convert Map to object for response
      progressHistory: user.progressHistory, // Kirim riwayat progress
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

    // Kirim progress dan riwayat progress ke frontend
    res.status(200).json({
      progress: Object.fromEntries(user.progress), // Convert Map to object for response
      progressHistory: user.progressHistory, // Kirim riwayat progress
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to get progress", error });
  }
};

module.exports = { updateProgress, getProgress };
