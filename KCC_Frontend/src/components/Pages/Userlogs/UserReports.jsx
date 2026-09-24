import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { SERVER_url } from "../../../config";
import axios from "axios";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  User,
  Globe,
  History,
  Activity,
  AlertCircle,
  LogOut,
  UserPlus
} from "lucide-react";
import "../shared/VerificationForm.css";
import "./UserReports.css";

const UserReports = () => {
  const [logs, setLogs] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchLogs = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userEmail = storedUser?.email || "";

        const [
          userLogsResponse,
          kycLogsResponse,
          logoutLogsResponse,
          customerLogsResponse,
          gstLogsResponse,
        ] = await Promise.all([
          axios.get(`${SERVER_url}/userlogs`),
          axios.get(`${SERVER_url}/logs`),
          axios.get(`${SERVER_url}/logoutlogs`),
          axios.get(`${SERVER_url}/customerlogs`),
          axios.get("http://localhost:5000/api/v1/gstlogs"),
        ]);

        // User Logs
        const userLogs = (userLogsResponse.data.userlogs || []).map((log) => ({
          email: log.email,
          logTime: new Date(log.logTime),
          ipAddress: log.ipAddress,
          status: log.status || "Completed",
          activity: "Login",
          category: "auth",
          details: "System Access Granted",
        }));

        // KYC Logs
        const kycLogs = (kycLogsResponse.data || []).map((log) => ({
          email: userEmail || "System Agent",
          logTime: new Date(log.timestamp),
          ipAddress: log.ipAddress || "-",
          status: log.level === "info" ? "Completed" : "Failed",
          activity: log.message.includes("Aadhar")
            ? "Aadhar Verification"
            : log.message.includes("Pan")
              ? "Pan Verification"
              : log.message.includes("Voter")
                ? "VoterId Verification"
                : "KYC Activity",
          category: "kyc",
          details: log.message,
        }));

        // Logout Logs
        const logoutLogs = (logoutLogsResponse.data || []).map((log) => ({
          email: log.email,
          logTime: new Date(log.logTime),
          ipAddress: log.ipAddress,
          status: log.status || "Completed",
          activity: "Logout",
          category: "auth",
          details: "Session Terminated",
        }));

        // Customer Logs
        const customerLogs = (customerLogsResponse.data || []).map((log) => ({
          email: log.email,
          logTime: new Date(log.logTime),
          ipAddress: log.ipAddress || "-",
          status: log.status || "Completed",
          activity: log.activity || "Customer Update",
          category: "operation",
          details: log.details || "Record modified",
        }));

        // GST Verification Logs
        const gstLogs = (gstLogsResponse.data || []).map((log) => ({
          email: log.gstin || "N/A",
          logTime: new Date(log.logTime),
          ipAddress: log.ipAddress || "-",
          status: log.isValid ? "Completed" : "Failed",
          activity: "GST Verification",
          category: "kyc",
          details: log.responseData?.data?.message || (log.isValid ? "Valid GSTIN" : "Invalid GSTIN"),
        }));

        // Combine all logs
        const combinedLogs = [
          ...userLogs,
          ...kycLogs,
          ...logoutLogs,
          ...customerLogs,
          ...gstLogs,
        ].sort((a, b) => b.logTime - a.logTime);

        setLogs(combinedLogs);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
  }, []);

  const header = (
    <div className="usr-table-header">
      <div className="usr-header-left">
        <Activity size={18} className="usr-header-icon" />
        <h3 className="usr-title">User Activity Trail</h3>
      </div>
      <div className="usr-header-right">
        <span className="rep-search-wrapper">
          <Search size={16} className="rep-search-icon" />
          <InputText
            type="search"
            onInput={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search activity..."
            className="rep-search-input"
          />
        </span>
      </div>
    </div>
  );

  const statusBodyTemplate = (rowData) => {
    const isSuccess = rowData.status.toLowerCase().includes("completed") || rowData.status.toLowerCase().includes("success");
    return (
      <div className={`rep-status-tag ${isSuccess ? 'success' : 'danger'}`}>
        <span>{rowData.status}</span>
      </div>
    );
  };

  const userBodyTemplate = (rowData) => {
    return (
      <div className="usr-user-cell">
        <User size={14} className="usr-user-icon" />
        <span title={rowData.email}>{rowData.email}</span>
      </div>
    );
  };

  const timeBodyTemplate = (rowData) => {
    return (
      <div className="usr-time-cell">
        <History size={14} className="usr-time-icon" />
        <span>{rowData.logTime.toLocaleString('en-GB')}</span>
      </div>
    );
  };

  const activityBodyTemplate = (rowData) => {
    let Icon = Activity;
    if (rowData.activity.includes("Login")) Icon = UserPlus;
    if (rowData.activity.includes("Logout")) Icon = LogOut;

    return (
      <div className="usr-activity-cell">
        <Icon size={14} className="usr-activity-icon" />
        <span>{rowData.activity}</span>
      </div>
    );
  };

  const ipBodyTemplate = (rowData) => {
    return (
      <div className="usr-ip-cell">
        <Globe size={14} className="usr-ip-icon" />
        <span>{rowData.ipAddress || '-'}</span>
      </div>
    );
  };

  return (
    <div className="vf-page">
      {/* Page Header */}
      <div className="vf-page-header vf-gradient-purple">
        <div className="vf-page-header-content">
          <div className={`vf-header-text ${mounted ? "mounted" : ""}`}>
            <div className="vf-header-badge">
              <Users size={14} />
              <span>User Governance</span>
            </div>
            <h1 className="vf-header-title">System Activity Reports</h1>
            <p className="vf-header-desc">
              Monitor operational workflows, user access attempts,
              and administrative actions across the entire platform.
            </p>
          </div>
        </div>
        <div className="vf-header-bg">
          <div className="vf-header-orb vf-header-orb-1" />
          <div className="vf-header-orb vf-header-orb-2" />
        </div>
      </div>

      <div className="rep-section">
        <div className={`rep-card ${mounted ? 'mounted' : ''}`}>
          <DataTable
            value={logs}
            paginator
            rows={8}
            header={header}
            globalFilter={globalFilter}
            className="rep-datatable"
            responsiveLayout="stack"
            breakpoint="960px"
            emptyMessage="No activity records found."
            paginatorClassName="rep-paginator"
          >
            <Column field="email" header="USER IDENTIFIER" body={userBodyTemplate} sortable style={{ width: '22%' }}></Column>
            <Column field="logTime" header="TIMESTAMP" body={timeBodyTemplate} sortable style={{ width: '18%' }}></Column>
            <Column field="activity" header="ACTIVITY" body={activityBodyTemplate} sortable style={{ width: '20%' }}></Column>
            <Column field="details" header="LOG DETAILS" sortable style={{ width: '25%' }}></Column>
            <Column field="ipAddress" header="IP ADDRESS" body={ipBodyTemplate} sortable style={{ width: '15%' }}></Column>
          </DataTable>
        </div>
      </div>

      <div className="vf-security-footer">
        <div className="vf-security-footer-inner">
          <ShieldCheck size={16} className="vf-security-icon" />
          <p className="vf-security-text">
            Activity logs are protected by session-based authorization.
            IP tracking enabled for fraud prevention and accountability.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserReports;
