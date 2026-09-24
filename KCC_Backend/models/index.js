const Sequelize = require('sequelize');
const sequelize = require('../db/connection');

const models = {
  User: require('./usermodel'),
  Session: require('./sessionModel'),
  Customer: require('./customermodel'),
  LandVerification: require('./landVerification'),
  AadharKyc: require('./aadharKyc'),
  PanCardKyc: require('./pancardKyc'),
  VoterIdKyc: require('./voterIdKyc'),
  Log: require('./log'),
  UserLog: require('./userLogModel'),
  LogoutLog: require('./LogoutLog'),
  CustomerLog: require('./customerLogModel'),
  MicrosoftUserData: require('./microsoftUserData'),
  GoogleUserData: require('./googleUserData'),
  UserOTPVerification: require('./UserOTPVerification'),
  Password: require('./passwordModel'),
  PasswordResetRequest: require('./passwordResetmodel')
};

// Define associations
if (models.Session && models.User) {
  models.Session.belongsTo(models.User, { foreignKey: 'userId' });
  models.User.hasMany(models.Session, { foreignKey: 'userId' });
}

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
