const express = require("express");
const router = express.Router();
const Response = require("../models/Response");
const CategoryResponse = require("../models/CategoryResponse");

// ── POST submit a pre-built category survey response ──
router.post("/category", async (req, res) => {
  try {
    const { surveyName, category, answers } = req.body;
    if (!surveyName || !category || !answers) {
      return res.status(400).json({ error: "surveyName, category, and answers are required." });
    }
    const catResponse = new CategoryResponse({
      surveyName,
      category,
      answers,
    });
    const saved = await catResponse.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── GET all category responses ──
router.get("/category/all", async (req, res) => {
  try {
    const responses = await CategoryResponse.find().sort({ submittedAt: -1 });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST submit a custom builder survey response ──
router.post("/", async (req, res) => {
  try {
    const response = new Response(req.body);
    const saved    = await response.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── GET response count for a survey ──
router.get("/:surveyId/count", async (req, res) => {
  try {
    const count = await Response.countDocuments({ surveyId: req.params.surveyId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET all responses for a specific survey ──
router.get("/:surveyId", async (req, res) => {
  try {
    const responses = await Response.find({ surveyId: req.params.surveyId });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;