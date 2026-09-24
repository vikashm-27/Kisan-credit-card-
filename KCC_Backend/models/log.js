const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Log = sequelize.define('Log', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    level: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
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
module.exports = Log;