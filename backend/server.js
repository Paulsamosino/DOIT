const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth");
const inventoryRoutes = require("./routes/inventory");
const dashboardRoutes = require("./routes/dashboard");
const ojtRoutes = require("./routes/staff");
const usersRoutes = require("./routes/users");
const reportsRoutes = require("./routes/reports");

// Initialize Express app
const app = express();

// Middleware
// Enable CORS with dynamic origin
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development or if origin is not set (like direct API calls)
    if (process.env.NODE_ENV !== 'production' || !origin) {
      callback(null, true);
    } else {
      // In production, you might want to restrict this to your frontend domain
      callback(null, true);
      // For production with specific domains:
      // const allowedOrigins = ['https://your-frontend-domain.com'];
      // if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      //   callback(null, true);
      // } else {
      //   callback(new Error('Not allowed by CORS'));
      // }
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/mapua_inventory";

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected Successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Root route
app.get('/', (req, res) => {
  res.redirect('/api');
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ojt", ojtRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/reports", reportsRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Mapua Makati IT Inventory Portal API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API info route
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Mapua Makati IT Inventory Portal API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      inventory: "/api/inventory",
      dashboard: "/api/dashboard",
      ojt: "/api/ojt",
      users: "/api/users",
      health: "/api/health",
    },
    documentation: "API documentation available on request",
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("🚨 Global Error Handler:", error);

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const validationErrors = Object.values(error.errors).map(
      (err) => err.message
    );
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: validationErrors,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID format",
    });
  }

  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("🚨 Unhandled Promise Rejection:", err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("🚨 Uncaught Exception:", err.message);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("🚀 ========================================");
  console.log(`🚀 Mapua Makati IT Inventory Portal API`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
  console.log("🚀 ========================================");
});

module.exports = app;
