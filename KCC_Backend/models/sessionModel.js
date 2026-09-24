const { DataTypes } = require('sequelize');
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

module.exports = Session;