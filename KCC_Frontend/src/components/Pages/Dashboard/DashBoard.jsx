import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { SERVER_url } from "../../../config";
import { Chart } from "primereact/chart";
import "../Dashboard/Dashboard.css";
import "../../Pages/shared/VerificationForm.css";
import axios from "axios";
import "chart.js/auto";
import {
  LayoutDashboard,
  ShieldCheck,
  Calendar,
  Filter,
  BarChart3,
  Users,
  Fingerprint,
  CreditCard,
  Building2,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const DashBoard = () => {
  const { t } = useTranslation();
  const [barChartData, setBarChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [selectedYear, setSelectedYear] = useState("Select");
  const [selectedMonth, setSelectedMonth] = useState("Select");
  const [selectedKYC, setSelectedKYC] = useState("Default");
  const [backendData, setBackendData] = useState({ aadhar: 0, pan: 0, voterId: 0, gstin: 0 });
  const [dashboardAnalytics, setDashboardAnalytics] = useState({
    landDone: 0,
    landFailed: 0,
    fullyFilledCustomers: 0,
    recentActivity: []
  });
  const [totalCount, setTotalCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const years = [
    { label: "Select Year", value: "Select" },
    { label: "2024", value: 2024 },
    { label: "2025", value: 2025 },
    { label: "2026", value: 2026 },
    { label: "2027", value: 2027 },
  ];

  const months = [
    { label: "Select Month", value: "Select" },
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const kycTypes = [
    { label: "All KYC Types", value: "Default" },
    { label: "Aadhar", value: "Aadhar" },
    { label: "PAN", value: "PAN" },
    { label: "VoterId", value: "VoterId" },
    { label: "GSTIN", value: "GSTIN" },
  ];

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedYear !== "Select") params.append("year", selectedYear);
      if (selectedMonth !== "Select") params.append("month", selectedMonth);
      if (selectedKYC !== "Default") params.append("kycType", selectedKYC);

      const kycResponse = await axios.get(`${SERVER_url}/api/auth/kyc-data?${params}`);
      const gstinResponse = await axios.get(`http://localhost:5000/api/v1/gstn-data?${params}`);
      const analyticsResponse = await axios.get(`${SERVER_url}/api/auth/dashboard-analytics`);

      setBackendData({
        aadhar: kycResponse.data.aadhar || 0,
        pan: kycResponse.data.pan || 0,
        voterId: kycResponse.data.voterId || 0,
        gstin: gstinResponse.data.gstin || 0,
      });
      setDashboardAnalytics({
        landDone: analyticsResponse.data.landDone || 0,
        landFailed: analyticsResponse.data.landFailed || 0,
        fullyFilledCustomers: analyticsResponse.data.fullyFilledCustomers || 0,
        recentActivity: analyticsResponse.data.recentActivity || []
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth, selectedKYC]);

  useEffect(() => {
    if (!backendData) return;

    const filteredData = getFilteredData(selectedKYC, backendData);

    let labels = [];
    if (selectedYear === "Select" && selectedMonth === "Select") {
      labels = months.slice(1).map(month => month.label);
    } else if (selectedMonth !== "Select") {
      labels = [months.find(m => m.value === selectedMonth)?.label];
    } else {
      labels = months.slice(1).map(month => month.label);
    }

    const barData = {
      labels: labels,
      datasets: filteredData.map((item) => ({
        label: item.label,
        backgroundColor: item.backgroundColor,
        borderRadius: 6,
        data: Array(labels.length).fill(item.value),
      })),
    };

      const options = {
        maintainAspectRatio: true,
        aspectRatio: window.innerWidth < 768 ? 1 : 2,
        plugins: {
          legend: {
            labels: {
              color: '#475569',
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: { size: 12, weight: '500' }
            },
            position: 'top',
            align: 'end'
          },
          tooltip: {
            backgroundColor: '#ffffff',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            titleFont: { size: 13, weight: '600' },
            bodyFont: { size: 12 },
            titleColor: '#0f172a',
            bodyColor: '#475569',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 10 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', borderDash: [5, 5] },
            ticks: { color: '#64748b', font: { size: 10 } }
          },
        },
        animation: {
          duration: 800,
          easing: 'easeOutQuart'
        }
      };

    setBarChartData(barData);
    setChartOptions(options);
    updateTotalCount();
  }, [backendData, selectedYear, selectedMonth, selectedKYC]);

  const getFilteredData = (kycType, data) => {
    const datasets = [
      {
        label: "Aadhar",
        value: data.aadhar,
        backgroundColor: "#2563eb",
      },
      {
        label: "PAN",
        value: data.pan,
        backgroundColor: "#d97706",
      },
      {
        label: "VoterId",
        value: data.voterId,
        backgroundColor: "#16a34a",
      },
      {
        label: "GSTIN",
        value: data.gstin,
        backgroundColor: "#0d9488",
      },
    ];

    return kycType === "Default"
      ? datasets
      : datasets.filter((dataset) => dataset.label === kycType);
  };

  const updateTotalCount = () => {
    let count = 0;
    if (selectedKYC === "Aadhar") count = backendData.aadhar;
    else if (selectedKYC === "PAN") count = backendData.pan;
    else if (selectedKYC === "VoterId") count = backendData.voterId;
    else if (selectedKYC === "GSTIN") count = backendData.gstin;
    else count = backendData.aadhar + backendData.pan + backendData.voterId + backendData.gstin;
    setTotalCount(count);
  };

  const kpiData = [
    { label: "Aadhar", count: backendData.aadhar, icon: <Fingerprint size={20} />, color: "blue", theme: "vf-gradient-blue" },
    { label: "PAN", count: backendData.pan, icon: <CreditCard size={20} />, color: "amber", theme: "vf-gradient-amber" },
    { label: "VoterId", count: backendData.voterId, icon: <LayoutDashboard size={20} />, color: "purple", theme: "vf-gradient-purple" },
    { label: "GSTIN", count: backendData.gstin, icon: <Building2 size={20} />, color: "teal", theme: "vf-gradient-teal" },
  ];

  return (
    <div className="vf-page dashboard-root">
      {/* Page Header is completely removed, taking advantage of the sleek layout */}
      <div className="dashboard-content">
        {/* KPI Row */}
        <div className={`dashboard-kpi-grid ${mounted ? "mounted" : ""}`}>
          {kpiData.map((kpi, idx) => (
            <div key={idx} className={`dashboard-kpi-card ${kpi.color}`}>
              <div className="kpi-icon-wrapper">
                {kpi.icon}
              </div>
              <div className="kpi-details">
                <span className="kpi-label">{kpi.label} {t('dashboard.verified')}</span>
                <span className="kpi-value">{kpi.count}</span>
              </div>
              <div className="kpi-trend">
                <TrendingUp size={14} />
                <span>{t('dashboard.active')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Chart Area */}
        <div className={`dashboard-main-card ${mounted ? "mounted" : ""}`}>
          <div className="dashboard-card-header">
            <div className="card-header-left">
              <div className="card-header-icon">
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 className="card-header-title">{t('dashboard.trends_title')}</h3>
                <p className="card-header-subtitle">
                  {selectedKYC === "Default" ? t('dashboard.all_modules') : selectedKYC}
                  {selectedYear !== "Select" ? ` · ${selectedYear}` : ""}
                  {selectedMonth !== "Select" ? ` · ${months.find(m => m.value === selectedMonth)?.label}` : ""}
                </p>
              </div>
            </div>

            <div className="dashboard-filters">
              <div className="filter-group">
                <Calendar size={14} />
                <Dropdown
                  value={selectedYear}
                  options={years}
                  onChange={(e) => setSelectedYear(e.value)}
                  placeholder="Year"
                  className="dashboard-dropdown"
                />
              </div>
              <div className="filter-group">
                <Filter size={14} />
                <Dropdown
                  value={selectedMonth}
                  options={months}
                  onChange={(e) => setSelectedMonth(e.value)}
                  placeholder="Month"
                  className="dashboard-dropdown"
                />
              </div>
              <div className="filter-group">
                <Users size={14} />
                <Dropdown
                  value={selectedKYC}
                  options={kycTypes}
                  onChange={(e) => setSelectedKYC(e.value)}
                  placeholder="Type"
                  className="dashboard-dropdown"
                />
              </div>
            </div>
          </div>

          <div className="dashboard-chart-wrapper">
            <div className="chart-total-count">
              <span className="total-label">{t('dashboard.subtotal')}</span>
              <span className="total-value">{totalCount}</span>
              <span className="total-desc">{t('dashboard.records_processed')}</span>
            </div>
            <div className="chart-actual-container">
              <Chart type="bar" data={barChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Advanced Analytics Section */}
        <div className="dashboard-advanced-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          
          {/* Recent Activity Feed */}
          <div className={`dashboard-main-card ${mounted ? "mounted" : ""}`}>
            <div className="card-header-left" style={{ marginBottom: '15px' }}>
              <div className="card-header-icon"><ShieldCheck size={18} /></div>
              <div>
                <h3 className="card-header-title">{t('dashboard.activity_log')}</h3>
                <p className="card-header-subtitle">{t('dashboard.recent_statements')}</p>
              </div>
            </div>
            <div className="activity-feed" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {dashboardAnalytics.recentActivity.length > 0 ? dashboardAnalytics.recentActivity.map((log, idx) => (
                <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{log.email} <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>({log.ipAddress})</span></p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    {new Date(log.logTime).toLocaleString()} 
                    <span style={{ 
                        color: log.status === 'success' ? '#059669' : '#e11d48',
                        background: log.status === 'success' ? '#ecfdf5' : '#fff1f2',
                        padding: '2px 8px', borderRadius: '4px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600'
                    }}>{log.status}</span>
                  </p>
                </div>
              )) : <p style={{ color: '#64748b' }}>{t('dashboard.no_activity')}</p>}
            </div>
          </div>

          {/* More Analytics */}
          <div className={`dashboard-main-card ${mounted ? "mounted" : ""}`}>
            <div className="card-header-left" style={{ marginBottom: '15px' }}>
              <div className="card-header-icon"><BarChart3 size={18} /></div>
              <div>
                <h3 className="card-header-title">{t('dashboard.detailed_insights')}</h3>
                <p className="card-header-subtitle">{t('dashboard.land_profiles')}</p>
              </div>
            </div>
            
            <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="dashboard-kpi-card blue">
                <div className="kpi-details">
                  <span className="kpi-label">{t('dashboard.verified_plots')}</span>
                  <span className="kpi-value">{dashboardAnalytics.landDone}</span>
                </div>
              </div>
              <div className="dashboard-kpi-card amber">
                <div className="kpi-details">
                  <span className="kpi-label">{t('dashboard.failed_pending')}</span>
                  <span className="kpi-value">{dashboardAnalytics.landFailed}</span>
                </div>
              </div>
              <div className="dashboard-kpi-card teal" style={{ gridColumn: 'span 2' }}>
                <div className="kpi-details">
                  <span className="kpi-label">{t('dashboard.fully_filled')}</span>
                  <span className="kpi-value">{dashboardAnalytics.fullyFilledCustomers}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Security Footer */}
      <div className="vf-security-footer">
        <div className="vf-security-footer-inner">
          <ShieldCheck size={16} className="vf-security-icon" />
          <p className="vf-security-text">
            Analytics data is aggregated and anonymized. Dashboard access is restricted to authorized administrative personnel only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;