// src/HomePage.jsx
import React from "react";
import { LogIn, UserPlus, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="home-container" id="home">
      <Navbar />
      <div className="hero-section">
        <img
          src="/logo_lock.jpg"
          alt="Secure File Sharing Logo"
          className="hero-logo"
        />
        <div className="hero-title">SecureShare</div>
        <div className="hero-desc">
          Securely share files with{" "}
          <span className="highlight">encryption</span> &amp;{" "}
          <span className="highlight">full control</span>.
        </div>
        <div className="hero-subdesc">Fast, private, and easy to use.</div>
      </div>
      <footer className="footer-info">
        <section id="about" className="info-section">
          <h2>About</h2>
          <p>
            SecureShare is a modern platform for sharing files with end-to-end
            encryption, password protection, and full control over access. Your
            privacy and security are our top priorities.
          </p>
        </section>
        <section id="services" className="info-section">
          <h2>Services</h2>
          <ul>
            <li>Encrypted File Upload & Download</li>
            <li>Password-Protected Sharing</li>
            <li>Expiring Download Links</li>
            <li>Access Logging & Audit</li>
            <li>User Authentication</li>
          </ul>
        </section>
        <section id="contact" className="info-section">
          <h2>Contact</h2>
          <p>
            For support or feedback, email us at{" "}
            <a href="mailto:support@secureshare.com">support@secureshare.com</a>{" "}
            or use the contact form in your dashboard.
          </p>
        </section>
      </footer>
    </div>
  );
}
