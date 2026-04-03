import React, { useState, useMemo } from "react";
import { UserPlus, Lock, Mail, User, Eye, EyeOff, Sparkles, Shield, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../utils/apiBase";
import "./CommonStyles.css";

const MIN_PASSWORD_LENGTH = 8;

const getPasswordStrength = (password) => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { strength: "weak", score: 0, message: `At least ${MIN_PASSWORD_LENGTH} characters required` };
  }

  let score = 1;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { strength: "weak", score: 1, message: "Too weak - mix letters, numbers, symbols" };
  if (score <= 2) return { strength: "fair", score: 2, message: "Fair - add uppercase, numbers, or symbols" };
  if (score <= 3) return { strength: "good", score: 3, message: "Good - consider adding more variety" };
  return { strength: "strong", score: 4, message: "Strong password!" };
};

const isPasswordValid = (password) => {
  return (
    password.length >= MIN_PASSWORD_LENGTH &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate password meets ALL requirements
    if (!isPasswordValid(password)) {
      setError("Password must have: 8+ characters, uppercase letter, lowercase letter, and number");
      setLoading(false);
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred during registration");
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
              <Shield size={48} />
            </div>
            <h2 className="branding-title">SecureShare</h2>
            <p className="branding-subtitle">Secure file sharing for teams</p>
            <div className="branding-features">
              <div className="feature-item">
                <Sparkles size={16} />
                <span>End-to-end encryption</span>
              </div>
              <div className="feature-item">
                <Sparkles size={16} />
                <span>Instant file sharing</span>
              </div>
              <div className="feature-item">
                <Sparkles size={16} />
                <span>Team collaboration</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-content">
            <div className="auth-header">
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join us for secure file sharing</p>
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Choose a username"
                    className="auth-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

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
                    placeholder="Create a strong password"
                    className={`auth-input ${password ? `password-strength-${passwordStrength.strength}` : ""}`}
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

                {password && (
                  <div className={`password-strength-indicator strength-${passwordStrength.strength}`}>
                    <div className="strength-bars">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`strength-bar ${i < passwordStrength.score ? "filled" : ""}`}
                        />
                      ))}
                    </div>
                    <span className="strength-text">{passwordStrength.message}</span>
                  </div>
                )}

                <div className="password-requirements">
                  <div className={`requirement ${password.length >= MIN_PASSWORD_LENGTH ? "met" : ""}`}>
                    {password.length >= MIN_PASSWORD_LENGTH ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    <span>At least {MIN_PASSWORD_LENGTH} characters</span>
                  </div>
                  <div className={`requirement ${/[a-z]/.test(password) ? "met" : ""}`}>
                    {/[a-z]/.test(password) ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    <span>Lowercase letter</span>
                  </div>
                  <div className={`requirement ${/[A-Z]/.test(password) ? "met" : ""}`}>
                    {/[A-Z]/.test(password) ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`requirement ${/[0-9]/.test(password) ? "met" : ""}`}>
                    {/[0-9]/.test(password) ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    <span>Number</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="auth-btn" 
                disabled={loading || !isPasswordValid(password)}
              >
                <UserPlus size={18} />
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            <button
              type="button"
              className="auth-link-btn"
              onClick={() => navigate("/login")}
            >
              Sign in instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
