import { useState, useEffect } from "react";
import API from "../../api/axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import "./ResponseAnalytics.css";

const BAR_COLORS = ["#2d5a3d", "#1e4db7", "#c8763a", "#8e44ad", "#2d7a7a", "#b7a01e"];
const PIE_COLORS = ["#2d5a3d", "#c8763a", "#1e4db7", "#8e44ad", "#3d7a54", "#e67e22"];

export default function ResponseAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [responses, setResponses] = useState([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inspect Response Modal
  const [inspectResponse, setInspectResponse] = useState(null);

  const fetchAnalyticsAndResponses = async () => {
    setLoading(true);
    setError("");
    try {
      const [analyticsRes, responsesRes] = await Promise.all([
        API.get("/admin/analytics"),
        API.get(`/admin/responses?page=${page}&limit=10`),
      ]);
      setAnalytics(analyticsRes.data);
      setResponses(responsesRes.data.responses || []);
      setTotalResponses(responsesRes.data.total || 0);
      setTotalPages(responsesRes.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load response analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsAndResponses();
  }, [page]);

  const handleExportCsv = () => {
    window.location.href = `${API.defaults.baseURL}/admin/export-csv`;
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="admin-spinner-large" />
        <p>Calculating aggregate analytics across surveys...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-error">
        <h3>Analytics Error</h3>
        <p>{error}</p>
        <button onClick={fetchAnalyticsAndResponses} className="admin-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const { surveyDistribution, categoryDistribution, totalSurveys, totalResponses: totalAll, builderCount, categoryCount } = analytics || {};

  return (
    <div className="analytics-view">
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <span className="admin-breadcrumb">SURVEYFLOW &bull; INTELLIGENCE</span>
          <h1 className="admin-view-title">Response Monitoring & Analytics</h1>
          <p className="admin-view-sub">
            Holistic cross-survey participation trends, volume distribution, and audit response records.
          </p>
        </div>
        <div className="admin-view-actions">
          <button onClick={handleExportCsv} className="admin-export-btn">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Export Responses (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card card-green">
          <span className="stat-card-label">Total Submissions</span>
          <div className="stat-card-value">{totalAll ?? 0}</div>
          <div className="stat-card-footnote">Across all survey channels</div>
        </div>

        <div className="admin-stat-card card-blue">
          <span className="stat-card-label">Custom Builder Responses</span>
          <div className="stat-card-value">{builderCount ?? 0}</div>
          <div className="stat-card-footnote">Dynamic user-created surveys</div>
        </div>

        <div className="admin-stat-card card-amber">
          <span className="stat-card-label">Pre-built Category Responses</span>
          <div className="stat-card-value">{categoryCount ?? 0}</div>
          <div className="stat-card-footnote">Curated template categories</div>
        </div>

        <div className="admin-stat-card card-purple">
          <span className="stat-card-label">Avg Responses / Survey</span>
          <div className="stat-card-value">
            {totalSurveys > 0 ? (totalAll / totalSurveys).toFixed(1) : "0"}
          </div>
          <div className="stat-card-footnote">Average engagement depth</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="analytics-charts-grid">
        {/* Survey Distribution Chart */}
        <div className="admin-section-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-card-title">Response Volume per Survey</h2>
              <p className="section-card-desc">Top participating surveys</p>
            </div>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            {surveyDistribution && surveyDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={surveyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" fontSize={11} stroke="#8c8980" tickLine={false} />
                  <YAxis allowDecimals={false} fontSize={11} stroke="#8c8980" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#18241c",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="responses" radius={[4, 4, 0, 0]}>
                    {surveyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty-placeholder">No survey response data yet.</div>
            )}
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="admin-section-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-card-title">Pre-built Category Distribution</h2>
              <p className="section-card-desc">Volume by category type</p>
            </div>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            {categoryDistribution && categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#18241c",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty-placeholder">No category responses submitted yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Response Audit Log Table */}
      <div className="admin-section-card no-padding" style={{ marginTop: 24 }}>
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #eae7df" }}>
          <h2 className="section-card-title">Detailed Response Log</h2>
          <p className="section-card-desc">Individual response records with answer inspection</p>
        </div>

        <div className="admin-table-wrap">
          <table className="user-mgmt-table">
            <thead>
              <tr>
                <th>Survey / Source</th>
                <th>Type</th>
                <th>Answers Recorded</th>
                <th>Submission Timestamp</th>
                <th style={{ textAlign: "right" }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {responses && responses.length > 0 ? (
                responses.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="survey-title-text" title={r.surveyTitle}>
                        {r.surveyTitle}
                      </div>
                    </td>
                    <td>
                      <span className="activity-type-badge">{r.type}</span>
                    </td>
                    <td>
                      <span className="count-pill">{r.answersCount} answers</span>
                    </td>
                    <td className="text-muted">
                      {new Date(r.submittedAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn-icon inspect-btn"
                        onClick={() => setInspectResponse(r)}
                        title="Inspect Answers"
                      >
                        <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted" style={{ padding: 32 }}>
                    No responses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="mgmt-pagination">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="page-nav-btn"
            >
              &larr; Previous
            </button>
            <span className="page-indicator">
              Page {page} of {totalPages} ({totalResponses} total)
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="page-nav-btn"
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Inspect Response Modal */}
      {inspectResponse && (
        <div className="admin-modal-overlay" onClick={() => setInspectResponse(null)}>
          <div className="admin-modal-box modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="inspect-header">
              <div>
                <h3>Response Detail</h3>
                <span className="survey-inspect-sub">
                  Survey: {inspectResponse.surveyTitle} &bull; Submitted {new Date(inspectResponse.submittedAt).toLocaleString()}
                </span>
              </div>
              <button className="modal-close-x" onClick={() => setInspectResponse(null)}>
                &times;
              </button>
            </div>

            <div className="survey-inspect-body">
              <h4>Answers ({inspectResponse.answers?.length || 0})</h4>
              <div className="inspect-questions-list">
                {inspectResponse.answers?.map((ans, idx) => (
                  <div key={idx} className="inspect-q-card">
                    <span className="inspect-q-num">Question {ans.questionIndex + 1}</span>
                    <div className="inspect-response-answer">
                      {ans.answer || <em>No answer provided</em>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="modal-cancel-btn" onClick={() => setInspectResponse(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
