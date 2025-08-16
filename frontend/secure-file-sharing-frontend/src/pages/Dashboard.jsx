import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Upload,
  LogOut,
  Home as HomeIcon,
  Link as LinkIcon,
  Download,
  Activity
} from "lucide-react";
import "./HomePage.css";

export default function Dashboard() {
  // ...existing code...
  const handleHome = () => {
    navigate("/");
  };
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  const handleDelete = async (fileId) => {
    setDeleteError("");
    setDeleteSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/files/${fileId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
  setDeleteSuccess("File deleted successfully!");
  fetchFiles();
  setTimeout(() => setDeleteSuccess("") , 2000);
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Delete failed");
    }
  };
  const [linkCopied, setLinkCopied] = useState("");
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [expiryUnit, setExpiryUnit] = useState("seconds");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch owned files
      const ownedRes = await axios.get("http://localhost:5000/api/files", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      // Fetch shared files
      const sharedRes = await axios.get("http://localhost:5000/api/files/shared", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      setFiles(ownedRes.data);
      setSharedFiles(sharedRes.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    const formData = new FormData();
    formData.append("file", file);
    if (password) formData.append("password", password);
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
      const res = await axios.post("http://localhost:5000/api/files/upload", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
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

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token on logout
    navigate("/");
  };

  const handleDownload = async (fileId) => {
    // Find the file to check if it has a password (look in both owned and shared files)
    const file = files.find(f => f._id === fileId) || sharedFiles.find(f => f._id === fileId);
    const isOwnedFile = files.find(f => f._id === fileId) !== undefined;
    
    if (file && file.password) {
      // If file has password, navigate to dashboard download page
      navigate(`/dashboard-download/${fileId}`);
    } else {
      // If no password, use appropriate download endpoint
      try {
        const token = localStorage.getItem("token");
        let response;
        
        if (isOwnedFile) {
          // For owned files, use direct download endpoint
          response = await fetch(`http://localhost:5000/api/files/direct-download/${fileId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } else {
          // For shared files, use regular download endpoint
          response = await fetch(`http://localhost:5000/api/files/download/${fileId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          });
        }
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", file?.filename || "file");
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } else {
          console.error('Download failed');
        }
      } catch (error) {
        console.error('Download error:', error);
      }
    }
  };

  const handleSharableLink = (fileId) => {
    // Only allow sharing links for owned files
    const isOwnedFile = files.find(f => f._id === fileId) !== undefined;
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

  // Helper function to format expiry date
  const formatExpiryDate = (expiryDate) => {
    if (!expiryDate) return 'No expiry';
    const date = new Date(expiryDate);
    const now = new Date();
    if (date <= now) {
      return 'Expired';
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Helper function to check if file is expired
  const isFileExpired = (file) => {
    if (!file.expiresAt) return false;
    return new Date() > new Date(file.expiresAt);
  };

  return (
    <div className="home-container">
      <div className="home-content" style={{ position: 'relative' }}>
        {/* Top right icons */}
        <div style={{ position: 'absolute', top: 24, right: 32, display: 'flex', gap: '16px', zIndex: 2 }}>
          <button onClick={handleHome} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} title="Home">
            <HomeIcon size={32} color="#fff" />
          </button>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} title="Logout">
            <LogOut size={32} color="#fff" />
          </button>
        </div>

        <h1 className="home-heading">Dashboard</h1>

        <div style={{
          background: "rgba(255,255,255,0.07)",
          padding: "24px",
          borderRadius: "16px",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          maxWidth: "480px",
          margin: "0 auto"
        }}>
          <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ color: "#fff", fontWeight: "bold" }}>Upload a File</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} required style={{ padding: "8px", borderRadius: "8px" }} />
            <input type="text" placeholder="Security Password (optional)" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }} />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="number" min="1" placeholder="Expiry Time" value={expiresIn} onChange={e => setExpiresIn(e.target.value)} style={{ padding: "8px", borderRadius: "8px", flex: 1 }} />
              <select value={expiryUnit} onChange={e => setExpiryUnit(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }}>
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
            <button type="submit" disabled={uploading} style={{ background: "#4f8cff", color: "#fff", padding: "10px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer" }}>
              {uploading ? "Uploading..." : <><Upload size={18} style={{ marginRight: "8px" }} /> Upload</>}
            </button>
            {uploadError && <div style={{ color: "#ff4d4f" }}>{uploadError}</div>}
            {uploadSuccess && <div style={{ color: "#4caf50" }}>{uploadSuccess}</div>}
          </form>
        </div>

        {files.length === 0 && sharedFiles.length === 0 && (
          <p style={{ color: "white", marginTop: "20px" }}>
            No files uploaded yet.
          </p>
        )}
        
        {/* Owned Files Section */}
        {files.length > 0 && (
          <div style={{
            marginTop: "32px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <h3 style={{ color: "#4caf50", marginBottom: "16px", fontSize: "1.3rem" }}>My Files</h3>
            <div style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              padding: "24px",
              maxWidth: "900px",
              width: "100%"
            }}>
              {linkCopied && <div style={{ color: '#4caf50', marginBottom: '10px', textAlign: 'center' }}>{linkCopied}</div>}
              {deleteError && <div style={{ color: '#ff4d4f', marginBottom: '10px', textAlign: 'center' }}>{deleteError}</div>}
              {deleteSuccess && <div style={{ color: '#4caf50', marginBottom: '10px', textAlign: 'center' }}>{deleteSuccess}</div>}
              
              {/* Header row */}
              <div style={{
                background: "rgba(255,255,255,0.15)",
                padding: "12px 10px",
                borderRadius: "8px",
                marginBottom: "10px",
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr auto",
                alignItems: "center",
                gap: "10px",
                fontWeight: "bold",
                fontSize: "0.9rem"
              }}>
                <span>File Name</span>
                <span>Size</span>
                <span>Type</span>
                <span>Uploaded</span>
                <span>Expires</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              
              {files.map((file) => (
                <div
                  key={file._id}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    padding: "10px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr auto",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>{file.filename}</span>
                  <span>{(file.size / 1024).toFixed(2)} KB</span>
                  <span>{file.type}</span>
                  <span>{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : ''}</span>
                  <span style={{ 
                    color: isFileExpired(file) ? '#ff4d4f' : '#4caf50',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {formatExpiryDate(file.expiresAt)}
                  </span>
                  <span style={{ 
                    color: file.isOwner ? '#4caf50' : '#ff9800',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {file.isOwner ? 'Owned' : 'Shared'}
                  </span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => handleDownload(file._id)} style={{ background: '#4f8cff', color: '#fff', borderRadius: '6px', border: 'none', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      <Download size={16} /> Download
                    </button>
                    <button onClick={() => handleSharableLink(file._id)} style={{ background: '#00bcd4', color: '#fff', borderRadius: '6px', border: 'none', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      <LinkIcon size={16} /> Link
                    </button>
                    <button onClick={() => handleActivityLogs(file._id)} style={{ background: '#ff9800', color: '#fff', borderRadius: '6px', border: 'none', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      <Activity size={16} /> Logs
                    </button>
                    {file.isOwner && (
                      <button onClick={() => handleDelete(file._id)} style={{ background: '#f44336', color: '#fff', borderRadius: '6px', border: 'none', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Shared Files Section */}
        {sharedFiles.length > 0 && (
          <div style={{
            marginTop: "32px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <h3 style={{ color: "#ff9800", marginBottom: "16px", fontSize: "1.3rem" }}>Shared With Me</h3>
            <div style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              padding: "24px",
              maxWidth: "900px",
              width: "100%"
            }}>
              {/* Header row */}
              <div style={{
                background: "rgba(255,255,255,0.15)",
                padding: "12px 10px",
                borderRadius: "8px",
                marginBottom: "10px",
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr auto",
                alignItems: "center",
                gap: "10px",
                fontWeight: "bold",
                fontSize: "0.9rem"
              }}>
                <span>File Name</span>
                <span>Size</span>
                <span>Type</span>
                <span>Uploaded</span>
                <span>Expires</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              
              {sharedFiles.map((file) => (
                <div
                  key={file._id}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    padding: "10px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr auto",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>{file.filename}</span>
                  <span>{(file.size / 1024).toFixed(2)} KB</span>
                  <span>{file.type}</span>
                  <span>{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : ''}</span>
                  <span style={{ 
                    color: isFileExpired(file) ? '#ff4d4f' : '#4caf50',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {formatExpiryDate(file.expiresAt)}
                  </span>
                  <span style={{ 
                    color: '#ff9800',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    Shared
                  </span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => handleDownload(file._id)} style={{ background: '#4f8cff', color: '#fff', borderRadius: '6px', border: 'none', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      <Download size={16} /> Download
                    </button>
                    <button onClick={() => handleActivityLogs(file._id)} style={{ background: '#ff9800', color: '#fff', borderRadius: '6px', border: 'none', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      <Activity size={16} /> Logs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
