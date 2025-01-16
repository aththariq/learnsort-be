const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

// @desc    Auth middleware untuk memverifikasi JWT
const authMiddleware = async (req, res, next) => {
  try {
    // Ambil token dari header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("Token received:", token); // Log token yang diterima

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Log decoded token

    // Cari user berdasarkan ID di token
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("User not found in database"); // Log jika user tidak ditemukan
      return res.status(401).json({ message: "User not found" });
    }

    console.log("User found:", user); // Log user yang ditemukan

    // Tambahkan user ke object request
    req.user = user;
    next(); // Lanjut ke endpoint berikutnya
  } catch (error) {
    console.error("Auth middleware error:", error); // Log error
    res
      .status(401)
      .json({ message: "Token is not valid", error: error.message });
  }
};

module.exports = authMiddleware;
