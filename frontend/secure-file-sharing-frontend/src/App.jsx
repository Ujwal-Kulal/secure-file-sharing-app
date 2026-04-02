import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import DownloadPage from "./pages/DownloadPage";
import DashboardDownloadPage from "./pages/DashboardDownloadPage";
import LogsPage from "./pages/LogsPage";
import GroupCreatePage from "./pages/GroupCreatePage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="route-stage">
      <div key={location.pathname} className="route-view">
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/groups/create" element={<GroupCreatePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/group/:uniqueId" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/download/:fileId" element={<DownloadPage />} />
          <Route path="/dashboard-download/:fileId" element={<DashboardDownloadPage />} />
          <Route path="/logs/:fileId" element={<LogsPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </Router>
  );
}
