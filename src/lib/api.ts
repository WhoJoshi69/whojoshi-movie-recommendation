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

// Types for bestsimilar API responses
export interface BestSimilarMovie {
  id: string;
  title: string;
  poster: string;
  year: string;
  type: 'movie' | 'tv';
}

export interface BestSimilarResponse {
  success: boolean;
  total: number;
  movies: number;
  tvShows: number;
  data: BestSimilarMovie[];
}

// Interface for autocomplete response
interface AutocompleteItem {
  id: string;
  label: string;
  url: string;
  serial?: string;
}

interface AutocompleteResponse {
  movie?: AutocompleteItem[];
  tv?: AutocompleteItem[];
  tag?: AutocompleteItem[];
}

// Function to get similar movies/TV shows from bestsimilar API
export const getSimilarFromBestSimilar = async (tmdbId: number, mediaType: 'movie' | 'tv', title: string): Promise<BestSimilarMovie[]> => {
  try {
    // First, search for the movie/TV show using the autocomplete API to get the correct URL
    console.log(`Searching for ${mediaType}: "${title}" to get BestSimilar URL...`);
    
    const autocompleteResponse = await fetch(`${API_ENDPOINTS.suggestions}?term=${encodeURIComponent(title)}`);
    
    if (!autocompleteResponse.ok) {
      throw new Error(`Autocomplete API error! status: ${autocompleteResponse.status}`);
    }
    
    const autocompleteData: AutocompleteResponse = await autocompleteResponse.json();
    
    // Find the first matching result based on media type
    let bestSimilarUrl: string | null = null;
    
    if (mediaType === 'movie' && autocompleteData.movie && autocompleteData.movie.length > 0) {
      bestSimilarUrl = autocompleteData.movie[0].url;
      console.log(`Found movie URL: ${bestSimilarUrl}`);
    } else if (mediaType === 'tv' && autocompleteData.tv && autocompleteData.tv.length > 0) {
      bestSimilarUrl = autocompleteData.tv[0].url;
      console.log(`Found TV show URL: ${bestSimilarUrl}`);
    }
    
    // If no specific match found, try the other type as fallback
    if (!bestSimilarUrl) {
      if (mediaType === 'movie' && autocompleteData.tv && autocompleteData.tv.length > 0) {
        bestSimilarUrl = autocompleteData.tv[0].url;
        console.log(`Using TV show URL as fallback: ${bestSimilarUrl}`);
      } else if (mediaType === 'tv' && autocompleteData.movie && autocompleteData.movie.length > 0) {
        bestSimilarUrl = autocompleteData.movie[0].url;
        console.log(`Using movie URL as fallback: ${bestSimilarUrl}`);
      }
    }
    
    if (!bestSimilarUrl) {
      console.log(`No BestSimilar URL found for "${title}"`);
      return [];
    }
    
    // Now use the found URL to get recommendations
    console.log(`Fetching recommendations for URL: ${bestSimilarUrl}`);
    const response = await fetch(`${API_ENDPOINTS.recommendations}?url=${encodeURIComponent(bestSimilarUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Recommendations API error! status: ${response.status}`);
    }
    
    const data: BestSimilarResponse = await response.json();
    
    if (!data.success) {
      throw new Error('BestSimilar API returned unsuccessful response');
    }
    
    console.log(`Found ${data.data.length} similar items for "${title}"`);
    return data.data;
  } catch (error) {
    console.error('Error fetching similar content from BestSimilar:', error);
    // Return empty array on error so the component can handle it gracefully
    return [];
  }
};