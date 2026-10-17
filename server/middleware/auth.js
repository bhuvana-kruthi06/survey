const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "survey_jwt_secret_key_2025";

/**
 * Verify JWT token and attach active user to req.user
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required. Token missing." });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Session expired. Please log in again." });
      }
      return res.status(401).json({ error: "Invalid authentication token." });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Account no longer exists." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "Account is suspended. Please contact administrator." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Authentication error: " + err.message });
  }
};

/**
 * Enforce role-based access control
 * @param  {...string} roles - e.g. 'admin', 'creator'
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Administrator privileges required.`,
        requiredRoles: roles,
        currentRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
  JWT_SECRET,
};
