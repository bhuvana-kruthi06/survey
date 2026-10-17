import { useState, useEffect, useCallback } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "./UserManagement.css";

export default function UserManagement() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    actionType: "",
    targetUser: null,
    newVal: null,
  });

  // User detail inspection modal
  const [inspectUser, setInspectUser] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        role: roleFilter,
        status: statusFilter,
      });
      const res = await API.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch user accounts.");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle status toggle dialog
  const requestStatusChange = (targetUser, newStatus) => {
    setConfirmDialog({
      open: true,
      title: newStatus === "suspended" ? "Suspend User Account" : "Reactivate User Account",
      message: `Are you sure you want to change the status of "${targetUser.name}" (${targetUser.email}) to ${newStatus.toUpperCase()}?`,
      actionType: "status",
      targetUser,
      newVal: newStatus,
    });
  };

  // Handle role change dialog
  const requestRoleChange = (targetUser, newRole) => {
    setConfirmDialog({
      open: true,
      title: "Update Account Role",
      message: `Change permission role for "${targetUser.name}" to ${newRole.toUpperCase()}?`,
      actionType: "role",
      targetUser,
      newVal: newRole,
    });
  };

  // Handle delete user dialog
  const requestDelete = (targetUser) => {
    setConfirmDialog({
      open: true,
      title: "Delete User Account",
      message: `Warning: This will permanently delete "${targetUser.name}" (${targetUser.email}). This action cannot be undone.`,
      actionType: "delete",
      targetUser,
      newVal: null,
    });
  };

  // Execute confirmed action
  const handleExecuteAction = async () => {
    const { actionType, targetUser, newVal } = confirmDialog;
    setConfirmDialog({ ...confirmDialog, open: false });
    setActionMessage({ type: "", text: "" });

    try {
      if (actionType === "status") {
        await API.patch(`/admin/users/${targetUser._id}/status`, { status: newVal });
        setActionMessage({
          type: "success",
          text: `Account "${targetUser.name}" status updated to ${newVal}.`,
        });
      } else if (actionType === "role") {
        await API.patch(`/admin/users/${targetUser._id}/role`, { role: newVal });
        setActionMessage({
          type: "success",
          text: `Account "${targetUser.name}" role updated to ${newRoleText(newVal)}.`,
        });
      } else if (actionType === "delete") {
        await API.delete(`/admin/users/${targetUser._id}`);
        setActionMessage({
          type: "success",
          text: `User account "${targetUser.name}" has been deleted.`,
        });
      }
      fetchUsers();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Action could not be completed.",
      });
    }
  };

  const newRoleText = (r) => (r === "admin" ? "Administrator" : r === "creator" ? "Survey Creator" : "Respondent");

  // Inspect user details
  const handleInspect = async (u) => {
    setInspectLoading(true);
    setInspectUser(null);
    try {
      const res = await API.get(`/admin/users/${u._id}`);
      setInspectUser(res.data);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to load user details.",
      });
    } finally {
      setInspectLoading(false);
    }
  };

  return (
    <div className="user-mgmt-view">
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <span className="admin-breadcrumb">SURVEYFLOW &bull; ACCESS CONTROL</span>
          <h1 className="admin-view-title">User Management</h1>
          <p className="admin-view-sub">
            Review registered accounts, govern administrative roles, and manage access statuses.
          </p>
        </div>
        <div className="total-counter-pill">
          <span>{total} Total Users</span>
        </div>
      </div>

      {/* Action Banner */}
      {actionMessage.text && (
        <div className={`action-banner banner-${actionMessage.type}`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage({ type: "", text: "" })}>&times;</button>
        </div>
      )}

      {/* Search & Filters Toolbar */}
      <div className="mgmt-toolbar">
        <div className="toolbar-search">
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <circle cx="9" cy="9" r="6" stroke="#8c8980" strokeWidth="1.75"/>
            <path d="M13.5 13.5L18 18" stroke="#8c8980" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
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
            <label>Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="creator">Survey Creator</option>
              <option value="respondent">Respondent</option>
            </select>
          </div>

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
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-section-card no-padding">
        {loading ? (
          <div className="mgmt-loading">
            <div className="admin-spinner-large" />
            <p>Loading user records...</p>
          </div>
        ) : error ? (
          <div className="mgmt-error">
            <p>{error}</p>
            <button onClick={fetchUsers} className="admin-refresh-btn">
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="mgmt-empty">
            <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
              <circle cx="12" cy="12" r="10" stroke="#b0ada6" strokeWidth="1.5"/>
              <path d="M12 8v5M12 16v.5" stroke="#b0ada6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>No user accounts found matching your query.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="user-mgmt-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Last Login</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = currentAdmin?._id === u._id;
                  return (
                    <tr key={u._id} className={isSelf ? "is-current-admin" : ""}>
                      <td>
                        <div className="user-cell-meta">
                          <div className="user-avatar-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="user-cell-name">
                              {u.name}
                              {isSelf && <span className="self-tag">You (Active)</span>}
                            </div>
                            <div className="user-cell-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="role-selector-wrap">
                          <select
                            value={u.role}
                            disabled={isSelf}
                            onChange={(e) => requestRoleChange(u, e.target.value)}
                            className={`role-select role-select-${u.role}`}
                            title={isSelf ? "You cannot modify your own administrative role" : "Change user role"}
                          >
                            <option value="admin">Administrator</option>
                            <option value="creator">Creator</option>
                            <option value="respondent">Respondent</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-status badge-${u.status}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="text-muted">
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="text-muted">
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </td>
                      <td>
                        <div className="user-action-buttons">
                          {/* Inspect details button */}
                          <button
                            className="btn-icon inspect-btn"
                            onClick={() => handleInspect(u)}
                            title="Inspect User Profile"
                          >
                            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>

                          {/* Status toggle button */}
                          <button
                            className={`btn-icon status-btn ${u.status === "active" ? "btn-suspend" : "btn-activate"}`}
                            disabled={isSelf}
                            onClick={() => requestStatusChange(u, u.status === "active" ? "suspended" : "active")}
                            title={isSelf ? "Cannot suspend own account" : u.status === "active" ? "Suspend Account" : "Reactivate Account"}
                          >
                            {u.status === "active" ? (
                              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M5 8h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            )}
                          </button>

                          {/* Delete user button */}
                          <button
                            className="btn-icon delete-btn"
                            disabled={isSelf}
                            onClick={() => requestDelete(u)}
                            title={isSelf ? "Cannot delete own account" : "Delete Account"}
                          >
                            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                              <path d="M2 4h12M5 4V2h6v2M13 4v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                className={`modal-confirm-btn ${confirmDialog.actionType === "delete" || confirmDialog.newVal === "suspended" ? "danger" : "primary"}`}
                onClick={handleExecuteAction}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {inspectUser && (
        <div className="admin-modal-overlay" onClick={() => setInspectUser(null)}>
          <div className="admin-modal-box modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="inspect-header">
              <h3>User Profile Details</h3>
              <button className="modal-close-x" onClick={() => setInspectUser(null)}>
                &times;
              </button>
            </div>
            <div className="inspect-content">
              <div className="inspect-grid">
                <div>
                  <span className="inspect-label">Full Name:</span>
                  <span className="inspect-val">{inspectUser.user?.name}</span>
                </div>
                <div>
                  <span className="inspect-label">Email:</span>
                  <span className="inspect-val">{inspectUser.user?.email}</span>
                </div>
                <div>
                  <span className="inspect-label">Role:</span>
                  <span className={`badge-role badge-${inspectUser.user?.role}`}>
                    {inspectUser.user?.role}
                  </span>
                </div>
                <div>
                  <span className="inspect-label">Status:</span>
                  <span className={`badge-status badge-${inspectUser.user?.status}`}>
                    {inspectUser.user?.status}
                  </span>
                </div>
                <div>
                  <span className="inspect-label">Account Created:</span>
                  <span className="inspect-val">
                    {new Date(inspectUser.user?.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="inspect-label">Surveys Authored:</span>
                  <span className="inspect-val">
                    {inspectUser.surveysCount || 0}
                  </span>
                </div>
              </div>

              {inspectUser.surveys && inspectUser.surveys.length > 0 && (
                <div className="inspect-surveys-list">
                  <h4>Created Surveys</h4>
                  <ul>
                    {inspectUser.surveys.map((s) => (
                      <li key={s._id}>
                        <span>{s.title}</span>
                        <span className={`badge-status badge-${s.status || "active"}`}>
                          {s.status || "active"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-actions" style={{ justifyContent: "flex-end" }}>
              <button className="modal-cancel-btn" onClick={() => setInspectUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
