const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// @desc    Auth middleware untuk memverifikasi JWT
const authMiddleware = async (req, res, next) => {
  try {
    // Ambil token dari header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cari user berdasarkan ID di token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Tambahkan user ke object request
    req.user = user;
    next(); // Lanjut ke endpoint berikutnya
  } catch (error) {
    res
      .status(401)
      .json({ message: "Token is not valid", error: error.message });
  }
};

module.exports = authMiddleware;
