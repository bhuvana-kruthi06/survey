import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/admin/overview");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load admin overview metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="admin-spinner-large" />
        <p>Loading real-time database metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-error">
        <h3>Unable to load dashboard data</h3>
        <p>{error}</p>
        <button onClick={fetchOverview} className="admin-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const { metrics, recentUsers, recentSurveys, recentResponses, dailyTrends } = data || {};

  return (
    <div className="admin-dashboard-view">
      {/* Page Header */}
      <div className="admin-view-header">
        <div>
          <span className="admin-breadcrumb">SURVEYFLOW &bull; SYSTEM GOVERNANCE</span>
          <h1 className="admin-view-title">Overview Dashboard</h1>
          <p className="admin-view-sub">
            Real-time aggregate activity across users, surveys, and responses.
          </p>
        </div>
        <div className="admin-view-actions">
          <button onClick={fetchOverview} className="admin-refresh-btn" title="Refresh metrics">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M14 8A6 6 0 118 2v2a4 4 0 104 4h2z" fill="currentColor"/>
            </svg>
            <span>Refresh</span>
          </button>
          <a
            href={`${API.defaults.baseURL}/admin/export-csv`}
            download="survey-responses.csv"
            className="admin-export-btn"
          >
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card card-green">
          <div className="stat-card-top">
            <span className="stat-card-label">Total Users</span>
            <div className="stat-card-icon icon-users">
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.75"/>
                <path d="M2 17c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{metrics?.totalUsers ?? 0}</div>
          <div className="stat-card-footnote">
            <span><strong>{metrics?.totalCreators ?? 0}</strong> creators</span>
            &bull;
            <span><strong>{metrics?.totalRespondents ?? 0}</strong> respondents</span>
          </div>
        </div>

        <div className="admin-stat-card card-blue">
          <div className="stat-card-top">
            <span className="stat-card-label">Total Surveys</span>
            <div className="stat-card-icon icon-surveys">
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.75"/>
                <path d="M8 7h4M8 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{metrics?.totalSurveys ?? 0}</div>
          <div className="stat-card-footnote">
            <span className="text-active"><strong>{metrics?.activeSurveys ?? 0}</strong> active</span>
            &bull;
            <span className="text-inactive"><strong>{metrics?.inactiveSurveys ?? 0}</strong> inactive</span>
          </div>
        </div>

        <div className="admin-stat-card card-amber">
          <div className="stat-card-top">
            <span className="stat-card-label">Total Responses</span>
            <div className="stat-card-icon icon-responses">
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path d="M4 14h12M4 10h8M4 6h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{metrics?.totalResponses ?? 0}</div>
          <div className="stat-card-footnote">
            <span><strong>{metrics?.builderResponsesCount ?? 0}</strong> custom builder</span>
            &bull;
            <span><strong>{metrics?.categoryResponsesCount ?? 0}</strong> category</span>
          </div>
        </div>

        <div className="admin-stat-card card-purple">
          <div className="stat-card-top">
            <span className="stat-card-label">Active Ratio</span>
            <div className="stat-card-icon icon-ratio">
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.75"/>
                <path d="M10 3v7l5 5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
          <div className="stat-card-value">
            {metrics?.totalSurveys > 0
              ? `${Math.round(((metrics.activeSurveys || 0) / metrics.totalSurveys) * 100)}%`
              : "100%"}
          </div>
          <div className="stat-card-footnote">
            <span>Survey engagement health</span>
          </div>
        </div>
      </div>

      {/* Trend Chart Section */}
      <div className="admin-section-card trend-card">
        <div className="section-card-header">
          <div>
            <h2 className="section-card-title">Survey Participation Activity (Last 7 Days)</h2>
            <p className="section-card-desc">Daily count of responses received across all surveys</p>
          </div>
          <span className="admin-live-badge">Live DB Query</span>
        </div>
        <div className="admin-chart-container" style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrends || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dd" vertical={false} />
              <XAxis dataKey="date" stroke="#8c8980" fontSize={12} tickLine={false} />
              <YAxis allowDecimals={false} stroke="#8c8980" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#18241c",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Responses"
                stroke="#2d5a3d"
                strokeWidth={3}
                dot={{ r: 4, fill: "#2d5a3d" }}
                activeDot={{ r: 6, fill: "#4f9a6b" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Recent Users & Recent Surveys */}
      <div className="admin-two-cols">
        {/* Recent Registrations */}
        <div className="admin-section-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-card-title">Recent Registrations</h2>
              <p className="section-card-desc">Latest accounts created in the system</p>
            </div>
            <Link to="/admin/users" className="admin-link-more">
              Manage Users &rarr;
            </Link>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-mini-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers && recentUsers.length > 0 ? (
                  recentUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="mini-user-info">
                          <span className="mini-user-name">{u.name}</span>
                          <span className="mini-user-email">{u.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-role badge-${u.role}`}>{u.role}</span>
                      </td>
                      <td>
                        <span className={`badge-status badge-${u.status}`}>{u.status}</span>
                      </td>
                      <td className="text-muted">
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      No user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Surveys */}
        <div className="admin-section-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-card-title">Recently Created Surveys</h2>
              <p className="section-card-desc">Most recently added surveys across the platform</p>
            </div>
            <Link to="/admin/surveys" className="admin-link-more">
              Manage Surveys &rarr;
            </Link>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-mini-table">
              <thead>
                <tr>
                  <th>Survey Title</th>
                  <th>Created By</th>
                  <th>Status</th>
                  <th>Questions</th>
                </tr>
              </thead>
              <tbody>
                {recentSurveys && recentSurveys.length > 0 ? (
                  recentSurveys.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div className="mini-survey-title" title={s.title}>
                          {s.title}
                        </div>
                      </td>
                      <td className="text-muted">{s.createdBy || "System"}</td>
                      <td>
                        <span className={`badge-status badge-${s.status || "active"}`}>
                          {s.status || "active"}
                        </span>
                      </td>
                      <td>{s.questions?.length || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      No surveys created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Survey Activity Feed */}
      <div className="admin-section-card" style={{ marginTop: 24 }}>
        <div className="section-card-header">
          <div>
            <h2 className="section-card-title">Recent Response Activity</h2>
            <p className="section-card-desc">Latest submissions captured by the survey engine</p>
          </div>
          <Link to="/admin/analytics" className="admin-link-more">
            Detailed Analytics &rarr;
          </Link>
        </div>

        <div className="admin-activity-list">
          {recentResponses && recentResponses.length > 0 ? (
            recentResponses.map((act) => (
              <div key={act.id} className="admin-activity-item">
                <div className="activity-icon-badge">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <circle cx="8" cy="8" r="7" stroke="#2d5a3d" strokeWidth="1.5"/>
                    <path d="M5 8l2 2 4-4" stroke="#2d5a3d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="activity-details">
                  <span className="activity-title">{act.title}</span>
                  <span className="activity-type-badge">{act.type}</span>
                </div>
                <div className="activity-meta">
                  <span>{act.answersCount} answers recorded</span>
                  <span className="activity-time">
                    {new Date(act.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "24px", textAlign: "center", color: "#8c8980" }}>
              No responses recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
