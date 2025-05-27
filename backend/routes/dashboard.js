const express = require("express");
const InventoryItem = require("../models/InventoryItem");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    // Get total inventory items
    const totalItems = await InventoryItem.countDocuments();

    // Get active users count
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get count by status
    const statusCounts = await InventoryItem.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format status counts for easier frontend consumption
    const statusStats = {
      Available: 0,
      "In Use": 0,
      Maintenance: 0,
      "Expiring Soon": 0,
      Retired: 0,
    };

    statusCounts.forEach((item) => {
      statusStats[item._id] = item.count;
    });

    // Get items added in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentlyAdded = await InventoryItem.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Get items with warranty expiring in next 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringWarranties = await InventoryItem.countDocuments({
      warrantyExpiry: {
        $gte: now,
        $lte: thirtyDaysFromNow,
      },
    });

    // Get items by building
    const itemsByBuilding = await InventoryItem.aggregate([
      {
        $group: {
          _id: "$building",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalItems,
          activeUsers,
          recentlyAdded,
          expiringWarranties,
        },
        statusStats,
        itemsByBuilding,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving dashboard statistics",
      error: error.message,
    });
  }
});

// @route   GET /api/dashboard/recent-activity
// @desc    Get recent activity for dashboard
// @access  Private
router.get("/recent-activity", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get recently updated items
    const recentlyUpdated = await InventoryItem.find()
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select(
        "computerNameOrId computerModel building floor roomNameOrNumber status updatedAt createdAt"
      );

    // Format the activity data
    const activities = recentlyUpdated.map((item) => {
      const isNew = item.createdAt.getTime() === item.updatedAt.getTime();
      return {
        id: item._id,
        type: isNew ? "created" : "updated",
        action: isNew ? "Added new item" : "Updated item",
        item: {
          name: item.computerNameOrId || "Unnamed Device",
          model: item.computerModel,
          location: `${item.building} - Floor ${item.floor} - ${item.roomNameOrNumber}`,
          status: item.status,
        },
        timestamp: item.updatedAt,
      };
    });

    res.json({
      success: true,
      data: { activities },
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

// @route   GET /api/dashboard/alerts
// @desc    Get system alerts (warranty expiring, maintenance needed, etc.)
// @access  Private
router.get("/alerts", auth, async (req, res) => {
  try {
    const now = new Date();
    const alerts = [];

    // Check for expiring warranties (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringWarranties = await InventoryItem.find({
      warrantyExpiry: {
        $gte: now,
        $lte: thirtyDaysFromNow,
      },
    }).select(
      "computerNameOrId computerModel warrantyExpiry building roomNameOrNumber"
    );

    expiringWarranties.forEach((item) => {
      const daysUntilExpiry = Math.ceil(
        (item.warrantyExpiry - now) / (1000 * 60 * 60 * 24)
      );
      alerts.push({
        type: "warranty",
        severity: daysUntilExpiry <= 7 ? "high" : "medium",
        title: "Warranty Expiring Soon",
        message: `${
          item.computerNameOrId || item.computerModel
        } warranty expires in ${daysUntilExpiry} days`,
        item: {
          id: item._id,
          name: item.computerNameOrId,
          model: item.computerModel,
          location: `${item.building} - ${item.roomNameOrNumber}`,
        },
        daysUntilExpiry,
      });
    });

    // Check for items in maintenance
    const maintenanceItems = await InventoryItem.find({
      status: "Maintenance",
    }).select(
      "computerNameOrId computerModel building roomNameOrNumber updatedAt"
    );

    maintenanceItems.forEach((item) => {
      const daysSinceMaintenance = Math.floor(
        (now - item.updatedAt) / (1000 * 60 * 60 * 24)
      );
      alerts.push({
        type: "maintenance",
        severity: daysSinceMaintenance > 7 ? "high" : "low",
        title: "Item in Maintenance",
        message: `${
          item.computerNameOrId || item.computerModel
        } has been in maintenance for ${daysSinceMaintenance} days`,
        item: {
          id: item._id,
          name: item.computerNameOrId,
          model: item.computerModel,
          location: `${item.building} - ${item.roomNameOrNumber}`,
        },
        daysSinceMaintenance,
      });
    });

    // Sort alerts by severity (high first)
    alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    res.json({
      success: true,
      data: { alerts },
    });
  } catch (error) {
    console.error("Get alerts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving alerts",
      error: error.message,
    });
  }
});

module.exports = router;
