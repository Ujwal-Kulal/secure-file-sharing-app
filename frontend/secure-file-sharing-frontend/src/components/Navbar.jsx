import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserCircle2, Sparkles, LayoutDashboard } from "lucide-react";
import "../pages/HomePage.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();

  return (
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
          <>
            <button className="nav-btn" onClick={() => navigate("/login")}>Login</button>
            <button className="nav-btn" onClick={() => navigate("/register")}>Register</button>
          </>
        ) : (
          <>
            <button
              className="nav-btn nav-profile-chip"
              onClick={() => navigate("/profile", { state: { from: "home" } })}
              title="Profile"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, paddingRight: 14 }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user?.username || "Profile"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <UserCircle2 size={16} color="#fff" />
                )}
              </span>
              <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.05, textAlign: "left" }}>
                <span style={{ fontSize: 10, opacity: 0.8, letterSpacing: 0.4, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Sparkles size={10} /> Profile
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.username || user?.email || "Account"}
                </span>
              </span>
            </button>
            <button className="nav-btn" onClick={() => navigate("/dashboard")} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><LayoutDashboard size={16} /> Dashboard</button>
            <button className="nav-btn" onClick={() => {
              logout();
              navigate("/");
            }}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
