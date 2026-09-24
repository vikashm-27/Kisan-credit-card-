const fs = require("fs").promises;
const path = require("path");
const pdfParse = require("pdf-parse");

async function testPdfParse() {
  try {
    const pdfPath = path.join("upload", "Abhi-Addhar.pdf");
    const pdfBuffer = await fs.readFile(pdfPath);
    
    const pdfData = await pdfParse(pdfBuffer);
    console.log("=== PDF PARSE EXTRACTED ===");
    console.log(pdfData.text);
    console.log("==============================");
    
    const dobRegex = /(?:DOB\s*:?\s*|)(\d{2}[-/]\d{2}[-/]\d{4})/;
    const dobMatch = pdfData.text.match(dobRegex);
    console.log("DOB Regex Match:", dobMatch ? dobMatch[1] : "No match");
  } catch (err) {
    console.error(err);
  }
}
testPdfParse();
