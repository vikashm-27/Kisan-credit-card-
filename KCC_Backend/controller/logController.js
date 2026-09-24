const Log = require('../models/log');
const userLogModel = require('../models/userLogModel');
const LogoutLog = require('../models/LogoutLog');
const CustomerLog = require('../models/customerLogModel');

exports.getGeneralLogs = async (req, res) => {
  try {
    const logs = await Log.findAll({ order: [['timestamp', 'DESC']], limit: 100 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

exports.getUserLogs = async (req, res) => {
  try {
    const userlogs = await userLogModel.findAll({ order: [['logTime', 'DESC']], limit: 100 });
    res.json({ userlogs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user logs', error });
  }
};

exports.getLogoutLogs = async (req, res) => {
  try {
    const logoutLogs = await LogoutLog.findAll({ order: [['logTime', 'DESC']], limit: 100 });
    res.json(logoutLogs);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching logout logs' });
  }
};

exports.getCustomerLogs = async (req, res) => {
  try {
    const customerLogs = await CustomerLog.findAll({ order: [['logTime', 'DESC']], limit: 100 });
    res.status(200).json(customerLogs);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
