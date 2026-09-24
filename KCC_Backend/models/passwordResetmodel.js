const { DataTypes } = require('sequelize');
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
module.exports = PasswordResetRequest;