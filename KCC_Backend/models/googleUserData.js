const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const GoogleUserData = sequelize.define('GoogleUserData', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    googleId: { type: DataTypes.STRING, allowNull: false },
    displayName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING(500), allowNull: false }
}, { tableName: 'google_user_data', timestamps: true });

GoogleUserData.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = GoogleUserData;