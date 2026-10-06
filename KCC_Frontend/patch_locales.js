const fs = require('fs');
const path = require('path');

const locales = ['en', 'hi', 'kn', 'ta', 'te'];
const extraKeys = {
  "aadhaar_kyc": "AADHAAR KYC",
  "uidai_bio_match": "UIDAI Bio-Match 98%",
  "pan_card": "PAN CARD",
  "nsdl_tax_verified": "NSDL Tax Verified",
  "bank_nach": "BANK NACH",
  "ifsc_code": "IFSC: ",
  "verified_cadastral_boundary": "Verified Cadastral Boundary (Bhoomi / Revenue GIS)",
  "gps_polygons_match": "GPS Polygons Match",
  "survey_number": "Survey Number",
  "verified_area": "Verified Area",
  "primary_crop": "Primary Crop",
  "irrigation_soil": "Irrigation & Soil",
  "canal_red_loamy": "Canal • Red Loamy",
  "base_crop_loan_prefix": "Base Crop Loan (",
  "base_crop_loan_suffix": " @ ₹50,000/ac)",
  "post_harvest_expenses": "+ 10% Post-Harvest & Household Expenses",
  "farm_asset_maintenance": "+ 20% Farm Asset Maintenance & Repairs",
  "max_kcc_limit": "Maximum Permissible KCC Limit",
  "proposed_sanction_amount": "Proposed / Approved Sanction Amount (₹ INR):",
  "remarks_placeholder": "Enter underwriter assessment, verification notes, or reasons for approval/rejection...",
  "remark_all_verified": "All Land & KYC Documents Verified",
  "remark_field_inspection": "Field inspection recommended for crop boundary",
  "remark_cibil_clean": "Satisfactory CIBIL score & clean repayment track",
  "remark_high_leverage": "High existing leverage - reduced sanction limit recommended",
  "remark_survey_match": "Survey coordinates match satellite cadastral plot",
  "last_decision_by": "Last decision by Officer ID #",
  "on_date": " on ",
  "bank_lead_office": "STATE BANK OF INDIA • LEAD BANK MANDYA",
  "sanction_advice_title": "KISAN CREDIT CARD (KCC) IN-PRINCIPLE SANCTION ADVICE",
  "scheme_under_ministry": "Scheme under Ministry of Agriculture & Farmers Welfare, Govt of India",
  "sanction_reference": "Sanction Reference:",
  "sanction_date": "Sanction Date:",
  "borrower_name": "Borrower Name:",
  "contact_number": "Contact Number:",
  "revenue_survey_no": "Revenue Survey No:",
  "sanctioned_land_area": "Sanctioned Land Area:",
  "total_sanctioned_limit": "TOTAL SANCTIONED CREDIT LIMIT:",
  "limit_breakdown_desc": "(Rupees Fifty Thousand per acre base + 10% post harvest + 20% maintenance)",
  "key_terms_title": "Key Terms & Interest Subvention:",
  "term_interest_rate": "Interest rate applicable: 7.00% p.a. as per Govt. of India Interest Subvention Scheme.",
  "term_prompt_repayment": "Additional 3.00% prompt repayment incentive brings effective interest to ",
  "term_effective_interest": "4.00% p.a.",
  "term_rupay_card": "Rupay KCC debit card will be issued for ATM cash withdrawals and PoS seed/fertilizer purchases.",
  "term_validity": "Valid for 5 years subject to annual credit line review.",
  "digital_officer_seal": "Digital Officer Seal:",
  "branch_credit_manager": "Branch Credit Manager",
  "mandya_lead_office": "Mandya Agricultural Lead Office",
  "print_sanction_note": "Print Sanction Note",
  "done_button": "Done",
  "application_id": "Application ID: ",
  "close_drawer": "Close drawer"
};

