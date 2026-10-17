const mongoose = require("mongoose");
 
// ── Question schema (used inside Survey) ──
const questionSchema = new mongoose.Schema({
  id:          { type: String },
  type:        { type: String, enum: ["radio", "checkbox", "rating", "textarea"] },
  text:        { type: String, required: true },
  required:    { type: Boolean, default: true },
  options:     [String],
  min:         Number,
  max:         Number,
  lowLabel:    String,
  highLabel:   String,
  placeholder: String,
});
 
// ── Survey schema ──
const surveySchema = new mongoose.Schema({
  title:         { type: String, required: true },
  description:   { type: String, default: "" },
  estimatedTime: { type: String, default: "2 min" },
  questions:     [questionSchema],
  createdBy:     { type: String, default: "admin" },
  status:        { type: String, enum: ["active", "inactive", "archived"], default: "active" },
  createdAt:     { type: Date,   default: Date.now },
});
 
module.exports = mongoose.model("Survey", surveySchema);