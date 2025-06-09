// TMDB API configuration and utilities
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Get TMDB API key from environment variables
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!apiKey) {
    console.warn('TMDB API key not found in environment variables');
    return '';
  }
  return apiKey;
};

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  genres: Array<{ id: number; name: string }>;
  production_companies: Array<{ id: number; name: string; logo_path: string | null }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  status: string;
  tagline: string | null;
  adult: boolean;
  budget: number;
  revenue: number;
  imdb_id: string | null;
  homepage: string | null;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  number_of_episodes: number;
  number_of_seasons: number;
  genres: Array<{ id: number; name: string }>;
  production_companies: Array<{ id: number; name: string; logo_path: string | null }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  status: string;
  tagline: string | null;
  adult: boolean;
  homepage: string | null;
  in_production: boolean;
  networks: Array<{ id: number; name: string; logo_path: string | null }>;
  seasons: Array<{
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    episode_count: number;
    air_date: string;
  }>;
}

export interface TMDBSearchResult {
  id: number;
  title?: string; // for movies
  name?: string; // for TV shows
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string; // for movies
  first_air_date?: string; // for TV shows
  vote_average: number;
  media_type: 'movie' | 'tv';
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}

// Helper function to construct image URLs
export const getTMDBImageUrl = (path: string | null, size: string = 'w780'): string => {
  if (!path) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Search for movies and TV shows
export const searchTMDB = async (query: string): Promise<TMDBSearchResponse> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('TMDB API key not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
};

// Get movie details by TMDB ID
export const getMovieDetails = async (tmdbId: number): Promise<TMDBMovie> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('TMDB API key not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
};

// Get TV show details by TMDB ID
export const getTVShowDetails = async (tmdbId: number): Promise<TMDBTVShow> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('TMDB API key not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
};

// Search for a specific title to get TMDB ID
export const findTMDBId = async (title: string, type: 'movie' | 'tv', year?: string): Promise<number | null> => {
  try {
    const searchResults = await searchTMDB(title);
    
    // Filter results by type and find the best match
    const filteredResults = searchResults.results.filter(result => result.media_type === type);
    
    if (filteredResults.length === 0) {
      return null;
    }

    // If year is provided, try to find a match with the same year
    if (year) {
      const yearNumber = parseInt(year);
      if (!isNaN(yearNumber)) {
        const yearMatch = filteredResults.find(result => {
          const resultYear = type === 'movie' 
            ? (result.release_date ? new Date(result.release_date).getFullYear() : null)
            : (result.first_air_date ? new Date(result.first_air_date).getFullYear() : null);
          return resultYear === yearNumber;
        });
        
        if (yearMatch) {
          return yearMatch.id;
        }
      }
    }

    // Return the first result (usually the most relevant) if no year match found
    return filteredResults[0].id;
  } catch (error) {
    console.error('Error finding TMDB ID:', error);
    return null;
  }
};

// Get similar movies/TV shows
export const getSimilar = async (tmdbId: number, type: 'movie' | 'tv'): Promise<TMDBSearchResult[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('TMDB API key not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/${type}/${tmdbId}/similar?api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results.map((item: any) => ({
    ...item,
    media_type: type
  }));
};

// Get movie/TV show credits
export const getCredits = async (tmdbId: number, type: 'movie' | 'tv') => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('TMDB API key not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/${type}/${tmdbId}/credits?api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
};

// Get watch providers for a movie/TV show
export const getWatchProviders = async (tmdbId: number, type: 'movie' | 'tv') => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('TMDB API key not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/${type}/${tmdbId}/watch/providers?api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
};

// Get videos (trailers, teasers, etc.) for a movie/TV show
export const getVideos = async (tmdbId: number, type: 'movie' | 'tv') => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('TMDB API key not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/${type}/${tmdbId}/videos?api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
};

// TMDB autocomplete/search suggestions
export const getTMDBSuggestions = async (query: string) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('TMDB API key not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&page=1`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Transform TMDB results to match our AutocompleteItem interface
  const transformedResults = {
    movie: [] as any[],
    tv: [] as any[]
  };

  data.results.forEach((item: any) => {
    if (item.media_type === 'movie' && item.title) {
      transformedResults.movie.push({
        id: item.id.toString(),
        label: `${item.title} (${item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'})`,
        url: `/movie/${item.id}`, // This will be used differently for TMDB mode
        tmdb_id: item.id,
        poster_path: item.poster_path,
        overview: item.overview,
        release_date: item.release_date,
        vote_average: item.vote_average
      });
    } else if (item.media_type === 'tv' && item.name) {
      transformedResults.tv.push({
        id: item.id.toString(),
        label: `${item.name} (${item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A'})`,
        url: `/tv/${item.id}`, // This will be used differently for TMDB mode
        tmdb_id: item.id,
        poster_path: item.poster_path,
        overview: item.overview,
        first_air_date: item.first_air_date,
        vote_average: item.vote_average
      });
    }
  });

  return transformedResults;
};

// Get trending movies and TV shows for TMDB mode
export const getTrendingContent = async () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('TMDB API key not configured');
  }

  const [moviesResponse, tvResponse] = await Promise.all([
    fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${apiKey}`),
    fetch(`${TMDB_BASE_URL}/trending/tv/week?api_key=${apiKey}`)
  ]);

  if (!moviesResponse.ok || !tvResponse.ok) {
    throw new Error('TMDB API error');
  }

  const [moviesData, tvData] = await Promise.all([
    moviesResponse.json(),
    tvResponse.json()
  ]);

  const transformedMovies = moviesData.results.map((movie: any) => ({
    id: movie.id.toString(),
    title: movie.title,
    poster: movie.poster_path ? getTMDBImageUrl(movie.poster_path, 'w780') : '/placeholder.svg',
    year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '',
    type: 'movie' as const
  }));

  const transformedTV = tvData.results.map((show: any) => ({
    id: show.id.toString(),
    title: show.name,
    poster: show.poster_path ? getTMDBImageUrl(show.poster_path, 'w780') : '/placeholder.svg',
    year: show.first_air_date ? new Date(show.first_air_date).getFullYear().toString() : '',
    type: 'tv' as const
  }));

  return [...transformedMovies, ...transformedTV];
};