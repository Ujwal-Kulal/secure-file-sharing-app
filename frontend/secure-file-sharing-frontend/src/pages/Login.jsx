import React, { useState } from "react";
import { LogIn, Lock, Mail, Eye, EyeOff, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../utils/apiBase";
import "./CommonStyles.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        login(data.token, data.user);
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button className="back-to-home-btn" onClick={() => navigate("/")}>
        <ArrowLeft size={18} />
        Back to Home
      </button>
      <div className="auth-background">
        <div className="auth-blob auth-blob--1"></div>
        <div className="auth-blob auth-blob--2"></div>
        <div className="auth-blob auth-blob--3"></div>
      </div>

      <div className="auth-wrapper">
        <div className="auth-branding">
          <div className="branding-content">
            <div className="branding-icon">
              <Lock size={48} />
            </div>
            <h2 className="branding-title">SecureShare</h2>
            <p className="branding-subtitle">Share files with confidence</p>
            <div className="branding-features">
              <div className="feature-item">
                <Sparkles size={16} />
                <span>Military-grade encryption</span>
              </div>
              <div className="feature-item">
                <Sparkles size={16} />
                <span>Group collaboration</span>
              </div>
              <div className="feature-item">
                <Sparkles size={16} />
                <span>Access logs & tracking</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-content">
            <div className="auth-header">
              <h1 className="auth-title">Welcome Back</h1>
              <p className="auth-subtitle">Sign in to your account</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                <LogIn size={18} />
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="auth-divider">
              <span>New to SecureShare?</span>
            </div>

            <button
              type="button"
              className="auth-link-btn"
              onClick={() => navigate("/register")}
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
