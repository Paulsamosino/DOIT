const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    // Location Information
    building: {
      type: String,
      required: [true, "Building is required"],
      trim: true,
    },
    floor: {
      type: String,
      required: [true, "Floor is required"],
      trim: true,
    },
    roomNameOrNumber: {
      type: String,
      required: [true, "Room name or number is required"],
      trim: true,
    },

    // Computer Information
    computerNameOrId: {
      type: String,
      trim: true,
    },
    computerModel: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
      sparse: true, // Allows multiple null values but enforces uniqueness for non-null values
      index: true,
    },
    operatingSystem: {
      type: String,
      trim: true,
    },
    processor: {
      type: String,
      trim: true,
    },
    memoryRAM: {
      type: String,
      trim: true,
    },
    storage: {
      type: String,
      trim: true,
    },

    // Peripherals
    monitorModelSN: {
      type: String,
      trim: true,
    },
    keyboardModelSN: {
      type: String,
      trim: true,
    },
    mouseModelSN: {
      type: String,
      trim: true,
    },
    otherPeripherals: {
      type: String,
      trim: true,
    },

    // Additional Information
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Available", "In Use", "Maintenance", "Expiring Soon", "Retired"],
      default: "Available",
    },
    purchaseDate: {
      type: Date,
    },
    warrantyExpiry: {
      type: Date,
    },
    submittedBy: {
      type: String,
      trim: true,
    },

    // Auto-generated timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This will automatically manage createdAt and updatedAt
  }
);

// Pre-save middleware to update the updatedAt field
inventoryItemSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient searching
inventoryItemSchema.index({
  computerNameOrId: "text",
  computerModel: "text",
  building: "text",
  roomNameOrNumber: "text",
});

// Virtual for location string
inventoryItemSchema.virtual("location").get(function () {
  return `${this.building} - Floor ${this.floor} - ${this.roomNameOrNumber}`;
});

// Ensure virtual fields are serialized
inventoryItemSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
