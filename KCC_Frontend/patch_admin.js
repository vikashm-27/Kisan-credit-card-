const fs = require('fs');

const path = 'D:\\WORK\\KCC_work\\Kisan Credit Card\\KCC_Frontend\\src\\components\\Pages\\Admin\\Admin.jsx';

let content = fs.readFileSync(path, 'utf8');

const replacements = [
    [/<span>AADHAAR KYC<\/span>/g, '<span>{t("admin.dossier.aadhaar_kyc")}</span>'],
    [/UIDAI Bio-Match 98%/g, '{t("admin.dossier.uidai_bio_match")}'],
    [/<span>PAN CARD<\/span>/g, '<span>{t("admin.dossier.pan_card")}</span>'],
    [/NSDL Tax Verified/g, '{t("admin.dossier.nsdl_tax_verified")}'],
    [/<span>BANK NACH<\/span>/g, '<span>{t("admin.dossier.bank_nach")}</span>'],
    [/IFSC:\s*/g, '{t("admin.dossier.ifsc_code")}'],
    [/Verified Cadastral Boundary \(Bhoomi \/ Revenue GIS\)/g, '{t("admin.dossier.verified_cadastral_boundary")}'],
    [/GPS Polygons Match/g, '{t("admin.dossier.gps_polygons_match")}'],
    [/<div className="cadastral-label">Survey Number<\/div>/g, '<div className="cadastral-label">{t("admin.dossier.survey_number")}</div>'],
    [/<div className="cadastral-label">Verified Area<\/div>/g, '<div className="cadastral-label">{t("admin.dossier.verified_area")}</div>'],
    [/<div className="cadastral-label">Primary Crop<\/div>/g, '<div className="cadastral-label">{t("admin.dossier.primary_crop")}</div>'],
    [/<div className="cadastral-label">Irrigation & Soil<\/div>/g, '<div className="cadastral-label">{t("admin.dossier.irrigation_soil")}</div>'],
    [/Canal • Red Loamy/g, '{t("admin.dossier.canal_red_loamy")}'],
    [/<span>Base Crop Loan \(/g, '<span>{t("admin.dossier.base_crop_loan_prefix")}'],
    [/ @ ₹50,000\/ac\)<\/span>/g, '{t("admin.dossier.base_crop_loan_suffix")}</span>'],
    [/<span>\+ 10% Post-Harvest & Household Expenses<\/span>/g, '<span>{t("admin.dossier.post_harvest_expenses")}</span>'],
    [/<span>\+ 20% Farm Asset Maintenance & Repairs<\/span>/g, '<span>{t("admin.dossier.farm_asset_maintenance")}</span>'],
    [/<span>Maximum Permissible KCC Limit<\/span>/g, '<span>{t("admin.dossier.max_kcc_limit")}</span>'],
    [/Proposed \/ Approved Sanction Amount \(₹ INR\):/g, '{t("admin.dossier.proposed_sanction_amount")}'],
    [/placeholder="Enter underwriter assessment, verification notes, or reasons for approval\/rejection..."/g, 'placeholder={t("admin.dossier.remarks_placeholder")}'],
    [/"All Land & KYC Documents Verified"/g, 't("admin.dossier.remark_all_verified")'],
    [/"Field inspection recommended for crop boundary"/g, 't("admin.dossier.remark_field_inspection")'],
    [/"Satisfactory CIBIL score & clean repayment track"/g, 't("admin.dossier.remark_cibil_clean")'],
    [/"High existing leverage - reduced sanction limit recommended"/g, 't("admin.dossier.remark_high_leverage")'],
    [/"Survey coordinates match satellite cadastral plot"/g, 't("admin.dossier.remark_survey_match")'],
    [/Last decision by Officer ID #/g, '{t("admin.dossier.last_decision_by")}'],
    [/ on \{" "/g, '{t("admin.dossier.on_date")}{" "'],
    [/<span>STATE BANK OF INDIA • LEAD BANK MANDYA<\/span>/g, '<span>{t("admin.dossier.bank_lead_office")}</span>'],
    [/KISAN CREDIT CARD \(KCC\) IN-PRINCIPLE SANCTION ADVICE/g, '{t("admin.dossier.sanction_advice_title")}'],
    [/Scheme under Ministry of Agriculture & Farmers Welfare, Govt of India/g, '{t("admin.dossier.scheme_under_ministry")}'],
    [/<strong>Sanction Reference:<\/strong>/g, '<strong>{t("admin.dossier.sanction_reference")}</strong>'],
    [/<strong>Sanction Date:<\/strong>/g, '<strong>{t("admin.dossier.sanction_date")}</strong>'],
    [/<strong>Borrower Name:<\/strong>/g, '<strong>{t("admin.dossier.borrower_name")}</strong>'],
    [/<strong>Contact Number:<\/strong>/g, '<strong>{t("admin.dossier.contact_number")}</strong>'],
    [/<strong>Revenue Survey No:<\/strong>/g, '<strong>{t("admin.dossier.revenue_survey_no")}</strong>'],
    [/<strong>Sanctioned Land Area:<\/strong>/g, '<strong>{t("admin.dossier.sanctioned_land_area")}</strong>'],
    [/<div className="sanction-limit-label">TOTAL SANCTIONED CREDIT LIMIT:<\/div>/g, '<div className="sanction-limit-label">{t("admin.dossier.total_sanctioned_limit")}</div>'],
    [/\(Rupees Fifty Thousand per acre base \+ 10% post harvest \+ 20% maintenance\)/g, '{t("admin.dossier.limit_breakdown_desc")}'],
    [/<h4 className="sanction-terms-title">Key Terms & Interest Subvention:<\/h4>/g, '<h4 className="sanction-terms-title">{t("admin.dossier.key_terms_title")}</h4>'],
    [/Interest rate applicable: 7\.00% p\.a\. as per Govt\. of India Interest Subvention Scheme\./g, '{t("admin.dossier.term_interest_rate")}'],
    [/Additional 3\.00% prompt repayment incentive brings effective interest to/g, '{t("admin.dossier.term_prompt_repayment")}'],
    [/<strong>4\.00% p\.a\.<\/strong>/g, '<strong>{t("admin.dossier.term_effective_interest")}</strong>'],
    [/Rupay KCC debit card will be issued for ATM cash withdrawals and PoS seed\/fertilizer purchases\./g, '{t("admin.dossier.term_rupay_card")}'],
    [/Valid for 5 years subject to annual credit line review\./g, '{t("admin.dossier.term_validity")}'],
    [/<div className="text-12 text-muted">Digital Officer Seal:<\/div>/g, '<div className="text-12 text-muted">{t("admin.dossier.digital_officer_seal")}</div>'],
    [/<div className="sanction-seal-role">Branch Credit Manager<\/div>/g, '<div className="sanction-seal-role">{t("admin.dossier.branch_credit_manager")}</div>'],
    [/<div className="text-12 text-muted">Mandya Agricultural Lead Office<\/div>/g, '<div className="text-12 text-muted">{t("admin.dossier.mandya_lead_office")}</div>'],
    [/<span>Print Sanction Note<\/span>/g, '<span>{t("admin.dossier.print_sanction_note")}</span>'],
    [/<span>Done<\/span>/g, '<span>{t("admin.dossier.done_button")}</span>'],
    [/Application ID: <strong>/g, '{t("admin.dossier.application_id")}<strong>'],
    [/title="Close drawer"/g, 'title={t("admin.dossier.close_drawer")}']
];

for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Admin.jsx patched.");
