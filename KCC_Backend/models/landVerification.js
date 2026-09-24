const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const LandVerification = sequelize.define('LandVerification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    landRecordId: { type: DataTypes.STRING, allowNull: false },
    surveyNumber: { type: DataTypes.STRING, allowNull: false },
    village: { type: DataTypes.STRING, allowNull: false },
    mandal: { type: DataTypes.STRING, allowNull: false },
    district: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    ownerName: { type: DataTypes.STRING, allowNull: false },
    fatherName: { type: DataTypes.STRING },
    aadharLast4: { type: DataTypes.STRING },
    landType: { type: DataTypes.STRING },
    totalAreaAcres: { type: DataTypes.DECIMAL(10, 4) },
    totalAreaHectares: { type: DataTypes.DECIMAL(10, 4) },
    totalAreaSqMeters: { type: DataTypes.DECIMAL(12, 2) },
    registrationDate: { type: DataTypes.STRING },
    documentNumber: { type: DataTypes.STRING },
    khasraNumber: { type: DataTypes.STRING },
    polygon: { type: DataTypes.JSON },
    cropHistory: { type: DataTypes.JSON },
    irrigationSource: { type: DataTypes.STRING },
    soilType: { type: DataTypes.STRING },
    encumbrance: { type: DataTypes.STRING },
    mutation: { type: DataTypes.STRING },
    verificationType: { type: DataTypes.STRING, defaultValue: 'polygon' },
    verifiedLatitude: { type: DataTypes.DECIMAL(10, 8) },
    verifiedLongitude: { type: DataTypes.DECIMAL(11, 8) },
    inspectionNote: { type: DataTypes.TEXT, defaultValue: '' },
    sitePhotograph: { type: DataTypes.STRING, defaultValue: '' },
    officerName: { type: DataTypes.STRING, defaultValue: 'Field Officer' },
    status: { type: DataTypes.STRING, defaultValue: 'Verified & Submitted' },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
}, {
    tableName: 'land_verifications',
    timestamps: true
});

LandVerification.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values._id = values.id;
    
    // Reconstruct nested objects
    values.totalArea = {
        acres: values.totalAreaAcres,
        hectares: values.totalAreaHectares,
        sqMeters: values.totalAreaSqMeters
    };
    
    values.verifiedCoordinates = {
        latitude: values.verifiedLatitude,
        longitude: values.verifiedLongitude
    };
    
    delete values.totalAreaAcres;
    delete values.totalAreaHectares;
    delete values.totalAreaSqMeters;
    delete values.verifiedLatitude;
    delete values.verifiedLongitude;
    
    return values;
};

module.exports = LandVerification;