const { DataTypes } = require('sequelize');
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
module.exports = UserLog;