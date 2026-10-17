const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Survey = require("../models/Survey");
const Response = require("../models/Response");
const CategoryResponse = require("../models/CategoryResponse");
const { verifyToken, requireRole } = require("../middleware/auth");

// Protect all admin routes with authentication and admin role verification
router.use(verifyToken, requireRole("admin"));

// ── GET /api/admin/overview ──
// Real-time, database-backed summary statistics
router.get("/overview", async (req, res) => {
  try {
    const [
      totalUsers,
      totalCreators,
      totalRespondents,
      totalSurveys,
      activeSurveys,
      inactiveSurveys,
      builderResponsesCount,
      categoryResponsesCount,
      recentUsers,
      recentSurveys,
      recentBuilderResponses,
      recentCategoryResponses,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "creator" }),
      User.countDocuments({ role: "respondent" }),
      Survey.countDocuments(),
      Survey.countDocuments({ status: "active" }),
      Survey.countDocuments({ status: { $in: ["inactive", "archived"] } }),
      Response.countDocuments(),
      CategoryResponse.countDocuments(),
      User.find().select("-password").sort({ createdAt: -1 }).limit(5),
      Survey.find().sort({ createdAt: -1 }).limit(5),
      Response.find().sort({ submittedAt: -1 }).limit(5).populate("surveyId", "title"),
      CategoryResponse.find().sort({ submittedAt: -1 }).limit(5),
    ]);

    const totalResponses = builderResponsesCount + categoryResponsesCount;

    // Combine recent response feed
    const combinedRecentResponses = [
      ...recentBuilderResponses.map((r) => ({
        id: r._id,
        type: "Builder Survey",
        title: r.surveyId ? r.surveyId.title : "Custom Survey",
        answersCount: r.answers ? r.answers.length : 0,
        submittedAt: r.submittedAt,
      })),
      ...recentCategoryResponses.map((r) => ({
        id: r._id,
        type: "Category Survey",
        title: `${r.category} - ${r.surveyName}`,
        answersCount: r.answers ? Object.keys(r.answers).length : 0,
        submittedAt: r.submittedAt,
      })),
    ].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 8);

    // Calculate daily trends for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trendResponses = await Response.find({ submittedAt: { $gte: sevenDaysAgo } });
    const trendCategoryResponses = await CategoryResponse.find({ submittedAt: { $gte: sevenDaysAgo } });

    const dailyMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyMap[key] = { date: key, count: 0 };
    }

    trendResponses.forEach((r) => {
      const key = new Date(r.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dailyMap[key]) dailyMap[key].count++;
    });

    trendCategoryResponses.forEach((r) => {
      const key = new Date(r.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dailyMap[key]) dailyMap[key].count++;
    });

    res.json({
      metrics: {
        totalUsers,
        totalCreators,
        totalRespondents,
        totalSurveys,
        activeSurveys,
        inactiveSurveys,
        builderResponsesCount,
        categoryResponsesCount,
        totalResponses,
      },
      recentUsers,
      recentSurveys,
      recentResponses: combinedRecentResponses,
      dailyTrends: Object.values(dailyMap),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load dashboard overview: " + err.message });
  }
});

// ── GET /api/admin/users ──
// Paginated and filterable user list
router.get("/users", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const search = req.query.search ? req.query.search.trim() : "";
    const role = req.query.role;
    const status = req.query.status;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role && role !== "all") {
      filter.role = role;
    }
    if (status && status !== "all") {
      filter.status = status;
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users: " + err.message });
  }
});

// ── GET /api/admin/users/:id ──
// User details with created surveys count
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const surveys = await Survey.find({ createdBy: user.name }).sort({ createdAt: -1 });

    res.json({
      user,
      surveys,
      surveysCount: surveys.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user details: " + err.message });
  }
});

// ── PATCH /api/admin/users/:id/status ──
// Toggle or update account status (active | suspended)
router.patch("/users/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ error: "Status must be either 'active' or 'suspended'." });
    }

    // Safeguard: Prevent admin from suspending their own account
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        error: "Security restriction: You cannot suspend your own administrative account.",
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: `User status changed to ${status}`, user: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user status: " + err.message });
  }
});

// ── PATCH /api/admin/users/:id/role ──
// Update role with privilege protection
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "creator", "respondent"].includes(role)) {
      return res.status(400).json({ error: "Role must be 'admin', 'creator', or 'respondent'." });
    }

    // Safeguard: Prevent admin from removing their own admin role
    if (req.user._id.toString() === req.params.id && role !== "admin") {
      return res.status(400).json({
        error: "Security restriction: You cannot revoke your own administrator privileges.",
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: `User role changed to ${role}`, user: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user role: " + err.message });
  }
});

// ── DELETE /api/admin/users/:id ──
// Delete user with safeguard
router.delete("/users/:id", async (req, res) => {
  try {
    // Safeguard: Prevent self-deletion
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        error: "Security restriction: You cannot delete your own administrative account.",
      });
    }

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user: " + err.message });
  }
});

// ── GET /api/admin/surveys ──
// Paginated surveys with response counts and status filtering
router.get("/surveys", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const search = req.query.search ? req.query.search.trim() : "";
    const status = req.query.status;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { createdBy: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "all") {
      filter.status = status;
    }

    const total = await Survey.countDocuments(filter);
    const surveys = await Survey.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Compute live response count for each survey
    const surveysWithCount = await Promise.all(
      surveys.map(async (s) => {
        const count = await Response.countDocuments({ surveyId: s._id });
        return {
          ...s.toObject(),
          responseCount: count,
          questionCount: s.questions ? s.questions.length : 0,
        };
      })
    );

    res.json({
      surveys: surveysWithCount,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch surveys: " + err.message });
  }
});

