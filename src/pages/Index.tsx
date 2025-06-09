import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Film, Tv, AlertCircle, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { API_ENDPOINTS } from "@/lib/api";
import { findTMDBId, getTMDBSuggestions, getTrendingContent } from "@/lib/tmdb";
import RotatingText from "@/blocks/TextAnimations/RotatingText/RotatingText";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Github } from "lucide-react";
import TagsDialog from "@/components/TagsDialog";
import MetallicPaint from "@/blocks/Animations/MetallicPaint/MetallicPaint";
import TextPressure from "@/blocks/TextAnimations/TextPressure/TextPressure";

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

interface MovieData {
  id: string;
  title: string;
  poster: string;
  year?: string;
  type: 'movie' | 'tv';
}

interface IndexProps {
  aiSearchEnabled: boolean;
}

const Index = ({ aiSearchEnabled }: IndexProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State persistence keys
  const STORAGE_KEYS = {
    searchTerm: 'whojoshi_search_term',
    selectedMovies: 'whojoshi_selected_movies',
    activeTab: 'whojoshi_active_tab',
    scrollPosition: 'whojoshi_scroll_position',
    hasError: 'whojoshi_has_error'
  };

  // Initialize state with persisted values
  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.searchTerm) || "";
    } catch {
      return "";
    }
  });
  
  const [suggestions, setSuggestions] = useState<AutocompleteResponse>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [selectedMovies, setSelectedMovies] = useState<MovieData[]>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEYS.selectedMovies);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const [hasError, setHasError] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.hasError) === 'true';
    } catch {
      return false;
    }
  });
  
  const [shouldShowDropdown, setShouldShowDropdown] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEYS.activeTab);
      return (stored as 'movies' | 'tv') || 'movies';
    } catch {
      return 'movies';
    }
  });
  
  const [metallicImageData, setMetallicImageData] = useState<ImageData | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Persist state to sessionStorage
  const persistState = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.searchTerm, searchTerm);
      sessionStorage.setItem(STORAGE_KEYS.selectedMovies, JSON.stringify(selectedMovies));
      sessionStorage.setItem(STORAGE_KEYS.activeTab, activeTab);
      sessionStorage.setItem(STORAGE_KEYS.hasError, hasError.toString());
      sessionStorage.setItem(STORAGE_KEYS.scrollPosition, window.scrollY.toString());
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }, [searchTerm, selectedMovies, activeTab, hasError, STORAGE_KEYS]);

  // Restore scroll position
  const restoreScrollPosition = useCallback(() => {
    try {
      const savedScrollPosition = sessionStorage.getItem(STORAGE_KEYS.scrollPosition);
      if (savedScrollPosition) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollPosition, 10));
        }, 100);
      }
    } catch (error) {
      console.warn('Failed to restore scroll position:', error);
    }
  }, [STORAGE_KEYS.scrollPosition]);

  // Persist state when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      persistState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [persistState]);

  // Restore scroll position when component mounts or when coming back from details
  useEffect(() => {
    // Check if we're coming back from a details page
    const isComingFromDetails = location.state?.fromDetails;
    if (isComingFromDetails || selectedMovies.length > 0) {
      restoreScrollPosition();
    }
  }, [location.state, restoreScrollPosition, selectedMovies.length]);

  // Wrapper functions to persist state when updating
  const updateSelectedMovies = useCallback((movies: MovieData[]) => {
    setSelectedMovies(movies);
    try {
      sessionStorage.setItem(STORAGE_KEYS.selectedMovies, JSON.stringify(movies));
    } catch (error) {
      console.warn('Failed to persist selected movies:', error);
    }
  }, [STORAGE_KEYS.selectedMovies]);

  const updateActiveTab = useCallback((tab: 'movies' | 'tv') => {
    setActiveTab(tab);
    try {
      sessionStorage.setItem(STORAGE_KEYS.activeTab, tab);
    } catch (error) {
      console.warn('Failed to persist active tab:', error);
    }
  }, [STORAGE_KEYS.activeTab]);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    try {
      sessionStorage.setItem(STORAGE_KEYS.searchTerm, term);
    } catch (error) {
      console.warn('Failed to persist search term:', error);
    }
  }, [STORAGE_KEYS.searchTerm]);

  const updateHasError = useCallback((error: boolean) => {
    setHasError(error);
    try {
      sessionStorage.setItem(STORAGE_KEYS.hasError, error.toString());
    } catch (error) {
      console.warn('Failed to persist error state:', error);
    }
  }, [STORAGE_KEYS.hasError]);

  // Persist state when key values change
  useEffect(() => {
    persistState();
  }, [persistState]);

  // Create image data for MetallicPaint component using logo.png
  useEffect(() => {
    const loadLogoImageData = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match image or use a standard size
        const size = 800;
        canvas.width = size;
        canvas.height = size;

        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);

        // Calculate dimensions to center the logo
        const aspectRatio = img.width / img.height;
        let drawWidth, drawHeight;
        
        if (aspectRatio > 1) {
          // Landscape image
          drawWidth = size * 0.8; // Use 80% of canvas width
          drawHeight = drawWidth / aspectRatio;
        } else {
          // Portrait or square image
          drawHeight = size * 0.8; // Use 80% of canvas height
          drawWidth = drawHeight * aspectRatio;
        }

        const x = (size - drawWidth) / 2;
        const y = (size - drawHeight) / 2;

        // Draw the logo image
        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        const imageData = ctx.getImageData(0, 0, size, size);
        setMetallicImageData(imageData);
      };

      img.onerror = () => {
        console.error('Failed to load logo.png, falling back to text');
        // Fallback to text-based logo if image fails to load
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 800;
        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('WhoJoshi', size / 2, size / 2 - 60);
        ctx.font = 'bold 40px Arial';
        ctx.fillText('Find Your Next', size / 2, size / 2 + 60);

        const imageData = ctx.getImageData(0, 0, size, size);
        setMetallicImageData(imageData);
      };

      // Load the logo from the public directory
      img.src = '/logo.png';
    };

    loadLogoImageData();
  }, [updateSearchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search function
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length > 1) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions({});
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, aiSearchEnabled]);

  const fetchSuggestions = async (term: string) => {
    try {
      updateHasError(false);
      
      if (aiSearchEnabled) {
        // Use AI search (existing API)
        const response = await fetch(`${API_ENDPOINTS.suggestions}?term=${encodeURIComponent(term)}`);
        
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          const hasResults = (data.movie && data.movie.length > 0) || (data.tv && data.tv.length > 0) || (data.tag && data.tag.length > 0);
          // Only show suggestions if we should show dropdown
          if (shouldShowDropdown) {
            setShowSuggestions(hasResults);
          }
          setSelectedIndex(-1);
          return;
        }
        
        throw new Error('Failed to fetch AI suggestions');
      } else {
        // Use TMDB search
        const data = await getTMDBSuggestions(term);
        setSuggestions(data);
        const hasResults = (data.movie && data.movie.length > 0) || (data.tv && data.tv.length > 0);
        // Only show suggestions if we should show dropdown
        if (shouldShowDropdown) {
          setShowSuggestions(hasResults);
        }
        setSelectedIndex(-1);
        return;
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      updateHasError(true);
      setSuggestions({});
      setShowSuggestions(false);
      
      // Show mock suggestions for demonstration
      const mockSuggestions = {
        movie: [
          { id: "1", label: "Wonder Woman (2017)", url: "/movies/38910-wonder-woman" },
          { id: "2", label: "Wonder Woman 1984 (2020)", url: "/movies/464052-wonder-woman-1984" }
        ],
        tv: [
          { id: "3", label: "Wonder Years (1988)", url: "/tv/1695-the-wonder-years", serial: "1" }
        ]
      };
      
      if (term.toLowerCase().includes('wonder')) {
        setSuggestions(mockSuggestions);
        const hasResults = (mockSuggestions.movie && mockSuggestions.movie.length > 0) || (mockSuggestions.tv && mockSuggestions.tv.length > 0) || (mockSuggestions.tag && mockSuggestions.tag.length > 0);
        // Only show suggestions if we should show dropdown
        if (shouldShowDropdown) {
          setShowSuggestions(hasResults);
        }
        toast({
          title: "Demo Mode",
          description: `Showing sample results due to ${aiSearchEnabled ? 'AI API' : 'TMDB API'} limitations`,
          variant: "default",
        });
      }
    }
  };

  const fetchMovieRecommendations = async (url: string, selectedItem: AutocompleteItem) => {
    setIsLoading(true);
    try {
      updateHasError(false);
      const response = await fetch(`${API_ENDPOINTS.recommendations}?url=${encodeURIComponent(url)}`);
      
      if (response.ok) {
        // Check content type to determine response format
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // New JSON format
          const data = await response.json();
          
          if (data.success && data.data) {
            const movies: MovieData[] = data.data.map((item: any) => ({
              id: item.id,
              title: item.title,
              poster: item.poster,
              year: item.year,
              type: item.type as 'movie' | 'tv'
            }));
            
            updateSelectedMovies(movies);
            return;
          }
        } else {
          // Fallback: HTML format
          const html = await response.text();
          
          // Parse HTML to extract movie data
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const movieElements = doc.querySelectorAll('.column-img');
          
          const movies: MovieData[] = Array.from(movieElements).map((element, index) => {
            const img = element.querySelector('img');
            const imgSrc = img?.getAttribute('src') || '';
            const imgAlt = img?.getAttribute('alt') || '';
            const dataId = img?.getAttribute('data-id') || index.toString();
            
            // Extract year from alt text
            const yearMatch = imgAlt.match(/\((\d{4})\)/);
            const year = yearMatch ? yearMatch[1] : '';
            
            // Check for TV show indicator in the same container or nearby elements
            const container = element.closest('.column') || element.parentElement;
            const tvShowLabel = container?.querySelector('.label-default');
            const isTvShow = tvShowLabel?.textContent?.includes('TV show') || false;
            
            return {
              id: dataId,
              title: imgAlt.replace(/\s*\(\d{4}\)/, ''),
              poster: imgSrc.startsWith('/') ? `https://bestsimilar.com${imgSrc}` : imgSrc,
              year,
              type: isTvShow ? 'tv' as const : 'movie' as const
            };
          }).filter(movie => movie.poster && movie.title);

          updateSelectedMovies(movies);
          return;
        }
      }
      
      throw new Error('Failed to fetch recommendations');
    } catch (error) {
      updateHasError(true);
      // Show mock movie data for demonstration
      const mockMovies: MovieData[] = [
        {
          id: "1",
          title: "Wonder Woman",
          poster: "/placeholder.svg",
          year: "2017",
          type: 'movie'
        },
        {
          id: "2",
          title: "Wonder Woman 1984",
          poster: "/placeholder.svg",
          year: "2020",
          type: 'movie'
        },
        {
          id: "3",
          title: "Batman v Superman",
          poster: "/placeholder.svg",
          year: "2016",
          type: 'movie'
        },
        {
          id: "4",
          title: "Justice League",
          poster: "/placeholder.svg",
          year: "2017",
          type: 'movie'
        }
      ];
      updateSelectedMovies(mockMovies);
      toast({
        title: "Demo Mode",
        description: "Showing sample recommendations due to API limitations",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback((item?: AutocompleteItem) => {
    if (item) {
      if (aiSearchEnabled) {
        // AI search mode - use existing recommendation API
        fetchMovieRecommendations(item.url, item);
      } else {
        // TMDB mode - show trending content or navigate directly to details
        if ((item as any).tmdb_id) {
          const mediaType = item.url.includes('/movie/') ? 'movie' : 'tv';
          navigate(`/details/${mediaType}/${(item as any).tmdb_id}`);
          return;
        } else {
          // Fallback to trending content
          fetchTrendingMovies();
        }
      }
      updateSearchTerm(item.label);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setSuggestions({});
      setShouldShowDropdown(false);
      searchRef.current?.blur();
    } else {
      const allSuggestions = [...(suggestions.movie || []), ...(suggestions.tv || []), ...(suggestions.tag || [])];
      if (allSuggestions.length > 0 && showSuggestions) {
        const selectedItem = selectedIndex >= 0 ? allSuggestions[selectedIndex] : allSuggestions[0];
        handleSearch(selectedItem);
      }
    }
  }, [suggestions, selectedIndex, showSuggestions, aiSearchEnabled, navigate, updateSearchTerm]);

  const fetchTrendingMovies = async () => {
    setIsLoading(true);
    try {
      const trendingContent = await getTrendingContent();
      updateSelectedMovies(trendingContent);
    } catch (error) {
      console.error('Error fetching trending content:', error);
      updateHasError(true);
      // Show mock data as fallback
      const mockMovies: MovieData[] = [
        {
          id: "550",
          title: "Fight Club",
          poster: "/placeholder.svg",
          year: "1999",
          type: 'movie'
        },
        {
          id: "13",
          title: "Forrest Gump",
          poster: "/placeholder.svg",
          year: "1994",
          type: 'movie'
        },
        {
          id: "680",
          title: "Pulp Fiction",
          poster: "/placeholder.svg",
          year: "1994",
          type: 'movie'
        },
        {
          id: "1399",
          title: "Game of Thrones",
          poster: "/placeholder.svg",
          year: "2011",
          type: 'tv'
        }
      ];
      updateSelectedMovies(mockMovies);
      toast({
        title: "Demo Mode",
        description: "Showing sample trending content due to TMDB API limitations",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagSelect = useCallback((tagUrl: string, tagName: string) => {
    const tagItem: AutocompleteItem = {
      id: tagUrl,
      label: tagName,
      url: tagUrl
    };
    // Always use AI search behavior for tags, regardless of search mode
    // Tags are meant to show curated recommendations
    fetchMovieRecommendations(tagUrl, tagItem);
    updateSearchTerm(tagName);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSuggestions({});
    setShouldShowDropdown(false);
    searchRef.current?.blur();
  }, []);

  const handleCardClick = useCallback(async (movie: MovieData) => {
    try {
      // Persist current state before navigating
      persistState();

      // Show loading state
      toast({
        title: "Loading...",
        description: "Searching for movie details...",
      });

      if (!aiSearchEnabled) {
        // In TMDB mode, the ID should already be a TMDB ID
        const numericId = parseInt(movie.id);
        if (!isNaN(numericId) && numericId > 0) {
          navigate(`/details/${movie.type}/${numericId}`, {
            state: { fromIndex: true }
          });
          return;
        }
      }

      // For AI search mode or fallback, search for TMDB ID using the movie title and year
      const tmdbId = await findTMDBId(movie.title, movie.type, movie.year);
      
      if (tmdbId) {
        // Navigate to details page with TMDB ID
        navigate(`/details/${movie.type}/${tmdbId}`, {
          state: { fromIndex: true }
        });
      } else {
        // Fallback: try to extract TMDB ID from the existing ID if it's numeric
        const numericId = parseInt(movie.id);
        if (!isNaN(numericId) && numericId > 0) {
          navigate(`/details/${movie.type}/${numericId}`, {
            state: { fromIndex: true }
          });
        } else {
          toast({
            title: "Not Found",
            description: "Could not find detailed information for this title.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error finding TMDB ID:', error);
      toast({
        title: "Error",
        description: "Failed to load movie details. Please try again.",
        variant: "destructive",
      });
    }
  }, [navigate, toast, aiSearchEnabled, persistState]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const allSuggestions = [...(suggestions.movie || []), ...(suggestions.tv || []), ...(suggestions.tag || [])];
    if (!showSuggestions || allSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        return;
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const newIndex = prev < 0 ? 0 : (prev + 1) % allSuggestions.length;
        return newIndex;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => {
        if (prev <= 0) {
          return allSuggestions.length - 1;
        }
        return prev - 1;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
      setSelectedIndex(-1);
      searchRef.current?.blur();
    }
  }, [suggestions, showSuggestions, handleSearch]);

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

  const allSuggestions = [...(suggestions.movie || []), ...(suggestions.tv || [])];

  return (
    <div className="min-h-screen bg-background text-foreground touch-manipulation">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-3 android-sm:px-4 py-4 android-sm:py-6">
          <div className="text-center mb-6 android-sm:mb-8">
            <h1 className="text-2xl android-sm:text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              WhoJoshi Recommendations
            </h1>
            <p className="text-sm android-sm:text-base text-muted-foreground px-2">
              <span className="hidden android-md:inline">In this app you can </span>
              <span className="android-md:hidden">Discover </span>
              <RotatingText
                texts={[
                  "curated recommendations",
                  "hidden gems", 
                  "new favorites",
                  "personalized suggestions"
                ]}
                rotationInterval={3000}
                className="text-white font-bold inline"
              />
            </p>
          </div>
          {/* Search Bar + Tags Button */}
          <div className="max-w-2xl mx-auto flex gap-2 items-center">
            <div className="flex-1 relative" ref={searchContainerRef} onKeyDown={handleKeyDown}>
              <PlaceholdersAndVanishInput
                ref={searchRef}
                placeholders={aiSearchEnabled ? [
                  "Search for Wonder Woman...",
                  "Find movies like Inception...",
                  "Discover TV shows like Breaking Bad...",
                  "Look for action movies...",
                  "Search for comedy series...",
                  "Find sci-fi recommendations..."
                ] : [
                  "Search Wonder Woman...",
                  "Find Inception...",
                  "Look for Breaking Bad...",
                  "Search The Dark Knight...",
                  "Find Game of Thrones...",
                  "Look for Stranger Things..."
                ]}
                onChange={(e) => {
                  updateSearchTerm(e.target.value);
                  if (!shouldShowDropdown) {
                    setShouldShowDropdown(true);
                  }
                  if (e.target.value.length > 1 && Object.keys(suggestions).length > 0 && shouldShowDropdown) {
                    setShowSuggestions(true);
                  }
                }}
                onSubmit={(e) => {
                  e.preventDefault();
                  const allSuggestions = [...(suggestions.movie || []), ...(suggestions.tv || []), ...(suggestions.tag || [])];
                  if (allSuggestions.length > 0 && showSuggestions) {
                    const selectedItem = selectedIndex >= 0 ? allSuggestions[selectedIndex] : allSuggestions[0];
                    handleSearch(selectedItem);
                  } else if (searchTerm.trim()) {
                    handleSearch();
                  }
                }}
              />
              {/* Autocomplete Suggestions */}
              {showSuggestions && allSuggestions.length > 0 && (
                <Card 
                  ref={dropdownRef}
                  className="absolute top-full mt-2 w-full bg-card/95 backdrop-blur-md border-border rounded-xl shadow-2xl max-h-80 android-sm:max-h-96 overflow-y-auto z-10"
                >
                  <div className="p-1 android-sm:p-2">
                    {suggestions.movie && suggestions.movie.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-2 px-2 android-sm:px-3 py-2 text-xs android-sm:text-sm text-muted-foreground font-medium">
                          <Film className="w-3 h-3 android-sm:w-4 android-sm:h-4" />
                          Movies
                        </div>
                        {suggestions.movie.map((item, index) => (
                          <div
                            key={`movie-${item.id}`}
                            ref={el => suggestionRefs.current[index] = el}
                            className={cn(
                              "px-2 android-sm:px-3 py-3 android-sm:py-3 cursor-pointer rounded-lg transition-all duration-200 touch-manipulation",
                              selectedIndex === index 
                                ? "bg-primary/20 border border-primary/30" 
                                : "hover:bg-muted/50 active:bg-muted/70"
                            )}
                            onClick={() => handleSearch(item)}
                          >
                            <div className="text-sm android-sm:text-base text-foreground font-medium">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {suggestions.tv && suggestions.tv.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-2 px-2 android-sm:px-3 py-2 text-xs android-sm:text-sm text-muted-foreground font-medium">
                          <Tv className="w-3 h-3 android-sm:w-4 android-sm:h-4" />
                          TV Shows
                        </div>
                        {suggestions.tv.map((item, index) => {
                          const globalIndex = (suggestions.movie?.length || 0) + index;
                          return (
                            <div
                              key={`tv-${item.id}`}
                              ref={el => suggestionRefs.current[globalIndex] = el}
                              className={cn(
                                "px-2 android-sm:px-3 py-3 android-sm:py-3 cursor-pointer rounded-lg transition-all duration-200 touch-manipulation",
                                selectedIndex === globalIndex 
                                  ? "bg-primary/20 border border-primary/30" 
                                  : "hover:bg-muted/50 active:bg-muted/70"
                              )}
                              onClick={() => handleSearch(item)}
                            >
                              <div className="text-sm android-sm:text-base text-foreground font-medium">{item.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {suggestions.tag && suggestions.tag.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-2 android-sm:px-3 py-2 text-xs android-sm:text-sm text-muted-foreground font-medium">
                          <Tag className="w-3 h-3 android-sm:w-4 android-sm:h-4" />
                          Tags
                        </div>
                        {suggestions.tag.map((item, index) => {
                          const globalIndex = (suggestions.movie?.length || 0) + (suggestions.tv?.length || 0) + index;
                          return (
                            <div
                              key={`tag-${item.id}`}
                              ref={el => suggestionRefs.current[globalIndex] = el}
                              className={cn(
                                "px-2 android-sm:px-3 py-3 android-sm:py-3 cursor-pointer rounded-lg transition-all duration-200 touch-manipulation",
                                selectedIndex === globalIndex 
                                  ? "bg-primary/20 border border-primary/30" 
                                  : "hover:bg-muted/50 active:bg-muted/70"
                              )}
                              onClick={() => handleSearch(item)}
                            >
                              <div className="text-sm android-sm:text-base text-foreground font-medium">{item.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
            <TagsDialog onTagSelect={handleTagSelect} />
          </div>
          {/* API Status Notice */}
          {hasError && (
            <div className="mt-2 p-2 android-sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg mx-1">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs android-sm:text-sm">Using demo data due to API limitations</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Main Content ... unchanged ... */}
      <div className="max-w-7xl mx-auto px-3 android-sm:px-4 py-6 android-sm:py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 android-sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 android-sm:gap-4 lg:gap-6">
            {Array.from({ length: 24 }).map((_, index) => (
              <div key={index} className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : selectedMovies.length > 0 ? (
          <>
            {(() => {
              const moviesList = selectedMovies.filter(item => item.type === 'movie');
              const tvShowsList = selectedMovies.filter(item => item.type === 'tv');
              return (
                <>
                  {/* Toggle Buttons */}
                  <div className="flex justify-center mb-6 android-sm:mb-8">
                    <div className="bg-muted rounded-xl p-1 flex w-full max-w-md android-sm:w-auto">
                      <button
                        onClick={() => updateActiveTab('movies')}
                        className={cn(
                          "flex items-center justify-center gap-1 android-sm:gap-2 px-3 android-sm:px-6 py-2 android-sm:py-3 rounded-lg font-medium transition-all duration-300 flex-1 android-sm:flex-none touch-manipulation",
                          activeTab === 'movies'
                            ? "bg-background text-foreground shadow-md"
                            : "text-muted-foreground hover:text-foreground active:text-foreground"
                        )}
                      >
                        <Film className="w-4 h-4 android-sm:w-5 android-sm:h-5" />
                        <span className="text-sm android-sm:text-base">Movies ({moviesList.length})</span>
                      </button>
                      <button
                        onClick={() => updateActiveTab('tv')}
                        className={cn(
                          "flex items-center justify-center gap-1 android-sm:gap-2 px-3 android-sm:px-6 py-2 android-sm:py-3 rounded-lg font-medium transition-all duration-300 flex-1 android-sm:flex-none touch-manipulation",
                          activeTab === 'tv'
                            ? "bg-background text-foreground shadow-md"
                            : "text-muted-foreground hover:text-foreground active:text-foreground"
                        )}
                      >
                        <Tv className="w-4 h-4 android-sm:w-5 android-sm:h-5" />
                        <span className="text-sm android-sm:text-base">TV Shows ({tvShowsList.length})</span>
                      </button>
                    </div>
                  </div>
                  {/* Content with smooth transitions */}
                  <div className="relative overflow-hidden">
                    {/* Movies Grid */}
                    <div
                      className={cn(
                        "transition-all duration-500 ease-in-out",
                        activeTab === 'movies'
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 translate-x-full absolute inset-0 pointer-events-none"
                      )}
                    >
                      {moviesList.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                          {moviesList.map((movie, index) => (
                            <div
                              key={`movie-${movie.id}-${index}`}
                              className="group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
                              style={{
                                animationDelay: `${index * 50}ms`
                              }}
                              onClick={() => handleCardClick(movie)}
                            >
                              <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl group-active:shadow-xl transition-all duration-300">
                                {movie.poster ? (
                                  <img
                                    src={movie.poster}
                                    alt={movie.title}
                                    className="w-full h-full object-cover group-hover:brightness-110 group-active:brightness-110 transition-all duration-300"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder.svg';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <Film className="w-8 h-8 android-sm:w-12 android-sm:h-12" />
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 android-sm:mt-3 px-1">
                                <h3 className="text-xs android-sm:text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary group-active:text-primary transition-colors duration-200">
                                  {movie.title}
                                </h3>
                                {movie.year && (
                                  <p className="text-xs text-muted-foreground mt-1">{movie.year}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-20">
                          <Film className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                          <h2 className="text-2xl font-bold text-muted-foreground mb-4">No Movies Found</h2>
                          <p className="text-muted-foreground">
                            No movie recommendations available for this selection.
                          </p>
                        </div>
                      )}
                    </div>
                    {/* TV Shows Grid */}
                    <div
                      className={cn(
                        "transition-all duration-500 ease-in-out",
                        activeTab === 'tv'
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-full absolute inset-0 pointer-events-none"
                      )}
                    >
                      {tvShowsList.length > 0 ? (
                        <div className="grid grid-cols-2 android-sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 android-sm:gap-4 lg:gap-6">
                          {tvShowsList.map((show, index) => (
                            <div
                              key={`tv-${show.id}-${index}`}
                              className="group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
                              style={{
                                animationDelay: `${index * 50}ms`
                              }}
                              onClick={() => handleCardClick(show)}
                            >
                              <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl group-active:shadow-xl transition-all duration-300">
                                {show.poster ? (
                                  <img
                                    src={show.poster}
                                    alt={show.title}
                                    className="w-full h-full object-cover group-hover:brightness-110 group-active:brightness-110 transition-all duration-300"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder.svg';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <Tv className="w-8 h-8 android-sm:w-12 android-sm:h-12" />
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 android-sm:mt-3 px-1">
                                <h3 className="text-xs android-sm:text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary group-active:text-primary transition-colors duration-200">
                                  {show.title}
                                </h3>
                                {show.year && (
                                  <p className="text-xs text-muted-foreground mt-1">{show.year}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-20">
                          <Tv className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                          <h2 className="text-2xl font-bold text-muted-foreground mb-4">No TV Shows Found</h2>
                          <p className="text-muted-foreground">
                            No TV show recommendations available for this selection.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        ) : (
          <div className="text-center py-20"> {/* MetallicPaint Animation */}
            {metallicImageData && (
              <div className="w-64 h-64 mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl">
                <MetallicPaint 
                  imageData={metallicImageData}
                  params={{
                    patternScale: 2.5,
                    refraction: 0,
                    edge: 0,
                    patternBlur: 0.05,
                    liquid: 0,
                    speed: 0.3,
                  }}
                />
              </div>
            )}
            {/* TextPressure Animation */}
            <div className="w-full max-w-lg mx-auto mb-8 min-h-[120px] flex items-center justify-center">
              <TextPressure 
                text="WhoJoshi"
                textColor="#ffffff"
                width={true}
                weight={true}
                italic={true}
                flex={true}
                scale={true}
                minFontSize={48}
                className="font-bold text-center"
              />
            </div>
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Start Your Discovery</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {aiSearchEnabled 
                ? "Search for any movie or TV show to get personalized recommendations and discover your next favorite watch."
                : "Search for movies and TV shows to browse trending content and find detailed information."
              }
            </p>
          </div>
        )}
      </div>
      {/* Footer ... unchanged ... */}
      <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 android-sm:px-4 py-6">
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <span>Built in India by</span>
            <a
              href="https://superintro.in/portfolio/darshitjoshi"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-foreground hover:text-primary transition-colors duration-200 underline decoration-primary/30 hover:decoration-primary"
            >
              Darshit
            </a>
            <a
              href="https://github.com/WhoJoshi69"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
