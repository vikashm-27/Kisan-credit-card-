import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../shared/VerificationForm.css";
import "./Gstin.css";
import {
  Building2,
  ShieldCheck,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
} from "lucide-react";

const Gstin = () => {
  const { t } = useTranslation();
  const [gstin, setGstin] = useState("");
  const [verificationData, setVerificationData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isGstinVisible, setIsGstinVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const gstinRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/i;

    if (!gstinRegex.test(gstin)) {
      alert("Invalid GSTIN format. Please enter a valid 15-digit GSTIN.");
      return;
    }

    try {
      const verifyResponse = await axios.post(
        "http://localhost:5000/api/v1/token/verifyItemId",
        {
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.qQSekbR5BFKQPc3_7gUiDY6Q9y7RojKzvBTLJ9jGtec",
          username: "admin",
          fieldID: "95603",
        }
      );

      const itoken = verifyResponse.data.itoken;

      const gstVerificationResponse = await axios.post(
        "http://localhost:5000/api/v1/gstn/gstnverification",
        {
          service: "Identity",
          itemId: itoken,
          task: "verification",
          essentials: {
            gstin: gstin,
            gstStatus: true,
          },
        }
      );

      if (gstVerificationResponse.status === 201) {
        setVerificationData(gstVerificationResponse.data.data);
        setShowModal(true);
      } else {
        alert("GST Verification Failed.");
      }
    } catch (error) {
      console.error("Error during GST verification:", error);
      alert("An error occurred during the GST verification process.");
    }
  };

  const handleOkayClick = () => {
    setShowModal(false);
    navigate("/customer/addcustomer");
  };

  const gstDataFields = verificationData
    ? [
      { label: t("gstin_kyc.lbl_gstin"), value: verificationData.GSTIN },
      { label: t("gstin_kyc.lbl_legal_name"), value: verificationData.legal_name_of_business },
      { label: t("gstin_kyc.lbl_center_jurisdiction"), value: verificationData.center_jurisdiction },
      { label: t("gstin_kyc.lbl_state_jurisdiction"), value: verificationData.state_jurisdiction },
      { label: t("gstin_kyc.lbl_date_of_registration"), value: verificationData.date_of_registration },
      { label: t("gstin_kyc.lbl_constitution"), value: verificationData.constitution_of_business },
      { label: t("gstin_kyc.lbl_taxpayer_type"), value: verificationData.taxpayer_type },
      { label: t("gstin_kyc.lbl_gst_status"), value: verificationData.gst_in_status },
      { label: t("gstin_kyc.lbl_last_updated"), value: verificationData.last_update_date },
      { label: t("gstin_kyc.lbl_business_activities"), value: verificationData.nature_of_business_activities },
      { label: t("gstin_kyc.lbl_principal_address"), value: verificationData.principal_place_address },
    ]
    : [];

  return (
    <div className="vf-page">
      {/* Page Header */}
      <div className="vf-page-header vf-gradient-teal">
        <div className="vf-page-header-content">
          <div className={`vf-header-text ${mounted ? "mounted" : ""}`}>
            <div className="vf-header-badge">
              <Building2 size={14} />
              <span>{t("gstin_kyc.badge")}</span>
            </div>
            <h1 className="vf-header-title">{t("gstin_kyc.title")}</h1>
            <p className="vf-header-desc">
              {t("gstin_kyc.desc")}
            </p>
          </div>
        </div>
        <div className="vf-header-bg">
          <div className="vf-header-orb vf-header-orb-1" />
          <div className="vf-header-orb vf-header-orb-2" />
        </div>
      </div>

      {/* Form */}
      <div className="vf-form-section">
        <div className={`vf-form-card ${mounted ? "mounted" : ""}`}>
          <div className="vf-form-card-header">
            <div className="vf-form-card-icon teal">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="vf-form-card-title">{t("gstin_kyc.card_title")}</h2>
              <p className="vf-form-card-subtitle">{t("gstin_kyc.card_subtitle")}</p>
            </div>
          </div>
          <div className="vf-form-body">
            <form onSubmit={handleSubmit}>
              <div className="vf-field">
                <label className="vf-label">
                  {t("gstin_kyc.gstin_number")} <span className="vf-required">*</span>
                </label>
                <div className="vf-input-wrapper">
                  <input
                    type={isGstinVisible ? "text" : "password"}
                    className="vf-input vf-input-with-icon"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    required
                    maxLength={15}
                    placeholder={t("gstin_kyc.placeholder")}
                    title={t("gstin_kyc.title_attr")}
                  />
                  <button
                    type="button"
                    className="vf-eye-btn"
                    onClick={() => setIsGstinVisible(!isGstinVisible)}
                  >
                    {isGstinVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="vf-submit-row">
                <button type="submit" className="vf-submit-btn teal">
                  <Send size={16} />
                  {t("gstin_kyc.verify_btn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* GST Result Modal */}
      {showModal && verificationData && (
        <div className="vf-modal-overlay" onClick={handleOkayClick}>
          <div className="vf-modal-card gstin-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="vf-modal-header">
              <div className="gstin-modal-success-row">
                <CheckCircle2 size={22} className="gstin-success-icon" />
                <div>
                  <h3 className="vf-modal-title">{t("gstin_kyc.modal_title")}</h3>
                  <p className="vf-modal-subtitle">{t("gstin_kyc.modal_subtitle")}</p>
                </div>
              </div>
            </div>
            <div className="vf-modal-body">
              {gstDataFields.map((field, index) => (
                <div className="vf-data-row" key={index}>
                  <span className="vf-data-label">{field.label}</span>
                  <span className="vf-data-value">{field.value || "—"}</span>
                </div>
              ))}
            </div>
            <div className="vf-modal-footer">
              <button className="vf-modal-btn vf-modal-btn-primary" onClick={handleOkayClick}>
                {t("gstin_kyc.continue_btn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security footer */}
      <div className="vf-security-footer">
        <div className="vf-security-footer-inner">
          <ShieldCheck size={16} className="vf-security-icon" />
          <p className="vf-security-text">
            {t("gstin_kyc.security_footer")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Gstin;
