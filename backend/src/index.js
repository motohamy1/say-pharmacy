require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { scrapeEDAData } = require('./utils/edaScraper');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8080', // Frontend is running on port 8080
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});