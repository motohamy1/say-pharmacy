const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Directory where CSV files will be stored
const csvDirectory = path.join(__dirname, '..', '..', 'data');

/**
 * Scrapes drug data from the Egyptian Drug Authority website
 * @returns {Promise<Array>} - Promise resolving to array of drug objects
 */
const scrapeEDAData = async () => {
  let browser;
  try {
    console.log('Starting EDA data scraping...');
    
    // Launch browser with appropriate settings for government websites
    browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });
    
    // Navigate to the EDA drug search page
    console.log('Navigating to EDA website...');
    await page.goto('http://eservices.edaegypt.gov.eg/EDASearch/SearchRegDrugs.aspx', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    console.log('Waiting for page to load...');
    
    // Wait for the main content to load
    await page.waitForSelector('body', { timeout: 30000 });
    
    // Small delay to ensure all content is loaded
    await page.waitForTimeout(5000);
    
    // Extract drug information
    console.log('Extracting drug data...');
    const drugData = await page.evaluate(() => {
      const drugs = [];
      
      // Try multiple possible selectors for drug tables
      const possibleSelectors = [
        '#ContentPlaceHolder1_gvRegDrugs',
        '.gvRegDrugs',
        '[id*="RegDrugs"]',
        'table'
      ];
      
      let table = null;
      for (const selector of possibleSelectors) {
        table = document.querySelector(selector);
        if (table) break;
      }
      
      if (!table) {
        console.log('Could not find drug table, checking page structure');
        // Return page structure info for debugging
        return { error: 'Table not found', pageStructure: Array.from(document.querySelectorAll('*')).map(el => el.tagName).slice(0, 50) };
      }
      
      // Get all rows except the header
      const rows = table.querySelectorAll('tr');
      
      if (rows.length <= 1) {
        return { error: 'No data rows found', rowCount: rows.length };
      }
      
      // Process each row
      for (let i = 1; i < rows.length; i++) { // Skip header row
        const cells = rows[i].querySelectorAll('td');
        
        // Skip rows with insufficient data
        if (cells.length < 3) continue;
        
        // Extract drug information
        const drug = {
          tradeName: cells[0] ? cells[0].textContent.trim() : '',
          scientificName: cells[1] ? cells[1].textContent.trim() : '',
          manufacturer: cells[2] ? cells[2].textContent.trim() : '',
          dosageForm: cells[3] ? cells[3].textContent.trim() : '',
          registrationNumber: cells[4] ? cells[4].textContent.trim() : '',
          registrationDate: cells[5] ? cells[5].textContent.trim() : '',
          expiryDate: cells[6] ? cells[6].textContent.trim() : '',
          marketStatus: cells[7] ? cells[7].textContent.trim() : '',
          // Add timestamp for data freshness
          scrapedAt: new Date().toISOString()
        };
        
        // Only add drugs with meaningful data
        if (drug.tradeName || drug.scientificName) {
          drugs.push(drug);
        }
      }
      
      return drugs;
    });
    
    // Handle error cases
    if (drugData && drugData.error) {
      console.error('Scraping error:', drugData.error);
      console.log('Page structure info:', drugData.pageStructure);
      return [];
    }
    
    console.log(`Successfully scraped ${drugData.length} drugs from EDA website`);
    return drugData;
  } catch (error) {
    console.error('Error scraping EDA data:', error);
    
    // Handle specific blocked client error
    if (error.message && error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
      console.log('EDA website is blocked by client (ad blocker or similar). Returning sample data for development.');
      return getSampleData();
    }
    
    // Try to get more information about the page for debugging
    if (browser && browser.pages) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          const page = pages[0];
          const url = page.url();
          const title = await page.title();
          console.log(`Current page: ${url}, Title: ${title}`);
        }
      } catch (pageError) {
        console.error('Error getting page info:', pageError);
      }
    }
    
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Saves scraped EDA data to CSV
 * @param {Array} data - Array of drug objects
 * @returns {Promise<void>}
 */
const saveEDADataToCSV = async (data) => {
  try {
    // Ensure data directory exists
    await fs.mkdir(csvDirectory, { recursive: true });
    
    const filePath = path.join(csvDirectory, 'eda_drugs.csv');
    
    if (!data || data.length === 0) {
      throw new Error('No data to save');
    }
    
    // Create CSV content
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => {
      return Object.values(obj).map(value => {
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    
    await fs.writeFile(filePath, csvContent, 'utf8');
    console.log(`Saved ${data.length} drugs to ${filePath}`);
  } catch (error) {
    console.error('Error saving EDA data to CSV:', error);
    throw error;
  }
};

/**
 * Updates local database with latest EDA data
 * @returns {Promise<void>}
 */
const updateEDADatabase = async () => {
  try {
    console.log('Starting EDA data update...');
    const drugData = await scrapeEDAData();
    
    if (drugData.length === 0) {
      console.warn('No drug data was scraped from EDA website');
      return;
    }
    
    await saveEDADataToCSV(drugData);
    console.log('EDA data update completed successfully');
  } catch (error) {
    console.error('Failed to update EDA database:', error);
    throw error;
  }
};

// Sample data for development when EDA website is blocked
function getSampleData() {
  return [
    {
      tradeName: 'Panadol Extra',
      scientificName: 'Paracetamol 500mg + Caffeine 65mg',
      manufacturer: 'GSK',
      dosageForm: 'Tablet',
      registrationNumber: '12345/2020',
      registrationDate: '2020-05-15',
      expiryDate: '2025-05-15',
      marketStatus: 'Active',
      scrapedAt: new Date().toISOString()
    },
    {
      tradeName: 'Amoxicillin Capsules',
      scientificName: 'Amoxicillin 500mg',
      manufacturer: 'PharmaCo',
      dosageForm: 'Capsule',
      registrationNumber: '67890/2019',
      registrationDate: '2019-08-22',
      expiryDate: '2024-08-22',
      marketStatus: 'Active',
      scrapedAt: new Date().toISOString()
    },
    {
      tradeName: 'Loratadine Tablets',
      scientificName: 'Loratadine 10mg',
      manufacturer: 'AllergyMed',
      dosageForm: 'Tablet',
      registrationNumber: '11111/2021',
      registrationDate: '2021-03-10',
      expiryDate: '2026-03-10',
      marketStatus: 'Active',
      scrapedAt: new Date().toISOString()
    }
  ];
}

module.exports = {
  scrapeEDAData,
  saveEDADataToCSV,
  updateEDADatabase
};
