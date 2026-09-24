import React, { useState, useEffect } from "react";
import "./Kyc.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  CreditCard,
  Fingerprint,
  Vote,
  Building2,
  BarChart3,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const Kyc = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const verificationTypes = [
    {
      name: t("kyc_hub.cibil_name"),
      code: "Cb",
      description: t("kyc_hub.cibil_desc"),
      icon: BarChart3,
      gradient: "kyc-card-gradient-blue",
      iconBg: "kyc-card-icon-blue",
      path: "/customer/cibil",
      tag: t("kyc_hub.tag_credit_score"),
    },
    {
      name: t("kyc_hub.aadhar_name"),
      code: "Ad",
      description: t("kyc_hub.aadhar_desc"),
      icon: Fingerprint,
      gradient: "kyc-card-gradient-green",
      iconBg: "kyc-card-icon-green",
      path: "/customer/aadhar/kyc",
      tag: t("kyc_hub.tag_identity"),
    },
    {
      name: t("kyc_hub.voter_name"),
      code: "Vi",
      description: t("kyc_hub.voter_desc"),
      icon: Vote,
      gradient: "kyc-card-gradient-purple",
      iconBg: "kyc-card-icon-purple",
      path: "/customer/voterid/kyc",
      tag: t("kyc_hub.tag_identity"),
    },
    {
      name: t("kyc_hub.pan_name"),
      code: "Pc",
      description: t("kyc_hub.pan_desc"),
      icon: CreditCard,
      gradient: "kyc-card-gradient-amber",
      iconBg: "kyc-card-icon-amber",
      path: "/customer/pancard/kyc",
      tag: t("kyc_hub.tag_financial"),
    },
    {
      name: t("kyc_hub.gstin_name"),
      code: "Gst",
      description: t("kyc_hub.gstin_desc"),
      icon: Building2,
      gradient: "kyc-card-gradient-teal",
      iconBg: "kyc-card-icon-teal",
      path: "/customer/gstin/kyc",
      tag: t("kyc_hub.tag_business"),
    },
  ];

  const handleCardClick = (type) => {
    navigate(type.path);
  };

  return (
    <div className="kyc-page">
      {/* Page Header */}
      <div className="kyc-page-header">
        <div className="kyc-page-header-content">
          <div className={`kyc-page-header-text ${mounted ? "mounted" : ""}`}>
            <div className="kyc-page-badge">
              <Sparkles size={14} />
              <span>{t("kyc_hub.badge")}</span>
            </div>
            <h1 className="kyc-page-title">
              {t("kyc_hub.title")}
            </h1>
            <p className="kyc-page-desc">
              {t("kyc_hub.desc")}
            </p>
          </div>
        </div>
        {/* Decorative bg */}
        <div className="kyc-page-header-bg">
          <div className="kyc-header-orb kyc-header-orb-1" />
          <div className="kyc-header-orb kyc-header-orb-2" />
        </div>
      </div>

      {/* Verification Cards Grid */}
      <div className="kyc-cards-container">
        <div className="kyc-cards-grid">
          {verificationTypes.map((type, index) => {
            const IconComp = type.icon;
            return (
              <div
                key={type.code}
                className={`kyc-type-card ${type.gradient} ${mounted ? "mounted" : ""}`}
                style={{ animationDelay: `${150 + index * 80}ms` }}
                onClick={() => handleCardClick(type)}
                onMouseEnter={() => setHoveredCard(type.code)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="kyc-type-card-inner">
                  {/* Top row: icon + tag */}
                  <div className="kyc-type-card-top">
                    <div className={`kyc-type-card-icon ${type.iconBg}`}>
                      <IconComp size={22} />
                    </div>
                    <span className="kyc-type-card-tag">{type.tag}</span>
                  </div>

                  {/* Card body */}
                  <div className="kyc-type-card-body">
                    <h3 className="kyc-type-card-name">{type.name}</h3>
                    <p className="kyc-type-card-desc">{type.description}</p>
                  </div>

                  {/* Card footer */}
                  <div className="kyc-type-card-footer">
                    <span className="kyc-type-card-action">
                      {t("kyc_hub.start_verification")}
                    </span>
                    <div className={`kyc-type-card-arrow ${hoveredCard === type.code ? "active" : ""}`}>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>

                {/* Shine effect */}
                <div className="kyc-type-card-shine" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Info footer */}
      <div className={`kyc-info-footer ${mounted ? "mounted" : ""}`}>
        <div className="kyc-info-footer-inner">
          <ShieldCheck size={18} className="kyc-info-footer-icon" />
          <p className="kyc-info-footer-text">
            {t("kyc_hub.security_footer")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Kyc;
