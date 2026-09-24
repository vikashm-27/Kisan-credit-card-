const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const logController = require('../controller/logController');
const dashboardController = require('../controller/dashboardController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Authentication Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/twofactorsetup', authController.twoFactorSetup);
router.post('/verify', authController.verifyOTP);
router.post('/logout', verifyToken, authController.logout);
router.post('/forgotpassword', authController.forgotPassword);
router.post('/resetpassword/:id/:token', authController.resetPassword);
router.post('/authMicrosoft', authController.authMicrosoft);

// Logging Routes
router.get('/logs', logController.getGeneralLogs);
router.get('/userlogs', logController.getUserLogs);
router.get('/logoutlogs', logController.getLogoutLogs);
router.get('/customerlogs', logController.getCustomerLogs);

// Dashboard / KYC Stats
router.get('/kyc-data', dashboardController.getKycStats);
router.get('/home-stats', dashboardController.getHomeStats);
router.get('/dashboard-analytics', dashboardController.getDashboardAnalytics);

module.exports = router;
