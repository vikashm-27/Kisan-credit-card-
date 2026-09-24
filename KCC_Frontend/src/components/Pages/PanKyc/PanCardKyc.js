import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SERVER_url } from "../../../config";
import "../shared/VerificationForm.css";
import "./PanCardKyc.css";
import {
  CreditCard,
  ShieldCheck,
  Send,
  Eye,
  EyeOff,
} from "lucide-react";

const PanCardKyc = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let user = localStorage.getItem("token");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);



  useEffect(() => {
    setMounted(true);
  }, []);

  const [name, setName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [panPdfFile, setPanPdfFile] = useState(null);
  const [showPan, setShowPan] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePanFileChange = (event) => {
    setPanPdfFile(event.target.files[0]);
  };

  const togglePanVisibility = () => {
    setShowPan(!showPan);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("panNumber", panNumber);
    formData.append("panPdfFile", panPdfFile);

    try {
      setLoading(true);
      const verifyResponse = await axios.post(
        "http://localhost:5000/api/v1/token/verifyItemId",
        {
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.qQSekbR5BFKQPc3_7gUiDY6Q9y7RojKzvBTLJ9jGtec",
          username: "admin",
          fieldID: "95601",
        }
      );

      const itoken = verifyResponse.data.itoken;

      const panVerificationResponse = await axios.post(
        "http://localhost:5000/api/v1/pan/panverification",
        {
          service: "Identity",
          itemId: itoken,
          task: "verification",
          essentials: {
            pan: panNumber,
            fuzzy: "false",
            panStatus: "true",
          },
        }
      );

      if (panVerificationResponse.status === 201) {
        const backendResponse = await axios.post(
          `${SERVER_url}/validatePanCard`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (backendResponse.status === 200 && backendResponse.data?.success !== false) {
          alert("User Verified Successfully.");
          navigate("/customer/land-verification", {
            state: {
              name,
              panNumber,
            },
          });
        } else {
          const errMsg = backendResponse.data?.error || backendResponse.data?.message || "Error sending data to backend";
          alert(errMsg);
        }
      } else {
        alert("Invalid PAN details");
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        t("kyc_alerts.err_request", "An error occurred during the request.");
      alert(errMsg);
      console.error("An error occurred during the request.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vf-page">
      {/* Page Header */}
      <div className="vf-page-header vf-gradient-amber">
        <div className="vf-page-header-content">
          <div className={`vf-header-text ${mounted ? "mounted" : ""}`}>
            <div className="vf-header-badge">
              <CreditCard size={14} />
              <span>{t("pan_kyc.badge")}</span>
            </div>
            <h1 className="vf-header-title">{t("pan_kyc.title")}</h1>
            <p className="vf-header-desc">
              {t("pan_kyc.desc")}
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
        <div className={`vf-form-card ${mounted ? "mounted" : ""} ${loading ? "vf-blurred" : ""}`}>
          <div className="vf-form-card-header">
            <div className="vf-form-card-icon amber">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="vf-form-card-title">{t("pan_kyc.card_title")}</h2>
              <p className="vf-form-card-subtitle">{t("pan_kyc.card_subtitle")}</p>
            </div>
          </div>
          <div className="vf-form-body">
            <form onSubmit={handleSubmit}>
              <div className="vf-field">
                <label className="vf-label">
                  {t("pan_kyc.full_name")} <span className="vf-required">*</span>
                </label>
                <div className="vf-input-wrapper">
                  <input
                    type="text"
                    className="vf-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={t("pan_kyc.name_placeholder")}
                  />
                </div>
              </div>

              <div className="vf-field">
                <label className="vf-label">
                  {t("pan_kyc.pan_number")} <span className="vf-required">*</span>
                </label>
                <div className="vf-input-wrapper">
                  <input
                    type={showPan ? "text" : "password"}
                    className="vf-input vf-input-with-icon"
                    value={panNumber}
                    onChange={(e) => {
                      if (/^[A-Z]{0,5}\d{0,4}[A-Z]{0,1}$/.test(e.target.value)) {
                        setPanNumber(e.target.value);
                      }
                    }}
                    required
                    placeholder={t("pan_kyc.pan_placeholder")}
                    maxLength={10}
                    title={t("pan_kyc.pan_title_attr")}
                  />
                  <button
                    type="button"
                    className="vf-eye-btn"
                    onClick={togglePanVisibility}
                  >
                    {showPan ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="vf-field">
                <label className="vf-label">
                  {t("pan_kyc.upload_doc")} <span className="vf-required">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf, .jpg, .jpeg, .png"
                  onChange={handlePanFileChange}
                  required
                  className="vf-file-input"
                />
              </div>

              <div className="vf-submit-row">
                <button type="submit" className="vf-submit-btn amber">
                  <Send size={16} />
                  {t("pan_kyc.submit_btn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="vf-loading-overlay">
          <div className="vf-spinner" />
          <span className="vf-loading-text">{t("pan_kyc.loading")}</span>
        </div>
      )}

      {/* Security footer */}
      <div className="vf-security-footer">
        <div className="vf-security-footer-inner">
          <ShieldCheck size={16} className="vf-security-icon" />
          <p className="vf-security-text">
            {t("pan_kyc.security_footer")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PanCardKyc;