const hiTranslations = {
  ...extraKeys,
  "aadhaar_kyc": "आधार KYC",
  "uidai_bio_match": "UIDAI बायो-मैच 98%",
  "pan_card": "पैन कार्ड",
  "nsdl_tax_verified": "NSDL टैक्स सत्यापित",
  "bank_nach": "बैंक NACH",
  "ifsc_code": "IFSC: ",
  "verified_cadastral_boundary": "सत्यापित भूकर सीमा (भूमि / राजस्व GIS)",
  "gps_polygons_match": "GPS पॉलीगॉन मैच",
  "survey_number": "सर्वेक्षण संख्या",
  "verified_area": "सत्यापित क्षेत्र",
  "primary_crop": "मुख्य फसल",
  "irrigation_soil": "सिंचाई और मिट्टी",
  "canal_red_loamy": "नहर • लाल दोमट",
  "base_crop_loan_prefix": "बेस फसल ऋण (",
  "base_crop_loan_suffix": " @ ₹50,000/एकड़)",
  "post_harvest_expenses": "+ 10% फसल कटाई के बाद और घरेलू खर्च",
  "farm_asset_maintenance": "+ 20% कृषि संपत्ति रखरखाव और मरम्मत",
  "max_kcc_limit": "अधिकतम अनुमेय KCC सीमा",
  "proposed_sanction_amount": "प्रस्तावित / स्वीकृत राशि (₹ INR):",
  "remarks_placeholder": "अंडरराइटर मूल्यांकन, सत्यापन नोट्स, या अनुमोदन/अस्वीकृति के कारण दर्ज करें...",
  "remark_all_verified": "सभी भूमि और KYC दस्तावेज़ सत्यापित",
  "remark_field_inspection": "फसल सीमा के लिए फील्ड निरीक्षण की सिफारिश की गई",
  "remark_cibil_clean": "संतोषजनक CIBIL स्कोर और साफ पुनर्भुगतान ट्रैक",
  "remark_high_leverage": "उच्च मौजूदा लीवरेज - कम स्वीकृति सीमा की सिफारिश की गई",
  "remark_survey_match": "सर्वेक्षण निर्देशांक उपग्रह कैडस्ट्राल प्लॉट से मेल खाते हैं",
  "last_decision_by": "अधिकारी ID # द्वारा अंतिम निर्णय ",
  "on_date": " को ",
  "bank_lead_office": "भारतीय स्टेट बैंक • लीड बैंक मंड्या",
  "sanction_advice_title": "किसान क्रेडिट कार्ड (KCC) सैद्धांतिक स्वीकृति सलाह",
  "scheme_under_ministry": "कृषि और किसान कल्याण मंत्रालय, भारत सरकार के तहत योजना",
  "sanction_reference": "स्वीकृति संदर्भ:",
  "sanction_date": "स्वीकृति तिथि:",
  "borrower_name": "उधारकर्ता का नाम:",
  "contact_number": "संपर्क नंबर:",
  "revenue_survey_no": "राजस्व सर्वेक्षण संख्या:",
  "sanctioned_land_area": "स्वीकृत भूमि क्षेत्र:",
  "total_sanctioned_limit": "कुल स्वीकृत क्रेडिट सीमा:",
  "limit_breakdown_desc": "(रुपये पचास हजार प्रति एकड़ बेस + 10% फसल के बाद + 20% रखरखाव)",
  "key_terms_title": "मुख्य शर्तें और ब्याज सहायता:",
  "term_interest_rate": "लागू ब्याज दर: 7.00% प्रति वर्ष (भारत सरकार की ब्याज सहायता योजना के अनुसार)।",
  "term_prompt_repayment": "अतिरिक्त 3.00% शीघ्र पुनर्भुगतान प्रोत्साहन प्रभावी ब्याज को बनाता है ",
  "term_effective_interest": "4.00% प्रति वर्ष",
  "term_rupay_card": "ATM नकद निकासी और PoS बीज/उर्वरक खरीद के लिए रुपे KCC डेबिट कार्ड जारी किया जाएगा।",
  "term_validity": "वार्षिक क्रेडिट लाइन समीक्षा के अधीन 5 वर्षों के लिए वैध।",
  "digital_officer_seal": "डिजिटल अधिकारी की मुहर:",
  "branch_credit_manager": "शाखा ऋण प्रबंधक",
  "mandya_lead_office": "मंड्या कृषि लीड कार्यालय",
  "print_sanction_note": "स्वीकृति नोट प्रिंट करें",
  "done_button": "हो गया",
  "application_id": "आवेदन ID: ",
  "close_drawer": "दराज बंद करें"
};

const knTranslations = {
  ...extraKeys,
  "aadhaar_kyc": "ಆಧಾರ್ KYC",
  "pan_card": "ಪ್ಯಾನ್ ಕಾರ್ಡ್",
  "bank_nach": "ಬ್ಯಾಂಕ್ NACH",
  "ifsc_code": "IFSC: ",
  "verified_cadastral_boundary": "ಪರಿಶೀಲಿಸಿದ ಗಡಿ (ಭೂಮಿ / ಕಂದಾಯ GIS)",
  "survey_number": "ಸರ್ವೆ ಸಂಖ್ಯೆ",
  "verified_area": "ಪರಿಶೀಲಿಸಿದ ಪ್ರದೇಶ",
  "primary_crop": "ಮುಖ್ಯ ಬೆಳೆ",
  "irrigation_soil": "ನೀರಾವರಿ ಮತ್ತು ಮಣ್ಣು",
  "max_kcc_limit": "ಗರಿಷ್ಠ KCC ಮಿತಿ",
  "sanction_advice_title": "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC) ಮಂಜೂರಾತಿ"
};

const taTranslations = {
  ...extraKeys,
  "aadhaar_kyc": "ஆதார் KYC",
  "pan_card": "பான் கார்டு",
  "bank_nach": "வங்கி NACH",
  "ifsc_code": "IFSC: ",
  "verified_cadastral_boundary": "சரிபார்க்கப்பட்ட எல்லை",
  "survey_number": "சர்வே எண்",
  "verified_area": "சரிபார்க்கப்பட்ட பகுதி",
  "primary_crop": "முக்கிய பயிர்",
  "max_kcc_limit": "அதிகபட்ச KCC வரம்பு"
};

const teTranslations = {
  ...extraKeys,
  "aadhaar_kyc": "ఆధార్ KYC",
  "pan_card": "పాన్ కార్డ్",
  "bank_nach": "బ్యాంక్ NACH",
  "ifsc_code": "IFSC: ",
  "verified_cadastral_boundary": "ధృవీకరించబడిన సరిహద్దు",
  "survey_number": "సర్వే సంఖ్య",
  "verified_area": "ధృవీకరించబడిన విస్తీర్ణం",
  "primary_crop": "ప్రధాన పంట",
  "max_kcc_limit": "గరిష్ట KCC పరిమితి"
};

const translate = (lang) => {
  if (lang === 'en') return extraKeys;
  if (lang === 'hi') return hiTranslations;
  if (lang === 'kn') return knTranslations;
  if (lang === 'ta') return taTranslations;
  if (lang === 'te') return teTranslations;
  return extraKeys; 
};

locales.forEach(lang => {
  const filePath = path.join(__dirname, 'src/locales', lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.admin) data.admin = {};
    if (!data.admin.dossier) data.admin.dossier = {};
    Object.assign(data.admin.dossier, translate(lang));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}`);
  }
});
