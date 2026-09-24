import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SERVER_url } from "../config";
import Sidebar from "./Sidebar/Sidebar";
import "./Home.css";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import { useTranslation } from "react-i18next";
import {
  Shield,
  CreditCard,
  FileCheck2,
  Users,
  ArrowRight,
  Sprout,
  BarChart3,
  Globe2,
  TrendingUp,
} from "lucide-react";


const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let user = localStorage.getItem("token");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);



  const [dashboardStats, setDashboardStats] = useState({
    activeCustomers: "...",
    kycVerified: "...",
    kycRejected: "...",
    successRate: "..."
  });

  useEffect(() => {
    setMounted(true);
    const fetchHomeStats = async () => {
      try {
        const response = await axios.get(`${SERVER_url}/api/auth/home-stats`);
        setDashboardStats({
          activeCustomers: response.data.activeCustomers.toLocaleString() + "+",
          kycVerified: response.data.kycVerified.toLocaleString() + "+",
          kycRejected: response.data.kycRejected.toLocaleString(),
          successRate: response.data.successRate + "%"
        });
      } catch (error) {
        console.error("Error fetching home stats:", error);
      }
    };
    fetchHomeStats();
  }, []);

  const stats = [
    {
      label: t("home_portal.active_customers"),
      value: dashboardStats.activeCustomers,
      icon: Users,
      trend: t("home_portal.live_badge"),
      trendLabel: "from database",
      gradient: "kpi-gradient-green",
      iconBg: "kpi-icon-green",
    },
    {
      label: t("home_portal.kyc_verified"),
      value: dashboardStats.kycVerified,
      icon: FileCheck2,
      trend: t("home_portal.live_badge"),
      trendLabel: "from database",
      gradient: "kpi-gradient-blue",
      iconBg: "kpi-icon-blue",
    },
    {
      label: t("home_portal.kyc_rejected"),
      value: dashboardStats.kycRejected,
      icon: CreditCard,
      trend: t("home_portal.live_badge"),
      trendLabel: "from database",
      gradient: "kpi-gradient-amber",
      iconBg: "kpi-icon-amber",
    },
    {
      label: t("home_portal.success_rate"),
      value: dashboardStats.successRate,
      icon: BarChart3,
      trend: t("home_portal.live_badge"),
      trendLabel: "from database",
      gradient: "kpi-gradient-emerald",
      iconBg: "kpi-icon-emerald",
    },
  ];

  return (
    <>
      <Header />
      <div className="flex min-h-[calc(100vh-56px)]">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          {/* Main Content Area */}
          <div className="home-content-area">
            {/* Hero Section */}
            <div className="home-hero">
              <div className="home-hero-bg" />
              {/* Decorative elements */}
              <div className="home-hero-decorations">
                <div className="home-hero-orb home-hero-orb-1" />
                <div className="home-hero-orb home-hero-orb-2" />
                <div className="home-hero-pattern">
                  <Sprout size={100} strokeWidth={1} className="text-green-300" />
                </div>
              </div>

              {/* Hero content */}
              <div className="home-hero-content">
                <div
                  className={`home-hero-text-block ${mounted ? "mounted" : ""
                    }`}
                >
                  <div className="home-hero-badge">
                    <div className="home-hero-badge-bar" />
                    <span className="home-hero-badge-text">
                      {t("home_portal.badge")}
                    </span>
                  </div>
                  <h1 className="home-hero-title">
                    {t("home_portal.title_1")}
                    <span className="home-hero-title-highlight">
                      {t("home_portal.title_2")}
                    </span>
                  </h1>
                  <p className="home-hero-desc">
                    {t("home_portal.desc")}
                  </p>
                  <button
                    onClick={() => navigate("/customer/kyc")}
                    className="home-hero-cta"
                  >
                    {t("home_portal.start_btn")}
                    <ArrowRight size={16} className="home-hero-cta-icon" />
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Stats Row */}
            <div className="kpi-container">
              <div className="kpi-grid">
                {stats.map((stat, index) => {
                  const IconComp = stat.icon;
                  return (
                    <div
                      key={index}
                      className={`kpi-card ${stat.gradient} ${mounted ? "mounted" : ""
                        }`}
                      style={{
                        animationDelay: `${200 + index * 100}ms`,
                      }}
                    >
                      <div className="kpi-card-inner">
                        <div className="kpi-header">
                          <div className={`kpi-icon-wrapper ${stat.iconBg}`}>
                            <IconComp size={20} />
                          </div>
                          <div className="kpi-trend">
                            <TrendingUp size={12} />
                            <span>{stat.trend}</span>
                          </div>
                        </div>
                        <div className="kpi-body">
                          <p className="kpi-value">{stat.value}</p>
                          <p className="kpi-label">{stat.label}</p>
                        </div>
                      </div>
                      <div className="kpi-shine" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content Cards */}
            <div className="home-cards-section">
              {/* About KYC Card */}
              <div
                className={`home-info-card ${mounted ? "mounted" : ""}`}
                style={{ animationDelay: "600ms" }}
              >
                <div className="home-info-card-header">
                  <div className="home-info-card-icon home-info-icon-green">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h2 className="home-info-card-title">
                      {t("home_portal.about_title")}
                    </h2>
                    <p className="home-info-card-subtitle">
                      {t("home_portal.about_subtitle")}
                    </p>
                  </div>
                </div>
                <div className="home-info-card-body">
                  <p>
                    {t("home_portal.about_desc")}
                  </p>
                </div>
              </div>

              {/* Importance Card */}
              <div
                className={`home-info-card ${mounted ? "mounted" : ""}`}
                style={{ animationDelay: "800ms" }}
              >
                <div className="home-info-card-header">
                  <div className="home-info-card-icon home-info-icon-blue">
                    <Globe2 size={18} />
                  </div>
                  <div>
                    <h2 className="home-info-card-title">
                      {t("home_portal.importance_title")}
                    </h2>
                    <p className="home-info-card-subtitle">
                      {t("home_portal.importance_subtitle")}
                    </p>
                  </div>
                </div>
                <div className="home-info-card-body">
                  <p>
                    {t("home_portal.importance_desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
