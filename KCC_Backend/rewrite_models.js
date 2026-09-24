const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');

const toJSONOverride = `
    toJSON() {
        const values = Object.assign({}, this.get());
        values._id = values.id;
        return values;
    }
`;

const models = {
  'usermodel.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING },
    firstName: { type: DataTypes.STRING, trim: true },
    lastName: { type: DataTypes.STRING, trim: true },
    userId: { type: DataTypes.STRING, trim: true },
    verified: { type: DataTypes.BOOLEAN },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    confirmPassword: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('user', 'admin', 'superadmin'), defaultValue: 'user' },
    department: { type: DataTypes.STRING, trim: true },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    joinDate: { type: DataTypes.DATE },
    passwordExpiration: { type: DataTypes.DATE },
    passwordResetToken: { type: DataTypes.STRING },
    passwordResetTokenExpires: { type: DataTypes.DATE }
}, {
    tableName: 'users',
    timestamps: true,
    defaultScope: { attributes: { exclude: ['confirmPassword'] } }
});

User.prototype.isPasswordExpired = function() {
    return this.passwordExpiration && this.passwordExpiration < new Date();
};
User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};

module.exports = User;`,

  'sessionModel.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const User = require('./usermodel');

const Session = sequelize.define('Session', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
    email: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('user', 'admin', 'superadmin'), defaultValue: 'user' },
    token: { type: DataTypes.TEXT, allowNull: false },
    ipAddress: { type: DataTypes.STRING, defaultValue: 'Unknown' },
    userAgent: { type: DataTypes.TEXT, defaultValue: 'Unknown' },
    deviceInfo: { type: DataTypes.STRING, defaultValue: 'Unknown Device' },
    browser: { type: DataTypes.STRING, defaultValue: 'Unknown Browser' },
    os: { type: DataTypes.STRING, defaultValue: 'Unknown OS' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    loginAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    lastActivityAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    expiresAt: { type: DataTypes.DATE, allowNull: false }
}, {
    tableName: 'sessions',
    timestamps: true,
    indexes: [
        { fields: ['isActive'] },
        { fields: ['userId', 'isActive'] }
    ]
});

Session.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};

module.exports = Session;`,

  'customermodel.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    firstName: { type: DataTypes.STRING },
    middleName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    options: { type: DataTypes.STRING },
    phoneNumber: { type: DataTypes.STRING },
    countryCode: { type: DataTypes.STRING }
}, {
    tableName: 'customers',
    timestamps: true
});

Customer.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    // Map back for compatibility if requested
    values.middileName = values.middleName;
    values.LastName = values.lastName;
    values.phonenumber = values.phoneNumber;
    return values;
};

module.exports = Customer;`,

  'landVerification.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const LandVerification = sequelize.define('LandVerification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    landRecordId: { type: DataTypes.STRING, allowNull: false },
    surveyNumber: { type: DataTypes.STRING, allowNull: false },
    village: { type: DataTypes.STRING, allowNull: false },
    mandal: { type: DataTypes.STRING, allowNull: false },
    district: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    ownerName: { type: DataTypes.STRING, allowNull: false },
    fatherName: { type: DataTypes.STRING },
    aadharLast4: { type: DataTypes.STRING },
    landType: { type: DataTypes.STRING },
    totalAreaAcres: { type: DataTypes.DECIMAL(10, 4) },
    totalAreaHectares: { type: DataTypes.DECIMAL(10, 4) },
    totalAreaSqMeters: { type: DataTypes.DECIMAL(12, 2) },
    registrationDate: { type: DataTypes.STRING },
    documentNumber: { type: DataTypes.STRING },
    khasraNumber: { type: DataTypes.STRING },
    polygon: { type: DataTypes.JSON },
    cropHistory: { type: DataTypes.JSON },
    irrigationSource: { type: DataTypes.STRING },
    soilType: { type: DataTypes.STRING },
    encumbrance: { type: DataTypes.STRING },
    mutation: { type: DataTypes.STRING },
    verificationType: { type: DataTypes.ENUM('coordinates', 'polygon'), defaultValue: 'polygon' },
    verifiedLatitude: { type: DataTypes.DECIMAL(10, 8) },
    verifiedLongitude: { type: DataTypes.DECIMAL(11, 8) },
    inspectionNote: { type: DataTypes.TEXT, defaultValue: '' },
    sitePhotograph: { type: DataTypes.STRING, defaultValue: '' },
    officerName: { type: DataTypes.STRING, defaultValue: 'Field Officer' },
    status: { type: DataTypes.STRING, defaultValue: 'Verified & Submitted' },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
}, {
    tableName: 'land_verifications',
    timestamps: true
});

LandVerification.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    
    // Reconstruct nested objects
    values.totalArea = {
        acres: values.totalAreaAcres,
        hectares: values.totalAreaHectares,
        sqMeters: values.totalAreaSqMeters
    };
    
    values.verifiedCoordinates = {
        latitude: values.verifiedLatitude,
        longitude: values.verifiedLongitude
    };
    
    delete values.totalAreaAcres;
    delete values.totalAreaHectares;
    delete values.totalAreaSqMeters;
    delete values.verifiedLatitude;
    delete values.verifiedLongitude;
    
    return values;
};

module.exports = LandVerification;`,

  'aadharKyc.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const AadharKyc = sequelize.define('AadharKyc', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    file: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.STRING, allowNull: false },
    aadharNumber: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
}, { tableName: 'aadhar_kycs', timestamps: true });

