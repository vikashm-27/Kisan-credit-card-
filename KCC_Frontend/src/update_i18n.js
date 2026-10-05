const fs = require('fs');
const path = require('path');

const localesDir = 'D:\\WORK\\KCC_work\\Kisan Credit Card\\KCC_Frontend\\src\\locales';
const adminTranslations = {
  "admin": {
    "header": {
      "title": "Bank Officer Underwriting & Loan Management",
      "subtitle": "Kisan Credit Card (KCC) Lead Origination & Underwriting Portal",
      "branch_office": "Mandya Branch Lead Office",
      "refresh_queue": "Refresh Queue"
    },
    "kpi": {
      "total_applications": "TOTAL APPLICATIONS",
      "total_desc": "All branch submissions",
      "pending_underwriting": "PENDING UNDERWRITING",
      "action_needed": "Action Needed",
      "pending_desc": "Awaiting credit decision",
      "total_sanctioned": "TOTAL SANCTIONED LIMIT",
      "sanctioned_badge": "Sanctioned",
      "sanctioned_desc": "Disbursed KCC lines",
      "approval_ratio": "APPROVAL RATIO",
      "approval_badge": "Appr / Rej",
      "approval_desc": "Underwriting efficiency"
    },
    "filters": {
      "all": "All Applications",
      "pending": "Pending Review",
      "under_review": "Under Review",
      "approved": "Approved",
      "flagged": "Flagged",
      "rejected": "Rejected",
      "search_placeholder": "Search by farmer, phone, survey #, crop..."
    },
    "table": {
      "headers": {
        "applicant": "APPLICANT FARMER",
        "survey": "SURVEY & LAND AREA",
        "crop": "CROP & SEASON",
        "cibil": "CIBIL SCORE",
        "limit": "SANCTION LIMIT",
        "status": "DECISION STATUS",
        "action": "ACTION"
      },
      "acres": "Acres",
      "scale": "Scale",
      "per_acre": "Acre",
      "review_btn": "Review"
    },
    "status": {
      "submitted": "SUBMITTED",
      "approved": "APPROVED",
      "rejected": "REJECTED",
      "flagged": "FLAGGED"
    }
  }
};

const dirs = fs.readdirSync(localesDir);
dirs.forEach(dir => {
  const tFile = path.join(localesDir, dir, 'translation.json');
  if (fs.existsSync(tFile)) {
    let content = JSON.parse(fs.readFileSync(tFile, 'utf8'));
    content.admin = adminTranslations.admin;
    fs.writeFileSync(tFile, JSON.stringify(content, null, 2), 'utf8');
    console.log(`Updated ${tFile}`);
  }
});
