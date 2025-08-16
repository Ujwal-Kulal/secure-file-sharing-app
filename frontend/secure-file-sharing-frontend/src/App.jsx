import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DownloadPage from "./pages/DownloadPage";
import DashboardDownloadPage from "./pages/DashboardDownloadPage";
import LogsPage from "./pages/LogsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/download/:fileId" element={<DownloadPage />} />
        <Route path="/dashboard-download/:fileId" element={<DashboardDownloadPage />} />
        <Route path="/logs/:fileId" element={<LogsPage />} />
      </Routes>
    </Router>
  );
}
