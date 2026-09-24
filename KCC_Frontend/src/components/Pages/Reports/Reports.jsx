import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { SERVER_url } from '../../../config';
import axios from 'axios';
import {
  ClipboardList,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck
} from "lucide-react";
import '../shared/VerificationForm.css';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${SERVER_url}/logs`);
        const logs = response.data.map(log => ({
          id: log._id || Math.random().toString(36).substr(2, 9),
          date: new Date(log.timestamp).toLocaleDateString('en-GB'),
          fullDate: new Date(log.timestamp),
          activity: log.message.includes("Aadhar") ? "Aadhar Verification" :
            log.message.includes("Pan") ? "Pan Verification" :
              log.message.includes("Voter") ? "VoterId Verification" : "Unknown",
          details: log.message,
          status: log.level === "info" ? "Completed" : "Failed",
        }));
        setReports(logs.sort((a, b) => b.fullDate - a.fullDate));
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
  }, []);

  const header = (
    <div className="rep-table-header">
      <div className="rep-header-left">
        <Filter size={18} className="rep-header-icon" />
        <h3 className="rep-title">System Audit Logs</h3>
      </div>
      <div className="rep-header-right">
        <span className="rep-search-wrapper">
          <Search size={16} className="rep-search-icon" />
          <InputText
            type="search"
            onInput={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search records..."
            className="rep-search-input"
          />
        </span>
      </div>
    </div>
  );

  const statusBodyTemplate = (rowData) => {
    const isSuccess = rowData.status === "Completed";
    return (
      <div className={`rep-status-tag ${isSuccess ? 'success' : 'danger'}`}>
        {isSuccess ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
        <span>{rowData.status}</span>
      </div>
    );
  };

  const dateBodyTemplate = (rowData) => {
    return (
      <div className="rep-date-cell">
        <Calendar size={14} className="rep-date-icon" />
        <span>{rowData.date}</span>
      </div>
    );
  };

  const activityBodyTemplate = (rowData) => {
    return (
      <div className="rep-activity-cell">
        <Clock size={14} className="rep-activity-icon" />
        <span>{rowData.activity}</span>
      </div>
    );
  };

  return (
    <div className="vf-page">
      {/* Page Header */}
      <div className="vf-page-header vf-gradient-blue">
        <div className="vf-page-header-content">
          <div className={`vf-header-text ${mounted ? "mounted" : ""}`}>
            <div className="vf-header-badge">
              <ClipboardList size={14} />
              <span>Audit Center</span>
            </div>
            <h1 className="vf-header-title">KYC Verification Reports</h1>
            <p className="vf-header-desc">
              Comprehensive history of all identity verification attempts,
              system responses, and processing status for audit compliance.
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
            value={reports}
            paginator
            rows={10}
            header={header}
            globalFilter={globalFilter}
            className="rep-datatable"
            responsiveLayout="stack"
            breakpoint="960px"
            emptyMessage="No verification records found."
            paginatorClassName="rep-paginator"
          >
            <Column field="date" header="DATE" body={dateBodyTemplate} sortable style={{ width: '15%' }}></Column>
            <Column field="activity" header="ACTIVITY" body={activityBodyTemplate} sortable style={{ width: '25%' }}></Column>
            <Column field="details" header="TECHNICAL DETAILS" sortable style={{ width: '45%' }}></Column>
            <Column field="status" header="STATUS" body={statusBodyTemplate} sortable style={{ width: '15%' }}></Column>
          </DataTable>
        </div>
      </div>

      <div className="vf-security-footer">
        <div className="vf-security-footer-inner">
          <ShieldCheck size={16} className="vf-security-icon" />
          <p className="vf-security-text">
            All records are immutable and timestamped.
            Digital audit trail maintained for regulatory compliance.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Reports;
