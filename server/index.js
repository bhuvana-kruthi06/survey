require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ── Middleware ──
app.use(cors({
  origin: true, // Allow any development origin (localhost:5173, 5174, 5175, etc.)
  credentials: true,
}));
app.use(express.json());

// ── Routes ──
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/admin",     require("./routes/admin"));
app.use("/api/surveys",   require("./routes/surveys"));
app.use("/api/responses", require("./routes/responses"));
app.use("/api/results",   require("./routes/responses"));

// ── Health / test route ──
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "SurveyFlow API is running ✅",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

// ── Start server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// ── Connect MongoDB with Graceful Fallback ──
const primaryUri = process.env.MONGO_URI;
const fallbackUri = "mongodb://127.0.0.1:27017/survey";

async function connectDatabase() {
  if (primaryUri) {
    try {
      await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 4000 });
      console.log("MongoDB connected successfully to primary URI");
      return;
    } catch (err) {
      console.warn(`Primary MongoDB connection failed (${err.message}). Connecting to local fallback...`);
    }
  }

  try {
    await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 4000 });
    console.log("MongoDB connected successfully to local instance (127.0.0.1:27017/survey)");
  } catch (err) {
    console.error("MongoDB connection failed completely:", err.message);
  }
}

connectDatabase();