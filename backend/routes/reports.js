const express = require("express");
const InventoryItem = require("../models/InventoryItem");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/reports/data
// @desc    Get comprehensive report data
// @access  Private
router.get("/data", auth, async (req, res) => {
  try {
    // Get total items
    const totalItems = await InventoryItem.countDocuments();

    // Get items by status
    const statusCounts = await InventoryItem.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format status data
    const itemsByStatus = {};
    statusCounts.forEach((item) => {
      itemsByStatus[item._id] = item.count;
    });

    // Get items by building
    const buildingCounts = await InventoryItem.aggregate([
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

    // Format building data
    const itemsByBuilding = {};
    buildingCounts.forEach((item) => {
      itemsByBuilding[item._id] = item.count;
    });

    // Get expiring warranties (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringWarranties = await InventoryItem.countDocuments({
      warrantyExpiry: {
        $gte: now,
        $lte: thirtyDaysFromNow,
      },
    });

    // Get items by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const itemsByMonth = await InventoryItem.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Format month data
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedMonthData = itemsByMonth.map((item) => ({
      month: monthNames[item._id.month - 1],
      count: item.count,
    }));

    // Get detailed status breakdown
    const statusBreakdown = await InventoryItem.aggregate([
      {
        $group: {
          _id: {
            status: "$status",
            building: "$building",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.status",
          buildings: {
            $push: {
              building: "$_id.building",
              count: "$count",
            },
          },
          totalCount: { $sum: "$count" },
        },
      },
    ]);

    // Get items by floor
    const floorCounts = await InventoryItem.aggregate([
      {
        $group: {
          _id: {
            building: "$building",
            floor: "$floor",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.building": 1, "_id.floor": 1 },
      },
    ]);

    const itemsByFloor = {};
    floorCounts.forEach((item) => {
      const key = `${item._id.building} - Floor ${item._id.floor}`;
      itemsByFloor[key] = item.count;
    });

    res.json({
      success: true,
      data: {
        totalItems,
        itemsByStatus,
        itemsByBuilding,
        itemsByFloor,
        expiringWarranties,
        itemsByMonth: formattedMonthData,
        statusBreakdown,
      },
    });
  } catch (error) {
    console.error("Get reports data error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving reports data",
      error: error.message,
    });
  }
});

// @route   GET /api/reports/summary
// @desc    Get summary statistics for reports
// @access  Private
router.get("/summary", auth, async (req, res) => {
  try {
    const now = new Date();

    // Basic counts
    const totalItems = await InventoryItem.countDocuments();
    const availableItems = await InventoryItem.countDocuments({
      status: "Available",
    });
    const inUseItems = await InventoryItem.countDocuments({ status: "In Use" });
    const maintenanceItems = await InventoryItem.countDocuments({
      status: "Maintenance",
    });

    // Items added this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const addedThisMonth = await InventoryItem.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Items updated this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const updatedThisWeek = await InventoryItem.countDocuments({
      updatedAt: { $gte: oneWeekAgo },
    });

    // Warranty expiring counts
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringIn30Days = await InventoryItem.countDocuments({
      warrantyExpiry: {
        $gte: now,
        $lte: thirtyDaysFromNow,
      },
    });

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringIn7Days = await InventoryItem.countDocuments({
      warrantyExpiry: {
        $gte: now,
        $lte: sevenDaysFromNow,
      },
    });

    // Building with most items
    const buildingCounts = await InventoryItem.aggregate([
      {
        $group: {
          _id: "$building",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    const topBuilding = buildingCounts[0] || { _id: "N/A", count: 0 };

    res.json({
      success: true,
      data: {
        totalItems,
        availableItems,
        inUseItems,
        maintenanceItems,
        addedThisMonth,
        updatedThisWeek,
        expiringIn30Days,
        expiringIn7Days,
        topBuilding: {
          name: topBuilding._id,
          count: topBuilding.count,
        },
      },
    });
  } catch (error) {
    console.error("Get reports summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving reports summary",
      error: error.message,
    });
  }
});

// @route   GET /api/reports/export/csv
// @desc    Export report data as CSV
// @access  Private
router.get("/export/csv", auth, async (req, res) => {
  try {
    const items = await InventoryItem.find()
      .select(
        "computerNameOrId computerModel status building floor roomNameOrNumber " +
          "category serialNumber purchaseDate warrantyExpiry cost createdAt updatedAt"
      )
      .sort({ createdAt: -1 });

    // Create CSV headers
    const headers = [
      "Computer Name/ID",
      "Model",
      "Status",
      "Building",
      "Floor",
      "Room",
      "Category",
      "Serial Number",
      "Purchase Date",
      "Warranty Expiry",
      "Cost",
      "Created At",
      "Updated At",
    ];

    // Create CSV rows
    const csvRows = items.map((item) => [
      item.computerNameOrId || "",
      item.computerModel || "",
      item.status || "",
      item.building || "",
      item.floor || "",
      item.roomNameOrNumber || "",
      item.category || "",
      item.serialNumber || "",
      item.purchaseDate ? item.purchaseDate.toISOString().split("T")[0] : "",
      item.warrantyExpiry
        ? item.warrantyExpiry.toISOString().split("T")[0]
        : "",
      item.cost || "",
      item.createdAt ? item.createdAt.toISOString() : "",
      item.updatedAt ? item.updatedAt.toISOString() : "",
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Set response headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="inventory_report.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Export CSV error:", error);
    res.status(500).json({
      success: false,
      message: "Server error exporting CSV",
      error: error.message,
    });
  }
});

// @route   GET /api/reports/export/pdf
// @desc    Export report data as PDF (now with actual PDF generation)
// @access  Private
router.get("/export/pdf", auth, async (req, res) => {
  try {
    const PDFDocument = require("pdfkit");
    const reportData = await getReportDataForExport();

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="inventory_report.pdf"'
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text("Inventory Report", 50, 50);
    doc
      .fontSize(12)
      .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);

    // Add summary section
    doc.fontSize(16).text("Summary", 50, 120);
    let yPosition = 150;

    doc
      .fontSize(12)
      .text(`Total Items: ${reportData.summary.totalItems}`, 50, yPosition);
    yPosition += 20;

    // Add status breakdown
    doc.fontSize(14).text("Items by Status:", 50, yPosition + 20);
    yPosition += 50;

    reportData.statusBreakdown.forEach((status) => {
      doc.fontSize(12).text(`${status._id}: ${status.count}`, 70, yPosition);
      yPosition += 20;
    });

    // Add building breakdown
    yPosition += 20;
    doc.fontSize(14).text("Items by Building:", 50, yPosition);
    yPosition += 30;

    reportData.buildingBreakdown.forEach((building) => {
      doc
        .fontSize(12)
        .text(`${building._id}: ${building.count}`, 70, yPosition);
      yPosition += 20;
    });

    // Add recent items section
    yPosition += 20;
    doc.fontSize(14).text("Recent Items:", 50, yPosition);
    yPosition += 30;

    reportData.recentItems.slice(0, 10).forEach((item) => {
      doc
        .fontSize(10)
        .text(
          `${item.computerNameOrId || "Unnamed"} - ${
            item.computerModel || "Unknown Model"
          } (${item.status})`,
          70,
          yPosition
        );
      yPosition += 15;
    });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Export PDF error:", error);
    res.status(500).json({
      success: false,
      message: "Server error exporting PDF",
      error: error.message,
    });
  }
});

// Helper function to get report data for export
async function getReportDataForExport() {
  const [totalItems, statusCounts, buildingCounts, recentItems] =
    await Promise.all([
      InventoryItem.countDocuments(),
      InventoryItem.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      InventoryItem.aggregate([
        {
          $group: {
            _id: "$building",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]),
      InventoryItem.find()
        .limit(10)
        .sort({ createdAt: -1 })
        .select(
          "computerNameOrId computerModel status building floor roomNameOrNumber createdAt"
        ),
    ]);

  return {
    summary: {
      totalItems,
      generatedAt: new Date().toISOString(),
    },
    statusBreakdown: statusCounts,
    buildingBreakdown: buildingCounts,
    recentItems,
  };
}

// @route   GET /api/reports/analytics
// @desc    Get detailed analytics for reports
// @access  Private
router.get("/analytics", auth, async (req, res) => {
  try {
    const now = new Date();

    // Get items by category
    const categoryAnalytics = await InventoryItem.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalCost: { $sum: { $toDouble: "$cost" } },
          averageCost: { $avg: { $toDouble: "$cost" } },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get warranty status analytics
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

    const warrantyAnalytics = {
      expired: await InventoryItem.countDocuments({
        warrantyExpiry: { $lt: now },
      }),
      expiringSoon: await InventoryItem.countDocuments({
        warrantyExpiry: { $gte: now, $lt: thirtyDaysFromNow },
      }),
      expiringNext30Days: await InventoryItem.countDocuments({
        warrantyExpiry: { $gte: thirtyDaysFromNow, $lt: sixtyDaysFromNow },
      }),
      validWarranty: await InventoryItem.countDocuments({
        warrantyExpiry: { $gte: sixtyDaysFromNow },
      }),
    };

    // Get age distribution (based on purchase date)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const ageDistribution = {
      lessThan1Year: await InventoryItem.countDocuments({
        purchaseDate: { $gte: oneYearAgo },
      }),
      oneToTwoYears: await InventoryItem.countDocuments({
        purchaseDate: { $gte: twoYearsAgo, $lt: oneYearAgo },
      }),
      twoToThreeYears: await InventoryItem.countDocuments({
        purchaseDate: { $gte: threeYearsAgo, $lt: twoYearsAgo },
      }),
      moreThanThreeYears: await InventoryItem.countDocuments({
        purchaseDate: { $lt: threeYearsAgo },
      }),
    };

    // Get cost analysis
    const costAnalysis = await InventoryItem.aggregate([
      {
        $group: {
          _id: null,
          totalInventoryValue: { $sum: { $toDouble: "$cost" } },
          averageItemCost: { $avg: { $toDouble: "$cost" } },
          highestCost: { $max: { $toDouble: "$cost" } },
          lowestCost: { $min: { $toDouble: "$cost" } },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        categoryAnalytics,
        warrantyAnalytics,
        ageDistribution,
        costAnalysis: costAnalysis[0] || {
          totalInventoryValue: 0,
          averageItemCost: 0,
          highestCost: 0,
          lowestCost: 0,
        },
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving analytics",
      error: error.message,
    });
  }
});

module.exports = router;
