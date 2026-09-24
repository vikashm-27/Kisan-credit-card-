const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const VoterIdKyc = require("../models/voterIdKyc");
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

// Regular expression to extract Voter ID number (assuming Voter ID format)
const voterIdRegex = /([A-Z]{3}[0-9]{7})/;

// Function to extract information from text using regular expressions
function extractVoterIdInfo(text) {
  const voterIdMatch = text.match(voterIdRegex);
  const voterIdNumber = voterIdMatch ? voterIdMatch[0] : null;

  // Extracting name (assuming name is near the Voter ID number in the text)
  const nameIndex = voterIdNumber
    ? text.indexOf(voterIdNumber) + voterIdNumber.length
    : -1;
  const name =
    nameIndex !== -1 ? text.substring(nameIndex).trim().split("\n")[0] : null;

  // Return extracted information
  return { voterIdNumber, name };
}

// Function to validate Voter ID number
function validateVoterIdNumber(voterIdNumber) {
  if (!voterIdNumber) return false; // Voter ID number not found in the text
  // Voter ID number validation logic (you can replace it with your validation logic)
  // For example, checking the length and format
  if (voterIdNumber.length !== 10) return false;
  return true;
}

// Function to extract information from text using regular expressions
function extractVoterIdInfo(text) {
  const voterIdMatch = text.match(voterIdRegex); // Assuming voterIdRegex is defined
  const voterIdNumber = voterIdMatch ? voterIdMatch[0] : null;

  // Extracting name (assuming name is present near the Voter ID number in the text)
  let name = null;
  if (voterIdNumber) {
    // Find the index of the voter ID number
    const voterIdIndex = text.indexOf(voterIdNumber);

    // Extract the substring before the voter ID number as potential name
    if (voterIdIndex > 0) {
      // Attempt to find the start of the name
      let potentialName = text.substring(0, voterIdIndex).trim();

      // Adjusted regex to capture full name
      const nameRegex = /[A-Za-z]+(?:\s+[A-Za-z]+)*/;
      const nameMatch = potentialName.match(nameRegex);
      name = nameMatch ? nameMatch[0] : null;
    }
  }

  // Return extracted information
  return { voterIdNumber, name };
}

const nameRegex = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/;

// const exclusionPhrases = ["Election Commission of India", "Government of India", "Electoral Roll", "Booth Level Officer", "Download Date", "Poll Date", "Serial No.", "Assembly Constituency No. and Name :131-Jammalamadugu",
//   "Part No. and Name :277-Yerraguntl",
//   "Polling Station Address :Zilla Parishad Boys High School, Old Building", "Room No.11, Yerraguntla",
//   "e-Electors Photo Identity Card"];

// List of phrases to exclude as non-names
const exclusionPhrases = ["Election Commission of India", "Government of India", "Electoral Roll", "Booth Level Officer",
  "Assembly Constituency No. and Name :128-Rayachoti",
  "Part No. and Name :220-GURRAMVANDLAPALLE H/O.NULIVEEDU"
];

const inclusionPhrases = ["Name"];

// Function to check if a string is a likely name
function isLikelyName(text) {
  // Check if the text matches the name regex and doesn't contain any exclusion phrases and contains inclusion phrases
  return (
    nameRegex.test(text) &&
    !exclusionPhrases.some((phrase) => text.includes(phrase)) &&
    inclusionPhrases.some((phrase) => text.includes(phrase))
  );
}

// Function to extract information from text using regular expressions
function extractVoterIdInfo(text) {
  const voterIdMatch = text.match(voterIdRegex); // Assuming voterIdRegex is defined
  const voterIdNumber = voterIdMatch ? voterIdMatch[0] : null;

  // Extracting name (assuming name is present near the Voter ID number in the text)
  let name = null;
  if (voterIdNumber) {
    // Find the index of the Voter ID number
    const voterIdIndex = text.indexOf(voterIdNumber);

    // Extract the substring before the Voter ID number as potential name
    if (voterIdIndex > 0) {
      // Attempt to find the start of the name
      let potentialText = text.substring(0, voterIdIndex).trim();

      // Split potential text into lines to analyze each line for probable names
      const lines = potentialText.split("\n");

      for (const line of lines) {
        const potentialName = line.trim();
        if (isLikelyName(potentialName)) {
          name = potentialName;
          break;
        }
      }

      // If no name found, attempt to find in the remaining text after the Voter ID number
      if (!name) {
        const remainingText = text
          .substring(voterIdIndex + voterIdNumber.length)
          .trim();
        const linesAfter = remainingText.split("\n");

        for (const line of linesAfter) {
          const potentialName = line.trim();
          if (isLikelyName(potentialName)) {
            name = potentialName;
            break;
          }
        }
      }
    }
  }

  // Return extracted information
  return { voterIdNumber, name };
}

