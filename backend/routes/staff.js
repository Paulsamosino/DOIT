const express = require("express");
const InventoryItem = require("../models/InventoryItem");
const { auth, ojtAuth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/ojt/inventory
// @desc    Create a new inventory item (OJT access)
// @access  Private (OJT only)
router.post("/inventory", auth, ojtAuth, async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      submittedBy: req.user.username,
    };

    const item = new InventoryItem(itemData);
    await item.save();

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: { item },
    });
  } catch (error) {
    console.error("Create inventory item error:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error creating inventory item",
      error: error.message,
    });
  }
});

// @route   GET /api/ojt/profile
// @desc    Get OJT user profile
// @access  Private (OJT)
router.get("/profile", auth, ojtAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Get OJT profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting profile",
      error: error.message,
    });
  }
});

module.exports = router;
