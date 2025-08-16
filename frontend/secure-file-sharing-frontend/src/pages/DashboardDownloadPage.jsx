import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Download, FileText, Lock } from "lucide-react";
import "./HomePage.css";

export default function DashboardDownloadPage() {
  const { fileId } = useParams();
  const [password, setPassword] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch file info to check if password is required
  React.useEffect(() => {
    async function fetchFileInfo() {
      try {
        const res = await axios.get(`http://localhost:5000/api/files/${fileId}`);
        setFileInfo(res.data);
        setShowPassword(!!res.data.password);
      } catch (err) {
        setError("File not found or error fetching file info.");
      }
    }
    fetchFileInfo();
  }, [fileId]);

  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);
    setError("");
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      // Use direct download endpoint that bypasses expiry but checks password
      const res = await axios.post(
        `http://localhost:5000/api/files/direct-download/${fileId}`,
        showPassword ? { password } : {},
        {
          responseType: "blob",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      // Download the file
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileInfo?.filename || "file");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.response?.data?.message || "Download failed");
    }
    setDownloading(false);
  };

  return (
    <div className="home-container">
      <div className="home-content" style={{ maxWidth: 500, margin: '48px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', justifyContent: 'center' }}>
          <Download size={32} color="#4f8cff" />
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', margin: 0, textShadow: '2px 2px 8px rgba(0,0,0,0.18)' }}>Download File</h2>
        </div>
        
        {error && <div style={{ color: "#ff4d4f", marginBottom: 16 }}>{error}</div>}
        
        {fileInfo ? (
          <form onSubmit={handleDownload} style={{ maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18, background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', color: '#fff' }}>
              <FileText size={22} color="#00bcd4" />
              <span><strong>File Name:</strong> {fileInfo.filename}</span>
            </div>
            <div style={{ color: '#fff', marginBottom: '10px' }}>
              <strong>Size:</strong> {(fileInfo.size / 1024).toFixed(2)} KB
            </div>
            
            {showPassword && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Lock size={18} color="#ff9800" />
                <input
                  type="password"
                  placeholder="Enter password to download"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ padding: "8px", borderRadius: "8px", width: '100%' }}
                  required
                />
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={downloading} 
              style={{ 
                background: "#4f8cff", 
                color: "#fff", 
                padding: "10px", 
                borderRadius: "8px", 
                border: "none", 
                fontWeight: "bold", 
                cursor: "pointer", 
                fontSize: '1.1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px' 
              }}
            >
              {downloading ? (
                <><Download size={18} /> Downloading...</>
              ) : (
                <><Download size={18} /> Download</>
              )}
            </button>
          </form>
        ) : (
          <div style={{ color: '#fff', textAlign: 'center', fontSize: '1.2rem' }}>Loading file info...</div>
        )}
      </div>
    </div>
  );
} 