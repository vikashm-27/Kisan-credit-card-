import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import ReactSpeedometer from "react-d3-speedometer";
import axios from "axios";
import "../shared/VerificationForm.css";
import "./Cibil.css";
import {
  BarChart3,
  ShieldCheck,
  Send,
  Info,
  X,
  AlertTriangle,
  CreditCard,
  TrendingDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const Cibil = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (data) => {
    try {
      // First API call to verifyItemId
      const verifyResponse = await axios.post(
        "http://localhost:5000/api/v1/token/verifyItemId",
        {
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.qQSekbR5BFKQPc3_7gUiDY6Q9y7RojKzvBTLJ9jGtec",
          username: "admin",
          fieldID: "95605",
        }
      );

      const itoken = verifyResponse.data.itoken;

      // Second API call for CIBIL verification
      const cibilVerificationResponse = await axios.post(
        "http://localhost:5000/api/v1/cibil",
        {
          service: "Identity",
          itemId: itoken,
          task: "verification",
          essentials: {
            pan: data.pan,
          },
        }
      );

      if (cibilVerificationResponse.status === 200) {
        setResult(cibilVerificationResponse.data);
        setError("");
      } else {
        alert("CIBIL Verification Failed.");
      }
    } catch (error) {
      console.error("Error during CIBIL verification:", error);
      setError(
        error.response?.data?.message ||
        "An error occurred during the CIBIL verification process."
      );
    }
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  return (
    <div className="vf-page">
      {/* Page Header */}
      <div className="vf-page-header vf-gradient-blue">
        <div className="vf-page-header-content">
          <div className={`vf-header-text ${mounted ? "mounted" : ""}`}>
            <div className="vf-header-badge">
              <BarChart3 size={14} />
              <span>{t("cibil.badge")}</span>
            </div>
            <h1 className="vf-header-title">{t("cibil.title")}</h1>
            <p className="vf-header-desc">
              {t("cibil.desc")}
            </p>
          </div>
        </div>
        <div className="vf-header-bg">
          <div className="vf-header-orb vf-header-orb-1" />
          <div className="vf-header-orb vf-header-orb-2" />
        </div>
      </div>

      {!result ? (
        /* ---- Form View ---- */
        <div className="vf-form-section">
          <div className={`vf-form-card ${mounted ? "mounted" : ""}`}>
            <div className="vf-form-card-header">
              <div className="vf-form-card-icon blue">
                <BarChart3 size={20} />
              </div>
              <div>
                <h2 className="vf-form-card-title">{t("cibil.card_title")}</h2>
                <p className="vf-form-card-subtitle">{t("cibil.card_subtitle")}</p>
              </div>
            </div>
            <div className="vf-form-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="vf-field">
                  <label className="vf-label">
                    {t("cibil.pan_number")} <span className="vf-required">*</span>
                  </label>
                  <input
                    className="vf-input"
                    type="text"
                    placeholder={t("cibil.pan_placeholder")}
                    {...register("pan", {
                      required: "PAN is required",
                      pattern: {
                        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                        message: "Invalid PAN format (e.g. ABCDE1234F)",
                      },
                    })}
                  />
                  {errors.pan && (
                    <div className="vf-error">
                      <AlertTriangle size={12} />
                      {errors.pan.message}
                    </div>
                  )}
                  {error && (
                    <div className="vf-error">
                      <AlertTriangle size={12} />
                      {error}
                    </div>
                  )}
                </div>
                <div className="vf-submit-row">
                  <button className="vf-submit-btn blue" type="submit">
                    <Send size={16} />
                    {t("cibil.verify_btn")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* ---- Result View ---- */
        <div className="vf-result-section">
          <div className="vf-result-grid">
            <div className="vf-result-card vf-result-left">
              <div className="vf-result-card-icon-row">
                <TrendingDown size={18} className="cibil-icon-red" />
              </div>
              <p className="vf-result-card-label">{t('cibil.late_payments')}</p>
              <p className="vf-result-card-value red">{result.creditAccountTotal}</p>
            </div>

            <div className="vf-speedometer-wrapper">
              <h2 className="vf-speedometer-title">
                {t('cibil.credit_report')}
                <button className="vf-info-btn" onClick={togglePopup} title="About CIBIL Score">
                  <Info size={16} />
                </button>
              </h2>
              <ReactSpeedometer
                maxValue={900}
                minValue={300}
                value={result.bureauScore}
                needleColor="#1f2937"
                startColor="#ef4444"
                endColor="#22c55e"
                segments={5}
                segmentColors={[
                  "#ef4444",
                  "#f97316",
                  "#eab308",
                  "#84cc16",
                  "#22c55e",
                ]}
                currentValueText={`CIBIL Score: ${result.bureauScore}`}
                textColor="#1f2937"
                width={280}
                height={180}
                ringWidth={30}
                needleHeightRatio={0.7}
              />
            </div>

            <div className="vf-result-card vf-result-right">
              <div className="vf-result-card-icon-row">
                <CreditCard size={18} className="cibil-icon-blue" />
              </div>
              <p className="vf-result-card-label">{t('cibil.credit_cards')}</p>
              <p className="vf-result-card-value blue">{result.creditAccountActive}</p>
            </div>
          </div>
        </div>
      )}

      {/* CIBIL Info Popup */}
      {showPopup && (
        <div className="vf-modal-overlay" onClick={togglePopup}>
          <div className="vf-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="vf-modal-header">
              <h3 className="vf-modal-title">{t('cibil.understanding_score')}</h3>
              <p className="vf-modal-subtitle">
                {t('cibil.popup_subtitle')}
              </p>
            </div>
            <div className="vf-modal-body">
              <div className="vf-score-range">
                <span className="vf-score-dot red" />
                <strong>Below 681:</strong> {t('cibil.needs_help')}
              </div>
              <div className="vf-score-range">
                <span className="vf-score-dot orange" />
                <strong>681 – 730:</strong> {t('cibil.average')}
              </div>
              <div className="vf-score-range">
                <span className="vf-score-dot yellow" />
                <strong>731 – 770:</strong> {t('cibil.fair')}
              </div>
              <div className="vf-score-range">
                <span className="vf-score-dot lime" />
                <strong>771 – 790:</strong> {t('cibil.good')}
              </div>
              <div className="vf-score-range">
                <span className="vf-score-dot green" />
                <strong>Above 790:</strong> {t('cibil.excellent')}
              </div>
              <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "12px", lineHeight: "1.6" }}>
                {t('cibil.popup_note')}
              </p>
            </div>
            <div className="vf-modal-footer">
              <button className="vf-modal-btn vf-modal-btn-primary" onClick={togglePopup}>
                {t('cibil.got_it')}
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
            {t('cibil.security_footer')}
          </p>
        </div>
      </div>
    </div>
  );
};
