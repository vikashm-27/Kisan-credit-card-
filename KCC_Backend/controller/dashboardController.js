const { Op } = require('sequelize');
const AadharKyc = require("../models/aadharKyc");
const PanCardKyc = require('../models/pancardKyc');
const VoterIdKyc = require("../models/voterIdKyc");
const Customer = require("../models/customermodel");
const LandVerification = require("../models/landVerification");
const UserLog = require("../models/userLogModel");

exports.getKycStats = async (req, res) => {
  const { year, month, kycType } = req.query;

  try {
    const where = {};

    if (year || month) {
      where.date = {};
      if (year) {
        where.date[Op.gte] = new Date(`${year}-01-01`);
        where.date[Op.lt] = new Date(`${parseInt(year) + 1}-01-01`);
      }
      if (month) {
        const queryYear = year || new Date().getFullYear();
        const start = new Date(queryYear, parseInt(month) - 1, 1);
        const end = new Date(queryYear, parseInt(month), 1);
        where.date[Op.gte] = start;
        where.date[Op.lt] = end;
      }
    }

    const aadharCount = kycType === "Aadhar" || !kycType
      ? await AadharKyc.count({ where })
      : 0;
    const panCount = kycType === "PAN" || !kycType
      ? await PanCardKyc.count({ where })
      : 0;
    const voterIdCount = kycType === "VoterId" || !kycType
      ? await VoterIdKyc.count({ where })
      : 0;

    res.json({
      aadhar: aadharCount,
      pan: panCount,
      voterId: voterIdCount,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
};

exports.getHomeStats = async (req, res) => {
    try {
        const activeCustomers = await Customer.count();
        
        const successRegex = '^(completed|verified|verified & submitted)$';
        const rejectRegex = '^(rejected|failed)$';

        // Count verified KYC
        const aadharVerified = await AadharKyc.count({ where: { status: { [Op.regexp]: successRegex } } });
        const panVerified = await PanCardKyc.count({ where: { status: { [Op.regexp]: successRegex } } });
        const voterVerified = await VoterIdKyc.count({ where: { status: { [Op.regexp]: successRegex } } });
        const totalVerified = aadharVerified + panVerified + voterVerified;

        // Count rejected KYC
        const aadharRejected = await AadharKyc.count({ where: { status: { [Op.regexp]: rejectRegex } } });
        const panRejected = await PanCardKyc.count({ where: { status: { [Op.regexp]: rejectRegex } } });
        const voterRejected = await VoterIdKyc.count({ where: { status: { [Op.regexp]: rejectRegex } } });
        const totalRejected = aadharRejected + panRejected + voterRejected;

        // Success rate
        const totalProcessed = totalVerified + totalRejected;
        const successRate = totalProcessed > 0 ? ((totalVerified / totalProcessed) * 100).toFixed(1) : 100.0;

        res.json({
            activeCustomers,
            kycVerified: totalVerified,
            kycRejected: totalRejected,
            successRate
        });
    } catch (error) {
        console.error("Error fetching home stats:", error);
        res.status(500).json({ error: "An error occurred while fetching home stats" });
    }
};

exports.getDashboardAnalytics = async (req, res) => {
    try {
        const successRegex = '^(completed|verified|verified & submitted)$';
        const rejectRegex = '^(rejected|failed)$';

        // Land Verifications
        const landDone = await LandVerification.count({ where: { status: { [Op.regexp]: successRegex } } });
        const landFailed = await LandVerification.count({ where: { status: { [Op.regexp]: rejectRegex } } });

        // Customer Profile Completions
        const fullyFilledCustomers = await Customer.count({
            where: {
                firstName: { [Op.and]: [{ [Op.not]: null }, { [Op.ne]: '' }] },
                lastName: { [Op.and]: [{ [Op.not]: null }, { [Op.ne]: '' }] },
                phoneNumber: { [Op.not]: null }
            }
        });

        const recentActivity = await UserLog.findAll({ order: [['logTime', 'DESC']], limit: 10 });

        res.json({
            landDone,
            landFailed,
            fullyFilledCustomers,
            recentActivity
        });
    } catch (error) {
        console.error("Error fetching dashboard analytics:", error);
        res.status(500).json({ error: "An error occurred while fetching dashboard analytics" });
    }
};
