require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
 
const app = express();
 
// ── Middleware ──
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://your-frontend.vercel.app"
  ]
}));
app.use(express.json());
 
// ── Routes ──
app.use("/api/surveys",   require("./routes/surveys"));
app.use("/api/responses", require("./routes/responses"));
app.use('/api/results', require('./routes/responses')); 
 
// ── Test route ──
app.get("/", (req, res) => {
  res.send("SurveyFlow API is running ✅");
});
 
// ── Connect MongoDB then start server ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });