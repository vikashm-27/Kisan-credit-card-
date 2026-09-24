const express = require("express");
const multer = require("multer");
const { convert } = require("pdf-poppler");
const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const AadharKyc = require("../models/aadharKyc");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const Log = require("../models/log");
const winston = require("winston");
const os = require("os");

// Get the machine's actual local network IPv4 address
const getLocalIPv4 = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.family === "IPv4") {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
};

// Helper function to convert IPv6 / loopback addresses to a real IPv4 address
const getIPv4 = (ip) => {
  if (!ip) return ip;
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }
  if (ip === "::1" || ip === "127.0.0.1") {
    return getLocalIPv4();
  }
  return ip;
};

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload"); // Save uploaded files to the 'upload' directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original filename
  },
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

// Regular expressions to extract Aadhar number and date of birth
const aadharRegex = /\b\d{4}\s*\d{4}\s*\d{4}\b/;
const dobRegex = /(?:DOB\s*:?\s*|)(\d{2}[-/]\d{2}[-/]\d{4})/;

// Helper to extract date of birth across various Aadhaar formats and regional languages
function extractDob(text) {
  if (!text) return null;

  // 1. Explicit DOB label in English or Indian regional languages with DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dobLabelPattern = /(?:DOB|D\.?O\.?B\.?|D0B|DO8|Date\s*of\s*Birth|जन्म\s*तिथि|जन्म\s*तारीख|పుట్టిన\s*తేదీ|ಹುಟ್ಟಿದ\s*ದಿನಾಂಕ|பிறந்த\s*தேதி)[^\d]{0,15}(\d{1,2})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{4})/i;
  let match = text.match(dobLabelPattern);
  if (match) {
    const day = String(match[1]).padStart(2, "0");
    const month = String(match[2]).padStart(2, "0");
    const year = match[3];
    return `${day}/${month}/${year}`;
  }

  // 2. Year of birth only (UIDAI standard fallback: 01/01/YYYY)
  const yobPattern = /(?:Year\s*of\s*Birth|YOB|ಜನ್ಮಿಸಿದ\s*ವರ್ಷ|జన్మించిన\s*సంవత్సరం)[^\d]{0,15}(\d{4})/i;
  match = text.match(yobPattern);
  if (match) {
    return `01/01/${match[1]}`;
  }

  // 3. Fallback: Search for any valid date matching DD/MM/YYYY or DD-MM-YYYY in the document
  const allDatesPattern = /(?:^|[^\d])(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?=[^\d]|$)/g;
  let dMatch;
  const currentYear = new Date().getFullYear();
  allDatesPattern.lastIndex = 0;
  while ((dMatch = allDatesPattern.exec(text)) !== null) {
    const day = parseInt(dMatch[1], 10);
    const month = parseInt(dMatch[2], 10);
    const year = parseInt(dMatch[3], 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= currentYear) {
      return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    }
  }

  // 4. Fallback to existing dobRegex match if any
  if (dobRegex.global) dobRegex.lastIndex = 0;
  const legacyMatch = dobRegex.exec(text);
  return legacyMatch ? legacyMatch[1] : null;
}

// Helper to extract 12-digit Aadhaar number, avoiding 16-digit Virtual IDs (VID)
function extractAadharNumber(text, hintNumber) {
  if (!text) return null;

  if (hintNumber) {
    const cleanHint = String(hintNumber).replace(/\s/g, "");
    const cleanText = text.replace(/\s/g, "");
    if (cleanHint.length === 12 && cleanText.includes(cleanHint)) {
      return cleanHint;
    }
  }

  // Strip 16-digit VIDs first so they don't get partially matched as a 12-digit Aadhaar
  const textWithoutVid = text.replace(/\b\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\b/g, "");

  // Look for Aadhaar number label
  const labeledMatch = textWithoutVid.match(/(?:Aadhaar\s*(?:No\.?|Number)?\s*[:/]?\s*)(\d{4}\s*\d{4}\s*\d{4})/i);
  if (labeledMatch) {
    return labeledMatch[1].replace(/\s/g, "");
  }

  // Standard 12-digit match
  const aadharMatch = textWithoutVid.match(/\b\d{4}\s*\d{4}\s*\d{4}\b/);
  if (aadharMatch) {
    return aadharMatch[0].replace(/\s/g, "");
  }

  // Fallback to original regex
  const origMatch = text.match(aadharRegex);
  return origMatch ? origMatch[0].replace(/\s/g, "") : null;
}

// Function to extract information from text using regular expressions
function extractInfo(text, frontEndName, hintNumber) {
  let name = null;
  const safeName = frontEndName ? String(frontEndName).trim() : "";
  const prefix = safeName.length >= 3 ? safeName.slice(0, 3) : safeName;

  if (prefix) {
    const nameRegexPattern = new RegExp(`(?:${prefix})\\s*(.+)`, "i");
    const nameMatch = text.match(nameRegexPattern);
    const formattedFrontEndName =
      prefix.slice(0, 1).toUpperCase() +
      prefix.slice(1, 3).toLowerCase();
    name = nameMatch
      ? `${formattedFrontEndName}${nameMatch[1].split(/[\n\r]/)[0].trim()}`
      : null;
  }

  const aadharNumber = extractAadharNumber(text, hintNumber);
  const dob = extractDob(text);

  return { name, aadharNumber, dob };
}

