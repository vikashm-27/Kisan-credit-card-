const fs = require('fs');
const file = 'D:\\WORK\\KCC_work\\Kisan Credit Card\\KCC_Frontend\\src\\components\\Pages\\Admin\\Admin.jsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  // Header
  ['<h1 className="admin-heading">Bank Officer Underwriting & Loan Management</h1>', '<h1 className="admin-heading">{t(\'admin.header.title\')}</h1>'],
  ['<span>Kisan Credit Card (KCC) Lead Origination & Underwriting Portal</span>', '<span>{t(\'admin.header.subtitle\')}</span>'],
  ['Mandya Branch Lead Office', '{t(\'admin.header.branch_office\')}'],
  ['<span>{refreshing ? "Refreshing..." : "Refresh Queue"}</span>', '<span>{refreshing ? t(\'admin.header.refresh_queue\') : t(\'admin.header.refresh_queue\')}</span>'],

  // KPIs
  ['<span className="admin-kpi-card-label">Total Applications</span>', '<span className="admin-kpi-card-label">{t(\'admin.kpi.total_applications\')}</span>'],
  ['<span>All branch submissions</span>', '<span>{t(\'admin.kpi.total_desc\')}</span>'],
  ['<span className="admin-kpi-card-label">Pending Underwriting</span>', '<span className="admin-kpi-card-label">{t(\'admin.kpi.pending_underwriting\')}</span>'],
  ['<span className="admin-kpi-accent-pill admin-kpi-pill-amber">Action Needed</span>', '<span className="admin-kpi-accent-pill admin-kpi-pill-amber">{t(\'admin.kpi.action_needed\')}</span>'],
  ['<span>Awaiting credit decision</span>', '<span>{t(\'admin.kpi.pending_desc\')}</span>'],
  ['<span className="admin-kpi-card-label">Total Sanctioned Limit</span>', '<span className="admin-kpi-card-label">{t(\'admin.kpi.total_sanctioned\')}</span>'],
  ['<span>Disbursed KCC lines</span>', '<span>{t(\'admin.kpi.sanctioned_desc\')}</span>'],
  ['<span className="admin-kpi-card-label">Approval Ratio</span>', '<span className="admin-kpi-card-label">{t(\'admin.kpi.approval_ratio\')}</span>'],
  ['<span>Underwriting efficiency</span>', '<span>{t(\'admin.kpi.approval_desc\')}</span>'],

  // Filters
  ['<span>All Applications</span>', '<span>{t(\'admin.filters.all\')}</span>'],
  ['<span>Pending Review</span>', '<span>{t(\'admin.filters.pending\')}</span>'],
  ['<span>Under Review</span>', '<span>{t(\'admin.filters.under_review\')}</span>'],
  ['<span>Approved</span>', '<span>{t(\'admin.filters.approved\')}</span>'],
  ['<span>Flagged</span>', '<span>{t(\'admin.filters.flagged\')}</span>'],
  ['<span>Rejected</span>', '<span>{t(\'admin.filters.rejected\')}</span>'],
  ['placeholder="Search by farmer, phone, survey #, crop..."', 'placeholder={t(\'admin.filters.search_placeholder\')}'],

  // Table Headers
  ['<th>Applicant Farmer</th>', '<th>{t(\'admin.table.headers.applicant\')}</th>'],
  ['<th>Survey & Land Area</th>', '<th>{t(\'admin.table.headers.survey\')}</th>'],
  ['<th>Crop & Season</th>', '<th>{t(\'admin.table.headers.crop\')}</th>'],
  ['<th>CIBIL Score</th>', '<th>{t(\'admin.table.headers.cibil\')}</th>'],
  ['<th>Sanction Limit</th>', '<th>{t(\'admin.table.headers.limit\')}</th>'],
  ['<th>Decision Status</th>', '<th>{t(\'admin.table.headers.status\')}</th>'],
  ['<th className="text-right">Action</th>', '<th className="text-right">{t(\'admin.table.headers.action\')}</th>'],

  // Table specifics
  ['{`${(parseFloat(app.landAreaAcres) || 0).toFixed(2)} Acres`}', '{`${(parseFloat(app.landAreaAcres) || 0).toFixed(2)} ${t(\'admin.table.acres\')}`}'],
  ['Scale: ₹50,000 / Acre', '{t(\'admin.table.scale\')}: ₹50,000 / {t(\'admin.table.per_acre\')}'],
  ['<span>Review</span>', '<span>{t(\'admin.table.review_btn\')}</span>'],

  // Update getStatusBadge usage
  ['const statusInfo = getStatusBadge(app.applicationStatus);', 'const statusInfo = getStatusBadge(app.applicationStatus, t);']
];

for (const [search, replace] of replacements) {
  content = content.replaceAll(search, replace);
}

// Special badge replacements
content = content.replace(
  '{kpis.approvedCount} Sanctioned',
  '{kpis.approvedCount} {t(\'admin.kpi.sanctioned_badge\')}'
);

content = content.replace(
  '{kpis.approvedCount} Appr / {kpis.rejectedCount} Rej',
  '{kpis.approvedCount} {t(\'admin.kpi.approval_badge\').split(\' / \')[0]} / {kpis.rejectedCount} {t(\'admin.kpi.approval_badge\').split(\' / \')[1]}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done refactoring Admin.jsx');
