const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const PanCardKyc = sequelize.define('PanCardKyc', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    file: { type: DataTypes.STRING, allowNull: false },
    panNumber: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
}, { tableName: 'pancard_kycs', timestamps: true });

PanCardKyc.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = PanCardKyc;