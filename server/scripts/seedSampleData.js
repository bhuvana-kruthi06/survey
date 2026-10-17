require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Survey = require("../models/Survey");
const Response = require("../models/Response");
const CategoryResponse = require("../models/CategoryResponse");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/survey";

async function seedData() {
  await mongoose.connect(MONGO_URI);
  console.log("Seeding sample data for demonstration...");

  // Seed sample users
  const creatorPassword = await bcrypt.hash("Creator@123", 10);
  const respondentPassword = await bcrypt.hash("User@123456", 10);

  const creatorUser = await User.findOneAndUpdate(
    { email: "sarah.creator@example.com" },
    {
      name: "Sarah Creator",
      email: "sarah.creator@example.com",
      password: creatorPassword,
      role: "creator",
      status: "active",
      createdAt: new Date(Date.now() - 5 * 86400000),
    },
    { upsert: true, new: true }
  );

  const respondentUser = await User.findOneAndUpdate(
    { email: "john.doe@example.com" },
    {
      name: "John Doe",
      email: "john.doe@example.com",
      password: respondentPassword,
      role: "respondent",
      status: "active",
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
    { upsert: true, new: true }
  );

  // Seed sample survey
  let survey = await Survey.findOne({ title: "Product Experience & Usability Survey" });
  if (!survey) {
    survey = new Survey({
      title: "Product Experience & Usability Survey",
      description: "Feedback on customer satisfaction, navigation ease, and feature requests.",
      estimatedTime: "3 min",
      createdBy: "Sarah Creator",
      status: "active",
      questions: [
        {
          id: "q1",
          type: "radio",
          text: "How intuitive did you find the new user onboarding?",
          required: true,
          options: ["Very intuitive", "Moderately easy", "Slightly confusing", "Difficult"],
        },
        {
          id: "q2",
          type: "rating",
          text: "Overall rating of system performance and responsiveness (1-10)",
          required: true,
          min: 1,
          max: 10,
          lowLabel: "Poor",
          highLabel: "Outstanding",
        },
        {
          id: "q3",
          type: "textarea",
          text: "What additional features would you like to see?",
          required: false,
          placeholder: "Share your thoughts...",
        },
      ],
      createdAt: new Date(Date.now() - 4 * 86400000),
    });
    await survey.save();
    console.log("Created sample survey:", survey.title);
  }

  // Seed sample builder responses
  const existingResponses = await Response.countDocuments({ surveyId: survey._id });
  if (existingResponses === 0) {
    await Response.create([
      {
        surveyId: survey._id,
        answers: [
          { questionIndex: 0, answer: "Very intuitive" },
          { questionIndex: 1, answer: "9" },
          { questionIndex: 2, answer: "Love the analytics charts, would love dark mode!" },
        ],
        submittedAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        surveyId: survey._id,
        answers: [
          { questionIndex: 0, answer: "Moderately easy" },
          { questionIndex: 1, answer: "8" },
          { questionIndex: 2, answer: "CSV exports are very fast and useful." },
        ],
        submittedAt: new Date(Date.now() - 1 * 86400000),
      },
    ]);
    console.log("Created sample responses for survey");
  }

  // Seed sample category response
  const existingCatResponses = await CategoryResponse.countDocuments();
  if (existingCatResponses === 0) {
    await CategoryResponse.create([
      {
        surveyName: "Tech Conference 2025",
        category: "Events",
        answers: {
          "Keynote speaker quality": "Excellent",
          "Session relevance": "Very relevant",
          "Networking opportunities": "Good",
        },
        submittedAt: new Date(Date.now() - 12 * 3600000),
      },
      {
        surveyName: "Electronics & Gadgets",
        category: "Products",
        answers: {
          "Build quality": "High",
          "Value for money": "Satisfied",
          "Recommendation likelihood": "10/10",
        },
        submittedAt: new Date(Date.now() - 6 * 3600000),
      },
    ]);
    console.log("Created sample category responses");
  }

  console.log("Sample data seeding complete!");
  await mongoose.disconnect();
}

seedData();
