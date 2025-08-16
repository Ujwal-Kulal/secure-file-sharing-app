import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FileText, User, Clock, Globe, MonitorSmartphone, Activity, Mail, Eye } from "lucide-react";
import "./HomePage.css";

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
        const res = await axios.get(`http://localhost:5000/api/logs/${fileId}`, {
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
        setError(err.response?.data?.message || "Failed to fetch logs");
      }
      setLoading(false);
    }
    fetchLogs();
  }, [fileId]);

  const formatUserInfo = (log) => {
    if (log.user === 'Anonymous') {
      return 'Anonymous';
    }
    
    if (log.userDetails) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span>{log.user}</span>
          <div style={{ fontSize: '0.8rem', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
    <div className="home-container">
      <div className="home-content" style={{ maxWidth: 900, margin: '48px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', justifyContent: 'center' }}>
          <Activity size={32} color="#4f8cff" />
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', margin: 0, textShadow: '2px 2px 8px rgba(0,0,0,0.18)' }}>File Activity Logs</h2>
        </div>
        
        {isFileOwner && (
          <div style={{
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#4caf50'
          }}>
            <Eye size={18} />
            <span>You can see detailed user information as the file owner</span>
          </div>
        )}
        
        {getFileOwnerDisplay()}
        
        {error && <div style={{ color: "#ff4d4f", marginBottom: 16 }}>{error}</div>}
        {loading ? (
          <div style={{ color: '#fff', textAlign: 'center', fontSize: '1.2rem' }}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ color: '#fff', textAlign: 'center', fontSize: '1.2rem' }}>No logs found for this file.</div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '18px 24px',
              marginBottom: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
            }}>
              <FileText size={28} color="#00bcd4" />
              <div style={{ color: '#fff', fontSize: '1.1rem' }}>
                <strong>File Name:</strong> {fileInfo?.fileName}<br />
                <strong>File Size:</strong> {fileInfo?.fileSize} KB
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: "100%", background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: "#4f8cff", fontSize: '1.08rem', background: 'rgba(255,255,255,0.13)' }}>
                    <th style={{ padding: '12px 8px', borderRadius: '8px 0 0 8px' }}><Activity size={18} style={{ marginRight: 6 }} /> Action</th>
                    <th style={{ padding: '12px 8px' }}><Clock size={18} style={{ marginRight: 6 }} /> Timestamp</th>
                    <th style={{ padding: '12px 8px' }}><Globe size={18} style={{ marginRight: 6 }} /> IP Address</th>
                    <th style={{ padding: '12px 8px' }}><MonitorSmartphone size={18} style={{ marginRight: 6 }} /> User Agent</th>
                    <th style={{ padding: '12px 8px', borderRadius: '0 8px 8px 0' }}><User size={18} style={{ marginRight: 6 }} /> User</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={idx} style={{ color: '#fff', background: idx % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.09)', fontSize: '1rem' }}>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>{log.action}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>{log.ipAddress}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>{log.userAgent}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>{formatUserInfo(log)}</td>
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
