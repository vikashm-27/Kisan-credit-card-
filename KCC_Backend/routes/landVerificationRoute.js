const express = require('express');
const router = express.Router();
const landVerificationController = require('../controller/landVerificationController');

// Verify land by polygon (drawn boundary)
router.post('/api/land-verification', landVerificationController.verifyByPolygon);

// Verify land by single coordinates
router.post('/api/land-verification/by-coordinates', landVerificationController.verifyByCoordinates);

// Verify land by official revenue survey number and sub-division
router.post('/api/land-verification/by-survey-number', landVerificationController.verifyBySurveyNumber);

// Get all registered land records (reference)
router.get('/api/land-verification/records', landVerificationController.getAllRecords);

// Submit final officer verification
router.post('/api/land-verification/submit', landVerificationController.submitVerification);

module.exports = router;
