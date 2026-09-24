import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import "primeicons/primeicons.css";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import { signOut } from "firebase/auth";
import { auth } from "../Firebase/Firebase";
import { httpPostService } from "../../httpHandler";
import { SERVER_url } from "../../config";
import {
  Leaf,
  User,
  LogOut,
  ChevronDown,
  Menu,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const heartbeatRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // Force logout - clears everything and redirects to login
  const forceLogout = useCallback((message) => {
    // Clear all intervals/timers first
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionId");

    if (message) {
      alert(message);
    }

    // Use window.location for a full page redirect to ensure clean state
    window.location.href = "/";
  }, []);

  const { instance } = useMsal();

  const handleLogout = useCallback(async () => {
    try {
      // Invalidate session on backend
      await httpPostService("sessions/logout", {});
      await signOut(auth);

      // MSAL logout
      const accounts = instance.getAllAccounts();
      if (accounts.length > 0) {
        // Clear a flag so Login.js knows NOT to auto-login
        sessionStorage.setItem("manualLogout", "true");
        await instance.logoutRedirect({
          postLogoutRedirectUri: window.location.origin
        });
      }
    } catch (error) {
      console.log(error);
    }
    // Always clear and redirect regardless of backend response
    forceLogout(null);
  }, [forceLogout, instance]);

  // ============================================
  // SESSION HEARTBEAT - Poll every 15 seconds
  // to detect if session was revoked by admin
  // ============================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // Don't poll if not logged in

    const checkSession = async () => {
      try {
        const response = await fetch(`${SERVER_url}/sessions/validate`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          const data = await response.json();
          if (data.sessionRevoked) {
            forceLogout("Your session has been revoked by an administrator. Please login again.");
            return;
          }
          // Token expired
          forceLogout("Session expired, please login again.");
          return;
        }

        if (response.status === 403) {
          forceLogout("Session is invalid. Please login again.");
          return;
        }
      } catch (error) {
        // Network error - don't force logout, just log
        console.log("Session heartbeat check failed:", error.message);
      }
    };

    // Run immediately on mount
    checkSession();

    // Then poll every 15 seconds
    heartbeatRef.current = setInterval(checkSession, 15000);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [forceLogout]);

  // Inactivity auto-logout timer (10 minutes)
  const resetLogoutTimer = useCallback((isAutoLogout) => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    logoutTimerRef.current = setTimeout(() => {
      if (isAutoLogout) {
        forceLogout("Session expired due to inactivity. Please login again.");
      } else {
        handleLogout();
      }
    }, 600000);
  }, [handleLogout, forceLogout]);

  useEffect(() => {
    const handleUserActivity = () => {
      resetLogoutTimer(true);
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    resetLogoutTimer(true);

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, [resetLogoutTimer]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleManualLogout = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    handleLogout();
  };


  return (
    <header className="header-root">
      <div className="header-inner">
        {/* Left side */}
        <div className="header-left">
          {/* Mobile menu toggle */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="header-menu-btn"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Logo */}
          <div className="header-logo-group" onClick={() => navigate("/home")}>
            <div className="header-logo-icon">
              <Leaf className="header-leaf-icon" />
            </div>
            <div className="header-logo-text">
              <h1 className="header-title">
                {t('header.title')}
              </h1>
              <p className="header-subtitle">
                Digital KYC Portal
              </p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="header-right">
          
          {/* Language Switcher */}
          <div className="header-lang-wrapper" style={{ position: 'relative', marginRight: '16px', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: '12px', pointerEvents: 'none', color: '#10b981', display: 'flex', alignItems: 'center' }}>
              <Globe size={16} />
            </div>
            <select 
              onChange={(e) => i18n.changeLanguage(e.target.value)} 
              value={i18n.language}
              style={{
                appearance: 'none',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '20px',
                padding: '6px 32px 6px 36px',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#065f46',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#d1fae5';
                e.target.style.borderColor = '#6ee7b7';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ecfdf5';
                e.target.style.borderColor = '#a7f3d0';
              }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#059669' }} />
          </div>

          {/* User dropdown */}
          <div className="header-dropdown-wrapper" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className={`header-user-btn ${showDropdown ? "active" : ""}`}
            >
              <div className="header-avatar">
                <User size={14} className="header-avatar-icon" />
              </div>
              <span className="header-username">
                {user?.email?.split("@")[0] || "User"}
              </span>
              <ChevronDown
                size={14}
                className={`header-chevron ${showDropdown ? "rotated" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="header-dropdown-menu">
                {/* User info */}
                <div className="header-dropdown-info">
                  <p className="header-dropdown-name">
                    {user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="header-dropdown-email">
                    {user?.email || "user@example.com"}
                  </p>
                </div>

                {/* Actions */}
                <div className="header-dropdown-actions">
                  <button
                    onClick={handleManualLogout}
                    className="header-logout-btn"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
