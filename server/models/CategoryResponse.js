const mongoose = require("mongoose");

const categoryResponseSchema = new mongoose.Schema({
  surveyName: { type: String, required: true },
  category:   { type: String, required: true },
  answers:    { type: Object, required: true },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CategoryResponse", categoryResponseSchema);