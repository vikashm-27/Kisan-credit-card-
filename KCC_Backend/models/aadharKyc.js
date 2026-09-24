const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const AadharKyc = sequelize.define('AadharKyc', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    file: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.STRING, allowNull: false },
    aadharNumber: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
}, { tableName: 'aadhar_kycs', timestamps: true });

AadharKyc.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = AadharKyc;