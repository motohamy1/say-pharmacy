require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Load drug data from JSON file
let drugsData = [];
const loadDrugsData = () => {
  try {
    const jsonPath = path.join(__dirname, '../../egyptian_drugs.json');
    console.log(`Attempting to load drugs from: ${jsonPath}`);
    
    // Check if file exists
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Drugs database file not found at: ${jsonPath}`);
    }
    
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    console.log(`Successfully read drugs file. File size: ${rawData.length} characters`);
    
    // Try to parse the JSON
    const parsedData = JSON.parse(rawData);
    
    if (!Array.isArray(parsedData)) {
      throw new Error('Drugs data is not an array');
    }
    
    drugsData = parsedData;
    console.log(`Successfully loaded ${drugsData.length} drugs from database`);
    
    // Log first few items for verification
    console.log('Sample of first 3 drugs:', JSON.stringify(drugsData.slice(0, 3), null, 2));
    
  } catch (error) {
    console.error('Error loading drugs data:', error.message);
    if (error.code === 'ENOENT') {
      console.error('The drugs database file was not found at the specified path.');
    } else if (error instanceof SyntaxError) {
      console.error('The drugs database file contains invalid JSON.');
    }
    drugsData = [];
    
    // Create a sample drug for testing if loading fails
    console.log('Creating sample drug for testing...');
    drugsData = [{
      id: 'sample-1',
      name: 'Panadol',
      company: 'GSK',
      activeIngredient: 'Paracetamol',
      form: 'Tablet',
      strength: '500mg',
      price: '10.00 EGP',
      description: 'For pain relief and fever reduction.'
    }];
  }
};

// Load data on startup
loadDrugsData();

// Custom CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://192.168.1.5:8080',
    'http://localhost:8081',
    'http://127.0.0.1:8081'
  ];

  const origin = req.headers.origin;
  
  // Log the request
  console.log('\n=== Incoming Request ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Origin:', origin);
  console.log('Headers:', req.headers);

  // Set CORS headers
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('Setting Access-Control-Allow-Origin:', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request');
    return res.status(200).end();
  }

  next();
});

app.use(express.json());

// Check for Gemini API Key and exit if not found
if (!process.env.GEMINI_API_KEY) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not set in the .env file.');
  console.debug('GEMINI_API_KEY:', process.env.GEMINI_API_KEY); // Add debug logging
  process.exit(1); // Exit the process with an error code
} else {
  console.log('✓ GEMINI_API_KEY loaded successfully');
  console.debug('GEMINI_API_KEY:', process.env.GEMINI_API_KEY); // Add debug logging
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to get a response from the AI model
async function getAIResponse(userInput, chatHistory) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  // System instruction to guide the AI model
  const systemInstruction = {
    role: "system",
    parts: [{
      text: `You are Mira, a friendly and knowledgeable AI pharmacy assistant for 
      'Say Pharmacy'. Your expertise is in Egyptian medications. 
      Your goal is to provide accurate, helpful, and safe information to users. 
      Here are your guidelines:\n\n1.  **Primary Focus:** Always prioritize information 
      about medications available in Egypt.\n2.  **Drug Information:** When asked about 
      a specific drug, provide details such as:\n    
      *   Active ingredients\n    *   Common uses and indications\n   
       *   Dosage and administration\n    *   Potential side effects\n   
       *  *   Important precautions or warnings\n    *   Known drug interactions\n3. 
       *  **Safety First:** NEVER provide a medical diagnosis or prescribe medication.
       *  Always advise users to consult with a doctor or licensed pharmacist for medical 
       * advice, diagnosis, or treatment plans. Use disclaimers like, "Please consult your 
       * healthcare provider for any medical advice."\n4.  **Data Source:** You can use the 
       * provided drug list for information. If a drug is not on the list, 
       * state that you don't have information about it and recommend consulting 
       * a pharmacist.\n5.  **Tone:** Be empathetic, clear, and professional. 
       * Keep your language easy to understand for a general audience.\n6.  
       * **Conversation Flow:** Maintain context from the chat history to 
       * provide relevant follow-up answers. If a query is unclear, ask for 
       * clarification.\n7.  **Non-Medication Queries:** If the user asks something 
       * outside your scope (e.g., the weather, politics), gently steer the 
       * conversation back to pharmacy topics. You can say, "My purpose is to 
       * assist with medication-related questions. How can I help you with that?"\n\nHere 
       * is a list of available drugs to 
       * reference:\n${JSON.stringify(drugsData.slice(0, 50))} ` // Using a slice for brevity
    }]
  };

  // Create a new chat session with the system instruction
  const chat = model.startChat({
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
    systemInstruction: systemInstruction,
    history: chatHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))
  });

  try {
    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

// Function to search for drugs locally
function searchDrugsLocally(query) {
  const searchTerm = query.toLowerCase();
  
  // Search for drugs that match the query
  const matchingDrugs = drugsData.filter(drug => {
    return Object.values(drug).some(value => 
      value && value.toString().toLowerCase().includes(searchTerm)
    );
  }).slice(0, 5); // Limit to top 5 results
  
  if (matchingDrugs.length === 0) {
    return `I couldn't find any information about "${query}" in our Egyptian drug database. Please try a different search term or check the spelling.`;
  }
  
  let response = `Here's what I found about "${query}" in our Egyptian drug database:\n\n`;
  
  matchingDrugs.forEach((drug, index) => {
    response += `${index + 1}. **${drug.name || 'Unknown Name'}**\n`;
    if (drug.company) response += `   Company: ${drug.company}\n`;
    if (drug.activeIngredient) response += `   Active Ingredient: ${drug.activeIngredient}\n`;
    if (drug.form) response += `   Form: ${drug.form}\n`;
    if (drug.strength) response += `   Strength: ${drug.strength}\n`;
    if (drug.price) response += `   Price: ${drug.price} EGP\n`;
    response += '\n';
  });
  
  return response;
}

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  console.log('\n=== New Chat Request ===');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { message, history = [] } = req.body;
    
    if (!message || typeof message !== 'string') {
      console.error('Invalid message format:', { message, type: typeof message });
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Message must be a non-empty string',
        details: { received: message, type: typeof message }
      });
    }

    console.log('Processing message:', message);
    console.log('History length:', history.length);

    try {
      // Try to get AI response
      console.log('Attempting to get AI response...');
      const aiResponse = await getAIResponse(message, history);
      console.log('AI Response successful');
      return res.json({ 
        response: aiResponse,
        source: 'ai'
      });
      
    } catch (aiError) {
      console.error('AI Service Error:', {
        message: aiError.message,
        stack: aiError.stack,
        name: aiError.name
      });
      
      // Fallback to local search
      console.log('Falling back to local database search...');
      const localResponse = searchDrugsLocally(message);
      
      return res.json({
        response: localResponse,
        source: 'local',
        fallback: true,
        error: aiError.message
      });
    }

  } catch (error) {
    console.error('Chat Endpoint Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An error occurred while processing your request',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }  
});

