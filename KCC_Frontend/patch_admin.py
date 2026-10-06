import re

path = r'D:\WORK\KCC_work\Kisan Credit Card\KCC_Frontend\src\components\Pages\Admin\Admin.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (r'<span>AADHAAR KYC</span>', r'<span>{t("admin.dossier.aadhaar_kyc")}</span>'),
    (r'UIDAI Bio-Match 98%', r'{t("admin.dossier.uidai_bio_match")}'),
    (r'<span>PAN CARD</span>', r'<span>{t("admin.dossier.pan_card")}</span>'),
    (r'NSDL Tax Verified', r'{t("admin.dossier.nsdl_tax_verified")}'),
    (r'<span>BANK NACH</span>', r'<span>{t("admin.dossier.bank_nach")}</span>'),
    (r'IFSC:\s*', r'{t("admin.dossier.ifsc_code")}'),
    (r'Verified Cadastral Boundary \(Bhoomi / Revenue GIS\)', r'{t("admin.dossier.verified_cadastral_boundary")}'),
    (r'GPS Polygons Match', r'{t("admin.dossier.gps_polygons_match")}'),
    (r'<div className="cadastral-label">Survey Number</div>', r'<div className="cadastral-label">{t("admin.dossier.survey_number")}</div>'),
    (r'<div className="cadastral-label">Verified Area</div>', r'<div className="cadastral-label">{t("admin.dossier.verified_area")}</div>'),
    (r'<div className="cadastral-label">Primary Crop</div>', r'<div className="cadastral-label">{t("admin.dossier.primary_crop")}</div>'),
    (r'<div className="cadastral-label">Irrigation & Soil</div>', r'<div className="cadastral-label">{t("admin.dossier.irrigation_soil")}</div>'),
    (r'Canal • Red Loamy', r'{t("admin.dossier.canal_red_loamy")}'),
    (r'<span>Base Crop Loan \(', r'<span>{t("admin.dossier.base_crop_loan_prefix")}'),
    (r' @ ₹50,000/ac\)</span>', r'{t("admin.dossier.base_crop_loan_suffix")}</span>'),
    (r'<span>\+ 10% Post-Harvest & Household Expenses</span>', r'<span>{t("admin.dossier.post_harvest_expenses")}</span>'),
    (r'<span>\+ 20% Farm Asset Maintenance & Repairs</span>', r'<span>{t("admin.dossier.farm_asset_maintenance")}</span>'),
    (r'<span>Maximum Permissible KCC Limit</span>', r'<span>{t("admin.dossier.max_kcc_limit")}</span>'),
    (r'Proposed / Approved Sanction Amount \(₹ INR\):', r'{t("admin.dossier.proposed_sanction_amount")}'),
    (r'placeholder="Enter underwriter assessment, verification notes, or reasons for approval/rejection..."', r'placeholder={t("admin.dossier.remarks_placeholder")}'),
    (r'"All Land & KYC Documents Verified"', r't("admin.dossier.remark_all_verified")'),
    (r'"Field inspection recommended for crop boundary"', r't("admin.dossier.remark_field_inspection")'),
    (r'"Satisfactory CIBIL score & clean repayment track"', r't("admin.dossier.remark_cibil_clean")'),
    (r'"High existing leverage - reduced sanction limit recommended"', r't("admin.dossier.remark_high_leverage")'),
    (r'"Survey coordinates match satellite cadastral plot"', r't("admin.dossier.remark_survey_match")'),
    (r'Last decision by Officer ID #', r'{t("admin.dossier.last_decision_by")}'),
    (r' on \{" "', r'{t("admin.dossier.on_date")}{" "'),
    (r'<span>STATE BANK OF INDIA • LEAD BANK MANDYA</span>', r'<span>{t("admin.dossier.bank_lead_office")}</span>'),
    (r'KISAN CREDIT CARD \(KCC\) IN-PRINCIPLE SANCTION ADVICE', r'{t("admin.dossier.sanction_advice_title")}'),
    (r'Scheme under Ministry of Agriculture & Farmers Welfare, Govt of India', r'{t("admin.dossier.scheme_under_ministry")}'),
    (r'<strong>Sanction Reference:</strong>', r'<strong>{t("admin.dossier.sanction_reference")}</strong>'),
    (r'<strong>Sanction Date:</strong>', r'<strong>{t("admin.dossier.sanction_date")}</strong>'),
    (r'<strong>Borrower Name:</strong>', r'<strong>{t("admin.dossier.borrower_name")}</strong>'),
    (r'<strong>Contact Number:</strong>', r'<strong>{t("admin.dossier.contact_number")}</strong>'),
    (r'<strong>Revenue Survey No:</strong>', r'<strong>{t("admin.dossier.revenue_survey_no")}</strong>'),
    (r'<strong>Sanctioned Land Area:</strong>', r'<strong>{t("admin.dossier.sanctioned_land_area")}</strong>'),
    (r'<div className="sanction-limit-label">TOTAL SANCTIONED CREDIT LIMIT:</div>', r'<div className="sanction-limit-label">{t("admin.dossier.total_sanctioned_limit")}</div>'),
    (r'\(Rupees Fifty Thousand per acre base \+ 10% post harvest \+ 20% maintenance\)', r'{t("admin.dossier.limit_breakdown_desc")}'),
    (r'<h4 className="sanction-terms-title">Key Terms & Interest Subvention:</h4>', r'<h4 className="sanction-terms-title">{t("admin.dossier.key_terms_title")}</h4>'),
    (r'Interest rate applicable: 7\.00% p\.a\. as per Govt\. of India Interest Subvention Scheme\.', r'{t("admin.dossier.term_interest_rate")}'),
    (r'Additional 3\.00% prompt repayment incentive brings effective interest to', r'{t("admin.dossier.term_prompt_repayment")}'),
    (r'<strong>4\.00% p\.a\.</strong>', r'<strong>{t("admin.dossier.term_effective_interest")}</strong>'),
    (r'Rupay KCC debit card will be issued for ATM cash withdrawals and PoS seed/fertilizer purchases\.', r'{t("admin.dossier.term_rupay_card")}'),
    (r'Valid for 5 years subject to annual credit line review\.', r'{t("admin.dossier.term_validity")}'),
    (r'<div className="text-12 text-muted">Digital Officer Seal:</div>', r'<div className="text-12 text-muted">{t("admin.dossier.digital_officer_seal")}</div>'),
    (r'<div className="sanction-seal-role">Branch Credit Manager</div>', r'<div className="sanction-seal-role">{t("admin.dossier.branch_credit_manager")}</div>'),
    (r'<div className="text-12 text-muted">Mandya Agricultural Lead Office</div>', r'<div className="text-12 text-muted">{t("admin.dossier.mandya_lead_office")}</div>'),
    (r'<span>Print Sanction Note</span>', r'<span>{t("admin.dossier.print_sanction_note")}</span>'),
    (r'<span>Done</span>', r'<span>{t("admin.dossier.done_button")}</span>'),
    (r'Application ID: <strong>', r'{t("admin.dossier.application_id")}<strong>'),
    (r'title="Close drawer"', r'title={t("admin.dossier.close_drawer")}'),
]

for p, r in replacements:
    content = re.sub(p, r, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Admin.jsx patched.")
