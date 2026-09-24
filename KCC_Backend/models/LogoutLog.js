const { DataTypes } = require('sequelize');
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
module.exports = LogoutLog;