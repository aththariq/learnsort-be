const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Cek apakah name sudah ada
    const nameExists = await User.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: "Name already exists" });
    }

    // Cek apakah email sudah ada
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat user baru
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: "Register berhasil",
    });
  } catch (error) {
    res.status(400).json({ message: "User registration failed", error });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cek apakah user ada
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      message: "Login berhasil",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ message: "Login failed", error: error.message }); // Tampilkan pesan error
  }
};

// @desc    Login with Google
// @route   POST /api/auth/google
// @access  Public
const loginWithGoogle = async (req, res) => {
  const { token } = req.body; // ID token dari Google

  try {
    // Verifikasi token dengan Google API
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload(); 

    // Cek apakah user sudah ada di database
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      // Buat user baru jika belum ada
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub, 
      });
    }

    // Generate JWT untuk autentikasi selanjutnya
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Kirim respons ke frontend
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: jwtToken,
      message: "Login with Google berhasil",
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res
      .status(400)
      .json({ message: "Login with Google gagal", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginWithGoogle,
};
