// Get the API base URL from environment variables or fallback to relative URLs
const getApiBaseUrl = (): string => {
  // In development, use the environment variable
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  }
  
  // In production, use the environment variable if set, otherwise use relative URLs
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Fallback to relative URLs (assumes API is served from same domain)
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  suggestions: `${API_BASE_URL}/api/suggestions`,
  recommendations: `${API_BASE_URL}/api/recommendations`,
  health: `${API_BASE_URL}/health`,
} as const;