// POST endpoint to handle file upload
router.post("/validateAadhar", upload.single("pdfFile"), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      const message = "Please upload a file";
      logger.warn(message);
      await saveLog("warn", message, null, null, null, null, getIPv4(req.ip));
      return res.status(400).json({ error: message });
    }

    const frontEndName = req.body.name;
    const hintNumber = req.body.aadhar_number || req.body.number;
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let extractedText = "";

    // 1. Fast-path: Check if the PDF has embedded digital text using pdf-parse
    if (ext === ".pdf") {
      try {
        const pdfBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        if (pdfData && pdfData.text && pdfData.text.trim().length > 20) {
          const quickInfo = extractInfo(pdfData.text, frontEndName, hintNumber);
          if (quickInfo.dob && quickInfo.aadharNumber) {
            extractedText = pdfData.text;
          }
        }
      } catch (pdfErr) {
        // Fall back to OCR conversion
      }
    }

    // 2. OCR processing if digital text was not present
    if (!extractedText) {
      if (ext === ".pdf") {
        // Convert uploaded PDF to high-resolution images (scale: 2048, png) for accurate OCR
        const outputDir = path.join("output", `${Date.now()}-${Math.floor(Math.random() * 10000)}`);
        await fs.mkdir(outputDir, { recursive: true });
        try {
          await convert(filePath, { format: "png", scale: 2048, out_dir: outputDir });
          const imageFiles = await fs.readdir(outputDir);
          if (imageFiles.length === 0) {
            return res.status(500).json({ error: "Failed to convert PDF to images" });
          }

          for (const file of imageFiles) {
            const imagePath = path.join(outputDir, file);
            const imageBuffer = await fs.readFile(imagePath);
            const {
              data: { text },
            } = await Tesseract.recognize(imageBuffer, "eng", {
              logger: (m) => console.log(m),
            });
            extractedText += text + "\n";
          }
        } finally {
          await fs.rm(outputDir, { recursive: true, force: true }).catch(() => {});
        }
      } else {
        // File is an image (.jpg, .jpeg, .png)
        const imageBuffer = await fs.readFile(filePath);
        const {
          data: { text },
        } = await Tesseract.recognize(imageBuffer, "eng", {
          logger: (m) => console.log(m),
        });
        extractedText += text + "\n";
      }
    }

    // Log the OCR text for debugging
    console.log("OCR Extracted Text:", extractedText);

    // Extract information from the OCR text using the front end name and hint number
    const extractedInfo = extractInfo(extractedText, frontEndName, hintNumber);

    // Validate Aadhar number from backend extraction
    if (aadharRegex.global) aadharRegex.lastIndex = 0;
    if (!extractedInfo.aadharNumber || !aadharRegex.test(extractedInfo.aadharNumber)) {
      const msg = "Invalid Aadhar number extracted from PDF";
      logger.warn(msg);
      await saveLog("warn", msg, req.file.originalname, extractedInfo.name, extractedInfo.dob, extractedInfo.aadharNumber, getIPv4(req.ip));
      return res.status(400).json({ error: msg });
    }

    // Validate date of birth from backend extraction
    if (dobRegex.global) dobRegex.lastIndex = 0;
    if (!extractedInfo.dob || !dobRegex.test(extractedInfo.dob)) {
      const msg = "Invalid date of birth extracted from PDF";
      logger.warn(msg);
      await saveLog("warn", msg, req.file.originalname, extractedInfo.name, extractedInfo.dob, extractedInfo.aadharNumber, getIPv4(req.ip));
      return res.status(400).json({ error: msg });
    }

    // Validate name
    if (!extractedInfo.name) {
      const msg = "Name not found in the PDF";
      logger.warn(msg);
      await saveLog("warn", msg, req.file.originalname, extractedInfo.name, extractedInfo.dob, extractedInfo.aadharNumber, getIPv4(req.ip));
      return res.status(400).json({ error: msg });
    }

    // Save extracted information to the database
    await saveAadharKyc(
      req.file.originalname,
      extractedInfo.name,
      extractedInfo.dob,
      extractedInfo.aadharNumber
    );
    const successMessage =
      "Aadhar verification done";
    logger.info(successMessage);
    await saveLog(
      "info",
      successMessage,
      req.file.originalname,
      extractedInfo.name,
      extractedInfo.dob,
      extractedInfo.aadharNumber,
      getIPv4(req.ip)
    );

    res.json({ success: true, data: extractedInfo });
    // res.json(responseData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "An error occurred" });
  }
});

// Function to save AadharKyc information into the database
async function saveAadharKyc(file, name, dob, aadharNumber) {
  try {
    // Check if a document with the same aadharNumber already exists
    const existingAadharKyc = await AadharKyc.findOne({ where: { aadharNumber } });

    if (existingAadharKyc) {
      // Handle the situation where the document already exists
      console.log(
        `AadharKyc information with Aadhar number ${aadharNumber} already exists`
      );

      existingAadharKyc.name = name;
      existingAadharKyc.dob = dob;
      existingAadharKyc.status = 'completed';
      await existingAadharKyc.save();
    } else {
      // Create a new AadharKyc document
      await AadharKyc.create({
        file: file,
        name: name,
        dob: dob,
        aadharNumber: aadharNumber,
        status: 'completed',
      });
      console.log("AadharKyc information saved into database successfully");
    }
  } catch (error) {
    console.error("Error saving AadharKyc information:", error);
    throw error;
  }
}
// Function to save logs to the database
async function saveLog(
  level,
  message,
  file = null,
  name = null,
  dob = null,
  aadharNumber = null,
  ipAddress = null
) {
  try {
    await Log.create({
      level,
      message,
      file,
      name,
      dob,
      aadharNumber,
      ipAddress,
    });
  } catch (error) {
    console.error("Error saving log to database:", error);
  }
}
module.exports = router;
