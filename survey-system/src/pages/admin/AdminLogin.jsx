import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLogin.css";

export default function AdminLogin() {
  const { adminLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect to admin dashboard
  if (user && user.role === "admin") {
    navigate("/admin/dashboard", { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both administrator email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await adminLogin(email, password);
      if (res.success) {
        const destination = location.state?.from?.pathname || "/admin/dashboard";
        navigate(destination, { replace: true });
      } else {
        setError(res.error || "Authentication failed. Check your administrator credentials.");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred during admin authentication.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg-glow" />
      
      <div className="admin-login-container">
        {/* Brand / Header */}
        <div className="admin-login-brand">
          <div className="admin-shield-icon">
            <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
              <path
                d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
                fill="#2d5a3d"
                stroke="#4f9a6b"
                strokeWidth="1.5"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="admin-portal-badge">RESTRICTED ACCESS</span>
          <h1 className="admin-login-title">SurveyFlow Admin Console</h1>
          <p className="admin-login-sub">
            System administration, user moderation, and survey governance portal.
          </p>
        </div>

        {/* Card Form */}
        <div className="admin-login-card">
          <div className="admin-card-header">
            <h2>Administrator Sign In</h2>
            <p>Access requires verified administrative role privileges.</p>
          </div>

          {error && (
            <div className="admin-error-banner" role="alert">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.75" />
                <path d="M10 6v5M10 14v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-form" noValidate>
            <div className="admin-field-group">
              <label className="admin-field-label">Administrator Email</label>
              <div className="admin-input-wrap">
                <svg className="admin-input-icon" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 5h14a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path d="M3 6l7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  type="email"
                  className="admin-input"
                  placeholder="admin@surveyflow.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="admin-field-group">
              <label className="admin-field-label">Password</label>
              <div className="admin-input-wrap">
                <svg className="admin-input-icon" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  className="admin-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  required
                />
                <button
                  type="button"
                  className="admin-toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? (
                    <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                      <path d="M3 3l14 14M8.5 8.6A3 3 0 0011.4 11.5M6.3 6.3A7.5 7.5 0 002 10s3 5 8 5a7.4 7.4 0 003.7-1M9 5.1A7.5 7.5 0 0118 10s-3 5-8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                      <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`admin-submit-btn ${loading ? "is-loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="admin-spinner" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Seed info hint */}
          <div className="admin-seed-notice">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14" className="admin-notice-icon">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <strong>Default Seed Credentials:</strong>
              <div style={{ fontFamily: "monospace", fontSize: 11, marginTop: 2 }}>
                admin@surveyflow.com / Admin@123456
              </div>
            </div>
          </div>
        </div>

        {/* Footer return link */}
        <div className="admin-login-footer">
          <span>Not an administrator?</span>
          <button
            type="button"
            className="admin-back-btn"
            onClick={() => navigate("/login")}
          >
            &larr; Return to Regular User Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
