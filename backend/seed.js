const mongoose = require("mongoose");
const User = require("./models/User");
const InventoryItem = require("./models/InventoryItem");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/mapua_inventory";

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Function to generate random date within a range
const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Generate inventory data function
const generateInventoryData = () => {
  // Common building and location data
  const buildings = [
    "Basement 1",
    "Ground Floor",
    "2nd Floor",
    "3rd Floor",
    "4th Floor",
    "5th Floor",
    "6th Floor",
    "7th Floor",
  ];

  const floors = [
    "Basement 1",
    "Ground Floor",
    "2nd Floor",
    "3rd Floor",
    "4th Floor",
    "5th Floor",
    "6th Floor",
    "7th Floor",
  ];

  const roomTypes = [
    "Office",
    "ILMO Laboratory",
    "Function Room",
    "Lecture Room",
  ];

  // Computer specifications
  const computerBrands = [
    "DELL",
    "ACER",
    "LENOVO",
    "APPLE",
    "HP",
    "ASUS",
    "Others",
  ];

  const computerModels = [
    "OptiPlex 7080",
    "EliteDesk 800 G6",
    "ThinkCentre M720",
    "Precision 3650",
    "ProDesk 600 G6",
    "Mac mini M1",
    "Veriton X4670G",
    "ExpertCenter D7",
    "Surface Studio",
    "ThinkStation P350",
  ];

  const processors = [
    "Intel Core i3-10100",
    "Intel Core i5-10500",
    "Intel Core i7-10700",
    "Intel Core i9-10900",
    "AMD Ryzen 3 5300G",
    "AMD Ryzen 5 5600X",
    "AMD Ryzen 7 5800X",
    "AMD Ryzen 9 5900X",
    "Apple M1",
    "Intel Xeon E-2300",
  ];

  const operatingSystems = [
    { name: "Windows 10 Pro", versions: ["20H2", "21H1", "21H2", "22H1"] },
    { name: "Windows 11 Pro", versions: ["21H2", "22H2", "23H2"] },
    { name: "macOS", versions: ["Big Sur", "Monterey", "Ventura", "Sonoma"] },
    {
      name: "Ubuntu Linux",
      versions: ["20.04 LTS", "22.04 LTS", "23.10", "24.04 LTS"],
    },
  ];

  const memoryOptions = [
    "4GB DDR4",
    "8GB DDR4",
    "16GB DDR4",
    "32GB DDR4",
    "64GB DDR4",
  ];
  const storageTypes = ["HDD", "SSD"];
  const storageSizes = ["256GB", "512GB", "1TB", "2TB"];
  const statusOptions = [
    "Available",
    "In Use",
    "Maintenance",
    "Expiring Soon",
    "Retired",
  ];

  // Peripherals
  const monitorModels = [
    "Dell P2419H",
    "HP E24 G4",
    "Lenovo ThinkVision T24i-20",
    "ASUS ProArt PA278CV",
    "LG 27UL850-W",
    "Samsung S27R650",
    "ViewSonic VG2755-2K",
  ];

  const keyboardModels = [
    "Logitech K120",
    "Microsoft Wired Keyboard 600",
    "Dell KB216",
    "HP 320K",
    "Lenovo Professional Wired Keyboard",
  ];

  const mouseModels = [
    "Logitech M100",
    "Microsoft Basic Optical Mouse",
    "Dell MS116",
    "HP 320M",
    "Lenovo Essential Wired Mouse",
  ];

  // Generate inventory items
  const items = [];

  for (let i = 1; i <= 115; i++) {
    // Create 115 items
    const building = buildings[Math.floor(Math.random() * buildings.length)];
    const floor = floors[Math.floor(Math.random() * floors.length)];

    const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
    // Generate a more descriptive room name/number/department
    const roomNameOrNumber = `${roomType} - ${
      Math.random() > 0.5
        ? "Room " + Math.floor(Math.random() * 500 + 100)
        : ["IT Department", "HR Department", "Finance Department"][
            Math.floor(Math.random() * 3)
          ]
    }`;

    const computerBrand =
      computerBrands[Math.floor(Math.random() * computerBrands.length)];
    let computerModel =
      computerModels[Math.floor(Math.random() * computerModels.length)];
    // Combine brand and model
    if (computerBrand !== "Others") {
      computerModel = `${computerBrand} ${computerModel}`;
    } else {
      computerModel = `Other Model ${Math.floor(Math.random() * 100)}`;
    }

    const brandPrefix = computerBrand.substring(0, 2).toUpperCase();
    const serialNumber = `${brandPrefix}-${i.toString().padStart(5, "0")}-${
      Math.floor(Math.random() * 999) + 100
    }`;

    const osChoice =
      operatingSystems[Math.floor(Math.random() * operatingSystems.length)];
    const operatingSystem = osChoice.name;
    const osVersion =
      osChoice.versions[Math.floor(Math.random() * osChoice.versions.length)];

    const processor = processors[Math.floor(Math.random() * processors.length)];
    const memoryRAM =
      memoryOptions[Math.floor(Math.random() * memoryOptions.length)];

    const storageType =
      storageTypes[Math.floor(Math.random() * storageTypes.length)];
    const storageSize =
      storageSizes[Math.floor(Math.random() * storageSizes.length)];
    const storage = `${storageSize} ${storageType}`;

    const status =
      statusOptions[Math.floor(Math.random() * statusOptions.length)];

    // Generate purchase and warranty dates
    const currentYear = new Date().getFullYear();
    const purchaseDate = randomDate(
      new Date(currentYear - 3, 0, 1),
      new Date(currentYear, 11, 31)
    );
    const warrantyYears = [2, 3, 5][Math.floor(Math.random() * 3)];
    const warrantyExpiry = new Date(purchaseDate);
    warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + warrantyYears);

    // Generate peripherals
    const monitorModel =
      monitorModels[Math.floor(Math.random() * monitorModels.length)];
    const monitorSN = `MON${Math.floor(10000 + Math.random() * 90000)}`;
    const monitorModelSN = `${monitorModel} (${monitorSN})`;

    const keyboardModel =
      keyboardModels[Math.floor(Math.random() * keyboardModels.length)];
    const keyboardSN = `KB${Math.floor(10000 + Math.random() * 90000)}`;
    const keyboardModelSN = `${keyboardModel} (${keyboardSN})`;

    const mouseModel =
      mouseModels[Math.floor(Math.random() * mouseModels.length)];
    const mouseSN = `MS${Math.floor(10000 + Math.random() * 90000)}`;
    const mouseModelSN = `${mouseModel} (${mouseSN})`;

    // Notes with computer details
    const notes =
      status === "Maintenance"
        ? `Currently undergoing ${
            [
              "hardware upgrade",
              "software update",
              "repair",
              "routine maintenance",
            ][Math.floor(Math.random() * 4)]
          }.`
        : status === "Retired"
        ? `Retired due to ${
            [
              "obsolescence",
              "irreparable damage",
              "end of life cycle",
              "replacement",
            ][Math.floor(Math.random() * 4)]
          }.`
        : `Standard workstation.`;

    // Create the item object
    items.push({
      building, // Corresponds to Campus Area
      floor: building, // Map Campus Area to floor as well for simplicity based on form structure
      roomNameOrNumber, // Corresponds to Room Description
      computerNameOrId: `MAPUA-PC-${i.toString().padStart(4, "0")}`, // Keep existing format
      computerModel, // Now includes Brand and Model
      serialNumber,
      operatingSystem,
      osVersion,
      processor,
      memoryRAM,
      storage, // Now includes Size and Type
      status,
      monitorModelSN, // Keep peripherals as they are not in the core form fields but are useful
      keyboardModelSN,
      mouseModelSN,
      otherPeripherals:
        Math.random() > 0.5
          ? ["Webcam", "Headset", "External Speakers", "Graphics Tablet"][
              Math.floor(Math.random() * 4)
            ]
          : "",
      purchaseDate,
      warrantyExpiry,
      notes,
      submittedBy: `Admin${Math.floor(Math.random() * 3) + 1}`, // Keep existing format
    });
  }

  return items;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data to start fresh
    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await InventoryItem.deleteMany({});
    console.log("✅ Existing data cleared");

    // Create 3 admin accounts
    console.log("👑 Creating admin accounts...");
    const admins = [];

    for (let i = 1; i <= 3; i++) {
      const adminUser = new User({
        username: `admin${i}`,
        email: `admin${i}@mapua.edu.ph`,
        password: `adminpassword${i}`,
        role: "admin",
      });

      await adminUser.save();
      admins.push({ username: `admin${i}`, password: `adminpassword${i}` });
    }

    console.log("✅ Admin accounts created:");
    admins.forEach((admin) => {
      console.log(
        `📝 Username: ${admin.username}, Password: ${admin.password}`
      );
    });

    // Create 7 OJT accounts
    console.log("👷 Creating OJT accounts...");
    const ojts = [];

    for (let i = 1; i <= 7; i++) {
      const ojtUser = new User({
        username: `ojt${i}`,
        email: `ojt${i}@mapua.edu.ph`,
        password: `ojtpassword${i}`,
        role: "ojt",
      });

      await ojtUser.save();
      ojts.push({ username: `ojt${i}`, password: `ojtpassword${i}` });
    }

    console.log("✅ OJT accounts created:");
    ojts.forEach((ojt) => {
      console.log(`📝 Username: ${ojt.username}, Password: ${ojt.password}`);
    });

    // Create 100+ inventory items
    console.log("🖥️ Creating inventory items...");
    const inventoryItems = generateInventoryData();

    for (const item of inventoryItems) {
      const inventoryItem = new InventoryItem(item);
      await inventoryItem.save();
    }

    console.log(`✅ ${inventoryItems.length} inventory items created`);

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
