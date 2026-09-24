import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import generatePDF, { Margin } from "react-to-pdf";
import ReactToPrint from "react-to-print";
import {
  FileCheck,
  Printer,
  Download,
  ArrowLeft,
  Check,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import "../shared/VerificationForm.css";
import "./FormGeneration.css";

const FormGeneration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state || { firstName: "Customer", lastName: "" };
  const currentDate = new Date().toLocaleDateString('en-GB');
  const [appId] = useState(Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const componentRef = useRef();

  const handleBack = () => {
    navigate("/customer");
  };

  return (
    <div className="vf-page">
      {/* Page Header */}
      <div className="vf-page-header vf-gradient-blue">
        <div className="vf-page-header-content">
          <div className={`vf-header-text ${mounted ? "mounted" : ""}`}>
            <div className="vf-header-badge">
              <FileCheck size={14} />
              <span>Document Center</span>
            </div>
            <h1 className="vf-header-title">{t('form_generation.title')}</h1>
            <p className="vf-header-desc">
              {t('form_generation.desc')} {formData.firstName} {formData.lastName}.
              Review the details below and proceed to print or download the official document.
            </p>
          </div>
        </div>
        <div className="vf-header-bg">
          <div className="vf-header-orb vf-header-orb-1" />
          <div className="vf-header-orb vf-header-orb-2" />
        </div>
      </div>

      <div className="fg-main-container">
        {/* Action Toolbar */}
        <div className="fg-toolbar">
          <button className="fg-action-btn back" onClick={handleBack}>
            <ArrowLeft size={16} />
            <span>{t('form_generation.back_customer')}</span>
          </button>

          <div className="fg-toolbar-right">
            <ReactToPrint
              trigger={() => (
                <button className="fg-action-btn print">
                  <Printer size={16} />
                  <span>{t('form_generation.print')}</span>
                </button>
              )}
              content={() => componentRef.current}
            />

            <button
              className="fg-action-btn download"
              onClick={() =>
                generatePDF(componentRef, {
                  filename: `KCC_Application_${formData.firstName}.pdf`,
                  page: {
                    margin: Margin.MEDIUM,
                    format: "A4",
                    orientation: "portrait",
                  },
                })
              }
            >
              <Download size={16} />
              <span>{t('form_generation.download')}</span>
            </button>

            <button
              className="fg-action-btn proceed"
              style={{ backgroundColor: "#10b981", color: "white", border: "none" }}
              onClick={() => {
                navigate("/customer/loan-calculator", {
                  state: {
                    landArea: formData.landArea || 2.5,
                    cropType: formData.cropType || "Paddy",
                    cropHistory: formData.cropHistory || [],
                    farmScore: formData.farmScore || 75
                  }
                });
              }}
            >
              <span>{t('form_generation.proceed_calc')}</span>
            </button>
          </div>
        </div>

        {/* Document Preview Area */}
        <div className="fg-preview-area">
          <div className="fg-document-paper" ref={componentRef}>
            {/* Real Form Content */}
            <div className="fg-doc-content">
              <div className="fg-bank-header">
                <div className="fg-bank-line">Name of Bank: <span className={formData.bankName ? "fg-data-highlight" : "fg-dots"}>{formData.bankName || "........................................................."}</span></div>
                <div className="fg-bank-line">{t('form_generation.branch_name')} <span className={formData.branchName ? "fg-data-highlight" : "fg-dots"}>{formData.branchName || "........................................................."}</span></div>
              </div>

              <div className="fg-to-section">
                <p>To,</p>
                <p>The Branch Manager</p>
                <p><span className="fg-dots">.........................................................</span></p>
              </div>

              <h2 className="fg-doc-title">
                {t('form_generation.doc_title')}
              </h2>

              <div className="fg-section-title">{t('form_generation.office_use')}</div>
              <div className="fg-table-wrapper">
                <table className="fg-table">
                  <thead>
                    <tr>
                      <th style={{ width: "30%" }}>Application SL.NO.</th>
                      <th style={{ width: "20%" }}>Category</th>
                      <th style={{ width: "16%" }}>SF</th>
                      <th style={{ width: "16%" }}>MF</th>
                      <th style={{ width: "20%" }}>Others</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: "center", fontWeight: "700" }}>{appId}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="fg-section-title">
                {t('form_generation.type_of_kcc')}
                <span className="fg-section-note">(Please tick <Check size={12} strokeWidth={3} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> the appropriate box)</span>
              </div>
              <div className="fg-table-wrapper">
                <table className="fg-table">
                  <thead>
                    <tr>
                      <th><div className="fg-checkbox-row"><div className="fg-box" /> <span>{t('form_generation.fresh_kcc')}</span></div></th>
                      <th><div className="fg-checkbox-row"><div className="fg-box" /> <span>{t('form_generation.enhance_limit')}</span></div></th>
                      <th><div className="fg-checkbox-row"><div className="fg-box" /> <span>{t('form_generation.activate_kcc')}</span></div></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: '600' }}>{t('form_generation.amount_required')}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="fg-section-title">{t('form_generation.particulars')}</div>
              <div className="fg-table-wrapper">
                <table className="fg-table">
                  <tbody>
                    <tr>
                      <td style={{ width: "30%", fontWeight: '600' }}>Name of the Applicant</td>
                      <td colSpan={5} className="fg-data-highlight">{formData.firstName} {formData.middleName || ""} {formData.lastName}</td>
                    </tr>
                    {formData.employmentType && (
                      <tr>
                        <td style={{ fontWeight: '600' }}>Occupation / Employment</td>
                        <td colSpan={5} style={{ fontSize: '12px' }}>
                          {formData.employmentType === 'salaried'
                            ? `Salaried - ${formData.employerName || 'Employer'} (${formData.employerType || 'General'}) | Net Salary: ₹${Number(formData.netSalary || 0).toLocaleString('en-IN')}/mo | Mode: ${formData.modeOfSalary || 'Bank'}`
                            : `Self-Employed - ${formData.businessName || 'Enterprise'} (${formData.natureOfBusiness || 'Business'}) | Turnover: ₹${Number(formData.annualTurnover || 0).toLocaleString('en-IN')} | Profit: ₹${Number(formData.netProfit || 0).toLocaleString('en-IN')}`}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ fontWeight: '600' }}>Account No (PM Kisan Beneficiary) *</td>
                      <td colSpan={5} className="fg-data-highlight">{formData.accountNumber || ""}</td>
                    </tr>
                    <tr>
                      <td rowSpan="4" className="fg-small-text">
                        If not covered under PMSBY and PMJJBY, Consent for Auto Debit for coverage under these two schemes.
                      </td>
                      <td style={{ width: "18%", fontWeight: '600', fontSize: '11px' }}>Name of Scheme</td>
                      <td style={{ width: "16%", fontWeight: '600', fontSize: '11px' }}>Annual Premium</td>
                      <td style={{ width: "16%", fontWeight: '600', fontSize: '11px' }}>Sum Assured</td>
                      <td colSpan="2" style={{ fontWeight: '600', fontSize: '11px', textAlign: 'center' }}>Consent</td>
                    </tr>
                    <tr>
                      <td>PMSBY</td>
                      <td>Rs.12/-</td>
                      <td>Rs.2 lakh</td>
                      <td><div className="fg-checkbox-row sm"><div className="fg-box" /> <span>Yes</span></div></td>
                      <td><div className="fg-checkbox-row sm"><div className="fg-box" /> <span>No</span></div></td>
                    </tr>
                    <tr>
                      <td>PMJJBY</td>
                      <td>Rs.330/-</td>
                      <td>Rs.2 lakh</td>
                      <td><div className="fg-checkbox-row sm"><div className="fg-box" /> <span>Yes</span></div></td>
                      <td><div className="fg-checkbox-row sm"><div className="fg-box" /> <span>No</span></div></td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="fg-info-note">
                        Amount to be debited: Rs.12/- per annum for PMSBY and Rs.330/- per annum for PMJJBY
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="fg-foot-note">* The KYC and other details will be accessed from this account.</div>
              </div>

              <div className="fg-section-title">D. Details of existing loans, if any:</div>
              <div className="fg-table-wrapper">
                <table className="fg-table">
                  <thead>
                    <tr>
                      <th style={{ width: "30%" }}>Bank / Sources</th>
                      <th style={{ width: "20%" }}>Branch Name</th>
                      <th style={{ width: "15%" }}>Facility</th>
                      <th style={{ width: "15%" }}>Outstanding</th>
                      <th style={{ width: "20%" }}>Overdues</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td height="30"></td><td></td><td></td><td></td><td></td></tr>
                  </tbody>
                </table>
              </div>

              <div className="fg-section-title">E. Particulars of total land holdings and crops:</div>
              <div className="fg-table-wrapper">
                <table className="fg-table">
                  <thead>
                    <tr>
                      <th rowSpan="2">Village</th>
                      <th rowSpan="2">Survey No.</th>
                      <th colSpan="3">Title Status</th>
                      <th rowSpan="2">Area (Acres)</th>
                      <th colSpan="3">Crops to be Grown</th>
                    </tr>
                    <tr>
                      <th>Owned</th>
                      <th>Leased</th>
                      <th>Share</th>
                      <th>Kharif</th>
                      <th>Rabi</th>
                      <th>Other</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td height="40"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                  </tbody>
                </table>
              </div>

              <div className="fg-section-title">F. KCC to Fisheries and Animal Husbandry Farmers:</div>
              <div className="fg-table-wrapper">
                <table className="fg-table">
                  <thead>
                    <tr>
                      <th>Village</th>
                      <th>Dairy Animals</th>
                      <th>Sheep / Goat</th>
                      <th>Pigs</th>
                      <th>Poultry</th>
                      <th>Others</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td height="30"></td><td></td><td></td><td></td><td></td><td></td></tr>
                  </tbody>
                </table>
              </div>

              <div className="fg-section-title">G. Declaration & Acknowledgement:</div>
              <div className="fg-declaration-box">
                <p>
                  I/We hereby declare that all information furnished is true and complete. I/We undertake to abide by terms
                  and conditions of the Bank. I/We declare that I/We have not availed KCC from any other Bank Branch.
                </p>
                <div className="fg-signature-row">
                  <div className="fg-sig-line">Signature / Thumb impression of Borrower(s)</div>
                </div>
              </div>

              <div className="fg-ack-section">
                <div className="fg-ack-title">ACKNOWLEDGEMENT</div>
                <p className="fg-ack-text">
                  Received the loan application from Shri/Smt <span className="fg-data-field">{formData.firstName} {formData.lastName}</span> residence of
                  <span className="fg-dots">...................................................................................................</span>
                  on <span className="fg-data-field">{currentDate}</span> for the purpose of opening KCC account.
                </p>
              </div>

              <div className="fg-footer-row">
                <div className="fg-date-col">Date: <span className="fg-data-field">{currentDate}</span></div>
                <div className="fg-sign-col">Signature of Officer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security footer */}
      <div className="vf-security-footer">
        <div className="vf-security-footer-inner">
          <ShieldCheck size={16} className="vf-security-icon" />
          <p className="vf-security-text">
            Official document generation is encrypted. All generated IDs are logged for compliance monitoring.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormGeneration;
