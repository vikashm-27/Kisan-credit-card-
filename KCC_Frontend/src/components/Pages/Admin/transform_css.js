const fs = require('fs');
const cssPath = 'D:/WORK/KCC_work/Kisan Credit Card/KCC_Frontend/src/components/Pages/Admin/Admin.css';

let css = fs.readFileSync(cssPath, 'utf8');

// Variable additions
const rootVariables = `:root {
  --admin-bg: #f8fafc;
  --admin-card-bg: #ffffff;
  --admin-text-main: #0f172a;
  --admin-text-muted: #64748b;
  --admin-border: #e2e8f0;
  --admin-border-focus: #3b82f6;
  
  /* Status Colors */
  --status-approved-bg: #ecfdf5;
  --status-approved-text: #047857;
  --status-approved-border: #a7f3d0;
  
  --status-review-bg: #eef2ff;
  --status-review-text: #4338ca;
  --status-review-border: #c7d2fe;
  
  --status-pending-bg: #fffbeb;
  --status-pending-text: #b45309;
  --status-pending-border: #fde68a;
  
  --status-flagged-bg: #fff7ed;
  --status-flagged-text: #c2410c;
  --status-flagged-border: #fed7aa;
  
  --status-rejected-bg: #fef2f2;
  --status-rejected-text: #b91c1c;
  --status-rejected-border: #fecaca;

  /* Theme variables */
  --color-primary-dark: #0f172a;
  --color-primary-emerald: #059669;
  --color-emerald-light: #ecfdf5;
  --color-emerald-border: #a7f3d0;
  --color-emerald-text: #047857;
  --color-danger-bg: #fef2f2;
  --color-danger-border: #fecaca;
  --color-danger-text: #991b1b;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.1);
}`;

