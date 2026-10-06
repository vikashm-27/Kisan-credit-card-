const { execSync } = require('child_process');
try {
  const diff = execSync('git diff HEAD~1 Admin.jsx', { cwd: 'D:\\WORK\\KCC_work\\Kisan Credit Card\\KCC_Frontend\\src\\components\\Pages\\Admin', encoding: 'utf8' });
  console.log(diff);
} catch (e) {
  console.error(e.message);
}
