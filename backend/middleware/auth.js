const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    // Check if it starts with 'Bearer '
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // Extract the token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid - user not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }
  } catch (error) {
    console.error("Admin auth middleware error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error in admin authentication",
    });
  }
};

// Middleware to check if user is OJT
const ojtAuth = async (req, res, next) => {
  try {
    if (req.user && (req.user.role === "ojt" || req.user.role === "admin")) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Access denied. OJT or Admin privileges required.",
      });
    }
  } catch (error) {
    console.error("OJT auth middleware error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error in OJT authentication",
    });
  }
};

module.exports = { auth, adminAuth, ojtAuth };
