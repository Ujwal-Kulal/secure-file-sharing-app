// src/HomePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { LogIn, UserPlus, Upload, Sparkles, ArrowRight, Users, Hash, BadgePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [uniqueId, setUniqueId] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [myGroups, setMyGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  useEffect(() => {
    const fetchMyGroups = async () => {
      if (!isLoggedIn) {
        setMyGroups([]);
        return;
      }

      try {
        setGroupsLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/groups/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyGroups(response.data?.groups || []);
      } catch {
        setMyGroups([]);
      } finally {
        setGroupsLoading(false);
      }
    };

    fetchMyGroups();
  }, [isLoggedIn]);

  const handleJoinGroup = async (event) => {
    event.preventDefault();
    setJoining(true);
    setJoinError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "group-join" } });
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/groups/join",
        { uniqueId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/group/${response.data.group.uniqueId}`, { state: { from: "home-join" } });
    } catch (err) {
      setJoinError(err.response?.data?.message || "Unable to join group");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="home-container" id="home" style={{ position: "relative" }}>
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
        <section className="info-section" style={{ gridColumn: "1 / -1" }}>
          <h2>Groups</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18, alignItems: "stretch" }}>
            <div style={{ padding: 18, borderRadius: 22, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 10 }}><Hash size={18} /> Join a Group</h3>
              <p style={{ marginTop: 0, opacity: 0.85 }}>Enter a unique group ID to open the shared workspace and dashboard.</p>
              <form onSubmit={handleJoinGroup} style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Users size={16} /> Unique Group ID</span>
                  <input
                    value={uniqueId}
                    onChange={(e) => setUniqueId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                    placeholder="Enter ID from your team"
                    maxLength={12}
                    className="profile-input"
                    style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)", color: "#fff" }}
                  />
                </label>
                {joinError && <div style={{ color: "#ff8f8f" }}>{joinError}</div>}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button type="submit" className="indian-button indian-button--indigo" style={{ border: "none", padding: "12px 18px" }} disabled={joining}>
                    {joining ? "Joining..." : "Join Group"}
                  </button>
                  <button type="button" onClick={() => navigate("/groups/create")} className="indian-button indian-button--glass" style={{ border: "none", padding: "12px 18px", display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <BadgePlus size={16} /> Create Group
                  </button>
                </div>
              </form>
            </div>
            <div style={{ padding: 18, borderRadius: 22, background: "linear-gradient(180deg, rgba(79,140,255,0.16), rgba(0,188,212,0.08))", border: "1px solid rgba(255,255,255,0.12)" }}>
              <h3 style={{ marginTop: 0 }}>
                {isLoggedIn ? "Your Groups" : "What groups add"}
              </h3>

              {isLoggedIn ? (
                <>
                  <p style={{ marginTop: 0, opacity: 0.86 }}>
                    {user?.username ? `${user.username}, choose a group to open its private dashboard.` : "Choose a group to open its private dashboard."}
                  </p>
                  {groupsLoading ? (
                    <p style={{ margin: 0, opacity: 0.85 }}>Loading your groups...</p>
                  ) : myGroups.length === 0 ? (
                    <p style={{ margin: 0, opacity: 0.9 }}>You are not part of any group yet. Join one or create a new group.</p>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {myGroups.map((group) => (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => navigate(`/group/${group.uniqueId}`)}
                          className="indian-button indian-button--glass"
                          style={{ border: "1px solid rgba(255,255,255,0.16)", padding: "11px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, textAlign: "left", borderRadius: 14 }}
                        >
                          <span style={{ display: "grid", gap: 3 }}>
                            <strong style={{ color: "#fff" }}>{group.name}</strong>
                            <span style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.82rem" }}>
                              ID {group.uniqueId} · {group.memberCount}/{group.memberLimit} members
                            </span>
                          </span>
                          <span style={{ color: "#d9ecff", fontWeight: 700, whiteSpace: "nowrap" }}>Open</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                  <li>Shared file collections per team</li>
                  <li>Private member limit control</li>
                  <li>Group-specific dashboard view</li>
                  <li>Clear sharing boundary for projects</li>
                </ul>
              )}
            </div>
          </div>
        </section>

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
