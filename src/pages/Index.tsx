import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Film, Tv, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { API_ENDPOINTS } from "@/lib/api";

interface AutocompleteItem {
  id: string;
  label: string;
  url: string;
  serial?: string;
}

interface AutocompleteResponse {
  movie?: AutocompleteItem[];
  tv?: AutocompleteItem[];
}

interface MovieData {
  id: string;
  title: string;
  poster: string;
  year?: string;
  type: 'movie' | 'tv';
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteResponse>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState<MovieData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasError, setHasError] = useState(false);
  const [shouldShowDropdown, setShouldShowDropdown] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
  }, [searchTerm]);

  const fetchSuggestions = async (term: string) => {
    try {
      setHasError(false);
      const response = await fetch(`${API_ENDPOINTS.suggestions}?term=${encodeURIComponent(term)}`);
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        const hasResults = (data.movie && data.movie.length > 0) || (data.tv && data.tv.length > 0);
        // Only show suggestions if we should show dropdown
        if (shouldShowDropdown) {
          setShowSuggestions(hasResults);
        }
        setSelectedIndex(-1);
        return;
      }
      
      throw new Error('Failed to fetch suggestions');
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setHasError(true);
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
        const hasResults = (mockSuggestions.movie && mockSuggestions.movie.length > 0) || (mockSuggestions.tv && mockSuggestions.tv.length > 0);
        // Only show suggestions if we should show dropdown
        if (shouldShowDropdown) {
          setShowSuggestions(hasResults);
        }
        toast({
          title: "Demo Mode",
          description: "Showing sample results due to API limitations",
          variant: "default",
        });
      }
    }
  };

  const fetchMovieRecommendations = async (url: string, selectedItem: AutocompleteItem) => {
    setIsLoading(true);
    try {
      setHasError(false);
      const response = await fetch(`${API_ENDPOINTS.recommendations}?url=${encodeURIComponent(url)}`);
      
      if (response.ok) {
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
          const tvShowLabel = container?.querySelector('span.label.label-default');
          const isTvShow = tvShowLabel?.textContent?.trim() === 'TV show';
          
          return {
            id: dataId,
            title: imgAlt.replace(/\s*\(\d{4}\)/, ''),
            poster: imgSrc.startsWith('/') ? `https://bestsimilar.com${imgSrc}` : imgSrc,
            year,
            type: isTvShow ? 'tv' as const : 'movie' as const
          };
        }).filter(movie => movie.poster && movie.title);

        // Separate movies and TV shows
        const moviesList = movies.filter(item => item.type === 'movie');
        const tvShowsList = movies.filter(item => item.type === 'tv');
        
        // Combine them with movies first, then TV shows
        const combinedList = [...moviesList, ...tvShowsList];
        
        setSelectedMovies(combinedList.slice(0, 24)); // Limit to 24 items
        return;
      }
      
      throw new Error('Failed to fetch recommendations');
    } catch (error) {
      console.error("Error fetching movie recommendations:", error);
      setHasError(true);
      
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
      
      setSelectedMovies(mockMovies);
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
      // Direct item selection (click)
      fetchMovieRecommendations(item.url, item);
      setSearchTerm(item.label);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      // Clear suggestions to prevent dropdown from reopening on focus
      setSuggestions({});
      // Disable dropdown from showing automatically
      setShouldShowDropdown(false);
      // Remove focus from input to prevent dropdown from reopening
      searchRef.current?.blur();
    } else {
      // Handle enter key on input
      const allSuggestions = [...(suggestions.movie || []), ...(suggestions.tv || [])];
      if (allSuggestions.length > 0 && showSuggestions) {
        const selectedItem = selectedIndex >= 0 ? allSuggestions[selectedIndex] : allSuggestions[0];
        fetchMovieRecommendations(selectedItem.url, selectedItem);
        setSearchTerm(selectedItem.label);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        // Clear suggestions to prevent dropdown from reopening on focus
        setSuggestions({});
        // Disable dropdown from showing automatically
        setShouldShowDropdown(false);
        // Remove focus from input to prevent dropdown from reopening
        searchRef.current?.blur();
      }
    }
  }, [suggestions, selectedIndex, showSuggestions]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const allSuggestions = [...(suggestions.movie || []), ...(suggestions.tv || [])];
    
    if (!showSuggestions || allSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        // If no suggestions are shown, don't do anything
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

  // Auto-scroll selected suggestion into view
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              WhoJoshi Recommendations
            </h1>
            <p className="text-muted-foreground">Discover your next favorite movie or TV show</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                ref={searchRef}
                type="text"
                placeholder="Search for movies or TV shows..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Re-enable dropdown when user starts typing
                  if (!shouldShowDropdown) {
                    setShouldShowDropdown(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (searchTerm.length > 1 && Object.keys(suggestions).length > 0 && shouldShowDropdown) {
                    setShowSuggestions(true);
                  }
                }}
                className="pl-12 pr-4 py-6 text-lg bg-card border-border focus:border-primary focus:ring-primary/20 rounded-xl"
              />
            </div>
            
            {/* API Status Notice */}
            {hasError && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Using demo data due to API limitations</span>
                </div>
              </div>
            )}
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && allSuggestions.length > 0 && (
              <Card 
                ref={dropdownRef}
                className="absolute top-full mt-2 w-full bg-card/95 backdrop-blur-md border-border rounded-xl shadow-2xl max-h-96 overflow-y-auto z-10"
              >
                <div className="p-2">
                  {suggestions.movie && suggestions.movie.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground font-medium">
                        <Film className="w-4 h-4" />
                        Movies
                      </div>
                      {suggestions.movie.map((item, index) => (
                        <div
                          key={`movie-${item.id}`}
                          ref={el => suggestionRefs.current[index] = el}
                          className={cn(
                            "px-3 py-3 cursor-pointer rounded-lg transition-all duration-200",
                            selectedIndex === index 
                              ? "bg-primary/20 border border-primary/30" 
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => handleSearch(item)}
                        >
                          <div className="text-foreground font-medium">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {suggestions.tv && suggestions.tv.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground font-medium">
                        <Tv className="w-4 h-4" />
                        TV Shows
                      </div>
                      {suggestions.tv.map((item, index) => {
                        const globalIndex = (suggestions.movie?.length || 0) + index;
                        return (
                          <div
                            key={`tv-${item.id}`}
                            ref={el => suggestionRefs.current[globalIndex] = el}
                            className={cn(
                              "px-3 py-3 cursor-pointer rounded-lg transition-all duration-200",
                              selectedIndex === globalIndex 
                                ? "bg-primary/20 border border-primary/30" 
                                : "hover:bg-muted/50"
                            )}
                            onClick={() => handleSearch(item)}
                          >
                            <div className="text-foreground font-medium">{item.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
                  {/* Movies Section */}
                  {moviesList.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <Film className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">Movies ({moviesList.length})</h2>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {moviesList.map((movie, index) => (
                          <div
                            key={`movie-${movie.id}-${index}`}
                            className="group cursor-pointer transition-all duration-300 hover:scale-105"
                          >
                            <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300">
                              {movie.poster ? (
                                <img
                                  src={movie.poster}
                                  alt={movie.title}
                                  className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Film className="w-12 h-12" />
                                </div>
                              )}
                            </div>
                            <div className="mt-3 px-1">
                              <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                                {movie.title}
                              </h3>
                              {movie.year && (
                                <p className="text-xs text-muted-foreground mt-1">{movie.year}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* TV Shows Section */}
                  {tvShowsList.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <Tv className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">TV Shows ({tvShowsList.length})</h2>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {tvShowsList.map((movie, index) => (
                          <div
                            key={`tv-${movie.id}-${index}`}
                            className="group cursor-pointer transition-all duration-300 hover:scale-105"
                          >
                            <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300">
                              {movie.poster ? (
                                <img
                                  src={movie.poster}
                                  alt={movie.title}
                                  className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Tv className="w-12 h-12" />
                                </div>
                              )}
                            </div>
                            <div className="mt-3 px-1">
                              <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                                {movie.title}
                              </h3>
                              {movie.year && (
                                <p className="text-xs text-muted-foreground mt-1">{movie.year}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </>
        ) : (
          <div className="text-center py-20">
            <Film className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Start Your Discovery</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Search for any movie or TV show to get personalized recommendations and discover your next favorite watch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;