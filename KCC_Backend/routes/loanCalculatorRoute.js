const express = require('express');
const router = express.Router();
const loanCalculatorController = require('../controller/loanCalculatorController');

// Calculate loan limits, tiers, and dynamic interest breakdown
router.post('/api/calculate-loan', loanCalculatorController.calculateLoan);

// Get list of crops and scale of finance reference data
router.get('/api/scale-of-finance', loanCalculatorController.getScaleOfFinance);

module.exports = router;
