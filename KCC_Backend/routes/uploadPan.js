const express = require('express');
const multer = require('multer');
const { convert } = require('pdf-poppler');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const PanCardKyc = require('../models/pancardKyc');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const Log = require("../models/log");
const winston = require("winston");
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


// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload'); // Save uploaded files to the 'upload' directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original filename
  }
});
const upload = multer({ storage: storage });
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Regular expression to extract PAN card number
const panRegex = /([A-Z]{5}[0-9]{4}[A-Z])/;

// Function to extract information from text using regular expressions & layout analysis
function extractPanInfo(text, frontEndName) {
  const panMatch = text.match(panRegex);
  const panNumber = panMatch ? panMatch[0].toUpperCase() : null;

  let name = null;
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Strategy 1: Match against frontEndName tokens if provided
  if (frontEndName && frontEndName.trim()) {
    const cleanFront = frontEndName.trim();
    const frontTokens = cleanFront.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (frontTokens.length > 0 && frontTokens.every(tok => lowerLine.includes(tok))) {
        name = cleanFront;
        break;
      }
    }
  }

  // Strategy 2: Look for line immediately preceding "Father's Name"
  if (!name) {
    for (let i = 0; i < lines.length; i++) {
      if (/(?:father(?:'s)?\s*name)/i.test(lines[i])) {
        for (let j = i - 1; j >= 0; j--) {
          const candidate = lines[j].replace(/^(name\s*[:.-]?\s*)/i, '').trim();
          if (
            candidate &&
            !panRegex.test(candidate) &&
            !/income tax|department|govt|card|permanent|signature/i.test(candidate) &&
            candidate.length >= 3
          ) {
            name = candidate;
            break;
          }
        }
        if (name) break;
      }
    }
  }

  // Strategy 3: Look for "Name" label
  if (!name) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^name\s*[:.-]?\s*(.+)/i.test(line)) {
        const match = line.match(/^name\s*[:.-]?\s*(.+)/i);
        if (match && match[1].trim().length >= 3) {
          name = match[1].trim();
          break;
        }
      } else if (/^name$/i.test(line) && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.length >= 3 && !/father/i.test(nextLine)) {
          name = nextLine;
          break;
        }
      }
    }
  }

  // Strategy 4: Fallback to lines after PAN number
  if (!name && panNumber) {
    const nameIndex = text.indexOf(panNumber) + panNumber.length;
    const postLines = text.substring(nameIndex).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of postLines) {
      if (
        line.length >= 3 &&
        !panRegex.test(line) &&
        !/income tax|department|govt|card|father|signature/i.test(line)
      ) {
        name = line;
        break;
      }
    }
  }

  // Fallback: If still no name found but frontEndName exists
  if (!name && frontEndName && frontEndName.trim()) {
    name = frontEndName.trim();
  }

  return { panNumber, name };
}

// Function to validate PAN number
function validatePanNumber(panNumber) {
  if (!panNumber) return false;
  if (panNumber.length !== 10) return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber);
}

