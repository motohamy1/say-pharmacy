// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001; // Explicitly set the port to 3001

// --- Middleware ---
// Consider if you need credentials: true and the specific origin.
// For initial testing, allowing all origins might simplify things:
// app.use(cors());
// Or keep yours if it's correct for your frontend setup:
app.use(cors({ origin: 'http://localhost:8080', credentials: true })); // Ensure http://localhost:8080 matches your React dev server URL
app.use(express.json());

// --- Gemini AI Setup ---
// IMPORTANT: Make sure process.env.GEMINI_API_KEY is set correctly in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Routes ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // --- FIX: Use a valid model name ---
    // Options include: 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // <-- CORRECTED MODEL NAME

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Error with Gemini API:', error); // This log is crucial for debugging
    // Optional: Send more details back during development (remove in production)
    // res.status(500).json({ error: 'Failed to get response from AI', details: error.message });
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

// --- Server Start ---
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});