// API Routes
app.get('/api/drugs', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    
    let filteredDrugs = drugsData;
    
    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredDrugs = drugsData.filter(drug => {
        return Object.values(drug).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm)
        );
      });
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedDrugs = filteredDrugs.slice(startIndex, endIndex);
    
    res.json({
      drugs: paginatedDrugs,
      total: filteredDrugs.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredDrugs.length / limit)
    });
  } catch (error) {
    console.error('Error fetching drug data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch drug data',
      message: error.message 
    });
  }
});

// Search specific endpoint
app.get('/api/drugs/search', async (req, res) => {
  try {
    const { q, category, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const searchTerm = q.toLowerCase();
    let results = drugsData.filter(drug => {
      const matchesSearch = Object.values(drug).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm)
      );
      
      const matchesCategory = !category || 
        (drug.category && drug.category.toLowerCase().includes(category.toLowerCase()));
      
      return matchesSearch && matchesCategory;
    });
    
    // Limit results
    results = results.slice(0, parseInt(limit));
    
    res.json({
      results,
      count: results.length,
      query: q
    });
  } catch (error) {
    console.error('Error searching drugs:', error);
    res.status(500).json({ 
      error: 'Failed to search drugs',
      message: error.message 
    });
  }
});

// Reload data endpoint (useful for updating the database)
app.post('/api/drugs/reload', (req, res) => {
  try {
    loadDrugsData();
    res.json({ 
      message: 'Drug data reloaded successfully',
      count: drugsData.length 
    });
  } catch (error) {
    console.error('Error reloading drug data:', error);
    res.status(500).json({ 
      error: 'Failed to reload drug data',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});