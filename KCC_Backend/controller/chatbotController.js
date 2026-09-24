const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
// We only initialize this if the API key is present
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// System instruction to tune the bot's behavior
const systemInstruction = `
You are the official AI Assistant and Guide for the "Draft KCC - Kisan Credit Card Portal".
Your primary goal is to help farmers understand the Kisan Credit Card (KCC) scheme, 
the application process, KYC (Know Your Customer) requirements, agricultural loans, and land verification.

Tone: Professional, helpful, empathetic, and strictly related to agriculture, banking, and government schemes in India.
Do not answer questions unrelated to agriculture, KCC, banking, or the application.
Keep your answers concise, structured, and easy to read.

Key facts about the platform:
- We support Aadhaar, PAN, and Voter ID for biometric KYC verification.
- We support digital Land Verification to accelerate loan processing.
- KCC offers a revolving cash credit facility valid for 5 years.
- No margin is required for agricultural loans up to ₹1.6 Lakhs.
- Features include prompt repayment subvention and built-in crop insurance.

When a user greets you, introduce yourself as the KCC AI Guide.
`;

exports.handleChat = async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ success: false, message: "Gemini API key is not configured on the server." });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: "Messages array is required." });
    }

    // Use gemini-2.0-flash which is the active and universally available model for new keys
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemInstruction,
    });

    // Format history for Gemini (excluding the very last user message)
    let history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // CRITICAL: Gemini strictly requires the history array to start with a 'user' role.
    if (history.length > 0 && history[0].role === 'model') {
      history.shift(); // Remove the first element
    }

    const latestMessage = messages[messages.length - 1].text;

    // Start a chat session with history
    const chat = model.startChat({ history });

    // Send the latest message
    const result = await chat.sendMessage(latestMessage);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      success: true,
      text: text
    });

  } catch (error) {
    console.error("Gemini AI Chat Error:", error);
    res.status(500).json({ success: false, message: "Failed to communicate with AI.", error: error.message });
  }
};
