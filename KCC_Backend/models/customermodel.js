const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    firstName: { type: DataTypes.STRING },
    middleName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    options: { type: DataTypes.STRING },
    phoneNumber: { type: DataTypes.STRING },
    countryCode: { type: DataTypes.STRING },

    // Employment Details
    employmentType: { type: DataTypes.STRING },
    // Salaried Fields
    employerName: { type: DataTypes.STRING },
    employerType: { type: DataTypes.STRING },
    netSalary: { type: DataTypes.DECIMAL(12, 2) },
    modeOfSalary: { type: DataTypes.STRING },
    yearsInJob: { type: DataTypes.INTEGER },
    // Self-Employed Fields
    businessName: { type: DataTypes.STRING },
    constitution: { type: DataTypes.STRING },
    natureOfBusiness: { type: DataTypes.STRING },
    annualTurnover: { type: DataTypes.DECIMAL(15, 2) },
    netProfit: { type: DataTypes.DECIMAL(15, 2) },
    premisesOwnership: { type: DataTypes.STRING },
    yearsInBusiness: { type: DataTypes.INTEGER },
    
    // Bank Details
    bankType: { type: DataTypes.STRING },
    bankName: { type: DataTypes.STRING },
    bankState: { type: DataTypes.STRING },
    bankDistrict: { type: DataTypes.STRING },
    branchName: { type: DataTypes.STRING },
    accountType: { type: DataTypes.STRING },
    accountNumber: { type: DataTypes.STRING },
    ifscCode: { type: DataTypes.STRING }
}, {
    tableName: 'customers',
    timestamps: true
});

Customer.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    // Map back for compatibility if requested
    values.middileName = values.middleName;
    values.LastName = values.lastName;
    values.phonenumber = values.phoneNumber;
    return values;
};

module.exports = Customer;