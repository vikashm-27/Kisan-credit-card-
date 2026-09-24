const customerModel = require("../models/customermodel");
const customerLogModel = require("../models/customerLogModel"); // Import the Customer Log model
const express = require("express");
const router = express.Router();

const os = require("os");

// Get the machine's actual local network IPv4 address
const getLocalIPv4 = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (!iface.internal && iface.family === 'IPv4') {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
};

// Helper function to convert IPv6 / loopback addresses to a real IPv4 address
const getIPv4 = (ip) => {
    if (!ip) return ip;
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }
    if (ip === '::1' || ip === '127.0.0.1') {
        return getLocalIPv4();
    }
    return ip;
};

router.post("/customerdetails", async (req, res) => {
  const {
    title,
    firstName,
    middleName,
    lastName,
    gender,
    email,
    options,
    phoneNumber,
    countryCode,
    // Employment Details
    employmentType,
    employerName,
    employerType,
    netSalary,
    modeOfSalary,
    yearsInJob,
    businessName,
    constitution,
    natureOfBusiness,
    annualTurnover,
    netProfit,
    premisesOwnership,
    yearsInBusiness,
    // Bank Details
    bankType,
    bankName,
    bankState,
    bankDistrict,
    branchName,
    accountType,
    accountNumber,
    ifscCode,
  } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await customerModel.findOne({ where: { email } });

    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "This user already exists" });
    } else {
      const customer = await customerModel.create(req.body);

      // Log the customer creation activity
      await customerLogModel.create({
        email: customer.email,
        activity: "Customer Created",
        details: `Customer ${firstName} ${lastName} created successfully.`,
        status: "Success",
        ipAddress: getIPv4(req.ip), 
      });

      res.status(200).json({ success: true, data: customer });
    }
  } catch (error) {
    console.error("Error:", error);

    // Log the failure in customer creation
    await customerLogModel.create({
      email: email,
      activity: "Customer Creation Failed",
      details: error.message,
      status: "Failed",
      ipAddress: getIPv4(req.ip),
    });

    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
