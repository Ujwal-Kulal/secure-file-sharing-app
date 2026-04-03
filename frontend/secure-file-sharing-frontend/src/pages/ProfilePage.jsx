import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Camera, ArrowLeft, Save, User, Phone, MapPin, Sparkles, Home, LayoutDashboard } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../utils/apiBase";
import "./HomePage.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    username: "",
    phoneNumber: "",
    address: "",
    profilePicture: "",
  });

  const fromPage = location.state?.from === "home" || location.state?.from === "dashboard"
    ? location.state.from
    : "dashboard";
  const primaryPath = fromPage === "home" ? "/" : "/dashboard";
  const secondaryPath = fromPage === "home" ? "/dashboard" : "/";
  const primaryLabel = fromPage === "home" ? "Back to Home" : "Back to Dashboard";
  const secondaryLabel = fromPage === "home" ? "Go to Dashboard" : "Go to Home";

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = response.data.user;
        setForm({
          username: profile.username || "",
          phoneNumber: profile.phoneNumber || "",
          address: profile.address || "",
          profilePicture: profile.profilePicture || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const initials = useMemo(() => {
    const name = form.username || user?.username || user?.email || "U";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";
  }, [form.username, user]);

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, profilePicture: reader.result }));
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        username: form.username,
      };

      if (form.phoneNumber.trim()) payload.phoneNumber = form.phoneNumber.trim();
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.profilePicture) payload.profilePicture = form.profilePicture;

      const response = await axios.put(`${API_BASE_URL}/api/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      updateUser(response.data.user);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content profile-shell" style={{ maxWidth: 1080, margin: "32px auto", position: "relative", paddingTop: 92 }}>
        <div className="profile-blob profile-blob--one" aria-hidden="true" />
        <div className="profile-blob profile-blob--two" aria-hidden="true" />
        <div style={{ position: "absolute", top: 0, left: 0, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="indian-button indian-button--glass"
            type="button"
            onClick={() => navigate(primaryPath)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#fff",
              borderRadius: 999,
              padding: "10px 14px",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
            }}
          >
            <ArrowLeft size={16} /> {primaryLabel}
          </button>

          <button
            className="indian-button indian-button--indigo"
            type="button"
            onClick={() => navigate(secondaryPath)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#fff",
              borderRadius: 999,
              padding: "10px 14px",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
            }}
          >
            {secondaryPath === "/" ? <Home size={16} /> : <LayoutDashboard size={16} />} {secondaryLabel}
          </button>
        </div>

        <div className="profile-heading-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24, marginTop: 6 }}>
          <Sparkles size={30} color="#7ee7ff" />
          <h1 className="home-heading" style={{ margin: 0 }}>Profile</h1>
        </div>

        {loading ? (
          <div style={{ color: "#fff", textAlign: "center" }}>Loading profile...</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "320px 1fr",
              gap: 20,
              alignItems: "stretch",
            }}
          >
            <div
              className="profile-card-left"
              style={{
                borderRadius: 24,
                padding: 24,
                background: "linear-gradient(180deg, rgba(79,140,255,0.16), rgba(0,188,212,0.08))",
                border: "1px solid rgba(255,255,255,0.16)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top right, rgba(126,231,255,0.18), transparent 30%), radial-gradient(circle at bottom left, rgba(79,140,255,0.24), transparent 35%)" }} />
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    padding: 4,
                    background: "linear-gradient(135deg, #4f8cff, #00bcd4, #8eecff)",
                    boxShadow: "0 0 0 10px rgba(255,255,255,0.04), 0 18px 35px rgba(0,0,0,0.24)",
                  }}>
                    {form.profilePicture ? (
                      <img
                        src={form.profilePicture}
                        alt="Profile"
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", background: "#0f172a" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(6, 11, 24, 0.9)", color: "#fff", fontSize: 42, fontWeight: 800 }}>
                        {initials}
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="profilePicture"
                    style={{
                      position: "absolute",
                      right: 8,
                      bottom: 8,
                      display: "grid",
                      placeItems: "center",
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #ff9800, #ffb74d)",
                      color: "#fff",
                      cursor: "pointer",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
                    }}
                  >
                    <Camera size={18} />
                  </label>
                </div>

                <input id="profilePicture" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />

                <div style={{ textAlign: "center", color: "#fff" }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{form.username || user?.username}</div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>{user?.email}</div>
                </div>

                <div style={{ width: "100%", display: "grid", gap: 10, marginTop: 10 }}>
                  <div style={{ padding: "10px 12px", borderRadius: 14, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dff6ff", fontWeight: 700, fontSize: 13 }}>
                      <User size={15} /> Identity
                    </div>
                    <div style={{ marginTop: 5, color: "rgba(255,255,255,0.84)", fontSize: 12 }}>
                      Keep your avatar and display name fresh for better recognition.
                    </div>
                  </div>

                  <div style={{ padding: "10px 12px", borderRadius: 14, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dff6ff", fontWeight: 700, fontSize: 13 }}>
                      <Phone size={15} /> Contact
                    </div>
                    <div style={{ marginTop: 5, color: "rgba(255,255,255,0.84)", fontSize: 12 }}>
                      Add phone details so teammates can reach you quickly.
                    </div>
                  </div>

                  <div style={{ padding: "10px 12px", borderRadius: 14, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dff6ff", fontWeight: 700, fontSize: 13 }}>
                      <MapPin size={15} /> Location
                    </div>
                    <div style={{ marginTop: 5, color: "rgba(255,255,255,0.84)", fontSize: 12 }}>
                      Your address helps personalize sharing and collaboration context.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form
              className="profile-card-right"
              onSubmit={handleSave}
              style={{
                borderRadius: 24,
                padding: 24,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.16)",
                backdropFilter: "blur(10px)",
                color: "#fff",
                display: "grid",
                gap: 18,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 24 }}>Your details</h2>
                <p style={{ margin: "6px 0 0", opacity: 0.8 }}>Update your profile picture and contact details here.</p>
              </div>

              {error && <div style={{ color: "#ff8080" }}>{error}</div>}
              {success && <div style={{ color: "#4caf50" }}>{success}</div>}

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><User size={16} /> Username</span>
                <input
                  value={form.username}
                  onChange={(e) => setForm((current) => ({ ...current, username: e.target.value }))}
                  className="profile-input"
                  style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "#fff" }}
                  placeholder="Your display name"
                />
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={16} /> Phone Number</span>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((current) => ({ ...current, phoneNumber: e.target.value }))}
                  className="profile-input"
                  style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "#fff" }}
                  placeholder="e.g. +1 555 123 4567"
                />
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={16} /> Address</span>
                <textarea
                  rows={4}
                  value={form.address}
                  onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))}
                  className="profile-input"
                  style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "#fff", resize: "vertical" }}
                  placeholder="Street, city, country"
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  className="indian-button indian-button--ghost"
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "transparent",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  className="indian-button indian-button--indigo"
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "12px 18px",
                    borderRadius: 14,
                    border: "none",
                    background: "linear-gradient(135deg, #4f8cff, #00bcd4)",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 16px 28px rgba(0,188,212,0.24)",
                  }}
                >
                  <Save size={16} /> {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}