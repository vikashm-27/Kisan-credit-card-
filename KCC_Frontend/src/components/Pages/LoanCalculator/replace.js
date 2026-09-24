const fs = require('fs');

const path = 'D:/WORK/KCC_work/Kisan Credit Card/KCC_Frontend/src/components/Pages/LoanCalculator/LoanCalculator.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
    '>KISAN SAMRIDDHI • AGRIFINANCE<': '>{t("loan_calculator.brand_title")}<',
    '>Institutional Credit Assessment & Scale of Finance Tool<': '>{t("loan_calculator.brand_subtitle")}<',
    'NABARD FY 24-25 Benchmark': '{t("loan_calculator.nabard_benchmark")}',
    '>Loan Parameters<': '>{t("loan_calculator.loan_parameters")}<',
    '>LIVE CALCULATOR<': '>{t("loan_calculator.live_calculator")}<',
    '>Configure crop type, scale of finance acreage, and borrower credit risk profiling.<': '>{t("loan_calculator.config_desc")}<',
    '>Calculated Year-1 Sanctioned Limit<': '>{t("loan_calculator.limit_title")}<',
    '>Total permissible KCC limit based on selected parameters<': '>{t("loan_calculator.limit_desc")}<',
    '>Fully Eligible<': '>{t("loan_calculator.fully_eligible")}<',
    ' Fully Eligible': ' {t("loan_calculator.fully_eligible")}',
    '>Base Crop Loan (SoF)<': '>{t("loan_calculator.base_crop_loan")}<',
    '>Post-Harvest (10%)<': '>{t("loan_calculator.post_harvest")}<',
    '>Farm Maint. (20%)<': '>{t("loan_calculator.farm_maint")}<',
    '>5-Year Projected<': '>{t("loan_calculator.five_year")}<',
    '>SECTION 01 • AGRICULTURE SPECIFICATIONS<': '>{t("loan_calculator.sec1_title")}<',
    '>Scale of Finance (SoF) aligned<': '>{t("loan_calculator.sec1_sub")}<',
    '>SECTION 02 • UNDERWRITING & INTEREST METRICS<': '>{t("loan_calculator.sec2_title")}<',
    '>2×2 ALIGNED MATRIX<': '>{t("loan_calculator.sec2_sub")}<',
    '>Credit health & yield scoring<': '>{t("loan_calculator.sec2_sub")}<',
    '>Generate Final KYC & Loan Application<': '>{t("loan_calculator.generate_btn")}<',
    '>Validating data...<': '>{t("loan_calculator.validating")}<',
    '>Generating Form...<': '>{t("loan_calculator.generating")}<',
    '"Prime Rating"': 't("loan_calculator.excellent_rating")',
    '"Good Rating"': 't("loan_calculator.good_rating")',
    '"Average Rating"': 't("loan_calculator.fair_rating")',
    '"Needs Attention"': 't("loan_calculator.poor_rating")',
    '"Standard Rating"': 't("loan_calculator.fair_rating")'
};

let original = content;
for (const [k, v] of Object.entries(replacements)) {
    content = content.split(k).join(v);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced:', content !== original);
