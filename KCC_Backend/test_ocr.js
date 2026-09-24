const { convert } = require("pdf-poppler");
const Tesseract = require("tesseract.js");
const fs = require("fs").promises;
const path = require("path");

async function testOCR() {
  try {
    const pdfPath = path.join("upload", "Abhi-Addhar.pdf");
    const outputDir = path.join("output", `test-${Date.now()}`);
    await fs.mkdir(outputDir, { recursive: true });
    
    console.log("Converting PDF...");
    await convert(pdfPath, { format: "jpg", out_dir: outputDir });
    
    const imageFiles = await fs.readdir(outputDir);
    let extractedText = "";
    
    console.log("Running Tesseract...");
    for (const file of imageFiles) {
      const imagePath = path.join(outputDir, file);
      const imageBuffer = await fs.readFile(imagePath);
      const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng");
      extractedText += text + "\n";
    }
    
    console.log("=== OCR EXTRACTED TEXT ===");
    console.log(extractedText);
    console.log("==========================");
    
    const dobRegex = /(?:DOB\s*:?\s*|)(\d{2}[-/]\d{2}[-/]\d{4})/;
    const match = extractedText.match(dobRegex);
    console.log("DOB Regex Match:", match ? match[1] : "No match");
    
    await fs.rm(outputDir, { recursive: true, force: true });
  } catch (error) {
    console.error("Error:", error);
  }
}

testOCR();
