import React, { useState, useEffect, useCallback } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Shield,
  ShieldOff,
  RefreshCw,
  Search,
  Users,
  Clock,
  Wifi,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from "lucide-react";
import { httpGetService, httpDeleteService } from "../../../httpHandler";
import "./UserSessions.css";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

const UserSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const currentSessionId = localStorage.getItem("sessionId");

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint =
        statusFilter === "active" ? "sessions" : "sessions/all";
      const response = await httpGetService(endpoint);
      if (response && response.success) {
        let filteredSessions = response.sessions;
        if (statusFilter === "inactive") {
          filteredSessions = response.sessions.filter((s) => !s.isActive);
        }
        setSessions(filteredSessions);
      } else {
        setError("Failed to fetch sessions");
      }
    } catch (err) {
      setError("Error fetching sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleRevoke = async (sessionId, email, deviceInfo) => {
    if (
      !window.confirm(
        `Are you sure you want to revoke the session for ${email} on ${deviceInfo}? This will log them out from that device.`
      )
    ) {
      return;
    }

    setRevoking(sessionId);
    setError("");
    try {
      const response = await httpDeleteService(`sessions/${sessionId}`);
      if (response && response.success) {
        setSuccessMessage(
          `Session for ${email} on ${deviceInfo} has been revoked successfully.`
        );
        fetchSessions();
      } else {
        setError(response?.message || "Failed to revoke session");
      }
    } catch (err) {
      setError("Error revoking session. Please try again.");
    } finally {
      setRevoking(null);
    }
  };

  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo) return <Monitor size={20} />;
    const info = deviceInfo.toLowerCase();
    if (info.includes("mobile") || info.includes("android") || info.includes("iphone")) {
      return <Smartphone size={20} />;
    }
    if (info.includes("tablet") || info.includes("ipad")) {
      return <Tablet size={20} />;
    }
    return <Monitor size={20} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Filter sessions by search term
  const filteredSessions = sessions.filter((session) => {
    const term = searchTerm.toLowerCase();
    return (
      session.email?.toLowerCase().includes(term) ||
      session.ipAddress?.toLowerCase().includes(term) ||
      session.browser?.toLowerCase().includes(term) ||
      session.os?.toLowerCase().includes(term) ||
      session.deviceInfo?.toLowerCase().includes(term)
    );
  });

  // Group sessions by user
  const groupedSessions = filteredSessions.reduce((acc, session) => {
    const email = session.email;
    if (!acc[email]) {
      acc[email] = [];
    }
    acc[email].push(session);
    return acc;
  }, {});

  // Pagination logic applied to user groups
  const userGroups = Object.entries(groupedSessions);
  const totalGroups = userGroups.length;
  const totalPages = Math.max(1, Math.ceil(totalGroups / itemsPerPage));

  // Ensure currentPage is within bounds
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGroups = userGroups.slice(startIndex, endIndex);

  const totalActive = sessions.filter((s) => s.isActive).length;
  const uniqueUsers = [...new Set(sessions.map((s) => s.email))].length;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="user-sessions-container">
      {/* Page Header */}
      <div className="sessions-header">
        <div className="sessions-header-left">
          <div className="sessions-header-icon">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="sessions-title">User Sessions</h1>
            <p className="sessions-subtitle">
              Monitor and manage active sessions across all devices
            </p>
          </div>
        </div>
        <button
          className="sessions-refresh-btn"
          onClick={fetchSessions}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spinning" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="sessions-stats-grid">
        <div className="sessions-stat-card">
          <div className="stat-card-icon stat-icon-blue">
            <Activity size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{totalActive}</span>
            <span className="stat-card-label">Active Sessions</span>
          </div>
        </div>
        <div className="sessions-stat-card">
          <div className="stat-card-icon stat-icon-green">
            <Users size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{uniqueUsers}</span>
            <span className="stat-card-label">Unique Users</span>
          </div>
        </div>
        <div className="sessions-stat-card">
          <div className="stat-card-icon stat-icon-amber">
            <Globe size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{sessions.length}</span>
            <span className="stat-card-label">Total Sessions</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="sessions-alert sessions-alert-success">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="sessions-alert sessions-alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="sessions-controls">
        <div className="sessions-search-wrapper">
          <Search size={16} className="sessions-search-icon" />
          <input
            type="text"
            className="sessions-search-input"
            placeholder="Search by email, IP, browser, OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sessions-filter-wrapper">
          <button
            className="sessions-filter-btn"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Filter size={16} />
            {statusFilter === "active"
              ? "Active Only"
              : statusFilter === "all"
              ? "All Sessions"
              : "Inactive Only"}
            <ChevronDown
              size={14}
              className={showFilterDropdown ? "rotated" : ""}
            />
          </button>
          {showFilterDropdown && (
            <div className="sessions-filter-dropdown">
              <button
                className={statusFilter === "active" ? "active" : ""}
                onClick={() => {
                  setStatusFilter("active");
                  setShowFilterDropdown(false);
                }}
              >
                <CheckCircle size={14} />
                Active Only
              </button>
              <button
                className={statusFilter === "all" ? "active" : ""}
                onClick={() => {
                  setStatusFilter("all");
                  setShowFilterDropdown(false);
                }}
              >
                <Globe size={14} />
                All Sessions
              </button>
              <button
                className={statusFilter === "inactive" ? "active" : ""}
                onClick={() => {
                  setStatusFilter("inactive");
                  setShowFilterDropdown(false);
                }}
              >
                <XCircle size={14} />
                Inactive Only
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sessions Content */}
      {loading ? (
        <div className="sessions-loading">
          <div className="sessions-spinner"></div>
          <p>Loading sessions...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="sessions-empty">
          <Shield size={48} />
          <h3>No Sessions Found</h3>
          <p>
            {searchTerm
              ? "No sessions match your search criteria."
              : "No active sessions to display."}
          </p>
        </div>
      ) : (
        <>
          <div className="sessions-list">
            {paginatedGroups.map(([email, userSessions]) => (
              <div key={email} className="sessions-user-group">
                <div className="sessions-user-header">
                  <div className="sessions-user-avatar">
                    {email.charAt(0).toUpperCase()}
                  </div>
                  <div className="sessions-user-info">
                    <span className="sessions-user-email">{email}</span>
                    <span className="sessions-user-count">
                      {userSessions.length} active session
                      {userSessions.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span
                    className={`sessions-role-badge ${
                      userSessions[0]?.role === "admin"
                        ? "role-admin"
                        : "role-user"
                    }`}
                  >
                    {userSessions[0]?.role || "user"}
                  </span>
                </div>

                <div className="sessions-cards">
                  {userSessions.map((session) => (
                    <div
                      key={session._id}
                      className={`session-card ${
                        !session.isActive ? "session-inactive" : ""
                      } ${
                        session._id === currentSessionId
                          ? "session-current"
                          : ""
                      }`}
                    >
                      <div className="session-card-header">
                        <div className="session-device-info">
                          <div
                            className={`session-device-icon ${
                              session.isActive
                                ? "device-active"
                                : "device-inactive"
                            }`}
                          >
                            {getDeviceIcon(session.deviceInfo)}
                          </div>
                          <div>
                            <div className="session-browser">
                              {session.browser || "Unknown Browser"}
                            </div>
                            <div className="session-os">
                              {session.os || "Unknown OS"}
                            </div>
                          </div>
                        </div>
                        <div className="session-status-wrapper">
                          {session._id === currentSessionId && (
                            <span className="session-current-badge">
                              Current
                            </span>
                          )}
                          <span
                            className={`session-status-badge ${
                              session.isActive
                                ? "status-active"
                                : "status-inactive"
                            }`}
                          >
                            <span className="status-dot"></span>
                            {session.isActive ? "Active" : "Revoked"}
                          </span>
                        </div>
                      </div>

                      <div className="session-card-details">
                        <div className="session-detail">
                          <Wifi size={14} />
                          <span className="detail-label">IP Address</span>
                          <span className="detail-value">
                            {session.ipAddress || "Unknown"}
                          </span>
                        </div>
                        <div className="session-detail">
                          <Clock size={14} />
                          <span className="detail-label">Logged In</span>
                          <span className="detail-value">
                            {formatDate(session.loginAt)}
                          </span>
                        </div>
                        <div className="session-detail">
                          <Activity size={14} />
                          <span className="detail-label">Last Active</span>
                          <span className="detail-value">
                            {getTimeAgo(session.lastActivityAt)}
                          </span>
                        </div>
                        <div className="session-detail">
                          <Monitor size={14} />
                          <span className="detail-label">Device</span>
                          <span className="detail-value">
                            {session.deviceInfo || "Unknown"}
                          </span>
                        </div>
                      </div>

                      {session.isActive &&
                        session._id !== currentSessionId && (
                          <div className="session-card-actions">
                            <button
                              className="session-revoke-btn"
                              onClick={() =>
                                handleRevoke(
                                  session._id,
                                  session.email,
                                  session.deviceInfo || "Unknown Device"
                                )
                              }
                              disabled={revoking === session._id}
                            >
                              {revoking === session._id ? (
                                <>
                                  <RefreshCw size={14} className="spinning" />
                                  Revoking...
                                </>
                              ) : (
                                <>
                                  <ShieldOff size={14} />
                                  Revoke Session
                                </>
                              )}
                            </button>
                          </div>
                        )}

                      {session._id === currentSessionId && (
                        <div className="session-card-current-note">
                          <Shield size={14} />
                          <span>This is your current session</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="sessions-pagination">
            <div className="pagination-info">
              <span className="pagination-showing">
                Showing{" "}
                <strong>{startIndex + 1}</strong>
                {" "}-{" "}
                <strong>{Math.min(endIndex, totalGroups)}</strong>
                {" "}of{" "}
                <strong>{totalGroups}</strong>
                {" "}user group{totalGroups !== 1 ? "s" : ""}
              </span>
              <span className="pagination-total-sessions">
                ({filteredSessions.length} total session{filteredSessions.length !== 1 ? "s" : ""})
              </span>
            </div>

            <div className="pagination-controls">
              {/* Items per page selector */}
              <div className="pagination-per-page">
                <span className="per-page-label">Per page:</span>
                <select
                  className="per-page-select"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Navigation buttons */}
              <div className="pagination-nav">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage <= 1}
                  title="First page"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`pagination-btn pagination-page-btn ${
                      safePage === pageNum ? "pagination-active" : ""
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={safePage >= totalPages}
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage >= totalPages}
                  title="Last page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserSessions;
