const express = require("express");
const User = require("../models/User");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get("/", auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving users",
      error: error.message,
    });
  }
});

// @route   POST /api/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post("/", auth, adminAuth, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || "ojt", // This role value matches our enum
    });

    // Validate before saving
    try {
      await user.validate();
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: Object.values(validationError.errors).map((err) => err.message),
      });
    }

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user: userResponse },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating user",
      error: error.message,
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put("/:id", auth, adminAuth, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password; // Prevent password update through this route

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating user",
      error: error.message,
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting user",
      error: error.message,
    });
  }
});

// @route   PUT /api/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private (Admin only)
router.put("/:id/toggle-status", auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: "User status toggled successfully",
      data: { user: userResponse },
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error toggling user status",
      error: error.message,
    });
  }
});

module.exports = router;