// POST endpoint to handle file upload for Voter ID validation
router.post(
  "/validateVoterId",
  upload.single("voterIDPdfFile"),
  async (req, res) => {
    try {
      // Check if a file was uploaded
      if (!req.file) {
        const message = "Please upload a file";
        logger.warn(message);
        await saveLog("warn", message, null, null, null, getIPv4(req.ip));
        return res.status(400).json({ error: message });
      }
      // Read the uploaded PDF file
      const pdfPath = req.file.path;
      const pdfBuffer = await fs.readFile(pdfPath);

      // Extract text from PDF using pdf-parse
      const pdfData = await pdfParse(pdfBuffer);
      const extractedText = pdfData.text;

      // Extract information from the OCR text
      const extractedInfo = extractVoterIdInfo(extractedText);

      // Validate Voter ID number from frontend
      const frontEndVoterIdNumber = req.body.voterIdNumber;
      if (!validateVoterIdNumber(frontEndVoterIdNumber)) {
        const msg = "Invalid Voter ID number from frontend";
        logger.warn(msg);
        await saveLog("warn", msg, req.file.originalname, extractedInfo.name, extractedInfo.voterIdNumber, getIPv4(req.ip));
        return res
          .status(400)
          .json({ error: msg });
      }

      // Validate Voter ID number from backend extraction
      if (!validateVoterIdNumber(extractedInfo.voterIdNumber)) {
        const msg = "Invalid Voter ID number extracted from PDF";
        logger.warn(msg);
        await saveLog("warn", msg, req.file.originalname, extractedInfo.name, extractedInfo.voterIdNumber, getIPv4(req.ip));
        return res
          .status(400)
          .json({ error: msg });
      }

      // Compare Voter ID numbers from frontend and backend
      if (frontEndVoterIdNumber !== extractedInfo.voterIdNumber) {
        const msg = "Voter ID numbers from frontend and backend do not match";
        logger.warn(msg);
        await saveLog("warn", msg, req.file.originalname, extractedInfo.name, extractedInfo.voterIdNumber, getIPv4(req.ip));
        return res
          .status(400)
          .json({
            error: msg,
          });
      }

      // Validate name
      if (!extractedInfo.name) {
        const msg = "Name not found in the PDF";
        logger.warn(msg);
        await saveLog("warn", msg, req.file.originalname, extractedInfo.name, extractedInfo.voterIdNumber, getIPv4(req.ip));
        return res.status(400).json({ error: msg });
      }

      // Save extracted information to the database
      await saveVoterIdKyc(
        req.file.originalname,
        extractedInfo.voterIdNumber,
        extractedInfo.name
      );
      const successMessage =
        "VoterId verification done";
      logger.info(successMessage);
      await saveLog(
        "info",
        successMessage,
        req.file.originalname,
        extractedInfo.name,
        extractedInfo.voterIdNumber,
        getIPv4(req.ip)
      );

      res.json({ success: true, data: extractedInfo });

      // res.json(responseData);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, error: "An error occurred" });
    }
  }
);

// Function to save Voter ID KYC information into the database
async function saveVoterIdKyc(file, voterIdNumber, name) {
  try {
    // Check if a document with the same aadharNumber already exists
    const existingVoterIdKyc = await VoterIdKyc.findOne({ where: { voterIdNumber } });

    if (existingVoterIdKyc) {
      // Handle the situation where the document already exists
      console.log(
        `VoterIdKyc information with VoterId number ${voterIdNumber} already exists`
      );

      existingVoterIdKyc.name = name;
      existingVoterIdKyc.status = 'completed';
      await existingVoterIdKyc.save();
    } else {
      // Create a new AadharKyc document
      await VoterIdKyc.create({
        file: file,
        name: name,
        voterIdNumber: voterIdNumber,
        status: 'completed',
      });
      console.log("VoterIdKyc information saved into database successfully");
    }
  } catch (error) {
    console.error("Error saving VoterIdKyc information:", error);
    throw error;
  }
}

// Function to save logs to the database
async function saveLog(
  level,
  message,
  file = null,
  name = null,
  voterIdNumber = null,
  ipAddress = null
) {
  try {
    await Log.create({
      level,
      message,
      file,
      name,
      voterIdNumber,
      ipAddress,
    });
  } catch (error) {
    console.error("Error saving log to database:", error);
  }
}

module.exports = router;
