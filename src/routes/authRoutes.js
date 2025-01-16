const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const {
  registerUser,
  loginUser,
  loginWithGoogle,
} = require("../controllers/authController");

// Validasi untuk register
const validateRegister = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Validasi untuk login
const validateLogin = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Route untuk register
router.post("/register", validateRegister, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  registerUser(req, res);
});

// Route untuk login
router.post("/login", validateLogin, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  loginUser(req, res);
});

// Route untuk login dengan Google
router.post("/google", loginWithGoogle);

module.exports = router;
