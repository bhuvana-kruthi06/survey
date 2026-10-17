require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });
const mongoose = require("mongoose");
const http = require("http");

async function runTests() {
  console.log("==================================================");
  console.log("🧪 Starting Automated Backend Security & API Tests");
  console.log("==================================================");

  // Connect DB
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/survey";
  await mongoose.connect(MONGO_URI);

  const express = require("express");
  const cors = require("cors");
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/admin", require("./routes/admin"));
  app.use("/api/surveys", require("./routes/surveys"));
  app.use("/api/responses", require("./routes/responses"));

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5009, "127.0.0.1", resolve));
  const baseUrl = "http://127.0.0.1:5009/api";

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, headers: res.headers, data };
  };

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Register standard user & verify privilege escalation protection
    const regRes = await fetchJson(`${baseUrl}/auth/register`, {
      method: "POST",
      body: {
        name: "Test Hacker",
        email: `hacker_${Date.now()}@example.com`,
        password: "Password123!",
        role: "admin", // Malicious attempt to escalate privilege to admin
      },
    });
    assert(regRes.status === 201, "Registration succeeds for regular user");
    assert(
      regRes.data.user && regRes.data.user.role !== "admin",
      "Privilege escalation prevented: role is not 'admin' despite request payload"
    );
    const regularToken = regRes.data.token;
    const regularUserId = regRes.data.user._id;

    // Test 2: Admin login with valid credentials
    const adminLoginRes = await fetchJson(`${baseUrl}/auth/admin-login`, {
      method: "POST",
      body: {
        email: "admin@surveyflow.com",
        password: "Admin@123456",
      },
    });
    assert(adminLoginRes.status === 200, "Admin login succeeds with seeded admin credentials");
    assert(adminLoginRes.data.token && adminLoginRes.data.user.role === "admin", "Admin receives valid admin JWT");
    const adminToken = adminLoginRes.data.token;
    const adminUserId = adminLoginRes.data.user._id;

    // Test 3: Admin login with regular user credentials -> 403 Forbidden
    const hackerAdminLogin = await fetchJson(`${baseUrl}/auth/admin-login`, {
      method: "POST",
      body: {
        email: regRes.data.user.email,
        password: "Password123!",
      },
    });
    assert(
      hackerAdminLogin.status === 403,
      "Non-admin user rejected from admin-login with 403 Forbidden"
    );

    // Test 4: Unauthenticated request to protected admin route -> 401 Unauthorized
    const unauthRes = await fetchJson(`${baseUrl}/admin/overview`);
    assert(unauthRes.status === 401, "Unauthenticated request to /api/admin/overview returns 401 Unauthorized");

    // Test 5: Regular user token on protected admin route -> 403 Forbidden
    const forbiddenRes = await fetchJson(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${regularToken}` },
    });
    assert(
      forbiddenRes.status === 403,
      "Regular user token calling /api/admin/overview returns 403 Forbidden"
    );

    // Test 6: Authorized admin token on /api/admin/overview -> 200 OK with metrics
    const overviewRes = await fetchJson(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(overviewRes.status === 200, "Admin token accessing /api/admin/overview returns 200 OK");
    assert(
      overviewRes.data.metrics && overviewRes.data.metrics.totalUsers >= 2,
      "Overview metrics return real database counts"
    );
    assert(Array.isArray(overviewRes.data.recentSurveys), "Overview includes recent surveys");

    // Test 7: Paginated user list
    const usersRes = await fetchJson(`${baseUrl}/admin/users?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(usersRes.status === 200, "Admin can list users with pagination");
    assert(Array.isArray(usersRes.data.users) && usersRes.data.total >= 2, "User list populated");
    assert(
      usersRes.data.users.every((u) => u.password === undefined),
      "Security: Passwords and hashes are completely omitted from user list"
    );

    // Test 8: Safeguard - Admin cannot suspend self
    const selfSuspendRes = await fetchJson(`${baseUrl}/admin/users/${adminUserId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: "suspended" },
    });
    assert(
      selfSuspendRes.status === 400,
      "Self-suspension safeguard: Admin cannot suspend their own account"
    );

    // Test 9: Admin can suspend regular user
    const suspendUserRes = await fetchJson(`${baseUrl}/admin/users/${regularUserId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: "suspended" },
    });
    assert(suspendUserRes.status === 200, "Admin can change regular user status to 'suspended'");

    // Test 10: Suspended user token is rejected with 403
    const suspendedCheck = await fetchJson(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${regularToken}` },
    });
    assert(suspendedCheck.status === 403, "Suspended user token is blocked from accessing API (403)");

    // Test 11: Survey management list & status toggle
    const surveysRes = await fetchJson(`${baseUrl}/admin/surveys`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(surveysRes.status === 200 && Array.isArray(surveysRes.data.surveys), "Admin can list all surveys");
    if (surveysRes.data.surveys.length > 0) {
      const surveyId = surveysRes.data.surveys[0]._id;
      const statusToggle = await fetchJson(`${baseUrl}/admin/surveys/${surveyId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { status: "inactive" },
      });
      assert(statusToggle.status === 200, "Admin can update survey status to 'inactive'");
      // Reset back to active
      await fetchJson(`${baseUrl}/admin/surveys/${surveyId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { status: "active" },
      });
    }

    // Test 12: Admin Response Analytics
    const analyticsRes = await fetchJson(`${baseUrl}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(analyticsRes.status === 200, "Admin can access response analytics");

    // Test 13: Admin CSV Export
    const exportRes = await fetch(`${baseUrl}/admin/export-csv`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(exportRes.status === 200, "Admin can export responses as CSV");
    const csvText = await exportRes.text();
    assert(csvText.includes("Submission Date"), "CSV export contains standard headers");

    // Test 14: Category Response endpoints
    const catSubmit = await fetchJson(`${baseUrl}/responses/category`, {
      method: "POST",
      body: {
        surveyName: "Test Auto Survey",
        category: "Automated Testing",
        answers: { "Q1": "Pass" },
      },
    });
    assert(catSubmit.status === 201, "POST /api/responses/category works");

    const catAll = await fetchJson(`${baseUrl}/responses/category/all`);
    assert(catAll.status === 200 && Array.isArray(catAll.data), "GET /api/responses/category/all works");

  } catch (err) {
    console.error("Test execution exception:", err);
    failed++;
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log("==================================================");
    console.log(`Summary: ${passed} passed, ${failed} failed`);
    console.log("==================================================");
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
