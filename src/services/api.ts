// API Service for centralized API calls

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Helper function to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`
    }));
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
}

// Chat API
export const chatAPI = {
  sendMessage: async (message: string, history: any[] = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history }),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  }
};

// Drugs API
export const drugsAPI = {
  // Fetch drugs with pagination and search
  fetchDrugs: async (params: { search?: string; page?: number; limit?: number }) => {
    try {
      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.limit || 12).toString(),
        ...(params.search && { search: params.search })
      });

      const response = await fetch(`${API_BASE_URL}/api/drugs?${queryParams}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Drugs API Error:', error);
      throw error;
    }
  },

  // Search drugs
  searchDrugs: async (query: string, category?: string, limit: number = 20) => {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        ...(category && { category })
      });

      const response = await fetch(`${API_BASE_URL}/api/drugs/search?${queryParams}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Drug Search API Error:', error);
      throw error;
    }
  },

  // Reload drugs database
  reloadDatabase: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drugs/reload`, {
        method: 'POST',
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Database Reload Error:', error);
      throw error;
    }
  }
};

// Health check API
export const healthAPI = {
  check: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return handleResponse(response);
    } catch (error) {
      console.error('Health Check Error:', error);
      throw error;
    }
  }
};

// Export all APIs
export default {
  chat: chatAPI,
  drugs: drugsAPI,
  health: healthAPI,
};