// POST endpoint to handle file upload for PAN card validation
router.post('/validatePanCard', upload.single('panPdfFile'), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      const message = "Please upload a file";
      logger.warn(message);
      await saveLog("warn", message, null, null, null, getIPv4(req.ip));
      return res.status(400).json({ success: false, error: message });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let extractedText = '';

    if (ext === '.pdf') {
      // 1. Fast-path: Check digital text in PDF using pdf-parse
      try {
        const pdfBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        if (pdfData && pdfData.text && pdfData.text.trim().length > 20) {
          const quickMatch = pdfData.text.match(panRegex);
          if (quickMatch) {
            extractedText = pdfData.text;
          }
        }
      } catch (pdfErr) {
        console.warn('pdf-parse skipped or failed, falling back to OCR:', pdfErr.message);
      }

      // 2. OCR fallback for scanned PDFs
      if (!extractedText) {
        const outputDir = path.join("output", `${Date.now()}-${Math.floor(Math.random() * 10000)}`);
        await fs.mkdir(outputDir, { recursive: true });
        try {
          await convert(filePath, {
            format: 'jpg',
            out_dir: outputDir,
            out_prefix: path.basename(filePath, path.extname(filePath)),
            page: null
          });

          const imageFiles = await fs.readdir(outputDir);
          if (imageFiles.length === 0) {
            return res.status(500).json({ success: false, error: 'Failed to convert PDF to images' });
          }

          for (const file of imageFiles) {
            const imagePath = path.join(outputDir, file);
            const imageBuffer = await fs.readFile(imagePath);
            const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
            extractedText += text + '\n';
          }
        } finally {
          await fs.rm(outputDir, { recursive: true, force: true }).catch(() => {});
        }
      }
    } else {
      // Image files (.jpg, .jpeg, .png, .webp) - direct OCR without poppler!
      const imageBuffer = await fs.readFile(filePath);
      const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
      extractedText = text;
    }

    // Log the OCR text for debugging
    console.log('OCR Extracted Text:', extractedText);

    // Extract information from the OCR text
    const frontEndName = req.body.name;
    const extractedInfo = extractPanInfo(extractedText, frontEndName);

    // Validate PAN number from frontend
    const frontEndPanNumber = req.body.panNumber ? req.body.panNumber.toString().trim().toUpperCase() : null;
    if (!validatePanNumber(frontEndPanNumber)) {
      const msg = 'Invalid PAN number entered. Please enter a valid 10-digit PAN (e.g. ABCDE1234F).';
      logger.warn(msg);
      await saveLog("warn", msg, req.file.originalname, extractedInfo.name, frontEndPanNumber, getIPv4(req.ip));
      return res.status(400).json({ success: false, error: msg });
    }

    // Validate PAN number from backend extraction
    if (!validatePanNumber(extractedInfo.panNumber)) {
      const msg = 'Could not detect a valid 10-digit PAN number on the uploaded document. Please upload a clear document.';
      logger.warn(msg);
      await saveLog("warn", msg, req.file.originalname, extractedInfo.name, extractedInfo.panNumber, getIPv4(req.ip));
      return res.status(400).json({ success: false, error: msg });
    }

    // Compare PAN numbers from frontend and backend
    if (frontEndPanNumber !== extractedInfo.panNumber) {
      const msg = `PAN number mismatch: Document shows ${extractedInfo.panNumber} but you entered ${frontEndPanNumber}.`;
      logger.warn(msg);
      await saveLog("warn", msg, req.file.originalname, extractedInfo.name, extractedInfo.panNumber, getIPv4(req.ip));
      return res.status(400).json({ success: false, error: msg });
    }

    // Validate name
    if (!extractedInfo.name) {
      const msg = 'Cardholder name not found on the uploaded document.';
      logger.warn(msg);
      await saveLog("warn", msg, req.file.originalname, extractedInfo.name, extractedInfo.panNumber, getIPv4(req.ip));
      return res.status(400).json({ success: false, error: msg });
    }

    // Save extracted information to the database
    await savePanCardKyc(req.file.originalname, extractedInfo.panNumber, extractedInfo.name);

    const successMessage = "Pan verification done";
    logger.info(successMessage);
    await saveLog(
      "info",
      successMessage,
      req.file.originalname,
      extractedInfo.name,
      extractedInfo.panNumber,
      getIPv4(req.ip)
    );

    res.json({ success: true, data: extractedInfo });
  } catch (error) {
    console.error('Error in validatePanCard:', error);
    res.status(500).json({ success: false, error: error.message || 'An error occurred during verification' });
  }
});

// Function to save PAN Card KYC information into the database
async function savePanCardKyc(file, panNumber, name) {
  try {
    // Check if a document with the same aadharNumber already exists
    const existingPanCardKyc = await PanCardKyc.findOne({ where: { panNumber } });

    if (existingPanCardKyc) {
      // Handle the situation where the document already exists
      console.log(
        `PanCardKyc information with Pan number ${panNumber} already exists`
      );

      existingPanCardKyc.name = name;
      existingPanCardKyc.status = 'completed';
      await existingPanCardKyc.save();
    } else {
      // Create a new AadharKyc document
      await PanCardKyc.create({
        file: file,
        name: name,
        panNumber: panNumber,
        status: 'completed',
      });
      console.log("PanCardKyc information saved into database successfully");
    }
  } catch (error) {
    console.error("Error saving PanCardKyc information:", error);
    throw error;
  }
}

// Function to save logs to the database
async function saveLog(
  level,
  message,
  file = null,
  name = null,
  panNumber = null,
  ipAddress = null
) {
  try {
    await Log.create({
      level,
      message,
      file,
      name,
      panNumber,
      ipAddress,
    });
  } catch (error) {
    console.error("Error saving log to database:", error);
  }
}
module.exports = router;
