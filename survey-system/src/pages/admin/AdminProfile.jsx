import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import "./AdminProfile.css";

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-profile-view">
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <span className="admin-breadcrumb">SURVEYFLOW &bull; SECURITY PROFILE</span>
          <h1 className="admin-view-title">Administrator Profile</h1>
          <p className="admin-view-sub">
            Active administrative credentials, system role privileges, and security parameters.
          </p>
        </div>
      </div>

      <div className="admin-profile-grid">
        {/* Profile Card */}
        <div className="admin-section-card profile-main-card">
          <div className="profile-hero">
            <div className="profile-large-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="profile-titles">
              <h2 className="profile-display-name">{user?.name}</h2>
              <p className="profile-display-email">{user?.email}</p>
              <div className="profile-tags-row">
                <span className="badge-role badge-admin">Administrator</span>
                <span className="badge-status badge-active">Active Session</span>
              </div>
            </div>
          </div>

          <div className="profile-meta-divider" />

          <div className="profile-attributes-grid">
            <div className="attr-item">
              <span className="attr-label">User ID (MongoDB)</span>
              <span className="attr-value mono">{user?._id || "N/A"}</span>
            </div>

            <div className="attr-item">
              <span className="attr-label">Assigned Role</span>
              <span className="attr-value">System Administrator (Full RBAC)</span>
            </div>

            <div className="attr-item">
              <span className="attr-label">Account Created</span>
              <span className="attr-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "Initial Seed"}
              </span>
            </div>

            <div className="attr-item">
              <span className="attr-label">Connected API Endpoint</span>
              <span className="attr-value mono">{API.defaults.baseURL}</span>
            </div>
          </div>

          <div className="profile-meta-divider" />

          <div className="profile-action-row">
            <button className="profile-logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Sign Out of Admin Console</span>
            </button>
          </div>
        </div>

        {/* Security & Governance Checklist Card */}
        <div className="admin-section-card">
          <h2 className="section-card-title">Security Governance Status</h2>
          <p className="section-card-desc">Active protections enforced by the server</p>

          <div className="security-check-list">
            <div className="sec-check-item">
              <div className="sec-check-icon check-pass">
                <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                  <path d="M3 8l3 3 7-7" stroke="#2d5a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="sec-check-text">
                <strong>Server-Side RBAC Enforcement</strong>
                <span>All <code>/api/admin/*</code> routes reject unauthorized tokens with 401 and non-admin roles with 403.</span>
              </div>
            </div>

            <div className="sec-check-item">
              <div className="sec-check-icon check-pass">
                <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                  <path d="M3 8l3 3 7-7" stroke="#2d5a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="sec-check-text">
                <strong>Bcrypt Password Hashing</strong>
                <span>Passwords salted with 10 rounds. Cleartext passwords or hashes are never exposed in API responses.</span>
              </div>
            </div>

            <div className="sec-check-item">
              <div className="sec-check-icon check-pass">
                <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                  <path d="M3 8l3 3 7-7" stroke="#2d5a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="sec-check-text">
                <strong>Privilege Escalation Protection</strong>
                <span>Public registration strictly assigns creator/respondent roles and strips administrative elevation requests.</span>
              </div>
            </div>

            <div className="sec-check-item">
              <div className="sec-check-icon check-pass">
                <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                  <path d="M3 8l3 3 7-7" stroke="#2d5a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="sec-check-text">
                <strong>Self-Preservation Safeguards</strong>
                <span>Active admin cannot accidentally demote their own role or suspend their own account.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
