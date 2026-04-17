import { useState, useEffect } from "react";
import API from "../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { surveyMeta, questionResults, trendData } from "../data/dashboardData";
import "./Dashboard.css";

// ── Color palette ──
const GREEN_SHADES = ["#2d5a3d","#3d7a54","#4f9a6b","#6ab585","#8ecfa2","#b8e4c4"];
const PIE_COLORS   = ["#2d5a3d","#c8763a","#1e4db7","#9a2d82","#b7a01e","#2d7a7a"];

// ── Stat card ──
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${accent}` }}>
      <p className="sc-label">{label}</p>
      <p className="sc-value">{value}</p>
      {sub && <p className="sc-sub">{sub}</p>}
    </div>
  );
}

// ── Custom bar tooltip ──
function BarTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const { label, count } = payload[0].payload;
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="custom-tooltip">
      <p className="ct-label">{label}</p>
      <p className="ct-val">{count} responses <span className="ct-pct">({pct}%)</span></p>
    </div>
  );
}

// ── Custom pie tooltip ──
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="ct-label">{payload[0].name}</p>
      <p className="ct-val">{payload[0].value} <span className="ct-pct">({payload[0].payload.percent}%)</span></p>
    </div>
  );
}

// ── Custom pie label ──
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 5) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${Math.round(percent)}%`}
    </text>
  );
};

