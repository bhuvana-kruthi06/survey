require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/survey";

// CLI arguments or env variables or defaults
const args = process.argv.slice(2);
const adminEmail = (args[0] || process.env.ADMIN_EMAIL || "admin@surveyflow.com").toLowerCase().trim();
const adminPassword = args[1] || process.env.ADMIN_PASSWORD || "Admin@123456";
const adminName = args[2] || process.env.ADMIN_NAME || "System Administrator";

async function seedAdmin() {
  console.log("🌱 Starting Admin Account Seed Script...");
  console.log(`Connecting to database...`);

  let connected = false;
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    connected = true;
  } catch (err) {
    console.warn(`Primary connection failed (${err.message}). Attempting fallback to local MongoDB...`);
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/survey", { serverSelectionTimeoutMS: 5000 });
      connected = true;
    } catch (fallbackErr) {
      console.error("❌ Could not connect to any MongoDB instance:", fallbackErr.message);
      process.exit(1);
    }
  }

  if (!connected) {
    console.error("❌ MongoDB connection could not be established.");
    process.exit(1);
  }

  try {
    const existing = await User.findOne({ email: adminEmail });
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (existing) {
      existing.name = adminName;
      existing.password = hashedPassword;
      existing.role = "admin";
      existing.status = "active";
      await existing.save();

      console.log("==================================================");
      console.log("✅ Admin account successfully updated!");
      console.log(`Email : ${adminEmail}`);
      console.log(`Name  : ${adminName}`);
      console.log(`Role  : admin`);
      console.log(`Status: active`);
      console.log("==================================================");
    } else {
      const newAdmin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        status: "active",
      });
      await newAdmin.save();

      console.log("==================================================");
      console.log("✅ New Admin account successfully created!");
      console.log(`Email : ${adminEmail}`);
      console.log(`Name  : ${adminName}`);
      console.log(`Role  : admin`);
      console.log(`Status: active`);
      console.log("==================================================");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin account:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
