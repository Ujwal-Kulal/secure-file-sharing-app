import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Download, FileText, Lock, Clock, AlertCircle } from "lucide-react";
import "./DownloadLink.css";

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
      link.setAttribute("download", fileInfo?.originalName || fileInfo?.filename || "file");
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
    <div className="download-container">
      <div className="download-wrapper">
        <div className="download-header">
          <div className="download-header-icon">
            <Download size={32} />
          </div>
          <h2>Download File</h2>
        </div>

        {error && <div className="download-error">{error}</div>}

        {isExpired && (
          <div className="download-status-box expired">
            <AlertCircle size={20} />
            <span>Link Expired</span>
          </div>
        )}

        {fileInfo ? (
          <form onSubmit={handleDownload} className="download-file-card">
            <div className="download-file-info">
              <FileText size={22} />
              <div>
                <strong>File Name:</strong> {fileInfo.originalName || fileInfo.filename}
              </div>
            </div>
            <div className="download-file-size">
              <strong>Size:</strong> {(fileInfo.size / 1024).toFixed(2)} KB
            </div>

            {fileInfo.expiresAt && (
              <div className={`download-expiry-box ${isExpired ? 'expired' : 'active'}`}>
                <div className="download-expiry-header">
                  <Clock size={18} />
                  <span>
                    {isExpired ? 'Expired at:' : 'Expires at:'}
                  </span>
                </div>
                <div className="download-expiry-time">
                  {formatExpiryDate(fileInfo.expiresAt)}
                </div>
                {!isExpired && timeRemaining && (
                  <div className="download-expiry-remaining">
                    Time remaining: {timeRemaining}
                  </div>
                )}
              </div>
            )}

            {showPassword && (
              <div className="download-password-group">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="Enter password to download"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="download-password-input"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={downloading || isExpired}
              className={`download-btn ${isExpired ? 'disabled' : 'active'}`}
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
          <div className="download-loading">Loading file info...</div>
        )}
      </div>
    </div>
  );
}
