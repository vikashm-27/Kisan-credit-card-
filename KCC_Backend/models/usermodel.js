const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING },
    firstName: { type: DataTypes.STRING, trim: true },
    lastName: { type: DataTypes.STRING, trim: true },
    userId: { type: DataTypes.STRING, trim: true },
    verified: { type: DataTypes.BOOLEAN },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    confirmPassword: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('user', 'admin', 'superadmin'), defaultValue: 'user' },
    department: { type: DataTypes.STRING, trim: true },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    joinDate: { type: DataTypes.DATE },
    passwordExpiration: { type: DataTypes.DATE },
    passwordResetToken: { type: DataTypes.STRING },
    passwordResetTokenExpires: { type: DataTypes.DATE }
}, {
    tableName: 'users',
    timestamps: true,
    defaultScope: { attributes: { exclude: ['confirmPassword'] } }
});

User.prototype.isPasswordExpired = function() {
    return this.passwordExpiration && this.passwordExpiration < new Date();
};
User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    return values;
};

module.exports = User;