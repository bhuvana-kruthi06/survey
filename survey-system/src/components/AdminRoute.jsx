import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        color: "#5c5950",
        background: "#faf9f6"
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: "3px solid #e0ded9",
          borderTopColor: "#2d5a3d",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <p style={{ marginTop: 16, fontSize: 14, fontWeight: 500 }}>
          Verifying administrator authorization...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in: redirect to admin login
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Logged in as respondent/creator but not admin: access denied
  if (user.role !== "admin") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#faf9f6",
        fontFamily: "'DM Sans', sans-serif",
        padding: 24,
      }}>
        <div style={{
          background: "#fff",
          border: "1px solid #ebd7d7",
          borderRadius: 14,
          padding: 40,
          maxWidth: 480,
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#faecec",
            color: "#c0392b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a18", marginBottom: 10 }}>
            403 - Administrator Access Required
          </h2>
          <p style={{ fontSize: 14, color: "#66635b", lineHeight: 1.6, marginBottom: 24 }}>
            Your account (<strong>{user.email}</strong> with role <em>{user.role}</em>) does not possess administrator privileges to access this area.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <a
              href="/surveys"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                borderRadius: 8,
                background: "#2d5a3d",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Return to User Dashboard
            </a>
            <a
              href="/admin/login"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                borderRadius: 8,
                border: "1.5px solid #d4d0c8",
                background: "#fff",
                color: "#1a1a18",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Admin Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
