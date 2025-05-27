const express = require("express");
const InventoryItem = require("../models/InventoryItem");
const { auth, adminAuth, ojtAuth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/inventory
// @desc    Get all inventory items with search, filter, and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      building = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query object
    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { computerNameOrId: { $regex: search, $options: "i" } },
        { computerModel: { $regex: search, $options: "i" } },
        { building: { $regex: search, $options: "i" } },
        { roomNameOrNumber: { $regex: search, $options: "i" } },
        { serialNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by building
    if (building) {
      query.building = building;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const items = await InventoryItem.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await InventoryItem.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error("Get inventory items error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving inventory items",
      error: error.message,
    });
  }
});

// @route   GET /api/inventory/:id
// @desc    Get single inventory item by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    res.json({
      success: true,
      data: { item },
    });
  } catch (error) {
    console.error("Get inventory item error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory item ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error retrieving inventory item",
      error: error.message,
    });
  }
});

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private (Admin)
router.post("/", auth, adminAuth, async (req, res) => {
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

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Serial number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error creating inventory item",
      error: error.message,
    });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private (Admin)
router.put("/:id", auth, adminAuth, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // Update item with new data
    Object.keys(req.body).forEach((key) => {
      item[key] = req.body[key];
    });

    await item.save();

    res.json({
      success: true,
      message: "Inventory item updated successfully",
      data: { item },
    });
  } catch (error) {
    console.error("Update inventory item error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory item ID format",
      });
    }

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

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Serial number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error updating inventory item",
      error: error.message,
    });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private (Admin)
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    await InventoryItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Delete inventory item error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory item ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error deleting inventory item",
      error: error.message,
    });
  }
});

// @route   GET /api/inventory/stats/summary
// @desc    Get inventory statistics for dashboard
// @access  Private
router.get("/stats/summary", auth, async (req, res) => {
  try {
    // Get total count
    const totalItems = await InventoryItem.countDocuments();

    // Get count by status
    const statusStats = await InventoryItem.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent items (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentItems = await InventoryItem.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Get items with warranty expiring soon (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringWarranties = await InventoryItem.countDocuments({
      warrantyExpiry: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow,
      },
    });

    res.json({
      success: true,
      data: {
        totalItems,
        statusStats,
        recentItems,
        expiringWarranties,
      },
    });
  } catch (error) {
    console.error("Get inventory stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving inventory statistics",
      error: error.message,
    });
  }
});

// @route   GET /api/inventory/recent-activity
// @desc    Get recent inventory activity
// @access  Private
router.get("/recent-activity", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentItems = await InventoryItem.find()
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select(
        "computerNameOrId computerModel building roomNameOrNumber status updatedAt"
      );

    res.json({
      success: true,
      data: { recentItems },
    });
  } catch (error) {
    console.error("Get recent activity error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving recent activity",
      error: error.message,
    });
  }
});

module.exports = router;
