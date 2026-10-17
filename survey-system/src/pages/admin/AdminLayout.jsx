import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

const ADMIN_NAV = [
  {
    path: "/admin/dashboard",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.75"/>
        <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.75"/>
        <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.75"/>
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.75"/>
      </svg>
    ),
  },
  {
    path: "/admin/users",
    label: "User Management",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M2 17c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
        <path d="M14 8a2.5 2.5 0 010-5M18 15c0-1.8-1.2-3.2-3-3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    path: "/admin/surveys",
    label: "Survey Governance",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M8 7h4M8 10h4M8 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    path: "/admin/analytics",
    label: "Response Analytics",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <path d="M3 17V3M3 17h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
        <path d="M6 13l3.5-5 3 3.5 4-6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: "/admin/profile",
    label: "Admin Account",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.75"/>
        <circle cx="10" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 15c0-2 1.8-3 4-3s4 1 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-portal-shell">
      {/* Mobile Top Header */}
      <header className="admin-top-bar">
        <button
          className="admin-menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Navigation"
        >
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="admin-bar-brand">
          <div className="admin-bar-logo">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <rect width="24" height="24" rx="6" fill="#2d5a3d" />
              <path d="M7 12h10M12 7v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span>SurveyFlow Admin</span>
        </div>
        <button
          className="admin-switch-mode-btn"
          onClick={() => navigate("/surveys")}
          title="Return to User View"
        >
          User View
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div className="admin-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin/dashboard" className="admin-logo-link" onClick={() => setSidebarOpen(false)}>
            <div className="admin-logo-box">
              <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
                <rect width="28" height="28" rx="8" fill="#2d5a3d" />
                <path d="M8 14h12M14 8v12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="14" cy="14" r="3.5" stroke="#a8d5b5" strokeWidth="1.2" fill="none" />
              </svg>
            </div>
            <div>
              <div className="admin-logo-text">SurveyFlow</div>
              <div className="admin-logo-badge">ADMIN PORTAL</div>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="admin-nav-menu">
          <div className="admin-nav-group-title">MAIN NAVIGATION</div>
          {ADMIN_NAV.map((item) => {
            const active = location.pathname === item.path || (item.path === "/admin/dashboard" && location.pathname === "/admin");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${active ? "is-active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
                {active && <span className="admin-active-pill" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="admin-user-meta">
              <span className="admin-user-name">{user?.name || "Administrator"}</span>
              <span className="admin-user-role">Super Admin</span>
            </div>
          </div>

          <div className="admin-footer-actions">
            <button
              className="admin-action-btn user-view-btn"
              onClick={() => navigate("/surveys")}
            >
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M6 3L2 7l4 4M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>User View</span>
            </button>
            <button
              className="admin-action-btn logout-btn"
              onClick={handleLogout}
              title="Sign Out"
            >
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}
