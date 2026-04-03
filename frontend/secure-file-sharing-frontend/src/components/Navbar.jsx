import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserCircle2, Sparkles, LayoutDashboard, LogOut, Loader } from "lucide-react";
import "../pages/HomePage.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Simulate logout animation time
    setTimeout(() => {
      logout();
      navigate("/", { state: { justLoggedOut: true, timestamp: Date.now() } });
      setIsLoggingOut(false);
    }, 600);
  };

  return (
    <>
      {isLoggingOut && (
        <div className="logout-overlay" role="status" aria-live="polite">
          <div className="logout-overlay-card">
            <div className="logout-overlay-spinner-wrapper">
              <Loader size={24} className="logout-overlay-spinner" />
            </div>
            <strong style={{ fontSize: 18, fontWeight: 700 }}>Signing out...</strong>
            <span style={{ fontSize: 13, opacity: 0.8 }}>Your session is being closed securely.</span>
          </div>
        </div>
      )}
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <img src="/logo_lock.jpg" alt="Secure File Sharing Logo" className="logo-img" />
          <span className="logo-text">SecureShare</span>
        </div>
        <div className="navbar-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="navbar-auth">
        {!isLoggedIn ? (
          <button className="nav-btn nav-btn--primary" onClick={() => navigate("/register")}>Get Started</button>
        ) : (
          <>
            <button
              className="nav-profile-chip"
              onClick={() => navigate("/profile", { state: { from: "home" } })}
              title="Profile"
            >
              <span className="profile-avatar">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user?.username || "Profile"} />
                ) : (
                  <UserCircle2 size={18} />
                )}
              </span>
              <span className="profile-info">
                <span className="profile-label">
                  <Sparkles size={11} /> Profile
                </span>
                <span className="profile-name">{user?.username || user?.email || "Account"}</span>
              </span>
            </button>
            <button className="nav-btn" onClick={() => navigate("/dashboard")} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><LayoutDashboard size={16} /> Dashboard</button>
            <button 
              className={`nav-btn nav-logout-btn ${isLoggingOut ? 'logging-out' : ''}`}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader size={16} className="logout-spinner" /> Logging out...
                </>
              ) : (
                <>
                  <LogOut size={16} /> Logout
                </>
              )}
            </button>
          </>
        )}
        </div>
      </nav>
    </>
  );
}
