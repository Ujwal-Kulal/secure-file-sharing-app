import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../pages/HomePage.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  // Use state to force re-render on location or storage change
  const [isLoggedIn, setIsLoggedIn] = React.useState(Boolean(localStorage.getItem("token")));

  React.useEffect(() => {
    const checkToken = () => setIsLoggedIn(Boolean(localStorage.getItem("token")));
    checkToken();
    window.addEventListener("storage", checkToken);
    // Also check on focus (for single tab refresh)
    window.addEventListener("focus", checkToken);
    return () => {
      window.removeEventListener("storage", checkToken);
      window.removeEventListener("focus", checkToken);
    };
  }, []);

  React.useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
  }, [location]);

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
        {!isLoggedIn && (
          <>
            <button className="nav-btn" onClick={() => navigate("/login")}>Login</button>
            <button className="nav-btn" onClick={() => navigate("/register")}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
}
