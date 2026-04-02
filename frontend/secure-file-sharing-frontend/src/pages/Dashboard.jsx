import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import {
  Upload,
  LogOut,
  Home as HomeIcon,
  Link as LinkIcon,
  Download,
  Activity,
  MoreHorizontal,
  FileText,
  Plus,
  Users,
  Shield,
  Trash2,
  UserCircle2,
  Sparkles,
  ChevronRight,
  Search,
} from "lucide-react";
import "./HomePage.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { uniqueId: groupUniqueId } = useParams();
  const { logout, user } = useAuth();
  const fileInputRef = useRef(null);

  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [linkCopied, setLinkCopied] = useState("");

  const [files, setFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [expiryUnit, setExpiryUnit] = useState("seconds");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [groupInfo, setGroupInfo] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [sharedSearchQuery, setSharedSearchQuery] = useState("");
  const [demoteTargetMember, setDemoteTargetMember] = useState(null);
  const [demoteToast, setDemoteToast] = useState({ type: "", message: "" });

  const fetchFiles = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (groupUniqueId) {
        const groupResponse = await axios.get(`http://localhost:5000/api/groups/${groupUniqueId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setGroupInfo(groupResponse.data.group);

        const [groupOwnedRes, groupSharedRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/files?groupId=${groupUniqueId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/api/files/shared?groupId=${groupUniqueId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setFiles(groupOwnedRes.data);
        setSharedFiles(groupSharedRes.data);
        return;
      }

      const ownedRes = await axios.get("http://localhost:5000/api/files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGroupInfo(null);
      setShowMembers(false);

      const sharedRes = await axios.get("http://localhost:5000/api/files/shared", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFiles(ownedRes.data);
      setSharedFiles(sharedRes.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, [groupUniqueId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileSelection = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDropzoneDrop = (event) => {
    event.preventDefault();
    setIsDraggingFile(false);
    const droppedFile = event.dataTransfer.files?.[0];
    handleFileSelection(droppedFile);
  };

  useEffect(() => {
    const closeMenu = () => setOpenActionMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    if (!demoteToast.message) return;
    const timer = setTimeout(() => {
      setDemoteToast({ type: "", message: "" });
    }, 2600);
    return () => clearTimeout(timer);
  }, [demoteToast]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    const formData = new FormData();
    formData.append("file", file);
    if (password) formData.append("password", password);
    if (groupUniqueId) formData.append("groupId", groupUniqueId);

    let expirySeconds = "";
    if (expiresIn) {
      const num = Number(expiresIn);
      if (expiryUnit === "minutes") expirySeconds = num * 60;
      else if (expiryUnit === "hours") expirySeconds = num * 3600;
      else expirySeconds = num;
      formData.append("expiresIn", expirySeconds);
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadSuccess("File uploaded successfully!");
      setFile(null);
      setPassword("");
      setExpiresIn("");
      setExpiryUnit("seconds");
      fetchFiles();
    } catch (error) {
      setUploadError(error.response?.data?.message || "Upload failed");
    }

    setUploading(false);
  };

  const handleDelete = async (fileId) => {
    setDeleteError("");
    setDeleteSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeleteSuccess("File deleted successfully!");
      fetchFiles();
      setTimeout(() => setDeleteSuccess(""), 2000);
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Delete failed");
    }
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDownload = async (fileId) => {
    const selectedFile = files.find((f) => f._id === fileId) || sharedFiles.find((f) => f._id === fileId);
    const isOwnedFile = files.find((f) => f._id === fileId) !== undefined;

    if (selectedFile && selectedFile.password) {
      navigate(`/dashboard-download/${fileId}`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let response;

      if (isOwnedFile) {
        response = await fetch(`http://localhost:5000/api/files/direct-download/${fileId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await fetch(`http://localhost:5000/api/files/download/${fileId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", selectedFile?.filename || "file");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleSharableLink = (fileId) => {
    const isOwnedFile = files.find((f) => f._id === fileId) !== undefined;
    if (!isOwnedFile) {
      alert("You can only share links for files you own.");
      return;
    }

    const link = `${window.location.origin}/download/${fileId}`;
    navigator.clipboard.writeText(link);
    setLinkCopied("Sharable link copied to clipboard!");
    setTimeout(() => setLinkCopied(""), 2000);
  };

  const handleActivityLogs = (fileId) => {
    navigate(`/logs/${fileId}`);
  };

  const handlePromoteToOwner = async (memberId) => {
    if (!groupUniqueId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/groups/${groupUniqueId}/owners/${memberId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFiles();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to promote member");
    }
  };

  const handleDemoteOwner = async (memberId) => {
    if (!groupUniqueId) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/groups/${groupUniqueId}/owners/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDemoteToast({ type: "success", message: "Owner role removed successfully." });
      setDemoteTargetMember(null);
      fetchFiles();
    } catch (error) {
      setDemoteToast({
        type: "error",
        message: error.response?.data?.message || "Failed to demote owner",
      });
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!groupUniqueId) return;
    if (!window.confirm("Remove this member from the group?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/groups/${groupUniqueId}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFiles();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove member");
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupUniqueId) return;
    if (!window.confirm("Delete this group and all its files? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/groups/${groupUniqueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete group");
    }
  };

  const formatExpiryDate = (expiryDate) => {
    if (!expiryDate) return "No expiry";
    const date = new Date(expiryDate);
    const now = new Date();
    if (date <= now) return "Expired";
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const isFileExpired = (fileToCheck) => {
    if (!fileToCheck.expiresAt) return false;
    return new Date() > new Date(fileToCheck.expiresAt);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    const mb = kb / 1024;
    if (mb < 1024) {
      return `${mb.toFixed(2)} MB`;
    }
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };
  const getFileTypeLabel = (fileToCheck) => {
    if (fileToCheck?.type && fileToCheck.type !== "unknown") {
      return fileToCheck.type.toUpperCase();
    }

    const name = fileToCheck?.originalName || fileToCheck?.filename || "";
    const parts = name.split(".");
    if (parts.length > 1) {
      return parts.pop().toUpperCase();
    }

    return "UNKNOWN";
  };

  const normalizedSharedSearch = sharedSearchQuery.trim().toLowerCase();
  const filteredSharedFiles = sharedFiles.filter((item) => {
    if (!normalizedSharedSearch) return true;

    const haystack = [
      item.filename,
      item.originalName,
      item.type,
      item.uploadedBy?.username,
      item.uploadedBy?.email,
      getFileTypeLabel(item),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSharedSearch);
  });

  return (
    <div className="home-container">
      <div className="home-content dashboard-shell" style={{ position: "relative", maxHeight: "none", overflow: "visible" }}>
        <div className="dashboard-blob dashboard-blob--amber" aria-hidden="true" />
        <div className="dashboard-blob dashboard-blob--blue" aria-hidden="true" />
        <div className="dashboard-blob dashboard-blob--green" aria-hidden="true" />
        <div style={{ position: "absolute", top: 24, right: 32, display: "flex", alignItems: "center", gap: "12px", zIndex: 2 }}>
          {user && (
            <button
              className="indian-button indian-button--glass"
              type="button"
              onClick={() => navigate("/profile", { state: { from: "dashboard" } })}
              style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
                padding: "8px 12px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, rgba(79,140,255,0.28), rgba(0,188,212,0.20))",
                border: "1px solid rgba(255,255,255,0.16)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                backdropFilter: "blur(10px)",
                color: "#fff",
                maxWidth: "260px",
                cursor: "pointer",
                transition: "transform 180ms ease, box-shadow 180ms ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px) scale(1.01)";
                e.currentTarget.style.boxShadow = "0 14px 34px rgba(0,0,0,0.26)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.18)";
              }}
            >
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4f8cff, #00bcd4)",
                  padding: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.username || "Profile"}
                      style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", background: "#0e1526" }}
                    />
                  ) : (
                    <UserCircle2 size={32} color="#fff" />
                  )}
                </div>
                <div style={{
                  position: "absolute",
                  right: -2,
                  bottom: -2,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#4caf50",
                  border: "2px solid #0f172a"
                }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0, textAlign: "left" }}>
                <span style={{ fontSize: "0.68rem", opacity: 0.78, display: "flex", alignItems: "center", gap: 4 }}>
                  <Sparkles size={11} /> Profile
                </span>
                <span style={{ fontWeight: 700, fontSize: "0.92rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                  {user.username || user.email}
                </span>
              </div>
              <ChevronRight size={15} color="rgba(255,255,255,0.8)" />
            </button>
          )}
          <button className="indian-button indian-button--ghost" onClick={handleHome} style={{ background: "transparent", border: "none", cursor: "pointer" }} title="Home">
            <HomeIcon size={32} color="#fff" />
          </button>
          <button className="indian-button indian-button--crimson" onClick={handleLogout} style={{ background: "transparent", border: "none", cursor: "pointer" }} title="Logout">
            <LogOut size={32} color="#fff" />
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <h1 className="home-heading" style={{ marginBottom: 8 }}>
            {groupUniqueId ? groupInfo?.name || "Group" : "Dashboard"}
          </h1>
          {groupInfo && (
            <>
              <div style={{ color: "rgba(255,255,255,0.86)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                <span>ID {groupInfo.uniqueId}</span>
                <span>•</span>
                <span>{groupInfo.memberCount}/{groupInfo.memberLimit} members</span>
                {groupInfo.isOwner && (
                  <span style={{ padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(126,231,255,0.35)", background: "rgba(126,231,255,0.14)", color: "#cdefff", fontWeight: 700, fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Shield size={12} /> Owner
                  </span>
                )}
                <button
                  type="button"
                  className="indian-button indian-button--glass"
                  onClick={() => setShowMembers((current) => !current)}
                  style={{ border: "1px solid rgba(255,255,255,0.2)", padding: "6px 12px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Users size={14} /> Members
                </button>
                {groupInfo.isOwner && (
                  <button
                    type="button"
                    className="indian-button indian-button--crimson"
                    onClick={handleDeleteGroup}
                    style={{ border: "1px solid rgba(255,255,255,0.22)", padding: "6px 12px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <Trash2 size={14} /> Delete Group
                  </button>
                )}
              </div>

              {showMembers && (
                <div style={{ marginTop: 12, maxWidth: 560, marginInline: "auto", textAlign: "left", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 14, padding: 12 }}>
                  <div style={{ color: "#fff", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <Users size={15} /> Group Members
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {(groupInfo.members || []).map((member) => (
                      <div key={member.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", padding: "8px 10px", borderRadius: 10, background: "rgba(15, 30, 58, 0.64)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                          <span style={{ color: "#fff", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                            {member.id === (user?._id || user?.id) ? "Me" : (member.username || "Member")}
                            {member.isOwner && (
                              <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 999, background: "rgba(126,231,255,0.18)", border: "1px solid rgba(126,231,255,0.32)", color: "#cdefff" }}>
                                OWNER
                              </span>
                            )}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.76)", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {member.email}
                          </span>
                        </div>
                        {groupInfo.isOwner && member.id !== (user?._id || user?.id) && (
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {!member.isOwner && (
                              <button
                                type="button"
                                onClick={() => handlePromoteToOwner(member.id)}
                                className="indian-button indian-button--glass indian-button--menu-item"
                                style={{ border: "none", padding: "6px 10px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                              >
                                <Shield size={13} /> Make Owner
                              </button>
                            )}
                            {member.isOwner && (
                              <button
                                type="button"
                                onClick={() => setDemoteTargetMember(member)}
                                className="indian-button indian-button--saffron indian-button--menu-item"
                                style={{ border: "none", padding: "6px 10px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                              >
                                Demote Owner
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id)}
                              className="indian-button indian-button--crimson indian-button--menu-item"
                              style={{ border: "none", padding: "6px 10px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div
          className="upload-studio-card"
          style={{
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(145deg, rgba(17, 29, 56, 0.92), rgba(34, 44, 82, 0.88))",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "20px",
            borderRadius: "22px",
            marginBottom: "24px",
            boxShadow: "0 18px 42px rgba(0,0,0,0.24)",
            maxWidth: "460px",
            margin: "0 auto",
          }}
        >
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at top right, rgba(255,183,77,0.16), transparent 32%), radial-gradient(circle at bottom left, rgba(79,140,255,0.18), transparent 30%)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#fff", fontSize: "1.35rem", fontWeight: 800 }}>Upload a File</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(255, 138, 61, 0.25), rgba(79, 140, 255, 0.25))", border: "1px solid rgba(255,255,255,0.12)" }}>
                <FileText size={20} color="#fff" />
              </div>
            </div>

            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", maxWidth: "340px", margin: "0 auto" }}>
            <input
              ref={fileInputRef}
              id="upload-file-input"
              type="file"
              onChange={(e) => handleFileSelection(e.target.files[0])}
              required
              className="upload-hidden-input"
            />
            <div
              className={`upload-dropzone ${isDraggingFile ? "upload-dropzone--active" : ""}`}
              onClick={handleDropzoneClick}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDropzoneDrop}
              role="button"
              tabIndex={0}
            >
              <div className="upload-dropzone-icon">
                <Plus size={18} />
                <FileText size={18} />
              </div>
              <div className="upload-dropzone-text">
                <span className="upload-dropzone-title">Drop your file here</span>
                <span className="upload-dropzone-subtitle">or click to choose from device</span>
              </div>
              <div className="upload-dropzone-action">{file ? "Replace" : "Browse"}</div>
            </div>
            <div className="upload-file-name">
              {file ? (
                <span className="upload-file-preview">Selected: {file.name}</span>
              ) : (
                "No file selected"
              )}
            </div>
            <input
              type="text"
              placeholder="Security Password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="upload-field"
            />
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <input
                type="number"
                min="1"
                placeholder="Expiry Time"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="upload-field upload-field-short"
              />
              <select value={expiryUnit} onChange={(e) => setExpiryUnit(e.target.value)} className="upload-field upload-field-select upload-field-short">
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
            <button type="submit" className="indian-button indian-button--indigo upload-submit" disabled={uploading} style={{ padding: "11px", border: "none", fontWeight: "bold", cursor: "pointer", width: "100%", maxWidth: "220px", alignSelf: "center" }}>
              {uploading ? "Uploading..." : <><Upload size={18} style={{ marginRight: "8px" }} /> Upload</>}
            </button>
            {uploadError && <div style={{ color: "#ffb3b3", fontWeight: 600 }}>{uploadError}</div>}
            {uploadSuccess && <div style={{ color: "#b8ffce", fontWeight: 600 }}>{uploadSuccess}</div>}
          </form>
          </div>
        </div>

        <div style={{ marginTop: "32px", color: "white", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 style={{ color: "#4caf50", marginBottom: "16px", fontSize: "1.3rem" }}>My Files</h3>
          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              padding: "20px",
              width: "100%",
              overflow: "visible",
            }}
          >
            {linkCopied && <div style={{ color: "#4caf50", marginBottom: "10px", textAlign: "center" }}>{linkCopied}</div>}
            {deleteError && <div style={{ color: "#ff4d4f", marginBottom: "10px", textAlign: "center" }}>{deleteError}</div>}
            {deleteSuccess && <div style={{ color: "#4caf50", marginBottom: "10px", textAlign: "center" }}>{deleteSuccess}</div>}

            {files.length === 0 ? (
              <p style={{ color: "white", textAlign: "center" }}>No files uploaded by you yet.</p>
            ) : (
              <>
                {files.map((item, index) => (
                  <div
                    key={item._id}
                    className="file-stack-card file-stack-card--owned"
                    style={{
                      position: "relative",
                      overflow: "visible",
                      zIndex: openActionMenuId === item._id ? 120 : 1,
                      background: "linear-gradient(145deg, rgba(255,255,255,0.11), rgba(255,255,255,0.06))",
                      padding: "14px",
                      borderRadius: "18px",
                      marginBottom: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
                      animationDelay: `${index * 70}ms`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", marginBottom: "12px" }}>
                      <div style={{ minWidth: 0, textAlign: "left", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                          <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "280px" }}>{item.filename}</span>
                          <span style={{ padding: "5px 10px", borderRadius: "999px", background: "rgba(79,140,255,0.18)", color: "#d8e6ff", fontSize: "0.72rem", fontWeight: 700, border: "1px solid rgba(79,140,255,0.24)" }}>{getFileTypeLabel(item)}</span>
                          <span style={{ padding: "5px 10px", borderRadius: "999px", background: item.isOwner ? "rgba(34,197,94,0.18)" : "rgba(255,152,0,0.18)", color: item.isOwner ? "#c8ffd9" : "#ffe0b2", fontSize: "0.72rem", fontWeight: 700, border: "1px solid rgba(255,255,255,0.12)" }}>{item.isOwner ? "Owned" : "Shared"}</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", color: "rgba(255,255,255,0.86)", fontSize: "0.82rem" }}>
                          <span>{formatFileSize(item.size)}</span>
                          <span>•</span>
                          <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
                          <span>•</span>
                          <span style={{ color: isFileExpired(item) ? "#ffb3b3" : "#b8ffce", fontWeight: 700 }}>{formatExpiryDate(item.expiresAt)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.66)", marginBottom: "2px" }}>Downloads</div>
                          <div style={{ fontWeight: 800, color: "#00bcd4", fontSize: "1rem" }}>{item.downloadCount ?? 0}</div>
                        </div>
                        <div className="action-menu-wrapper" style={{ position: "relative", display: "flex", justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="action-dot-trigger indian-button indian-button--glass indian-button--menu-trigger"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenuId((prev) => (prev === item._id ? null : item._id));
                        }}
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "10px",
                          border: "1px solid rgba(255,255,255,0.22)",
                          background: "linear-gradient(135deg, rgba(79,140,255,0.35), rgba(0,188,212,0.25))",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
                          backdropFilter: "blur(8px)",
                          transform: openActionMenuId === item._id ? "scale(1.08)" : "scale(1)",
                          transition: "transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease",
                        }}
                        title="More actions"
                      >
                        <MoreHorizontal
                          size={18}
                          style={{
                            transform: openActionMenuId === item._id ? "rotate(90deg)" : "rotate(0deg)",
                            transition: "transform 220ms ease",
                          }}
                        />
                      </button>

                      {openActionMenuId === item._id && (
                        <div
                          className="action-dropdown-menu"
                          style={{
                            position: "absolute",
                            top: "40px",
                            right: "0",
                            minWidth: "170px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            padding: "10px",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "linear-gradient(155deg, #1a2d52, #0d1a34)",
                            boxShadow: "0 16px 36px rgba(0,0,0,0.35)",
                            zIndex: 220,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              handleDownload(item._id);
                              setOpenActionMenuId(null);
                            }}
                            className="action-dropdown-item indian-button indian-button--indigo indian-button--menu-item"
                            style={{ border: "none", padding: "7px 10px", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <Download size={14} /> Download
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleSharableLink(item._id);
                              setOpenActionMenuId(null);
                            }}
                            className="action-dropdown-item indian-button indian-button--glass indian-button--menu-item"
                            style={{ border: "none", padding: "7px 10px", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <LinkIcon size={14} /> Link
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleActivityLogs(item._id);
                              setOpenActionMenuId(null);
                            }}
                            className="action-dropdown-item indian-button indian-button--saffron indian-button--menu-item"
                            style={{ border: "none", padding: "7px 10px", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <Activity size={14} /> Logs
                          </button>
                          {item.isOwner && (
                            <button
                              type="button"
                              onClick={() => {
                                handleDelete(item._id);
                                setOpenActionMenuId(null);
                              }}
                              className="action-dropdown-item indian-button indian-button--crimson indian-button--menu-item"
                              style={{ border: "none", padding: "7px 10px", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem" }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: "32px", color: "white", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 style={{ color: "#ff9800", marginBottom: "16px", fontSize: "1.3rem" }}>Shared With Me</h3>
          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              padding: "20px",
              width: "100%",
              overflow: "visible",
            }}
          >
            <div className="shared-search-shell">
              <div className="shared-search-pill">
                <Search size={17} className="shared-search-icon" />
                <input
                  type="text"
                  className="shared-search-input"
                  placeholder={groupUniqueId ? "Search private group files by name or type" : "Search public shared files by name, type, or uploader"}
                  value={sharedSearchQuery}
                  onChange={(event) => setSharedSearchQuery(event.target.value)}
                />
              </div>
              <div className="shared-search-meta">
                Showing {filteredSharedFiles.length} of {sharedFiles.length}
              </div>
            </div>

            {sharedFiles.length === 0 ? (
              <p style={{ color: "white", textAlign: "center" }}>No files shared with you yet.</p>
            ) : filteredSharedFiles.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.85)", textAlign: "center" }}>
                No shared files match this search.
              </p>
            ) : (
              <>
                {filteredSharedFiles.map((item, index) => (
                  <div
                    key={item._id}
                    className="file-stack-card file-stack-card--shared"
                    style={{
                      position: "relative",
                      overflow: "visible",
                      background: "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
                      padding: "14px",
                      borderRadius: "18px",
                      marginBottom: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
                      animationDelay: `${index * 70}ms`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
                      <div style={{ minWidth: 0, textAlign: "left", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                          <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "280px" }}>{item.filename}</span>
                          <span style={{ padding: "5px 10px", borderRadius: "999px", background: "rgba(79,140,255,0.18)", color: "#d8e6ff", fontSize: "0.72rem", fontWeight: 700, border: "1px solid rgba(79,140,255,0.24)" }}>{getFileTypeLabel(item)}</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", color: "rgba(255,255,255,0.86)", fontSize: "0.82rem" }}>
                          <span>{formatFileSize(item.size)}</span>
                          <span>•</span>
                          <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
                          <span>•</span>
                          <span style={{ color: isFileExpired(item) ? "#ffb3b3" : "#b8ffce", fontWeight: 700 }}>{formatExpiryDate(item.expiresAt)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <button onClick={() => handleDownload(item._id)} className="indian-button indian-button--indigo indian-button--menu-item" style={{ border: "none", padding: "9px 12px", fontWeight: "bold", cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", justifySelf: "center" }} title="Download">
                          <Download size={14} /> Download
                        </button>
                        {groupUniqueId && groupInfo?.isOwner && (
                          <>
                            <button onClick={() => handleActivityLogs(item._id)} className="indian-button indian-button--saffron indian-button--menu-item" style={{ border: "none", padding: "9px 12px", fontWeight: "bold", cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }} title="Logs">
                              <Activity size={14} /> Logs
                            </button>
                            <button onClick={() => handleDelete(item._id)} className="indian-button indian-button--crimson indian-button--menu-item" style={{ border: "none", padding: "9px 12px", fontWeight: "bold", cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }} title="Delete">
                              <Trash2 size={14} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {demoteToast.message && (
          <div className={`owner-toast owner-toast--${demoteToast.type || "info"}`}>
            {demoteToast.message}
          </div>
        )}

        {demoteTargetMember && (
          <div className="owner-modal-backdrop" role="dialog" aria-modal="true">
            <div className="owner-modal-card">
              <h4>Demote Owner</h4>
              <p>
                Demote <strong>{demoteTargetMember.username || demoteTargetMember.email || "this member"}</strong> to a normal member?
              </p>
              <div className="owner-modal-actions">
                <button
                  type="button"
                  className="indian-button indian-button--glass"
                  style={{ border: "none", padding: "8px 12px" }}
                  onClick={() => setDemoteTargetMember(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="indian-button indian-button--saffron"
                  style={{ border: "none", padding: "8px 12px" }}
                  onClick={() => handleDemoteOwner(demoteTargetMember.id)}
                >
                  Confirm Demote
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
