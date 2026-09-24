const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const MicrosoftUserData = sequelize.define('MicrosoftUserData', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    microsoftId: { type: DataTypes.STRING, allowNull: false },
    displayName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING(500) }
}, { tableName: 'microsoft_user_data', timestamps: true });

MicrosoftUserData.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};
module.exports = MicrosoftUserData;