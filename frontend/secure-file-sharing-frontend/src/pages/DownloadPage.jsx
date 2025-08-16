import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Download, FileText, Lock, Clock, AlertCircle } from "lucide-react";
import "./HomePage.css";

export default function DownloadPage() {
  const { fileId } = useParams();
  const [password, setPassword] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  // Fetch file info to check if password is required and expiry status
  useEffect(() => {
    async function fetchFileInfo() {
      try {
        const res = await axios.get(`http://localhost:5000/api/files/${fileId}`);
        setFileInfo(res.data);
        setShowPassword(!!res.data.password);
        
        // Check if link is expired
        if (res.data.expiresAt && new Date() > new Date(res.data.expiresAt)) {
          setIsExpired(true);
        }
      } catch (err) {
        setError("File not found or error fetching file info.");
      }
    }
    fetchFileInfo();
  }, [fileId]);

  // Real-time countdown timer
  useEffect(() => {
    if (!fileInfo?.expiresAt || isExpired) return;

    const timer = setInterval(() => {
      const now = new Date();
      const expiry = new Date(fileInfo.expiresAt);
      
      if (now >= expiry) {
        setIsExpired(true);
        setTimeRemaining("Expired");
        clearInterval(timer);
        return;
      }
      
      setTimeRemaining(getTimeRemaining(fileInfo.expiresAt));
    }, 1000);

    // Initial calculation
    setTimeRemaining(getTimeRemaining(fileInfo.expiresAt));

    return () => clearInterval(timer);
  }, [fileInfo, isExpired]);

  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);
    setError("");
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      // Use regular download endpoint that checks expiry
      const res = await axios.post(
        `http://localhost:5000/api/files/download/${fileId}`,
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

  // Format expiry date for display
  const formatExpiryDate = (expiryDate) => {
    if (!expiryDate) return null;
    const date = new Date(expiryDate);
    
    // Always return the formatted date/time, regardless of expiry status
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  // Calculate time remaining
  const getTimeRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const date = new Date(expiryDate);
    const now = new Date();
    
    if (date <= now) {
      return 'Expired';
    }
    
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}, ${seconds} second${seconds > 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="home-container">
      <div className="home-content" style={{ maxWidth: 500, margin: '48px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', justifyContent: 'center' }}>
          <Download size={32} color="#4f8cff" />
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', margin: 0, textShadow: '2px 2px 8px rgba(0,0,0,0.18)' }}>Download File</h2>
        </div>
        
        {error && <div style={{ color: "#ff4d4f", marginBottom: 16 }}>{error}</div>}
        
        {isExpired && (
          <div style={{ 
            background: 'rgba(255, 77, 79, 0.1)', 
            border: '1px solid #ff4d4f', 
            borderRadius: '8px', 
            padding: '16px', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={20} color="#ff4d4f" />
            <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>Link Expired</span>
          </div>
        )}
        
        {fileInfo ? (
          <form onSubmit={handleDownload} style={{ maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18, background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', color: '#fff' }}>
              <FileText size={22} color="#00bcd4" />
              <span><strong>File Name:</strong> {fileInfo.filename}</span>
            </div>
            <div style={{ color: '#fff', marginBottom: '10px' }}>
              <strong>Size:</strong> {(fileInfo.size / 1024).toFixed(2)} KB
            </div>
            
            {fileInfo.expiresAt && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px', 
                marginBottom: '10px',
                padding: '12px',
                background: isExpired ? 'rgba(255, 77, 79, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                borderRadius: '8px',
                border: `1px solid ${isExpired ? '#ff4d4f' : '#ff9800'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isExpired ? '#ff4d4f' : '#ff9800' }}>
                  <Clock size={18} color={isExpired ? "#ff4d4f" : "#ff9800"} />
                  <span style={{ fontWeight: 'bold' }}>
                    {isExpired ? 'Expired at:' : 'Expires at:'}
                  </span>
                </div>
                <div style={{ 
                  color: isExpired ? '#ff4d4f' : '#fff',
                  fontSize: '0.9rem',
                  marginLeft: '26px'
                }}>
                  {formatExpiryDate(fileInfo.expiresAt)}
                </div>
                {!isExpired && timeRemaining && (
                  <div style={{ 
                    color: '#4caf50',
                    fontSize: '0.85rem',
                    marginLeft: '26px',
                    fontStyle: 'italic'
                  }}>
                    Time remaining: {timeRemaining}
                  </div>
                )}
              </div>
            )}
            
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
              disabled={downloading || isExpired} 
              style={{ 
                background: isExpired ? "#666" : "#4f8cff", 
                color: "#fff", 
                padding: "10px", 
                borderRadius: "8px", 
                border: "none", 
                fontWeight: "bold", 
                cursor: isExpired ? "not-allowed" : "pointer", 
                fontSize: '1.1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px' 
              }}
            >
              {downloading ? (
                <><Download size={18} /> Downloading...</>
              ) : isExpired ? (
                <><AlertCircle size={18} /> Link Expired</>
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
