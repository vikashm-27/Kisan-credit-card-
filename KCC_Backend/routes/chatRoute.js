const express = require('express');
const router = express.Router();
const chatbotController = require('../controller/chatbotController');

// POST route to handle chat messages
router.post('/api/chat', chatbotController.handleChat);

module.exports = router;
