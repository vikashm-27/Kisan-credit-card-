import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import {
  Building2,
  Search,
  Filter,
  ShieldCheck,
  Briefcase,
  MapPin,
  Calendar,
  Tag,
  CheckCircle2,
  XCircle,
  Globe,
  AlertCircle
} from "lucide-react";
import "../shared/VerificationForm.css"
import "./GstInReports.css"

export const GstInReports = () => {
  const [gstLogs, setGstLogs] = useState([]);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchLogs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/gstlogs"
        );

        const sortedLogs = response.data.sort(
          (a, b) => new Date(b.logTime) - new Date(a.logTime)
        );

        setGstLogs(sortedLogs);
      } catch (err) {
        console.error("Error fetching GST logs:", err);
        setError("Failed to fetch GST data logs.");
      }
    };
    fetchLogs();
  }, []);

  const header = (
    <div className="gst-table-header">
      <div className="gst-header-left">
        <Briefcase size={18} className="gst-header-icon" />
        <h3 className="gst-title">GST Verification Trail</h3>
      </div>
      <div className="gst-header-right">
        <span className="rep-search-wrapper">
          <Search size={16} className="rep-search-icon" />
          <InputText
            type="search"
            onInput={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search GSTIN/Business..."
            className="rep-search-input"
          />
        </span>
      </div>
    </div>
  );

  const statusBodyTemplate = (rowData) => {
    const status = rowData.responseData?.data?.gst_in_status || (rowData.isValid ? "Active" : "Inactive");
    const isActive = status.toLowerCase() === "active";
    return (
      <div className={`rep-status-tag ${isActive ? 'success' : 'danger'}`}>
        {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
        <span>{status}</span>
      </div>
    );
  };

  const gstinBodyTemplate = (log) => {
    return (
      <div className="gst-id-cell">
        <Building2 size={14} className="gst-id-icon" />
        <span>{log.responseData?.data?.GSTIN || "N/A"}</span>
      </div>
    );
  };

  const businessBodyTemplate = (log) => {
    return (
      <div className="gst-business-cell">
        <Tag size={14} className="gst-business-icon" />
        <span title={log.responseData?.data?.legal_name_of_business}>
          {log.responseData?.data?.legal_name_of_business || "N/A"}
        </span>
      </div>
    );
  };

  const addressBodyTemplate = (log) => {
    return (
      <div className="gst-address-cell">
        <MapPin size={14} className="gst-address-icon" />
        <span title={log.responseData?.data?.principal_place_address}>
          {log.responseData?.data?.principal_place_address || "N/A"}
        </span>
      </div>
    );
  };

  const ipBodyTemplate = (log) => {
    return (
      <div className="gst-ip-cell">
        <Globe size={14} className="gst-ip-icon" />
        <span>{log.ipAddress || "N/A"}</span>
      </div>
    );
  };

  return (
    <div className="vf-page">
      {/* Page Header */}
      <div className="vf-page-header vf-gradient-teal">
        <div className="vf-page-header-content">
          <div className={`vf-header-text ${mounted ? "mounted" : ""}`}>
            <div className="vf-header-badge">
              <Building2 size={14} />
              <span>Business Verfication</span>
            </div>
            <h1 className="vf-header-title">GSTIN Compliance Reports</h1>
            <p className="vf-header-desc">
              Detailed tracking of GST registration lookups, tax-payer status,
              and business coordinate logs for vendor Due Diligence.
            </p>
          </div>
        </div>
        <div className="vf-header-bg">
          <div className="vf-header-orb vf-header-orb-1" />
          <div className="vf-header-orb vf-header-orb-2" />
        </div>
      </div>

      <div className="rep-section">
        {error && (
          <div className="gst-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        <div className={`rep-card ${mounted ? 'mounted' : ''}`}>
          <DataTable
            value={gstLogs}
            paginator
            rows={8}
            header={header}
            globalFilter={globalFilter}
            className="rep-datatable"
            emptyMessage="No GST verification logs available"
            responsiveLayout="stack"
            breakpoint="960px"
            paginatorClassName="rep-paginator"
          >
            <Column field="responseData.data.GSTIN" header="GSTIN" body={gstinBodyTemplate} sortable style={{ width: '15%' }}></Column>
            <Column field="responseData.data.legal_name_of_business" header="LEGAL NAME" body={businessBodyTemplate} sortable style={{ width: '22%' }}></Column>
            <Column field="responseData.data.date_of_registration" header="REG DATE" sortable style={{ width: '12%' }}></Column>
            <Column field="responseData.data.taxpayer_type" header="TYPE" sortable style={{ width: '12%' }}></Column>
            <Column field="responseData.data.gst_in_status" header="STATUS" body={statusBodyTemplate} sortable style={{ width: '12%' }}></Column>
            <Column field="responseData.data.principal_place_address" header="ADDRESS" body={addressBodyTemplate} sortable style={{ width: '15%' }}></Column>
            <Column field="ipAddress" header="IP ADDRESS" body={ipBodyTemplate} sortable style={{ width: '12%' }}></Column>
          </DataTable>
        </div>
      </div>

      <div className="vf-security-footer">
        <div className="vf-security-footer-inner">
          <ShieldCheck size={16} className="vf-security-icon" />
          <p className="vf-security-text">
            GSTIN data is synchronized with the GST common portal.
            All lookups are logged for commercial integrity audits.
          </p>
        </div>
      </div>
    </div>
  );
};