AadharKyc.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = AadharKyc;`,

  'pancardKyc.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const PanCardKyc = sequelize.define('PanCardKyc', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    file: { type: DataTypes.STRING, allowNull: false },
    panNumber: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
}, { tableName: 'pancard_kycs', timestamps: true });

PanCardKyc.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = PanCardKyc;`,

  'voterIdKyc.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const VoterIdKyc = sequelize.define('VoterIdKyc', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    file: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    voterIdNumber: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
}, { tableName: 'voter_id_kycs', timestamps: true });

VoterIdKyc.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = VoterIdKyc;`,

  'log.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Log = sequelize.define('Log', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    level: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    timestamp: { type: DataTypes.DATE },
    file: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    dob: { type: DataTypes.STRING },
    aadharNumber: { type: DataTypes.STRING },
    voterIdNumber: { type: DataTypes.STRING },
    panNumber: { type: DataTypes.STRING },
    ipAddress: { type: DataTypes.STRING }
}, { tableName: 'logs', timestamps: true });

Log.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = Log;`,

  'userLogModel.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const UserLog = sequelize.define('UserLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false },
    logTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ipAddress: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'user_logs', timestamps: true });

UserLog.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = UserLog;`,

  'LogoutLog.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const LogoutLog = sequelize.define('LogoutLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false },
    logTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ipAddress: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'Logged Out' }
}, { tableName: 'logout_logs', timestamps: true });

LogoutLog.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = LogoutLog;`,

  'customerLogModel.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const CustomerLog = sequelize.define('CustomerLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false },
    logTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    activity: { type: DataTypes.STRING, allowNull: false },
    details: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    ipAddress: { type: DataTypes.STRING }
}, { tableName: 'customer_logs', timestamps: true });

CustomerLog.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = CustomerLog;`,

  'microsoftUserData.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const MicrosoftUserData = sequelize.define('MicrosoftUserData', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    microsoftId: { type: DataTypes.STRING, allowNull: false },
    displayName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING(500) }
}, { tableName: 'microsoft_user_data', timestamps: true });

MicrosoftUserData.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = MicrosoftUserData;`,

  'googleUserData.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const GoogleUserData = sequelize.define('GoogleUserData', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    googleId: { type: DataTypes.STRING, allowNull: false },
    displayName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING(500), allowNull: false }
}, { tableName: 'google_user_data', timestamps: true });

GoogleUserData.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = GoogleUserData;`,

  'UserOTPVerification.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const UserOTPVerification = sequelize.define('UserOTPVerification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.STRING },
    otp: { type: DataTypes.STRING },
    expireAt: { type: DataTypes.DATE }
}, { tableName: 'user_otp_verifications', timestamps: true });

UserOTPVerification.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = UserOTPVerification;`,

  'passwordModel.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Password = sequelize.define('Password', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    password: { type: DataTypes.STRING }
}, { tableName: 'passwords', timestamps: true });

Password.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = Password;`,

  'passwordResetmodel.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const PasswordResetRequest = sequelize.define('PasswordResetRequest', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING },
    resetToken: { type: DataTypes.STRING },
    expiresAt: { type: DataTypes.DATE },
    lastReminderSent: { type: DataTypes.DATE }
}, { tableName: 'password_reset_requests', timestamps: true });

PasswordResetRequest.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = PasswordResetRequest;`

};

for (const [filename, content] of Object.entries(models)) {
    fs.writeFileSync(path.join(modelsDir, filename), content, 'utf8');
    console.log("Updated " + filename);
}