// ── Question chart block ──
function QuestionBlock({ q, index }) {
  const [chartType, setChartType] = useState("bar");
  const total = q.totalAnswered;

  const enriched = q.data?.map((d) => ({
    ...d,
    percent: total ? Math.round((d.count / total) * 100) : 0,
  }));

  const typeLabel = {
    radio:    "Single choice",
    checkbox: "Multiple choice",
    rating:   "Rating scale",
    textarea: "Open text",
  };

  return (
    <div className="q-block">
      <div className="qb-header">
        <div className="qb-header-left">
          <span className="qb-num">{String(index + 1).padStart(2, "0")}</span>
          <span className={`qb-type-badge qb-type-${q.type}`}>{typeLabel[q.type]}</span>
        </div>
        <div className="qb-header-right">
          <span className="qb-responses">{total} responses</span>
          {(q.type === "radio" || q.type === "checkbox") && (
            <div className="chart-toggle">
              <button className={chartType === "bar" ? "ct-active" : ""} onClick={() => setChartType("bar")}>
                <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                  <rect x="1" y="7" width="3" height="6" rx="1" fill="currentColor"/>
                  <rect x="5" y="4" width="3" height="9" rx="1" fill="currentColor"/>
                  <rect x="9" y="1" width="3" height="12" rx="1" fill="currentColor"/>
                </svg>
                Bar
              </button>
              <button className={chartType === "pie" ? "ct-active" : ""} onClick={() => setChartType("pie")}>
                <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                  <path d="M7 1v6l5 2.5A6 6 0 107 1z" fill="currentColor" opacity=".5"/>
                  <path d="M7 1a6 6 0 016 6h-6V1z" fill="currentColor"/>
                </svg>
                Pie
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="qb-question">{q.text}</h3>

      {q.type === "rating" && q.average && (
        <div className="rating-avg-row">
          <div className="rating-avg-badge">
            <span className="rab-num">{q.average}</span>
            <span className="rab-label">/ 10 average</span>
          </div>
          <div className="rating-avg-bar-wrap">
            <div className="rating-avg-bar" style={{ width: `${q.average * 10}%` }} />
          </div>
        </div>
      )}

      {q.data && chartType === "bar" && (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={q.type === "rating" ? 180 : Math.max(200, q.data.length * 44)}>
            <BarChart
              data={enriched}
              layout={q.type === "rating" ? "horizontal" : "vertical"}
              margin={{ top: 4, right: 16, bottom: 4, left: q.type === "rating" ? 0 : 120 }}
            >
              {q.type === "rating" ? (
                <>
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#9c9a92" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<BarTooltip total={total} />} cursor={{ fill: "#f5f2ec" }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {enriched.map((_, i) => (
                      <Cell key={i} fill={GREEN_SHADES[Math.min(i, GREEN_SHADES.length - 1)]} />
                    ))}
                  </Bar>
                </>
              ) : (
                <>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={116}
                    tick={{ fontSize: 12, fill: "#4a4a47" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<BarTooltip total={total} />} cursor={{ fill: "#f5f2ec" }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                    {enriched.map((_, i) => (
                      <Cell key={i} fill={GREEN_SHADES[Math.min(i, GREEN_SHADES.length - 1)]} />
                    ))}
                  </Bar>
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {q.data && chartType === "pie" && (
        <div className="chart-wrap pie-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={enriched}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
                label={renderPieLabel}
              >
                {enriched.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                formatter={(val) => <span style={{ fontSize: 12, color: "#4a4a47" }}>{val}</span>}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {q.data && (
        <div className="pct-list">
          {enriched.map((d, i) => (
            <div key={i} className="pct-row">
              <span className="pct-label">{d.label}</span>
              <div className="pct-bar-track">
                <div
                  className="pct-bar-fill"
                  style={{
                    width: `${d.percent}%`,
                    background: GREEN_SHADES[Math.min(i, GREEN_SHADES.length - 1)],
                  }}
                />
              </div>
              <span className="pct-count">{d.count}</span>
              <span className="pct-pct">{d.percent}%</span>
            </div>
          ))}
        </div>
      )}

      {q.type === "textarea" && q.samples && (
        <div className="samples-wrap">
          <p className="samples-label">Sample responses ({q.totalAnswered} total)</p>
          <div className="samples-list">
            {q.samples.map((s, i) => (
              <div key={i} className="sample-item">
                <span className="sample-quote">"</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ──
export default function Dashboard() {
  // ✅ ALL hooks are INSIDE the component function
  const [activeTab,   setActiveTab]   = useState("overview");
  const [surveys,     setSurveys]     = useState([]);
  const [responses,   setResponses]   = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [categoryResponses, setCategoryResponses] = useState([]);


  const handleExportCSV = () => {
    const rows = [];

    // Header row
    rows.push(["Type", "Survey/Category", "Question", "Answer", "Submitted At"]);

    // Builder survey responses
    responses.forEach((r) => {
      const surveyTitle = surveys[0]?.title || "Custom Survey";
      r.answers.forEach((a) => {
        const question = surveys[0]?.questions?.[a.questionIndex]?.text || `Q${a.questionIndex + 1}`;
        rows.push(["Builder Survey", surveyTitle, question, a.answer, new Date(r.submittedAt).toLocaleString()]);
      });
    });

    // Category survey responses
    categoryResponses.forEach((r) => {
      Object.entries(r.answers).forEach(([question, answer]) => {
        rows.push(["Pre-built Survey", `${r.category} — ${r.surveyName}`, question, Array.isArray(answer) ? answer.join(", ") : answer, new Date(r.submittedAt).toLocaleString()]);
      });
    });

    // Convert to CSV string
    const csv = rows.map(row =>
      row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    // Trigger download
    const blob = new URL(`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = "survey-responses.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
  Promise.all([
    API.get("/surveys"),
    API.get("/responses/category/all")
  ])
    .then(([surveysRes, categoryRes]) => {
      setSurveys(surveysRes.data);
      setCategoryResponses(categoryRes.data || []);
      if (surveysRes.data.length > 0) {
        return API.get(`/responses/${surveysRes.data[0]._id}`);
      }
    })
    .then((res) => {
      if (res) setResponses(res.data);
      setLoadingData(false);
    })
    .catch(() => setLoadingData(false));
}, []);

  // Use real data if available, otherwise fall back to mock data
  const meta     = surveys.length > 0
    ? { ...surveyMeta, title: surveys[0].title, totalResponses: responses.length }
    : surveyMeta;

  const questions = surveys.length > 0 && surveys[0].questions?.length > 0
    ? questionResults
    : questionResults;

  if (loadingData) {
    return (
      <div style={{ padding: "60px", textAlign: "center", fontFamily: "DM Sans, sans-serif", color: "#9c9a92" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* Page header */}
        <div className="dash-page-header">
          <div>
            <h1 className="dash-title">{meta.title}</h1>
            <p className="dash-desc">{surveyMeta.description}</p>
          </div>
          <button className="btn-export" onClick={handleExportCSV}>
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Export CSV
          </button>
        </div>

        {/* Stat cards */}
        <div className="stats-row">
          <StatCard label="Total responses" value={meta.totalResponses}          sub="All time"           accent="#2d5a3d" />
          <StatCard label="Completion rate" value={`${surveyMeta.completionRate}%`} sub="Started vs finished" accent="#c8763a" />
          <StatCard label="Avg time"        value={surveyMeta.avgTime}           sub="Per response"       accent="#1e4db7" />
          <StatCard label="Last response"   value={surveyMeta.lastResponse}      sub="Most recent"        accent="#9a2d82" />
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          <button className={`dash-tab ${activeTab === "overview"  ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={`dash-tab ${activeTab === "questions" ? "active" : ""}`} onClick={() => setActiveTab("questions")}>Question breakdown</button>
          <button className={`dash-tab ${activeTab === "trend"     ? "active" : ""}`} onClick={() => setActiveTab("trend")}>Response trend</button>
        </div>

        {/* ── Overview tab ── */}
        {activeTab === "overview" && (
          <div className="tab-content">
            <div className="section-card">
              <h2 className="section-title">Responses by question</h2>
              <p className="section-sub">How many people answered each question</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={questions.map((q, i) => ({ name: `Q${i + 1}`, answered: q.totalAnswered, skipped: meta.totalResponses - q.totalAnswered }))}
                  margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9c9a92" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9c9a92" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e8e4dd", fontSize: 13 }} cursor={{ fill: "#f5f2ec" }} />
                  <Bar dataKey="answered" name="Answered" fill="#2d5a3d" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  <Bar dataKey="skipped"  name="Skipped"  fill="#e8e4dd" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="section-card">
              <h2 className="section-title">Top question — referral source</h2>
              <p className="section-sub">{questions[0].text}</p>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={questions[0].data.map((d) => ({ ...d, percent: Math.round((d.count / questions[0].totalAnswered) * 100) }))}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      labelLine={false}
                      label={renderPieLabel}
                    >
                      {questions[0].data.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend formatter={(val) => <span style={{ fontSize: 12, color: "#4a4a47" }}>{val}</span>} iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
             {categoryResponses.length > 0 && (
              <div className="section-card">
                <h2 className="section-title">Pre-built Survey Responses</h2>
                <p className="section-sub">{categoryResponses.length} responses from pre-built surveys</p>
                {categoryResponses.map((r, i) => (
                  <div key={i} className="response-card" style={{ borderBottom: "1px solid #f0ece6", paddingBottom: "12px", marginBottom: "12px" }}>
                    <p style={{ fontWeight: 600 }}>{r.category} — {r.surveyName}</p>
                    <p style={{ fontSize: 12, color: "#9c9a92" }}>{new Date(r.submittedAt).toLocaleString()}</p>
                    <pre style={{ fontSize: 12, background: "#f5f2ec", padding: "8px", borderRadius: "6px", marginTop: "6px" }}>
                      {JSON.stringify(r.answers, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
          

        {/* ── Questions tab ── */}
        {activeTab === "questions" && (
          <div className="tab-content">
            {questions.map((q, i) => (
              <QuestionBlock key={q.id} q={q} index={i} />
            ))}
          </div>
        )}

        {/* ── Trend tab ── */}
        {activeTab === "trend" && (
          <div className="tab-content">
            <div className="section-card">
              <h2 className="section-title">Responses over last 7 days</h2>
              <p className="section-sub">Daily response volume this week</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData} margin={{ top: 8, right: 24, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9c9a92" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9c9a92" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e8e4dd", fontSize: 13 }} cursor={{ stroke: "#2d5a3d", strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Line type="monotone" dataKey="responses" stroke="#2d5a3d" strokeWidth={2.5} dot={{ fill: "#2d5a3d", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#2d5a3d", strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="section-card">
              <h2 className="section-title">Daily breakdown</h2>
              <table className="trend-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Responses</th>
                    <th>Share</th>
                    <th>Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((d) => {
                    const total = trendData.reduce((s, r) => s + r.responses, 0);
                    const pct   = Math.round((d.responses / total) * 100);
                    return (
                      <tr key={d.day}>
                        <td className="tt-day">{d.day}</td>
                        <td className="tt-count">{d.responses}</td>
                        <td className="tt-pct">{pct}%</td>
                        <td>
                          <div className="tt-bar-track">
                            <div className="tt-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}