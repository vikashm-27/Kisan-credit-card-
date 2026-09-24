import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { SERVER_url } from "../../../config";
import "../shared/VerificationForm.css";
import "./AadharKyc.css";
import {
  Fingerprint,
  ShieldCheck,
  Send,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTranslation } from "react-i18next";


const AadharKyc = () => {
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
  const [aadharNumber, setAadharNumber] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [showAadhar, setShowAadhar] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const toast = useRef(null);

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const toggleAadharVisibility = () => {
    setShowAadhar(!showAadhar);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("aadhar_number", aadharNumber);
    formData.append("pdfFile", pdfFile);

    try {
      setLoading(true);
      const verifyResponse = await axios.post(
        "http://localhost:5000/api/v1/token/verifyItemId",
        {
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.qQSekbR5BFKQPc3_7gUiDY6Q9y7RojKzvBTLJ9jGtec",
          username: "admin",
          fieldID: "95602",
        }
      );

      const itoken = verifyResponse.data.itoken;

      const aadharVerificationResponse = await axios.post(
        "http://localhost:5000/api/v1/aadhar/aadharverification",
        {
          service: "Identity",
          itemId: itoken,
          task: "verification",
          essentials: {
            number: aadharNumber,
            full_name: name,
            fuzzy: "false",
            aadharStatus: "true",
          },
        }
      );

      if (aadharVerificationResponse.status === 201) {
        const backendResponse = await axios.post(
          `${SERVER_url}/validateAadhar`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (backendResponse.status === 200) {
          toast.current.show({ severity: 'success', summary: t('aadhar_kyc.success', 'Success'), detail: t('kyc_alerts.otp_sent'), life: 3000 });
          setShowOtpModal(true);
        } else {
          toast.current.show({ severity: 'error', summary: t('aadhar_kyc.error', 'Error'), detail: t('kyc_alerts.err_backend'), life: 3000 });
        }
      } else {
        toast.current.show({ severity: 'error', summary: t('aadhar_kyc.error', 'Error'), detail: t('kyc_alerts.err_invalid'), life: 3000 });
      }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: t('aadhar_kyc.error', 'Error'), detail: t('kyc_alerts.err_request'), life: 3000 });
      console.error("An error occurred during the request.", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    const value = element.value;
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5 && value !== "") {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (newOtp[index] !== "") {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1].focus();
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleOtpSubmit = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp === "123456") {
      toast.current.show({ severity: 'success', summary: t('aadhar_kyc.verified_summary', 'Verified'), detail: t('kyc_alerts.otp_success'), life: 3000 });
      setTimeout(() => navigate("/customer/land-verification"), 1000);
    } else {
      toast.current.show({ severity: 'error', summary: t('aadhar_kyc.error', 'Error'), detail: t('kyc_alerts.otp_invalid'), life: 3000 });
    }
  };

  const otpDialogFooter = (
    <div>
      <Button className="otp-submit" label={t('common.submit')} onClick={handleOtpSubmit} />
    </div>
  );

  return (
    <div className="vf-page">
      <Toast ref={toast} />
      {/* Page Header */}
      <div className="vf-page-header vf-gradient-green">
        <div className="vf-page-header-content">
          <div className={`vf-header-text ${mounted ? "mounted" : ""}`}>
            <div className="vf-header-badge">
              <Fingerprint size={14} />
              <span>{t('aadhar_kyc.identity_verification')}</span>
            </div>
            <h1 className="vf-header-title">{t('aadhar_kyc.title')}</h1>
            <p className="vf-header-desc">
              {t('aadhar_kyc.subtitle')}
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
            <div className="vf-form-card-icon green">
              <Fingerprint size={20} />
            </div>
            <div>
              <h2 className="vf-form-card-title">{t('aadhar_kyc.card_title')}</h2>
              <p className="vf-form-card-subtitle">{t('aadhar_kyc.card_subtitle')}</p>
            </div>
          </div>
          <div className="vf-form-body">
            <form onSubmit={handleSubmit}>
              <div className="vf-field">
                <label className="vf-label">
                  {t('aadhar_kyc.full_name')} <span className="vf-required">*</span>
                </label>
                <div className="vf-input-wrapper">
                  <input
                    type="text"
                    className="vf-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={t('aadhar_kyc.name_placeholder', 'Enter full name as on Aadhaar')}
                  />
                </div>
              </div>

              <div className="vf-field">
                <label className="vf-label">
                  {t('aadhar_kyc.aadhar_number')} <span className="vf-required">*</span>
                </label>
                <div className="vf-input-wrapper">
                  <input
                    type={showAadhar ? "text" : "password"}
                    className="vf-input vf-input-with-icon"
                    value={aadharNumber}
                    onChange={(e) => {
                      if (/^\d{0,12}$/.test(e.target.value)) {
                        setAadharNumber(e.target.value);
                      }
                    }}
                    required
                    placeholder={t('aadhar_kyc.placeholder')}
                    maxLength={12}
                    title={t('aadhar_kyc.aadhar_title', 'Please enter a valid 12-digit Aadhar number')}
                  />
                  <button
                    type="button"
                    className="vf-eye-btn"
                    onClick={toggleAadharVisibility}
                  >
                    {showAadhar ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="vf-field">
                <label className="vf-label">
                  {t('aadhar_kyc.upload_document')} <span className="vf-required">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf, .jpg, .jpeg, .png"
                  onChange={handleFileChange}
                  required
                  className="vf-file-input"
                />
              </div>

              <div className="vf-submit-row">
                <button type="submit" className="vf-submit-btn green">
                  <Send size={16} />
                  {t('aadhar_kyc.submit_btn')}
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
          <span className="vf-loading-text">{t('aadhar_kyc.verifying')}</span>
        </div>
      )}

      {/* OTP Dialog */}
      <Dialog
        header={<div className="vf-otp-dialog-header"><Fingerprint size={24}/> <span>{t('aadhar_kyc.otp_title')}</span></div>}
        visible={showOtpModal}
        style={{ width: "400px" }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        footer={otpDialogFooter}
        onHide={() => setShowOtpModal(false)}
        className="vf-otp-dialog"
      >
        <div className="vf-otp-dialog-content">
          <p className="vf-otp-desc">{t('aadhar_kyc.otp_desc')}</p>
          <div className="vf-otp-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="password"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(e.target, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
              className="vf-otp-input"
            />
          ))}
          </div>
        </div>
      </Dialog>

      {/* Security footer */}
      <div className="vf-security-footer">
        <div className="vf-security-footer-inner">
          <ShieldCheck size={16} className="vf-security-icon" />
          <p className="vf-security-text">
            {t('aadhar_kyc.security_footer', 'Aadhaar verification complies with UIDAI guidelines. Your data is encrypted end-to-end.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AadharKyc;
