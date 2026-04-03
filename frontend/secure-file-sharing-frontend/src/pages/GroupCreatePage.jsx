import React, { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Sparkles, Users, Hash, BadgePlus, ArrowLeftRight, PartyPopper } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../utils/apiBase";
import "./HomePage.css";

const generateUniqueId = () => {
  const randomSegment = Math.random().toString(36).slice(2, 6).toUpperCase();
  const timeSegment = Date.now().toString(36).slice(-4).toUpperCase();
  return `${randomSegment}${timeSegment}`.replace(/[^A-Z0-9]/g, "").slice(0, 10);
};

export default function GroupCreatePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [name, setName] = useState("");
  const [uniqueId, setUniqueId] = useState(generateUniqueId());
  const [memberLimit, setMemberLimit] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const previewStyle = useMemo(() => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "space-between",
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
  }), []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/groups/create`,
        { name, uniqueId, memberLimit },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/group/${response.data.group.uniqueId}`, { state: { from: "create-group" } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="home-container" style={{ position: "relative" }}>
      <div className="home-content" style={{ maxWidth: 820, margin: "32px auto", paddingTop: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
          <Sparkles size={30} color="#7ee7ff" />
          <h1 className="home-heading" style={{ margin: 0 }}>Create Group</h1>
        </div>

        {!isLoggedIn && (
          <div style={{ marginBottom: 18, color: "#ffd2d2" }}>
            Please login first to create a group.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "stretch" }}>
          <div style={{ borderRadius: 24, padding: 22, background: "linear-gradient(180deg, rgba(79,140,255,0.16), rgba(0,188,212,0.08))", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 20px 50px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={previewStyle}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><BadgePlus size={16} /> Group name</span>
                <strong>{name || "Your Group"}</strong>
              </div>
              <div style={previewStyle}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Hash size={16} /> Unique ID</span>
                <strong>{uniqueId}</strong>
              </div>
              <div style={previewStyle}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Users size={16} /> Member limit</span>
                <strong>{memberLimit}</strong>
              </div>
              <button
                type="button"
                onClick={() => setUniqueId(generateUniqueId())}
                className="indian-button indian-button--glass"
                style={{ border: "none", padding: "12px 14px", display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}
              >
                <ArrowLeftRight size={16} /> Regenerate ID
              </button>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 1.6 }}>
                Share this unique ID with your team. Members will use it on the home page to open the group dashboard directly.
              </div>
            </div>
          </div>

          <form onSubmit={handleCreate} style={{ borderRadius: 24, padding: 22, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 20px 50px rgba(0,0,0,0.16)", backdropFilter: "blur(10px)", color: "#fff", display: "grid", gap: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>New Group Details</h2>
              <p style={{ margin: "6px 0 0", opacity: 0.8 }}>Create a private space for your team.</p>
            </div>

            {error && <div style={{ color: "#ff8080" }}>{error}</div>}

            <label style={{ display: "grid", gap: 8 }}>
              <span>Group Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="profile-input"
                style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "#fff" }}
                placeholder="e.g. Design Team"
              />
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Hash size={16} /> Unique ID</span>
              <input
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                className="profile-input"
                style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "#fff", letterSpacing: "0.08em" }}
                placeholder="6-12 characters"
                maxLength={12}
              />
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Users size={16} /> People Limit</span>
              <input
                type="number"
                min="2"
                max="200"
                value={memberLimit}
                onChange={(e) => setMemberLimit(Number(e.target.value))}
                className="profile-input"
                style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "#fff" }}
                placeholder="Maximum members"
              />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button type="button" onClick={() => navigate("/")} className="indian-button indian-button--ghost" style={{ border: "none", padding: "12px 18px" }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="indian-button indian-button--indigo" style={{ border: "none", padding: "12px 18px", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <PartyPopper size={16} /> {saving ? "Creating..." : "Create Group"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
