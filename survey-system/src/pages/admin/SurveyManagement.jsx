import { useState, useEffect, useCallback } from "react";
import API from "../../api/axios";
import "./SurveyManagement.css";

export default function SurveyManagement() {
  const [surveys, setSurveys] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

  // Inspection Modal
  const [inspectSurvey, setInspectSurvey] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    actionType: "",
    targetSurvey: null,
    newStatus: null,
  });

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        status: statusFilter,
      });
      const res = await API.get(`/admin/surveys?${params.toString()}`);
      setSurveys(res.data.surveys || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch survey catalog.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  // Request status change
  const requestStatusChange = (survey, newStatus) => {
    setConfirmDialog({
      open: true,
      title: `Update Survey Status`,
      message: `Change status of survey "${survey.title}" to ${newStatus.toUpperCase()}?`,
      actionType: "status",
      targetSurvey: survey,
      newStatus,
    });
  };

  // Request deletion
  const requestDelete = (survey) => {
    setConfirmDialog({
      open: true,
      title: "Delete Survey",
      message: `Warning: You are about to delete "${survey.title}". It has ${survey.responseCount || 0} recorded responses. Confirm deletion?`,
      actionType: "delete",
      targetSurvey: survey,
      newStatus: null,
    });
  };

  // Execute confirmed action
  const handleExecuteAction = async () => {
    const { actionType, targetSurvey, newStatus } = confirmDialog;
    setConfirmDialog({ ...confirmDialog, open: false });
    setActionMessage({ type: "", text: "" });

    try {
      if (actionType === "status") {
        await API.patch(`/admin/surveys/${targetSurvey._id}/status`, { status: newStatus });
        setActionMessage({
          type: "success",
          text: `Survey "${targetSurvey.title}" status updated to ${newStatus}.`,
        });
      } else if (actionType === "delete") {
        await API.delete(`/admin/surveys/${targetSurvey._id}`);
        setActionMessage({
          type: "success",
          text: `Survey "${targetSurvey.title}" deleted successfully.`,
        });
      }
      fetchSurveys();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Survey action could not be completed.",
      });
    }
  };

  // Inspect questions and survey metadata
  const handleInspect = async (survey) => {
    setInspectLoading(true);
    setInspectSurvey(null);
    try {
      const res = await API.get(`/admin/surveys/${survey._id}`);
      setInspectSurvey(res.data);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to load survey details.",
      });
    } finally {
      setInspectLoading(false);
    }
  };

  return (
    <div className="survey-mgmt-view">
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <span className="admin-breadcrumb">SURVEYFLOW &bull; CATALOG GOVERNANCE</span>
          <h1 className="admin-view-title">Survey Management</h1>
          <p className="admin-view-sub">
            Audit authored surveys, inspect questions, control survey availability, and monitor participation.
          </p>
        </div>
        <div className="total-counter-pill">
          <span>{total} Total Surveys</span>
        </div>
      </div>

      {/* Action Banner */}
      {actionMessage.text && (
        <div className={`action-banner banner-${actionMessage.type}`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage({ type: "", text: "" })}>&times;</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mgmt-toolbar">
        <div className="toolbar-search">
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <circle cx="9" cy="9" r="6" stroke="#8c8980" strokeWidth="1.75"/>
            <path d="M13.5 13.5L18 18" stroke="#8c8980" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              &times;
            </button>
          )}
        </div>

        <div className="toolbar-filters">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Live)</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Surveys Table */}
      <div className="admin-section-card no-padding">
        {loading ? (
          <div className="mgmt-loading">
            <div className="admin-spinner-large" />
            <p>Loading survey catalog...</p>
          </div>
        ) : error ? (
          <div className="mgmt-error">
            <p>{error}</p>
            <button onClick={fetchSurveys} className="admin-refresh-btn">
              Retry
            </button>
          </div>
        ) : surveys.length === 0 ? (
          <div className="mgmt-empty">
            <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
              <rect x="4" y="3" width="12" height="14" rx="2" stroke="#b0ada6" strokeWidth="1.5"/>
              <path d="M8 7h4M8 11h4" stroke="#b0ada6" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p>No surveys found matching your query criteria.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="user-mgmt-table">
              <thead>
                <tr>
                  <th>Survey Details</th>
                  <th>Created By</th>
                  <th>Questions</th>
                  <th>Responses</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="survey-meta-cell">
                        <span className="survey-title-text" title={s.title}>
                          {s.title}
                        </span>
                        {s.description && (
                          <span className="survey-desc-snippet" title={s.description}>
                            {s.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="creator-badge">{s.createdBy || "System"}</span>
                    </td>
                    <td>
                      <span className="count-pill">{s.questionCount || s.questions?.length || 0} Qs</span>
                    </td>
                    <td>
                      <span className="count-pill responses-pill">
                        {s.responseCount || 0}
                      </span>
                    </td>
                    <td>
                      <div className="status-dropdown-wrap">
                        <select
                          value={s.status || "active"}
                          onChange={(e) => requestStatusChange(s, e.target.value)}
                          className={`status-select status-select-${s.status || "active"}`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </td>
                    <td className="text-muted">
                      {new Date(s.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      <div className="user-action-buttons">
                        {/* Inspect Questions */}
                        <button
                          className="btn-icon inspect-btn"
                          onClick={() => handleInspect(s)}
                          title="Inspect Survey Questions & Responses"
                        >
                          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                            <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                        </button>

                        {/* Open in Respondent Mode */}
                        <a
                          href={`/survey/${s._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-icon view-link-btn"
                          title="View Live Respondent Interface"
                        >
                          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                            <path d="M12 9v4a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4M9 2h5v5M6 10L14 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>

                        {/* Delete Survey */}
                        <button
                          className="btn-icon delete-btn"
                          onClick={() => requestDelete(s)}
                          title="Delete Survey"
                        >
                          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                            <path d="M2 4h12M5 4V2h6v2M13 4v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
              Page {page} of {totalPages}
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

      {/* Confirmation Modal */}
      {confirmDialog.open && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-icon-warning">
              <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                <circle cx="12" cy="12" r="10" stroke="#c0392b" strokeWidth="2"/>
                <path d="M12 7v6M12 16v.5" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="modal-title">{confirmDialog.title}</h3>
            <p className="modal-desc">{confirmDialog.message}</p>
            <div className="modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
              >
                Cancel
              </button>
              <button
                className={`modal-confirm-btn ${confirmDialog.actionType === "delete" ? "danger" : "primary"}`}
                onClick={handleExecuteAction}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Survey Questions Modal */}
      {inspectSurvey && (
        <div className="admin-modal-overlay" onClick={() => setInspectSurvey(null)}>
          <div className="admin-modal-box modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="inspect-header">
              <div>
                <h3>{inspectSurvey.survey?.title}</h3>
                <span className="survey-inspect-sub">
                  Authored by {inspectSurvey.survey?.createdBy} &bull; {inspectSurvey.responseCount || 0} responses
                </span>
              </div>
              <button className="modal-close-x" onClick={() => setInspectSurvey(null)}>
                &times;
              </button>
            </div>

            <div className="survey-inspect-body">
              <h4>Questions ({inspectSurvey.survey?.questions?.length || 0})</h4>
              <div className="inspect-questions-list">
                {inspectSurvey.survey?.questions?.map((q, idx) => (
                  <div key={idx} className="inspect-q-card">
                    <div className="inspect-q-header">
                      <span className="inspect-q-num">Q{idx + 1}</span>
                      <span className={`inspect-q-type type-${q.type}`}>{q.type}</span>
                      {q.required && <span className="inspect-q-required">Required</span>}
                    </div>
                    <div className="inspect-q-text">{q.text}</div>
                    {q.options && q.options.length > 0 && (
                      <div className="inspect-q-options">
                        <span className="options-title">Options:</span>
                        <div className="options-chips">
                          {q.options.map((opt, oIdx) => (
                            <span key={oIdx} className="option-chip">
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {q.type === "rating" && (
                      <div className="inspect-q-rating-meta">
                        Scale: {q.min || 1} ({q.lowLabel || "Low"}) to {q.max || 10} ({q.highLabel || "High"})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="modal-cancel-btn" onClick={() => setInspectSurvey(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