css = css.replace(/:root\s*\{[\s\S]*?--status-rejected-border:\s*#fecaca;\n\}/m, rootVariables);

// Standardizing Spacing
css = css.replace(/padding:\s*3px\s*10px;/g, 'padding: 4px 8px;');
css = css.replace(/gap:\s*18px;/g, 'gap: 16px;');
css = css.replace(/margin-bottom:\s*28px;/g, 'margin-bottom: 32px;');
css = css.replace(/padding:\s*20px\s*22px;/g, 'padding: 24px;');
css = css.replace(/margin-bottom:\s*12px;/g, 'margin-bottom: 16px;');
css = css.replace(/margin-left:\s*10px;/g, 'margin-left: 8px;');
css = css.replace(/padding:\s*2px\s*7px;/g, 'padding: 4px 8px;');
css = css.replace(/padding:\s*18px\s*24px;/g, 'padding: 16px 24px;');
css = css.replace(/gap:\s*7px;/g, 'gap: 8px;');
css = css.replace(/padding:\s*1px\s*6px;/g, 'padding: 2px 8px;');
css = css.replace(/padding:\s*9px\s*36px\s*9px\s*38px;/g, 'padding: 8px 32px 8px 40px;');
css = css.replace(/padding:\s*13px\s*20px;/g, 'padding: 12px 24px;');
css = css.replace(/padding:\s*14px\s*20px;/g, 'padding: 16px 24px;');
css = css.replace(/margin-top:\s*2px;/g, 'margin-top: 4px;');
css = css.replace(/gap:\s*6px;/g, 'gap: 8px;');
css = css.replace(/padding:\s*4px\s*10px;/g, 'padding: 4px 8px;');
css = css.replace(/padding:\s*7px\s*14px;/g, 'padding: 8px 16px;');
css = css.replace(/padding:\s*14px\s*24px;/g, 'padding: 16px 24px;');
css = css.replace(/padding:\s*20px\s*24px;/g, 'padding: 24px;');
css = css.replace(/gap:\s*14px;/g, 'gap: 16px;');
css = css.replace(/padding:\s*20px\s*24px\s*40px\s*24px;/g, 'padding: 24px 24px 40px 24px;');
css = css.replace(/gap:\s*22px;/g, 'gap: 24px;');
css = css.replace(/padding:\s*18px;/g, 'padding: 16px;');
css = css.replace(/margin-bottom:\s*14px;/g, 'margin-bottom: 16px;');
css = css.replace(/gap:\s*10px;/g, 'gap: 8px;');
css = css.replace(/padding:\s*10px\s*12px;/g, 'padding: 8px 16px;');
css = css.replace(/padding:\s*14px;/g, 'padding: 16px;');
css = css.replace(/padding:\s*8px\s*10px;/g, 'padding: 8px;');
css = css.replace(/padding:\s*6px\s*0;/g, 'padding: 8px 0;');
css = css.replace(/padding-top:\s*10px;/g, 'padding-top: 8px;');
css = css.replace(/margin-top:\s*4px;/g, 'margin-top: 8px;');
css = css.replace(/padding:\s*18px\s*24px\s*24px\s*24px;/g, 'padding: 16px 24px 24px 24px;');
css = css.replace(/padding:\s*11px\s*14px;/g, 'padding: 12px 16px;');
css = css.replace(/padding:\s*32px\s*36px;/g, 'padding: 32px;');

// Standardizing Typography
css = css.replace(/font-size:\s*10\.5px;/g, 'font-size: 10px;');
css = css.replace(/font-size:\s*11\.5px;/g, 'font-size: 12px;');
css = css.replace(/font-size:\s*12\.5px;/g, 'font-size: 12px;');
css = css.replace(/font-size:\s*13\.5px;/g, 'font-size: 14px;');
css = css.replace(/font-size:\s*11px;/g, 'font-size: 12px;');
css = css.replace(/font-size:\s*13px;/g, 'font-size: 14px;');
css = css.replace(/font-size:\s*15px;/g, 'font-size: 16px;');

// Shadows (replacing harsh 1px borders with drop shadows for cards)
// E.g. .admin-kpi-card
css = css.replace(/border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.4\);/g, 'border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: var(--shadow-card);');
// E.g. .dossier-section
css = css.replace(/border:\s*1px\s*solid\s*#e2e8f0;\n\s*border-radius:\s*14px;\n\s*padding:\s*16px;\n\s*box-shadow:\s*0\s*1px\s*3px\s*rgba\(0,\s*0,\s*0,\s*0\.03\);/g, 'border: 1px solid var(--admin-border);\n  border-radius: 14px;\n  padding: 16px;\n  box-shadow: var(--shadow-card);');

const utilityClasses = `\n
/* Utility Classes for Inline Style Extraction */
.flex-center {
  display: flex;
  align-items: center;
}

.flex-center-gap-8 {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flex-column-center-gap-8 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.p-64-24 {
  padding: 64px 24px;
}

.mt-8 {
  margin-top: 8px;
}

.text-muted {
  color: var(--color-slate-500);
}

.text-danger {
  color: var(--color-danger-text);
}

.font-bold {
  font-weight: 700;
}

.font-extrabold {
  font-weight: 800;
}

.text-12 {
  font-size: 12px;
}

.text-14 {
  font-size: 14px;
}

.text-16 {
  font-size: 16px;
}

.empty-state-text {
  margin: 0;
  font-size: 14px;
  color: var(--color-slate-500);
  max-width: 448px;
}

.cibil-subtext {
  font-size: 12px;
  opacity: 0.85;
}

.sanction-limit-val {
  font-weight: 800;
  color: var(--color-primary-dark);
  font-size: 14px;
}

.feedback-alert {
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.feedback-success {
  background-color: var(--color-emerald-light);
  color: var(--color-emerald-text);
  border: 1px solid var(--color-emerald-border);
}

.feedback-error {
  background-color: var(--color-danger-bg);
  color: var(--color-danger-text);
  border: 1px solid var(--color-danger-border);
}

.cadastral-map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.cadastral-map-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-emerald-border);
  text-transform: uppercase;
}

.cadastral-map-badge {
  font-size: 10px;
  background: var(--color-primary-emerald);
  padding: 4px 8px;
  border-radius: 4px;
}

.cadastral-map-visual {
  height: 96px;
  background: radial-gradient(circle at 50% 50%, var(--color-slate-800) 0%, var(--color-primary-dark) 100%);
  border-radius: 8px;
  border: 1px solid var(--color-slate-700);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cadastral-map-svg {
  position: absolute;
  inset: 0;
}

.text-primary {
  color: var(--color-primary-dark);
}

.officer-sanction-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--admin-border);
}

.officer-sanction-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-slate-700);
  margin-bottom: 8px;
}

.officer-sanction-input {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-emerald-text);
}

.review-meta {
  font-size: 12px;
  color: var(--color-slate-500);
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary-full {
  width: 100%;
  justify-content: center;
  background: var(--color-emerald-light);
  border-color: var(--color-emerald-border);
  color: var(--color-emerald-text);
}

.sanction-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid var(--color-primary-dark);
  padding-bottom: 16px;
}

.sanction-modal-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary-emerald);
  font-weight: 800;
  font-size: 14px;
}

.sanction-modal-title {
  font-size: 20px;
  font-weight: 800;
  margin: 8px 0 0;
  color: var(--color-primary-dark);
}

.sanction-modal-subtitle {
  font-size: 12px;
  color: var(--color-slate-500);
}

.sanction-grid-details {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  font-size: 14px;
  background: var(--admin-bg);
  padding: 16px;
  border-radius: 8px;
}

.sanction-limit-box {
  margin: 24px 0;
  padding: 16px 24px;
  background: var(--color-emerald-light);
  border: 1px solid var(--color-emerald-border);
  border-radius: 12px;
}

.sanction-limit-label {
  font-size: 14px;
  color: var(--color-emerald-text);
  font-weight: 600;
}

.sanction-limit-amount {
  font-size: 32px;
  font-weight: 900;
  color: #065f46;
  margin: 4px 0;
}

.sanction-limit-desc {
  font-size: 12px;
  color: var(--color-emerald-text);
}

.sanction-terms-section {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-slate-700);
}

.sanction-terms-title {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--color-primary-dark);
}

.sanction-terms-list {
  padding-left: 24px;
  margin: 0;
}

.sanction-modal-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--admin-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.sanction-seal-label {
  font-size: 12px;
  color: var(--color-slate-500);
}

.sanction-seal-role {
  font-weight: 700;
  font-size: 14px;
  color: var(--color-primary-dark);
}

.sanction-actions {
  display: flex;
  gap: 8px;
}
`;

fs.writeFileSync(cssPath, css + utilityClasses, 'utf8');
console.log('CSS transformed');
