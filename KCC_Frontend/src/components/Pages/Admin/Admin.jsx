import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Landmark,
  IndianRupee,
  FileSpreadsheet,
  Search,
  RefreshCw,
  X,
  ChevronRight,
  ChevronLeft,
  MapPin,
  ShieldCheck,
  Check,
  AlertCircle,
  Printer,
  Download,
  Eye,
  FileText,
  Filter,
  Sparkles,
  Phone,
  Mail,
  Layers,
  Calendar,
  CheckSquare,
  TrendingUp
} from "lucide-react";
import { httpGetService, httpPutService } from "../../../httpHandler";
import { SERVER_url } from "../../../config";
import "./Admin.css";

// Currency formatting helpers for Indian numbering system
const formatINR = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatLakhsCr = (val) => {
  const num = Number(val) || 0;
  if (num >= 10000000) {
    return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹ ${(num / 100000).toFixed(2)} L`;
  }
  return formatINR(num);
};

const getCibilBadgeClass = (score) => {
  const s = Number(score) || 0;
  if (s >= 750) return "cibil-excellent";
  if (s >= 680) return "cibil-good";
  if (s >= 600) return "cibil-fair";
  return "cibil-poor";
};

const getCibilLabel = (score) => {
  const s = Number(score) || 0;
  if (s >= 750) return "Excellent";
  if (s >= 680) return "Good";
  if (s >= 600) return "Moderate";
  return "High Risk";
};

const getStatusBadge = (status, t) => {
  const st = (status || "SUBMITTED").toUpperCase();
  switch (st) {
    case "APPROVED":
      return { label: t ? t('admin.status.approved') : "APPROVED", class: "badge-approved" };
    case "UNDER_REVIEW":
      return { label: t ? t('admin.filters.under_review') : "UNDER REVIEW", class: "badge-under_review" };
    case "FLAGGED":
      return { label: t ? t('admin.status.flagged') : "FLAGGED", class: "badge-flagged" };
    case "REJECTED":
      return { label: t ? t('admin.status.rejected') : "REJECTED", class: "badge-rejected" };
    case "SUBMITTED":
    default:
      return { label: t ? t('admin.status.submitted') : "SUBMITTED", class: "badge-submitted" };
  }
};

const Admin = () => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [kpis, setKpis] = useState({
    totalApplications: 0,
    pendingReview: 0,
    totalDisbursed: 0,
    approvalRatio: "0.0%",
    approvedCount: 0,
    rejectedCount: 0,
    flaggedCount: 0,
    underReviewCount: 0,
    submittedCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [fetchError, setFetchError] = useState(null);

  // Debounce search input to eliminate request storms and out-of-order response race conditions
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Drawer & Dossier state
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [officerRemarks, setOfficerRemarks] = useState("");
  const [sanctionInput, setSanctionInput] = useState(0);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Sanction Letter Modal state
  const [showSanctionLetter, setShowSanctionLetter] = useState(false);
  const [sanctionLetterDoc, setSanctionLetterDoc] = useState(null);

  // Current logged in user/officer
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  // Fetch applications & branch KPIs
  const loadApplications = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setFetchError(null);

      try {
        const queryParams = new URLSearchParams({
          status: statusFilter,
          search: debouncedSearch,
          page: currentPage.toString(),
          limit: "10",
        });

        // Use httpGetService with fallback to direct fetch
        let res = await httpGetService(`api/admin/applications?${queryParams.toString()}`);

        if (!res || !res.success) {
          // Fallback to direct fetch
          const token = localStorage.getItem("token");
          const raw = await fetch(`${SERVER_url}/api/admin/applications?${queryParams.toString()}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          res = await raw.json();
        }

        if (res && res.success) {
          setApplications(res.applications || []);
          if (res.kpis) setKpis(res.kpis);
          setTotalCount(res.totalCount || 0);
          setTotalPages(res.totalPages || 1);
        } else {
          setFetchError(res?.message || "Failed to load application queue from server.");
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setFetchError("Unable to connect to the backend server. Please verify the service is running.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter, debouncedSearch, currentPage]
  );

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Open drawer and populate selected application
  const openDossier = (app) => {
    setSelectedApp(app);
    setOfficerRemarks(app.officerRemarks || "");
    const maxLimit = Math.round((parseFloat(app.landAreaAcres) || 0) * 50000 * 1.3);
    const initialSanction = (app.sanctionedAmount !== null && app.sanctionedAmount !== undefined) 
      ? app.sanctionedAmount 
      : maxLimit;
    setSanctionInput(initialSanction);
    setIsDrawerOpen(true);
    setFeedback(null);
  };

  const closeDossier = () => {
    setIsDrawerOpen(false);
    setSelectedApp(null);
    setFeedback(null);
  };

  // Close drawer on Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showSanctionLetter) setShowSanctionLetter(false);
        else if (isDrawerOpen) closeDossier();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, showSanctionLetter]);

  // Lock body scroll when drawer or modal is open
  useEffect(() => {
    if (isDrawerOpen || showSanctionLetter) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, showSanctionLetter]);

  // Handle Underwriting Decision
  const handleDecision = async (decision) => {
    if (!selectedApp) return;

    if (decision === "REJECTED" && !officerRemarks.trim()) {
      setFeedback({
        type: "error",
        text: "Please provide mandatory rejection remarks explaining the grounds for rejection.",
      });
      return;
    }

    if (decision === "APPROVED") {
      const parsedSanction = parseFloat(sanctionInput);
      if (isNaN(parsedSanction) || parsedSanction <= 0) {
        setFeedback({
          type: "error",
          text: "Please specify a valid sanction amount greater than ₹0 before approving.",
        });
        return;
      }
    }

    setDecisionLoading(true);
    setFeedback(null);

    try {
      let finalSanctionAmount = selectedApp.sanctionedAmount;
      if (decision === "APPROVED") {
        finalSanctionAmount = parseFloat(sanctionInput);
      } else if (decision === "REJECTED") {
        finalSanctionAmount = 0;
      } else {
        finalSanctionAmount = (sanctionInput !== "" && sanctionInput !== null && sanctionInput !== undefined && !isNaN(parseFloat(sanctionInput))) 
          ? parseFloat(sanctionInput) 
          : selectedApp.sanctionedAmount;
      }

      const payload = {
        decision,
        remarks: officerRemarks,
        officerId: currentUser.id || currentUser.userId || 1,
        sanctionedAmount: finalSanctionAmount,
      };

      let res = await httpPutService(`api/admin/applications/${selectedApp.id}/decision`, payload);

      if (!res || !res.success) {
        const token = localStorage.getItem("token");
        const raw = await fetch(`${SERVER_url}/api/admin/applications/${selectedApp.id}/decision`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        res = await raw.json();
      }

      if (res && res.success) {
        const updatedRecord = res.application || res.customer || {
          ...selectedApp,
          applicationStatus: decision,
          officerRemarks,
          sanctionedAmount: finalSanctionAmount,
        };

        // Update list locally
        setApplications((prev) =>
          prev.map((item) => (item.id === selectedApp.id ? updatedRecord : item))
        );
        setSelectedApp(updatedRecord);

        setFeedback({
          type: "success",
          text: `Application #${selectedApp.id} has been successfully marked as ${decision}.`,
        });

        // Refresh stats (soft refresh to avoid scroll jump)
        loadApplications(true);

        if (decision === "APPROVED") {
          setSanctionLetterDoc(updatedRecord);
          setShowSanctionLetter(true);
        } else {
          setTimeout(() => {
            closeDossier();
          }, 1500);
        }
      } else {
        setFeedback({
          type: "error",
          text: res?.message || "Failed to update application decision.",
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: "Error connecting to server. Please try again.",
      });
    } finally {
      setDecisionLoading(false);
    }
  };

  const quickRemarkChips = [
    t("admin.dossier.remark_all_verified"),
    t("admin.dossier.remark_field_inspection"),
    t("admin.dossier.remark_cibil_clean"),
    t("admin.dossier.remark_high_leverage"),
    t("admin.dossier.remark_survey_match"),
  ];

  return (
    <div className="kcc-admin-root animate-fade-in">
      {/* Top Header Section */}
      <div className="admin-header-panel">
        <div className="admin-header-title-group">
          <div className="admin-header-icon-wrap">
            <Landmark size={26} />
          </div>
          <div>
            <h1 className="admin-heading">{t('admin.header.title')}</h1>
            <div className="admin-subheading">
              <span>{t('admin.header.subtitle')}</span>
            </div>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            className="admin-btn-secondary"
            onClick={() => loadApplications(true)}
            disabled={refreshing || loading}
            title="Refresh application queue"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? t('admin.header.refresh_queue') : t('admin.header.refresh_queue')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="admin-kpi-cards-grid">
        {/* KPI 1: Total Applications */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-card-top">
            <div className="flex-center">
              <span className="admin-kpi-card-label">{t('admin.kpi.total_applications')}</span>
              <span className="admin-kpi-live-badge"><TrendingUp size={12} /> Live</span>
            </div>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-indigo">
              <FileSpreadsheet size={20} />
            </div>
          </div>
          <div className="admin-kpi-card-value">{kpis.totalApplications}</div>
          <div className="admin-kpi-card-subtext">
            <span className="admin-kpi-accent-pill admin-kpi-pill-emerald">+14% MoM</span>
            <span>{t('admin.kpi.total_desc')}</span>
          </div>
        </div>

        {/* KPI 2: Pending Review */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-card-top">
            <div className="flex-center">
              <span className="admin-kpi-card-label">{t('admin.kpi.pending_underwriting')}</span>
              <span className="admin-kpi-live-badge"><TrendingUp size={12} /> Live</span>
            </div>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-amber">
              <Clock size={20} />
            </div>
          </div>
          <div className="admin-kpi-card-value">{kpis.pendingReview}</div>
          <div className="admin-kpi-card-subtext">
            <span className="admin-kpi-accent-pill admin-kpi-pill-amber">{t('admin.kpi.action_needed')}</span>
            <span>{t('admin.kpi.pending_desc')}</span>
          </div>
        </div>

        {/* KPI 3: Total Disbursed */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-card-top">
            <div className="flex-center">
              <span className="admin-kpi-card-label">{t('admin.kpi.total_sanctioned')}</span>
              <span className="admin-kpi-live-badge"><TrendingUp size={12} /> Live</span>
            </div>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-emerald">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="admin-kpi-card-value">{formatLakhsCr(kpis.totalDisbursed)}</div>
          <div className="admin-kpi-card-subtext">
            <span className="admin-kpi-accent-pill admin-kpi-pill-emerald">{kpis.approvedCount} {t('admin.kpi.sanctioned_badge')}</span>
            <span>{t('admin.kpi.sanctioned_desc')}</span>
          </div>
        </div>

        {/* KPI 4: Rejected */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-card-top">
            <div className="flex-center">
              <span className="admin-kpi-card-label">{t('admin.kpi.rejected') || "Rejected"}</span>
              <span className="admin-kpi-live-badge"><TrendingUp size={12} /> Live</span>
            </div>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-red">
              <XCircle size={20} />
            </div>
          </div>
          <div className="admin-kpi-card-value">{kpis.rejectedCount || 0}</div>
          <div className="admin-kpi-card-subtext">
            <span className="admin-kpi-accent-pill admin-kpi-pill-red">
              {kpis.rejectedCount} {t('admin.kpi.rejected_badge') || "Declined"}
            </span>
            <span>{t('admin.kpi.rejected_desc') || "Applications rejected"}</span>
          </div>
        </div>
      </div>

      {/* Underwriting Queue Table Card */}
      <div className="admin-table-card">
        {/* Toolbar & Filters */}
        <div className="admin-toolbar">
          <div className="admin-toolbar-row1">
            {/* Status Filter Tabs */}
            <div className="status-tabs-list">
              <button
                className={`status-tab-btn ${statusFilter === "ALL" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("ALL");
                  setCurrentPage(1);
                }}
              >
                <span>{t('admin.filters.all')}</span>
                <span className="tab-count-badge">{kpis.totalApplications}</span>
              </button>

              <button
                className={`status-tab-btn ${statusFilter === "PENDING" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("PENDING");
                  setCurrentPage(1);
                }}
              >
                <span>{t('admin.filters.pending')}</span>
                <span className="tab-count-badge">{kpis.pendingReview}</span>
              </button>

              <button
                className={`status-tab-btn ${statusFilter === "UNDER_REVIEW" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("UNDER_REVIEW");
                  setCurrentPage(1);
                }}
              >
                <span>{t('admin.filters.under_review')}</span>
                <span className="tab-count-badge">{kpis.underReviewCount || 0}</span>
              </button>

              <button
                className={`status-tab-btn ${statusFilter === "APPROVED" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("APPROVED");
                  setCurrentPage(1);
                }}
              >
                <span>{t('admin.filters.approved')}</span>
                <span className="tab-count-badge">{kpis.approvedCount || 0}</span>
              </button>

              <button
                className={`status-tab-btn ${statusFilter === "FLAGGED" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("FLAGGED");
                  setCurrentPage(1);
                }}
              >
                <span>{t('admin.filters.flagged')}</span>
                <span className="tab-count-badge">{kpis.flaggedCount || 0}</span>
              </button>

              <button
                className={`status-tab-btn ${statusFilter === "REJECTED" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("REJECTED");
                  setCurrentPage(1);
                }}
              >
                <span>{t('admin.filters.rejected')}</span>
                <span className="tab-count-badge">{kpis.rejectedCount || 0}</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="admin-search-wrap">
              <Search size={16} className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder={t('admin.filters.search_placeholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchTerm && (
                <button
                  className="admin-search-clear"
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Queue Table */}
        <div className="table-responsive-wrapper">
          <table className="kcc-queue-table">
            <thead>
              <tr>
                <th>{t('admin.table.headers.applicant')}</th>
                <th>{t('admin.table.headers.survey')}</th>
                <th>{t('admin.table.headers.crop')}</th>
                <th>{t('admin.table.headers.cibil')}</th>
                <th>{t('admin.table.headers.limit')}</th>
                <th>{t('admin.table.headers.status')}</th>
                <th className="text-right">{t('admin.table.headers.action')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-64-24">
                    <div className="flex-center-gap-8 text-muted">
                      <RefreshCw size={20} className="animate-spin text-emerald-600" />
                      <span>Loading underwriting applications queue...</span>
                    </div>
                  </td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan={7} className="text-center p-64-24">
                    <div className="flex-column-center-gap-8 text-danger">
                      <AlertCircle size={36} className="text-red-500" />
                      <div className="font-bold text-danger text-16">
                        Backend Connection Error
                      </div>
                      <p className="empty-state-text">
                        {fetchError}
                      </p>
                      <button
                        className="admin-btn-secondary mt-8"
                        onClick={() => loadApplications(true)}
                      >
                        <RefreshCw size={14} />
                        <span>Retry Connection</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-64-24">
                    <div className="flex-column-center-gap-8 text-muted">
                      <FileSpreadsheet size={36} className="text-slate-300" />
                      <div className="font-bold text-primary text-16">
                        No applications found
                      </div>
                      <p className="empty-state-text">
                        No records match the selected filter or search term "{searchTerm}".
                      </p>
                      <button
                        className="admin-btn-secondary mt-8"
                        onClick={() => {
                          setStatusFilter("ALL");
                          setSearchTerm("");
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const statusInfo = getStatusBadge(app.applicationStatus, t);
                  const fullName = `${app.firstName || "Farmer"} ${app.lastName || ""}`.trim();
                  const initials = `${(app.firstName || "F")[0]}${(app.lastName || "K")[0] || ""}`.toUpperCase();
                  const isSelected = selectedApp?.id === app.id;

                  return (
                    <tr
                      key={app.id}
                      className={`clickable-row ${isSelected ? "selected-row" : ""}`}
                      onClick={() => openDossier(app)}
                    >
                      {/* Farmer Name & Contact */}
                      <td>
                        <div className="farmer-avatar-cell">
                          <div className="farmer-avatar-bubble">{initials}</div>
                          <div>
                            <div className="farmer-name-main">{fullName}</div>
                            <div className="farmer-contact-sub">
                              <Phone size={11} />
                              <span>{app.phoneNumber || "No phone"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Land & Survey */}
                      <td>
                        <div className="land-survey-text">
                          <MapPin size={13} className="text-slate-400" />
                          <span>{app.surveyNumber || `Sy. 104/${app.id}A`}</span>
                        </div>
                        <div className="land-area-sub">
                          {`${(parseFloat(app.landAreaAcres) || 0).toFixed(2)} ${t('admin.table.acres')}`} • Mandya
                        </div>
                      </td>

                      {/* Crop */}
                      <td>
                        <span className="crop-badge-pill">
                          <Sparkles size={11} />
                          {app.cropType || "Paddy (Kharif)"}
                        </span>
                      </td>

                      {/* CIBIL Score */}
                      <td>
                        <div className={`cibil-pill ${getCibilBadgeClass(app.cibilScore)}`}>
                          <span>{app.cibilScore || 720}</span>
                          <span className="cibil-subtext">({getCibilLabel(app.cibilScore)})</span>
                        </div>
                      </td>

                      {/* Sanction Limit */}
                      <td>
                        <div className="sanction-limit-val">
                          {formatINR((app.sanctionedAmount !== null && app.sanctionedAmount !== undefined) ? app.sanctionedAmount : (app.calculatedBreakdown?.totalCalculatedLimit || 125000))}
                        </div>
                        <div className="text-12 text-muted">
                          {t('admin.table.scale')}: ₹50,000 / {t('admin.table.per_acre')}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`app-status-badge ${statusInfo.class}`}>
                          <span className="status-dot"></span>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="text-right">
                        <button
                          className="btn-review-dossier"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDossier(app);
                          }}
                        >
                          <Eye size={13} />
                          <span>{t('admin.table.review_btn')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="admin-pagination-bar">
          <div>
            Showing{" "}
            <strong>
              {totalCount === 0 ? 0 : (currentPage - 1) * 10 + 1} -{" "}
              {Math.min(currentPage * 10, totalCount)}
            </strong>{" "}
            of <strong>{totalCount}</strong> applications
          </div>

          <div className="pagination-controls-group">
            <button
              className="page-nav-btn"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              return (
                <button
                  key={pageNum}
                  className={`page-nav-btn ${currentPage === pageNum ? "active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              className="page-nav-btn"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================================================
          SLIDE-OVER FARMER DOSSIER DRAWER
          ========================================================================== */}
      {isDrawerOpen && selectedApp && createPortal(
        <div className="drawer-backdrop" onClick={closeDossier} style={{ color: "var(--admin-text-main)" }}>
          <div className="farmer-dossier-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-title-area">
                <div className="drawer-farmer-avatar">
                  {`${(selectedApp.firstName || "F")[0]}${(selectedApp.lastName || "K")[0] || ""}`.toUpperCase()}
                </div>
                <div>
                  <h2 className="drawer-farmer-name">
                    {selectedApp.firstName} {selectedApp.lastName}
                  </h2>
                  <div className="drawer-app-id">
                    {t("admin.dossier.application_id")}<strong>KCC-2026-{String(selectedApp.id).padStart(4, "0")}</strong> •{" "}
                    {selectedApp.phoneNumber}
                  </div>
                </div>
              </div>

              <div className="flex-center-gap-8">
                <span className={`app-status-badge ${getStatusBadge(selectedApp.applicationStatus).class}`}>
                  <span className="status-dot"></span>
                  {getStatusBadge(selectedApp.applicationStatus).label}
                </span>
                <button className="drawer-close-btn" onClick={closeDossier} title={t("admin.dossier.close_drawer")}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="dossier-scroll-body">
              {/* Section 1: KYC Verification Badges */}
              <div className="dossier-modules-grid">
              <div className="dossier-section">
                <div className="dossier-section-title">
                  <span>{t('admin.dossier.kyc_auth')}</span>
                  <ShieldCheck size={16} className="text-emerald-600" />
                </div>

                <div className="kyc-badges-row">
                  {/* Aadhaar Badge */}
                  <div className="kyc-badge-card verified">
                    <div className="kyc-badge-header">
                      <span>{t("admin.dossier.aadhaar_kyc")}</span>
                      <Check size={12} />
                    </div>
                    <div className="kyc-value-main">
                      {selectedApp.kycStatus?.aadhaar?.number || "XXXX-XXXX-4829"}
                    </div>
                    <div className="kyc-meta-sub">{t("admin.dossier.uidai_bio_match")}</div>
                  </div>

                  {/* PAN Card Badge */}
                  <div className="kyc-badge-card verified">
                    <div className="kyc-badge-header">
                      <span>{t("admin.dossier.pan_card")}</span>
                      <Check size={12} />
                    </div>
                    <div className="kyc-value-main">
                      {selectedApp.kycStatus?.pan?.number || `ABCDE${1000 + selectedApp.id}F`}
                    </div>
                    <div className="kyc-meta-sub">{t("admin.dossier.nsdl_tax_verified")}</div>
                  </div>

                  {/* Bank Account */}
                  <div className="kyc-badge-card verified">
                    <div className="kyc-badge-header">
                      <span>{t("admin.dossier.bank_nach")}</span>
                      <Check size={12} />
                    </div>
                    <div className="kyc-value-main">
                      {selectedApp.bankName || "SBI Mandya"}
                    </div>
                    <div className="kyc-meta-sub">
                      {t("admin.dossier.ifsc_code")}{selectedApp.ifscCode || "SBIN0001234"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Cadastral Land & Survey Snapshot */}
              <div className="dossier-section">
                <div className="dossier-section-title">
                  <span>{t('admin.dossier.cadastral_details')}</span>
                  <Layers size={16} className="text-emerald-600" />
                </div>

                {/* Styled Cadastral Map Boundary Snapshot */}
                <div className="cadastral-map-box">
                  <div className="cadastral-map-header">
                    <div className="cadastral-map-title">
                      {t("admin.dossier.verified_cadastral_boundary")}
                    </div>
                    <span className="cadastral-map-badge">
                      {t("admin.dossier.gps_polygons_match")}
                    </span>
                  </div>

                  {/* Stylized Polygon SVG Map */}
                  <div
                    className="cadastral-map-visual"
                  >
                    <svg width="100%" height="100%" className="cadastral-map-svg">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      {/* Polygon plot */}
                      <polygon
                        points="80,15 220,25 280,75 140,82 60,60"
                        fill="rgba(16, 185, 129, 0.25)"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                      <circle cx="160" cy="50" r="4" fill="#38bdf8" />
                      <text x="170" y="53" fill="#ffffff" fontSize="9" fontWeight="bold">
                        Sy. {selectedApp.surveyNumber || `104/${selectedApp.id}A`}
                      </text>
                    </svg>
                  </div>
                </div>

                <div className="cadastral-grid-details">
                  <div className="cadastral-item">
                    <div className="cadastral-label">{t("admin.dossier.survey_number")}</div>
                    <div className="cadastral-val">{selectedApp.surveyNumber || `Sy. 104/${selectedApp.id}A`}</div>
                  </div>
                  <div className="cadastral-item">
                    <div className="cadastral-label">{t("admin.dossier.verified_area")}</div>
                    <div className="cadastral-val">
                      {`${(parseFloat(selectedApp.landAreaAcres) || 0).toFixed(2)} Acres`}
                    </div>
                  </div>
                  <div className="cadastral-item">
                    <div className="cadastral-label">{t("admin.dossier.primary_crop")}</div>
                    <div className="cadastral-val">{selectedApp.cropType || "Paddy (Kharif)"}</div>
                  </div>
                  <div className="cadastral-item">
                    <div className="cadastral-label">{t("admin.dossier.irrigation_soil")}</div>
                    <div className="cadastral-val">{t("admin.dossier.canal_red_loamy")}</div>
                  </div>
                </div>
              </div>

              {/* Section 3: Scale of Finance Limit Calculation (NABARD / RBI Formula) */}
              <div className="dossier-section">
                <div className="dossier-section-title">
                  <span>{t('admin.dossier.scale_finance')}</span>
                  <IndianRupee size={16} className="text-emerald-600" />
                </div>

                <div className="scale-finance-box">
                  <div className="scale-row">
                    <span>{t("admin.dossier.base_crop_loan_prefix")}{selectedApp.cropType || "Paddy"}{t("admin.dossier.base_crop_loan_suffix")}</span>
                    <strong className="text-primary">
                      {formatINR(
                        Math.round(
                          (parseFloat(selectedApp.landAreaAcres) || 0) * 50000
                        )
                      )}
                    </strong>
                  </div>

                  <div className="scale-row">
                    <span>{t("admin.dossier.post_harvest_expenses")}</span>
                    <span>
                      {formatINR(
                        Math.round(
                          (parseFloat(selectedApp.landAreaAcres) || 0) * 50000 * 0.1
                        )
                      )}
                    </span>
                  </div>

                  <div className="scale-row">
                    <span>{t("admin.dossier.farm_asset_maintenance")}</span>
                    <span>
                      {formatINR(
                        Math.round(
                          (parseFloat(selectedApp.landAreaAcres) || 0) * 50000 * 0.2
                        )
                      )}
                    </span>
                  </div>

                  <div className="scale-row total-row">
                    <span>{t("admin.dossier.max_kcc_limit")}</span>
                    <span>
                      {formatINR(
                        Math.round(
                          (parseFloat(selectedApp.landAreaAcres) || 0) * 50000 * 1.3
                        )
                      )}
                    </span>
                  </div>

                  {/* Officer Editable Sanction Amount */}
                  <div className="officer-sanction-section">
                    <label className="officer-sanction-label">
                      {t("admin.dossier.proposed_sanction_amount")}
                    </label>
                    <input
                      type="text"
                      className="admin-search-input officer-sanction-input"
                      value={sanctionInput !== "" && sanctionInput !== null && sanctionInput !== undefined ? Number(sanctionInput).toLocaleString('en-IN') : ""}
                      onChange={(e) => {
                        const el = e.target;
                        const currentVal = el.value;
                        const currentCursor = el.selectionStart;
                        const rawVal = currentVal.replace(/\D/g, "");
                        const numericVal = rawVal !== "" ? Number(rawVal) : "";
                        
                        const formattedVal = numericVal !== "" ? numericVal.toLocaleString('en-IN') : "";
                        const lengthDelta = formattedVal.length - currentVal.length;
                        let newCursor = currentCursor + lengthDelta;
                        if (newCursor < 0) newCursor = 0;
                        
                        setSanctionInput(numericVal);
                        
                        requestAnimationFrame(() => {
                          if (el) el.setSelectionRange(newCursor, newCursor);
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Underwriter Remarks */}
              <div className="dossier-section">
                <div className="dossier-section-title">
                  <span>{t('admin.dossier.underwriting_remarks')}</span>
                  <FileText size={16} className="text-emerald-600" />
                </div>

                <textarea
                  className="officer-remarks-textarea"
                  placeholder={t("admin.dossier.remarks_placeholder")}
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                />

                <div className="remark-chips-list">
                  {quickRemarkChips.map((chip, index) => (
                    <button
                      key={index}
                      type="button"
                      className="remark-chip-btn"
                      onClick={() =>
                        setOfficerRemarks((prev) => (prev ? `${prev}. ${chip}` : chip))
                      }
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                {selectedApp.reviewedAt && (
                  <div className="review-meta">
                    <Calendar size={12} />
                    <span>
                      {t("admin.dossier.last_decision_by")}{selectedApp.reviewedByOfficerId || 1} on{" "}
                      {new Date(selectedApp.reviewedAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>
              </div>
            </div>

            {/* Drawer Decision Footer Actions */}
            <div className="drawer-footer-actions">
              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`feedback-alert ${feedback.type === "success" ? "feedback-success" : "feedback-error"}`}
                  onClick={() => setFeedback(null)}
                  style={{ cursor: "pointer" }}
                  title="Click to dismiss"
                >
                  {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{feedback.text}</span>
                </div>
              )}

              <div className="primary-decision-buttons">
                {/* Approve Sanction */}
                <button
                  className="btn-decision btn-approve-sanction"
                  disabled={decisionLoading}
                  onClick={() => handleDecision("APPROVED")}
                >
                  <CheckCircle2 size={16} />
                  <span>{t('admin.dossier.approve_sanction')}</span>
                </button>

                {/* Flag for Field Inspection */}
                <button
                  className="btn-decision btn-flag-inspection"
                  disabled={decisionLoading}
                  onClick={() => handleDecision("FLAGGED")}
                >
                  <AlertTriangle size={15} />
                  <span>{t('admin.dossier.flag_inspection')}</span>
                </button>

                {/* Reject */}
                <button
                  className="btn-decision btn-reject-app"
                  disabled={decisionLoading}
                  onClick={() => handleDecision("REJECTED")}
                >
                  <XCircle size={15} />
                  <span>{t('admin.dossier.reject')}</span>
                </button>
              </div>

              {selectedApp.applicationStatus === "APPROVED" && (
                <button
                  className="admin-btn-secondary btn-secondary-full"
                  onClick={() => {
                    setSanctionLetterDoc(selectedApp);
                    setShowSanctionLetter(true);
                  }}
                >
                  <FileText size={15} />
                  <span>{t('admin.dossier.view_print_letter')}</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==========================================================================
          OFFICIAL SANCTION LETTER MODAL
          ========================================================================== */}
      {showSanctionLetter && sanctionLetterDoc && createPortal(
        <div className="sanction-modal-backdrop" onClick={() => setShowSanctionLetter(false)} style={{ color: "var(--admin-text-main)" }}>
          <div className="sanction-letter-sheet animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="sanction-modal-header">
              <div>
                <div className="sanction-modal-brand">
                  <Landmark size={20} />
                  <span>{t("admin.dossier.bank_lead_office")}</span>
                </div>
                <h2 className="sanction-modal-title">
                  {t("admin.dossier.sanction_advice_title")}
                </h2>
                <div className="sanction-modal-subtitle">
                  {t("admin.dossier.scheme_under_ministry")}
                </div>
              </div>

              <button className="drawer-close-btn" onClick={() => setShowSanctionLetter(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="sanction-grid-details">
              <div>
                <strong>{t("admin.dossier.sanction_reference")}</strong> KCC/MND/2026/{sanctionLetterDoc.id}
              </div>
              <div>
                <strong>{t("admin.dossier.sanction_date")}</strong> {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
              </div>
              <div>
                <strong>{t("admin.dossier.borrower_name")}</strong> {sanctionLetterDoc.firstName} {sanctionLetterDoc.lastName}
              </div>
              <div>
                <strong>{t("admin.dossier.contact_number")}</strong> {sanctionLetterDoc.phoneNumber}
              </div>
              <div>
                <strong>{t("admin.dossier.revenue_survey_no")}</strong> {sanctionLetterDoc.surveyNumber || "Sy. 104/2A"}
              </div>
              <div>
                <strong>{t("admin.dossier.sanctioned_land_area")}</strong> {(parseFloat(sanctionLetterDoc.landAreaAcres) || 0).toFixed(2)} Acres
              </div>
            </div>

            <div className="sanction-limit-box">
              <div className="sanction-limit-label">{t("admin.dossier.total_sanctioned_limit")}</div>
              <div className="sanction-limit-amount">
                {formatINR(sanctionLetterDoc.sanctionedAmount || 125000)}
              </div>
              <div className="sanction-limit-desc">
                {t("admin.dossier.limit_breakdown_desc")}
              </div>
            </div>

            <div className="sanction-terms-section">
              <h4 className="sanction-terms-title">{t("admin.dossier.key_terms_title")}</h4>
              <ul className="sanction-terms-list">
                <li>{t("admin.dossier.term_interest_rate")}</li>
                <li>{t("admin.dossier.term_prompt_repayment")} <strong>{t("admin.dossier.term_effective_interest")}</strong></li>
                <li>{t("admin.dossier.term_rupay_card")}</li>
                <li>{t("admin.dossier.term_validity")}</li>
              </ul>
            </div>

            <div className="sanction-modal-footer">
              <div>
                <div className="text-12 text-muted">{t("admin.dossier.digital_officer_seal")}</div>
                <div className="sanction-seal-role">{t("admin.dossier.branch_credit_manager")}</div>
                <div className="text-12 text-muted">{t("admin.dossier.mandya_lead_office")}</div>
              </div>

              <div className="sanction-actions">
                <button
                  className="admin-btn-secondary"
                  onClick={() => window.print()}
                >
                  <Printer size={15} />
                  <span>{t("admin.dossier.print_sanction_note")}</span>
                </button>
                <button
                  className="btn-review-dossier"
                  onClick={() => setShowSanctionLetter(false)}
                >
                  <span>{t("admin.dossier.done_button")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Admin;

