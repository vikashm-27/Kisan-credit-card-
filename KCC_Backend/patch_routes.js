const fs = require('fs');
const path = require('path');

const adminRoutePath = path.join(__dirname, 'routes', 'adminRoute.js');
let adminRouteCode = fs.readFileSync(adminRoutePath, 'utf8');

adminRouteCode = `const { Op } = require('sequelize');\n` + adminRouteCode;

adminRouteCode = adminRouteCode.replace(
    /await User\.find\(\)\s*\.select\('-password -confirmPassword -passwordResetToken -passwordResetTokenExpires'\)\s*\.sort\(\{ createdAt: -1 \}\)/,
    "await User.findAll({ attributes: { exclude: ['password', 'confirmPassword', 'passwordResetToken', 'passwordResetTokenExpires'] }, order: [['createdAt', 'DESC']] })"
);

adminRouteCode = adminRouteCode.replace(
    /await User\.findById\(req\.params\.id\)\s*\.select\('-password -confirmPassword -passwordResetToken -passwordResetTokenExpires'\)/g,
    "await User.findByPk(req.params.id, { attributes: { exclude: ['password', 'confirmPassword', 'passwordResetToken', 'passwordResetTokenExpires'] } })"
);

adminRouteCode = adminRouteCode.replace(
    /await User\.findOne\(\{ email: email\.toLowerCase\(\) \}\)/,
    "await User.findOne({ where: { email: email.toLowerCase() } })"
);

adminRouteCode = adminRouteCode.replace(
    /const newUser = new User\(\{([\s\S]*?)\}\);\s*await newUser\.save\(\);/,
    "const newUser = await User.create({$1});"
);

adminRouteCode = adminRouteCode.replace(
    /newUser\._id/g,
    "newUser.id"
);

adminRouteCode = adminRouteCode.replace(
    /await User\.findById\(req\.params\.id\)/g,
    "await User.findByPk(req.params.id)"
);

adminRouteCode = adminRouteCode.replace(
    /await User\.findOne\(\{ email: email\.toLowerCase\(\), _id: \{ \$ne: req\.params\.id \} \}\)/,
    "await User.findOne({ where: { email: email.toLowerCase(), id: { [Op.ne]: req.params.id } } })"
);

fs.writeFileSync(adminRoutePath, adminRouteCode, 'utf8');


const sessionRoutePath = path.join(__dirname, 'routes', 'sessionRoute.js');
let sessionRouteCode = fs.readFileSync(sessionRoutePath, 'utf8');

sessionRouteCode = sessionRouteCode.replace(
    /await Session\.find\(\{ isActive: true \}\)\s*\.sort\(\{ loginAt: -1 \}\)\s*\.select\('-token'\)/,
    "await Session.findAll({ where: { isActive: true }, order: [['loginAt', 'DESC']], attributes: { exclude: ['token'] } })"
);

sessionRouteCode = sessionRouteCode.replace(
    /await Session\.find\(\)\s*\.sort\(\{ loginAt: -1 \}\)\s*\.select\('-token'\)/,
    "await Session.findAll({ order: [['loginAt', 'DESC']], attributes: { exclude: ['token'] } })"
);

sessionRouteCode = sessionRouteCode.replace(
    /await Session\.find\(\{ userId, isActive: true \}\)\s*\.sort\(\{ loginAt: -1 \}\)\s*\.select\('-token'\)/,
    "await Session.findAll({ where: { userId, isActive: true }, order: [['loginAt', 'DESC']], attributes: { exclude: ['token'] } })"
);

sessionRouteCode = sessionRouteCode.replace(
    /await Session\.findById\(sessionId\)/,
    "await Session.findByPk(sessionId)"
);

sessionRouteCode = sessionRouteCode.replace(
    /req\.sessionDoc\._id/g,
    "req.sessionDoc.id"
);

sessionRouteCode = sessionRouteCode.replace(
    /await Session\.updateMany\(\s*\{ userId, isActive: true \},\s*\{ isActive: false \}\s*\)/,
    "await Session.update({ isActive: false }, { where: { userId, isActive: true } })"
);

fs.writeFileSync(sessionRoutePath, sessionRouteCode, 'utf8');

console.log("Rewrote adminRoute.js and sessionRoute.js");
