import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";
 
export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
 
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
 
  const update = (field, val) => {
    setForm((p) => ({ ...p, [field]: val }));
    setError("");
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
 
    setTimeout(() => {
      let result;
      if (tab === "login") {
        result = login(form.email, form.password);
      } else {
        result = register(form.name, form.email, form.password);
      }
 
      if (result.success) {
        navigate("/surveys");
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 600); // small delay to show loading state
  };
 
  const switchTab = (t) => {
    setTab(t);
    setError("");
    setForm({ name: "", email: "", password: "" });
  };
 
  return (
    <div className="login-page">
      {/* Left panel — branding */}
      <div className="login-left">
        <div className="login-left-inner">
          <div className="brand-logo">
            <svg viewBox="0 0 36 36" fill="none" width="36" height="36">
              <rect width="36" height="36" rx="10" fill="#2d5a3d" />
              <path d="M10 18h16M18 10v16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="18" r="5" stroke="#a8d5b5" strokeWidth="1.5" fill="none" />
            </svg>
            <span className="brand-name">SurveyFlow</span>
          </div>
 
          <div className="left-hero">
            <h1 className="left-title">Understand your audience, one question at a time.</h1>
            <p className="left-sub">
              Create surveys, collect responses, and turn data into clear insights — all in one place.
            </p>
          </div>
 
          <div className="left-stats">
            <div className="stat-item">
              <span className="stat-num">12k+</span>
              <span className="stat-label">Surveys created</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">98%</span>
              <span className="stat-label">Completion rate</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">4.9★</span>
              <span className="stat-label">User rating</span>
            </div>
          </div>
        </div>
      </div>
 
      {/* Right panel — form */}
      <div className="login-right">
        <div className="login-card">
          {/* Tab switcher */}
          <div className="tab-switcher">
            <button
              className={`tab-btn ${tab === "login" ? "active" : ""}`}
              onClick={() => switchTab("login")}
            >
              Sign in
            </button>
            <button
              className={`tab-btn ${tab === "register" ? "active" : ""}`}
              onClick={() => switchTab("register")}
            >
              Create account
            </button>
            <div className={`tab-indicator ${tab === "register" ? "right" : ""}`} />
          </div>
 
          <div className="form-header">
            <h2 className="form-title">
              {tab === "login" ? "Welcome back" : "Get started free"}
            </h2>
            <p className="form-sub">
              {tab === "login"
                ? "Sign in to access your surveys and results."
                : "Create your account and start your first survey today."}
            </p>
          </div>
 
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Name field (register only) */}
            {tab === "register" && (
              <div className="field-group animate-in">
                <label className="field-label">Full name</label>
                <div className="field-wrap">
                  <svg className="field-icon" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}
 
            {/* Email */}
            <div className="field-group">
              <label className="field-label">Email address</label>
              <div className="field-wrap">
                <svg className="field-icon" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 8l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  type="email"
                  className="field-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  autoFocus={tab === "login"}
                />
              </div>
            </div>
 
            {/* Password */}
            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label">Password</label>
                {tab === "login" && (
                  <button type="button" className="forgot-link">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="field-wrap">
                <svg className="field-icon" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  className="field-input"
                  placeholder={tab === "register" ? "At least 6 characters" : "Your password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="show-pass-btn"
                  onClick={() => setShowPass((p) => !p)}
                  tabIndex={-1}
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
              {tab === "register" && (
                <div className="password-strength">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`strength-bar ${
                        form.password.length >= i * 3 ? "filled" : ""
                      } ${
                        form.password.length >= 12
                          ? "strong"
                          : form.password.length >= 6
                          ? "medium"
                          : "weak"
                      }`}
                    />
                  ))}
                  <span className="strength-label">
                    {form.password.length === 0
                      ? ""
                      : form.password.length < 6
                      ? "Too short"
                      : form.password.length < 12
                      ? "Good"
                      : "Strong"}
                  </span>
                </div>
              )}
            </div>
 
            {/* Error message */}
            {error && (
              <div className="error-box">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}
 
            {/* Submit */}
            <button
              type="submit"
              className={`submit-btn ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : tab === "login" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </button>
          </form>
 
          {/* Demo hint */}
          <p className="demo-hint">
            Demo: use any email + password (6+ chars) to continue
          </p>
        </div>
      </div>
    </div>
  );
}