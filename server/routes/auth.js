const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken, JWT_SECRET } = require("../middleware/auth");

/**
 * Generate standard JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ── POST /api/auth/register ──
// Public registration for respondents / survey creators.
// Prevents privilege escalation: admin role CANNOT be assigned here.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    // Role assignment: standard users default to 'creator' (can create & take surveys)
    // Never allow 'admin' from registration body
    let assignedRole = "creator";
    if (req.body.role === "respondent") {
      assignedRole = "respondent";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
      status: "active",
      lastLogin: new Date(),
    });

    await user.save();
    const token = generateToken(user);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
});

// ── POST /api/auth/login ──
// General user login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "Your account has been suspended. Please contact the administrator." });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

// ── POST /api/auth/admin-login ──
// Dedicated admin login endpoint
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials or unauthorized access." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials or unauthorized access." });
    }

    // Server-side admin verification
    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied. This account does not possess administrator credentials.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        error: "Administrator account is suspended. Contact system administrator.",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      message: "Admin authentication successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: "Admin login failed: " + err.message });
  }
});

// ── GET /api/auth/me ──
// Validate token and return fresh authenticated user data
router.get("/me", verifyToken, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
