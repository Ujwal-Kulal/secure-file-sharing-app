import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FileText, User, Clock, Globe, MonitorSmartphone, Activity, Mail, Eye } from "lucide-react";
import { API_BASE_URL } from "../utils/apiBase";
import "./ActivityLogs.css";

export default function LogsPage() {
  const { fileId } = useParams();
  const [logs, setLogs] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFileOwner, setIsFileOwner] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/logs/${fileId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        setLogs(res.data);
        if (res.data.length > 0) {
          setFileInfo({
            fileName: res.data[0].fileName,
            fileSize: res.data[0].fileSize
          });
          setIsFileOwner(res.data[0].isFileOwner);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 403) {
          setError("Only the file owner can view detailed logs for this file.");
        } else {
          setError(err.response?.data?.message || "Failed to fetch logs");
        }
      }
      setLoading(false);
    }
    fetchLogs();
  }, [fileId]);

  const formatUserInfo = (log) => {
    if (log.isCurrentUser) {
      return <span className="user-badge">You</span>;
    }

    if (log.user === 'Anonymous') {
      return 'Anonymous';
    }
    
    if (log.userDetails) {
      return (
        <div className="user-info">
          <span>{log.user}</span>
          <div className="user-email">
            <Mail size={12} />
            {log.userDetails.email}
          </div>
        </div>
      );
    }
    
    return log.user;
  };

  const getFileOwnerDisplay = () => {
    if (!logs.length || !logs[0].fileOwnerInfo || !isFileOwner) return null;
    
    const owner = logs[0].fileOwnerInfo;
    return (
      <div style={{
        background: 'rgba(255, 152, 0, 0.1)',
        border: '1px solid #ff9800',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#ff9800'
      }}>
        <User size={18} />
        <span>
          <strong>File Owner:</strong> {owner.username} ({owner.email})
        </span>
      </div>
    );
  };

  return (
    <div className="logs-container">
      <div className="logs-wrapper">
        <div className="logs-header">
          <div className="logs-header-icon">
            <Activity size={32} />
          </div>
          <h1>File Activity Logs</h1>
        </div>
        
        {isFileOwner && (
          <div className="logs-info-box permission">
            <Eye size={18} />
            <span>You can see detailed user information as the file owner</span>
          </div>
        )}
        
        {getFileOwnerDisplay() && (
          <div className="logs-info-box owner">
            <User size={18} />
            <span>
              <strong>File Owner:</strong> {logs[0]?.fileOwnerInfo?.username} ({logs[0]?.fileOwnerInfo?.email})
            </span>
          </div>
        )}
        
        {error && <div className="logs-info-box error"><Mail size={18} /> {error}</div>}
        {loading ? (
          <div className="logs-state loading">Loading activity logs...</div>
        ) : logs.length === 0 ? (
          <div className="logs-state">No activity logs found for this file</div>
        ) : (
          <>
            <div className="logs-file-card">
              <div className="logs-file-icon">
                <FileText size={32} />
              </div>
              <div className="logs-file-info">
                <div className="logs-file-info-row">
                  <strong>File Name:</strong>
                  <span>{fileInfo?.fileName}</span>
                </div>
                <div className="logs-file-info-row">
                  <strong>File Size:</strong>
                  <span>{fileInfo?.fileSize} KB</span>
                </div>
              </div>
            </div>
            <div className="logs-table-wrapper">
              <table className="logs-table">
                <colgroup>
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '23%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '33%' }} />
                  <col style={{ width: '18%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th><Activity size={16} /> Action</th>
                    <th><Clock size={16} /> Timestamp</th>
                    <th><Globe size={16} /> IP Address</th>
                    <th><MonitorSmartphone size={16} /> User Agent</th>
                    <th><User size={16} /> User</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={idx}>
                      <td>{log.action}</td>
                      <td title={new Date(log.timestamp).toLocaleString()}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.ipAddress || "N/A"}</td>
                      <td title={log.userAgent}>{log.userAgent}</td>
                      <td>{formatUserInfo(log)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