// ── GET /api/admin/surveys/:id ──
// Full survey details with associated questions and responses
router.get("/surveys/:id", async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const responses = await Response.find({ surveyId: survey._id }).sort({ submittedAt: -1 });

    res.json({
      survey,
      responses,
      responseCount: responses.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch survey: " + err.message });
  }
});

// ── PATCH /api/admin/surveys/:id/status ──
// Activate, deactivate, or archive a survey
router.patch("/surveys/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive", "archived"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'active', 'inactive', or 'archived'." });
    }

    const updated = await Survey.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Survey not found" });
    }

    res.json({ message: `Survey status updated to ${status}`, survey: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update survey status: " + err.message });
  }
});

// ── DELETE /api/admin/surveys/:id ──
// Delete survey with response integrity safeguard
router.delete("/surveys/:id", async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const responseCount = await Response.countDocuments({ surveyId: survey._id });

    // Delete survey
    await Survey.findByIdAndDelete(req.params.id);

    // Optionally cascade response deletion or keep for audit
    if (req.query.cascade === "true") {
      await Response.deleteMany({ surveyId: req.params.id });
    }

    res.json({
      message: "Survey deleted successfully",
      associatedResponsesKept: req.query.cascade !== "true" ? responseCount : 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete survey: " + err.message });
  }
});

// ── GET /api/admin/responses ──
// Paginated responses across all surveys
router.get("/responses", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));

    const [builderTotal, catTotal] = await Promise.all([
      Response.countDocuments(),
      CategoryResponse.countDocuments(),
    ]);

    const total = builderTotal + catTotal;

    const builderResponses = await Response.find()
      .populate("surveyId", "title questions")
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const formatted = builderResponses.map((r) => ({
      _id: r._id,
      type: "Builder Survey",
      surveyTitle: r.surveyId ? r.surveyId.title : "Custom Survey",
      surveyId: r.surveyId ? r.surveyId._id : null,
      answersCount: r.answers ? r.answers.length : 0,
      answers: r.answers,
      submittedAt: r.submittedAt,
    }));

    res.json({
      responses: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch responses: " + err.message });
  }
});

// ── GET /api/admin/analytics ──
// Comprehensive analytics across builder and category surveys
router.get("/analytics", async (req, res) => {
  try {
    const [surveys, responses, categoryResponses] = await Promise.all([
      Survey.find(),
      Response.find().populate("surveyId", "title"),
      CategoryResponse.find(),
    ]);

    // Breakdown responses by survey title
    const surveyDistribution = {};
    surveys.forEach((s) => {
      surveyDistribution[s.title] = 0;
    });

    responses.forEach((r) => {
      const title = r.surveyId ? r.surveyId.title : "Unassigned";
      surveyDistribution[title] = (surveyDistribution[title] || 0) + 1;
    });

    const surveyChartData = Object.entries(surveyDistribution).map(([name, count]) => ({
      name: name.length > 25 ? name.substring(0, 22) + "..." : name,
      fullName: name,
      responses: count,
    }));

    // Breakdown category responses by category
    const categoryDistribution = {};
    categoryResponses.forEach((r) => {
      categoryDistribution[r.category] = (categoryDistribution[r.category] || 0) + 1;
    });

    const categoryChartData = Object.entries(categoryDistribution).map(([cat, count]) => ({
      category: cat,
      count,
    }));

    res.json({
      totalSurveys: surveys.length,
      totalResponses: responses.length + categoryResponses.length,
      builderCount: responses.length,
      categoryCount: categoryResponses.length,
      surveyDistribution: surveyChartData,
      categoryDistribution: categoryChartData,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics: " + err.message });
  }
});

// ── GET /api/admin/export-csv ──
// Administrative CSV export of all response records
router.get("/export-csv", async (req, res) => {
  try {
    const [surveys, responses, categoryResponses] = await Promise.all([
      Survey.find(),
      Response.find().populate("surveyId"),
      CategoryResponse.find(),
    ]);

    const rows = [["Source", "Survey Title / Category", "Question", "Answer", "Submission Date"]];

    // Builder survey answers
    responses.forEach((r) => {
      const surveyTitle = r.surveyId ? r.surveyId.title : "Custom Survey";
      if (r.answers && r.answers.length > 0) {
        r.answers.forEach((a) => {
          const questionText =
            r.surveyId && r.surveyId.questions && r.surveyId.questions[a.questionIndex]
              ? r.surveyId.questions[a.questionIndex].text
              : `Question ${a.questionIndex + 1}`;
          rows.push([
            "Builder Survey",
            surveyTitle,
            questionText,
            a.answer,
            new Date(r.submittedAt).toISOString(),
          ]);
        });
      }
    });

    // Category survey answers
    categoryResponses.forEach((r) => {
      if (r.answers) {
        Object.entries(r.answers).forEach(([q, ans]) => {
          rows.push([
            "Pre-built Survey",
            `${r.category} - ${r.surveyName}`,
            q,
            Array.isArray(ans) ? ans.join(", ") : String(ans),
            new Date(r.submittedAt).toISOString(),
          ]);
        });
      }
    });

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="surveyflow-admin-responses.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate CSV export: " + err.message });
  }
});

module.exports = router;
