const fs = require('fs');
const jsxPath = 'D:/WORK/KCC_work/Kisan Credit Card/KCC_Frontend/src/components/Pages/Admin/Admin.jsx';

let jsx = fs.readFileSync(jsxPath, 'utf8');

// JSX Replacements
jsx = jsx.replace(/style=\{\{\s*display:\s*['"]flex['"],\s*alignItems:\s*['"]center['"]\s*\}\}/g, 'className="flex-center"');
jsx = jsx.replace(/style=\{\{\s*textAlign:\s*['"]right['"]\s*\}\}/g, 'className="text-right"');
jsx = jsx.replace(/style=\{\{\s*textAlign:\s*['"]center['"],\s*padding:\s*['"]60px 20px['"]\s*\}\}/g, 'className="text-center p-64-24"');
jsx = jsx.replace(/style=\{\{\s*display:\s*['"]inline-flex['"],\s*alignItems:\s*['"]center['"],\s*gap:\s*10,\s*color:\s*['"]#64748b['"]\s*\}\}/g, 'className="flex-center-gap-8 text-muted"');
jsx = jsx.replace(/style=\{\{\s*color:\s*['"]#b91c1c['"],\s*display:\s*['"]flex['"],\s*flexDirection:\s*['"]column['"],\s*alignItems:\s*['"]center['"],\s*gap:\s*10\s*\}\}/g, 'className="flex-column-center-gap-8 text-danger"');
jsx = jsx.replace(/style=\{\{\s*fontWeight:\s*700,\s*color:\s*['"]#991b1b['"],\s*fontSize:\s*16\s*\}\}/g, 'className="font-bold text-danger text-16"');
jsx = jsx.replace(/style=\{\{\s*margin:\s*0,\s*fontSize:\s*13,\s*color:\s*['"]#64748b['"],\s*maxWidth:\s*450\s*\}\}/g, 'className="empty-state-text"');
jsx = jsx.replace(/style=\{\{\s*marginTop:\s*8\s*\}\}/g, 'className="mt-8"');
jsx = jsx.replace(/style=\{\{\s*color:\s*['"]#64748b['"],\s*display:\s*['"]flex['"],\s*flexDirection:\s*['"]column['"],\s*alignItems:\s*['"]center['"],\s*gap:\s*10\s*\}\}/g, 'className="flex-column-center-gap-8 text-muted"');
jsx = jsx.replace(/style=\{\{\s*fontWeight:\s*700,\s*color:\s*['"]#1e293b['"],\s*fontSize:\s*16\s*\}\}/g, 'className="font-bold text-primary text-16"');
jsx = jsx.replace(/style=\{\{\s*margin:\s*0,\s*fontSize:\s*13\s*\}\}/g, 'className="empty-state-text"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*10\.5,\s*opacity:\s*0\.85\s*\}\}/g, 'className="cibil-subtext"');
jsx = jsx.replace(/style=\{\{\s*fontWeight:\s*800,\s*color:\s*['"]#0f172a['"],\s*fontSize:\s*14\s*\}\}/g, 'className="sanction-limit-val"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*11,\s*color:\s*['"]#64748b['"]\s*\}\}/g, 'className="text-12 text-muted"');
jsx = jsx.replace(/style=\{\{\s*display:\s*['"]flex['"],\s*alignItems:\s*['"]center['"],\s*gap:\s*8\s*\}\}/g, 'className="flex-center-gap-8"');

// Extract Feedback alert style
jsx = jsx.replace(/style=\{\{[\s\S]*?border:\s*`1px solid \$\{feedback.type === "success" \? "#a7f3d0" : "#fecaca"\}`,\s*\}\}/g, 'className={`feedback-alert ${feedback.type === "success" ? "feedback-success" : "feedback-error"}`}');

// Section 2 Cadastral
jsx = jsx.replace(/style=\{\{\s*display:\s*['"]flex['"],\s*justifyContent:\s*['"]space-between['"],\s*alignItems:\s*['"]center['"],\s*marginBottom:\s*8\s*\}\}/g, 'className="cadastral-map-header"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*11,\s*fontWeight:\s*700,\s*color:\s*['"]#a7f3d0['"],\s*textTransform:\s*['"]uppercase['"]\s*\}\}/g, 'className="cadastral-map-title"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*10,\s*background:\s*['"]#059669['"],\s*padding:\s*['"]2px 6px['"],\s*borderRadius:\s*4\s*\}\}/g, 'className="cadastral-map-badge"');
jsx = jsx.replace(/style=\{\{\s*height:\s*90,\s*background:\s*['"]radial-gradient\(circle at 50% 50%, #1e293b 0%, #0f172a 100%\)['"],\s*borderRadius:\s*8,\s*border:\s*['"]1px solid #334155['"],\s*position:\s*['"]relative['"],\s*display:\s*['"]flex['"],\s*alignItems:\s*['"]center['"],\s*justifyContent:\s*['"]center['"],\s*overflow:\s*['"]hidden['"],\s*\}\}/g, 'className="cadastral-map-visual"');
jsx = jsx.replace(/style=\{\{\s*position:\s*['"]absolute['"],\s*inset:\s*0\s*\}\}/g, 'className="cadastral-map-svg"');

// Scale of finance
jsx = jsx.replace(/style=\{\{\s*color:\s*['"]#0f172a['"]\s*\}\}/g, 'className="text-primary"');
jsx = jsx.replace(/style=\{\{\s*marginTop:\s*14,\s*paddingTop:\s*12,\s*borderTop:\s*['"]1px solid #e2e8f0['"]\s*\}\}/g, 'className="officer-sanction-section"');
jsx = jsx.replace(/style=\{\{\s*display:\s*['"]block['"],\s*fontSize:\s*12,\s*fontWeight:\s*700,\s*color:\s*['"]#334155['"],\s*marginBottom:\s*6\s*\}\}/g, 'className="officer-sanction-label"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*15,\s*fontWeight:\s*800,\s*color:\s*['"]#047857['"]\s*\}\}/g, 'className="officer-sanction-input"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*11,\s*color:\s*['"]#64748b['"],\s*marginTop:\s*10,\s*display:\s*['"]flex['"],\s*alignItems:\s*['"]center['"],\s*gap:\s*5\s*\}\}/g, 'className="review-meta"');
jsx = jsx.replace(/style=\{\{\s*width:\s*['"]100%['"],\s*justifyContent:\s*['"]center['"],\s*background:\s*['"]#f0fdf4['"],\s*borderColor:\s*['"]#a7f3d0['"],\s*color:\s*['"]#047857['"]\s*\}\}/g, 'className="btn-secondary-full"');

// Sanction Letter
jsx = jsx.replace(/style=\{\{\s*display:\s*['"]flex['"],\s*justifyContent:\s*['"]space-between['"],\s*alignItems:\s*['"]flex-start['"],\s*borderBottom:\s*['"]2px solid #0f172a['"],\s*paddingBottom:\s*16\s*\}\}/g, 'className="sanction-modal-header"');
jsx = jsx.replace(/style=\{\{\s*display:\s*['"]flex['"],\s*alignItems:\s*['"]center['"],\s*gap:\s*8,\s*color:\s*['"]#059669['"],\s*fontWeight:\s*800,\s*fontSize:\s*13\s*\}\}/g, 'className="sanction-modal-brand"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*20,\s*fontWeight:\s*800,\s*margin:\s*['"]6px 0 0['"],\s*color:\s*['"]#0f172a['"]\s*\}\}/g, 'className="sanction-modal-title"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*12,\s*color:\s*['"]#64748b['"]\s*\}\}/g, 'className="sanction-modal-subtitle"');
jsx = jsx.replace(/style=\{\{\s*marginTop:\s*20,\s*display:\s*['"]grid['"],\s*gridTemplateColumns:\s*['"]1fr 1fr['"],\s*gap:\s*16,\s*fontSize:\s*13,\s*background:\s*['"]#f8fafc['"],\s*padding:\s*16,\s*borderRadius:\s*10\s*\}\}/g, 'className="sanction-grid-details"');
jsx = jsx.replace(/style=\{\{\s*margin:\s*['"]24px 0['"],\s*padding:\s*['"]18px 20px['"],\s*background:\s*['"]#ecfdf5['"],\s*border:\s*['"]1px solid #a7f3d0['"],\s*borderRadius:\s*12\s*\}\}/g, 'className="sanction-limit-box"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*13,\s*color:\s*['"]#047857['"],\s*fontWeight:\s*600\s*\}\}/g, 'className="sanction-limit-label"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*32,\s*fontWeight:\s*900,\s*color:\s*['"]#065f46['"],\s*margin:\s*['"]4px 0['"]\s*\}\}/g, 'className="sanction-limit-amount"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*12,\s*color:\s*['"]#047857['"]\s*\}\}/g, 'className="sanction-limit-desc"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*12\.5,\s*lineHeight:\s*1\.6,\s*color:\s*['"]#334155['"]\s*\}\}/g, 'className="sanction-terms-section"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*14,\s*fontWeight:\s*700,\s*margin:\s*['"]0 0 8px['"],\s*color:\s*['"]#0f172a['"]\s*\}\}/g, 'className="sanction-terms-title"');
jsx = jsx.replace(/style=\{\{\s*paddingLeft:\s*20,\s*margin:\s*0\s*\}\}/g, 'className="sanction-terms-list"');
jsx = jsx.replace(/style=\{\{\s*marginTop:\s*24,\s*paddingTop:\s*16,\s*borderTop:\s*['"]1px solid #e2e8f0['"],\s*display:\s*['"]flex['"],\s*justifyContent:\s*['"]space-between['"],\s*alignItems:\s*['"]flex-end['"]\s*\}\}/g, 'className="sanction-modal-footer"');
jsx = jsx.replace(/style=\{\{\s*fontSize:\s*11,\s*color:\s*['"]#64748b['"]\s*\}\}/g, 'className="sanction-seal-label"');
jsx = jsx.replace(/style=\{\{\s*fontWeight:\s*700,\s*fontSize:\s*13,\s*color:\s*['"]#0f172a['"]\s*\}\}/g, 'className="sanction-seal-role"');
jsx = jsx.replace(/style=\{\{\s*display:\s*['"]flex['"],\s*gap:\s*10\s*\}\}/g, 'className="sanction-actions"');

fs.writeFileSync(jsxPath, jsx, 'utf8');
console.log('JSX transformed');
