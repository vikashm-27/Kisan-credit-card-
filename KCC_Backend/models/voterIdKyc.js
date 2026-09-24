const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const VoterIdKyc = sequelize.define('VoterIdKyc', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    file: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    voterIdNumber: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
}, { tableName: 'voter_id_kycs', timestamps: true });

VoterIdKyc.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = VoterIdKyc;