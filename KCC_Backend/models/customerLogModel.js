const { DataTypes } = require('sequelize');
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
module.exports = CustomerLog;