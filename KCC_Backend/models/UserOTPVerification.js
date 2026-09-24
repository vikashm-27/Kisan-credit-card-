const { DataTypes } = require('sequelize');
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
module.exports = UserOTPVerification;