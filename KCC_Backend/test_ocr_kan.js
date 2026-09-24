const Tesseract = require("tesseract.js");
const fs = require("fs").promises;
const path = require("path");

async function testOcrKan() {
  try {
    const outputDir = path.join("output");
    // Find the jpg in output dir (assuming I still have one, or I can just convert the pdf)
    const { convert } = require("pdf-poppler");
    const pdfPath = path.join("upload", "Abhi-Addhar.pdf");
    const testDir = path.join("output", "testkan");
    await fs.mkdir(testDir, { recursive: true });
    await convert(pdfPath, { format: "jpg", out_dir: testDir });
    
    const files = await fs.readdir(testDir);
    let extracted = "";
    for (const file of files) {
      if (file.endsWith(".jpg")) {
        console.log(`Processing ${file}...`);
        const { data: { text } } = await Tesseract.recognize(path.join(testDir, file), "eng+kan");
        extracted += text + "\n";
      }
    }
    console.log("=== KANNADA + ENG EXTRACTED ===");
    console.log(extracted);
    console.log("==============================");
    
    const dobRegex = /(?:DOB\s*:?\s*|)(\d{2}[-/]\d{2}[-/]\d{4})/;
    const dobMatch = extracted.match(dobRegex);
    console.log("DOB Regex Match:", dobMatch ? dobMatch[1] : "No match");
    
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (err) {
    console.error(err);
  }
}
testOcrKan();
