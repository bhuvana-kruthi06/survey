import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
 
const NAV_ITEMS = [
  {
    label: "Take Survey", path: "/survey/latest",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" width="16" height="16">
        <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 7h8M5 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    desc: "Respond to the active survey",
  },
  {
    label: "Survey Builder",
    path: "/builder",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" width="16" height="16">
        <path d="M3 14l2-2 8-8a1.4 1.4 0 00-2-2L3 10l-1 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M11 4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    desc: "Create and manage surveys",
  },
  {
    label: "Results Dashboard",
    path: "/dashboard",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" width="16" height="16">
        <rect x="2" y="10" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="7" y="6" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="12" y="2" width="3" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    desc: "View responses and analytics",
  },
];
 
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
 
  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
 
  // Close menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);
 
  const handleNav = (path) => {
    navigate(path);
    setOpen(false);
  };
 
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
 
  const currentPage = NAV_ITEMS.find((n) => location.pathname.startsWith(n.path.split("/survey")[0] === "" ? n.path : n.path.split("/survey")[0]));
 
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <button className="navbar-brand" onClick={() => handleNav("/surveys")}>
          <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
            <rect width="32" height="32" rx="8" fill="#2d5a3d"/>
            <path d="M9 16h14M16 9v14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="4.5" stroke="#a8d5b5" strokeWidth="1.2" fill="none"/>
          </svg>
          <span className="navbar-brand-name">SurveyFlow</span>
        </button>
 
        {/* Right side */}
        <div className="navbar-right" ref={menuRef}>
          {/* Current page label (desktop) */}
          <span className="navbar-current-page">
            {NAV_ITEMS.find((n) => location.pathname === n.path || location.pathname.startsWith("/survey"))?.label || ""}
          </span>
 
          {/* User pill */}
          <div className="navbar-user-pill">
            <div className="navbar-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="navbar-username">{user?.name}</span>
          </div>
 
          {/* Hamburger button */}
          <button
            className={`hamburger-btn ${open ? "is-open" : ""}`}
            onClick={() => setOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            <span className="ham-line ham-line-1" />
            <span className="ham-line ham-line-2" />
            <span className="ham-line ham-line-3" />
          </button>
 
          {/* Dropdown menu */}
          {open && (
            <div className="nav-dropdown">
              {/* Header */}
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="dropdown-name">{user?.name}</p>
                  <p className="dropdown-role">Logged in</p>
                </div>
              </div>
 
              <div className="dropdown-divider" />
 
              {/* Nav items */}
              <p className="dropdown-section-label">Navigation</p>
              <nav className="dropdown-nav">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path.includes("/survey") && location.pathname.startsWith("/survey"));
                  return (
                    <button
                      key={item.path}
                      className={`dropdown-nav-item ${isActive ? "active" : ""}`}
                      onClick={() => handleNav(item.path)}
                    >
                      <span className="dni-icon">{item.icon}</span>
                      <span className="dni-text">
                        <span className="dni-label">{item.label}</span>
                        <span className="dni-desc">{item.desc}</span>
                      </span>
                      {isActive && <span className="dni-dot" />}
                    </button>
                  );
                })}
              </nav>
 
              <div className="dropdown-divider" />
 
              {/* Sign out */}
              <button className="dropdown-signout" onClick={handleLogout}>
                <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
                  <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}