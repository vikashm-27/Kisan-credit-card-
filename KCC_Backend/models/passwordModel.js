const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Password = sequelize.define('Password', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    password: { type: DataTypes.STRING }
}, { tableName: 'passwords', timestamps: true });

Password.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = Password;