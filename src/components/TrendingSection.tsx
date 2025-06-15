
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Film, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTMDBImageUrl, getPopularMovies, getUpcomingMovies, getNowPlayingMovies, TMDBSearchResult } from "@/lib/tmdb";

interface TrendingSectionProps {
  onMovieClick: (movie: TMDBSearchResult) => void;
}

const TrendingSection = ({ onMovieClick }: TrendingSectionProps) => {
  const [activeSection, setActiveSection] = useState<'trending' | 'upcoming' | 'now-playing'>('trending');
  const [movies, setMovies] = useState<TMDBSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchMovies = async (section: 'trending' | 'upcoming' | 'now-playing') => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      let data: TMDBSearchResult[] = [];
      
      switch (section) {
        case 'trending':
          data = await getPopularMovies();
          break;
        case 'upcoming':
          data = await getUpcomingMovies();
          break;
        case 'now-playing':
          data = await getNowPlayingMovies();
          break;
      }
      
      setMovies(data.slice(0, 12)); // Show only first 12 movies
    } catch (error) {
      console.error('Error fetching movies:', error);
      setHasError(true);
      // Show mock data as fallback
      const mockMovies: TMDBSearchResult[] = [
        {
          id: 550,
          title: "Sample Movie 1",
          overview: "A sample movie for demonstration",
          poster_path: null,
          backdrop_path: null,
          release_date: "2024-01-15",
          vote_average: 8.5,
          media_type: 'movie'
        },
        {
          id: 551,
          title: "Sample Movie 2", 
          overview: "Another sample movie",
          poster_path: null,
          backdrop_path: null,
          release_date: "2024-02-20",
          vote_average: 7.8,
          media_type: 'movie'
        }
      ];
      setMovies(mockMovies);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(activeSection);
  }, [activeSection]);

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'trending':
        return 'Trending Movies';
      case 'upcoming':
        return 'Coming Soon';
      case 'now-playing':
        return 'Now Playing';
      default:
        return 'Movies';
    }
  };

  const getSectionIcon = () => {
    switch (activeSection) {
      case 'trending':
        return <TrendingUp className="w-5 h-5" />;
      case 'upcoming':
        return <Calendar className="w-5 h-5" />;
      case 'now-playing':
        return <Film className="w-5 h-5" />;
      default:
        return <Film className="w-5 h-5" />;
    }
  };

  return (
    <div className="mb-12">
      {/* Section Toggle Buttons */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted rounded-xl p-1 flex flex-wrap gap-1 max-w-full">
          <button
            onClick={() => setActiveSection('trending')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm touch-manipulation",
              activeSection === 'trending'
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground active:text-foreground"
            )}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Trending</span>
          </button>
          <button
            onClick={() => setActiveSection('upcoming')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm touch-manipulation",
              activeSection === 'upcoming'
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground active:text-foreground"
            )}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Coming Soon</span>
          </button>
          <button
            onClick={() => setActiveSection('now-playing')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm touch-manipulation",
              activeSection === 'now-playing'
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground active:text-foreground"
            )}
          >
            <Film className="w-4 h-4" />
            <span className="hidden sm:inline">Now Playing</span>
          </button>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {getSectionIcon()}
        <h2 className="text-xl font-bold text-foreground">{getSectionTitle()}</h2>
        {hasError && (
          <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Demo</span>
        )}
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie, index) => (
            <div
              key={`${activeSection}-${movie.id}-${index}`}
              className="group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
              onClick={() => onMovieClick(movie)}
            >
              <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl group-active:shadow-xl transition-all duration-300">
                {movie.poster_path ? (
                  <img
                    src={getTMDBImageUrl(movie.poster_path, 'w500')}
                    alt={movie.title || 'Movie'}
                    className="w-full h-full object-cover group-hover:brightness-110 group-active:brightness-110 transition-all duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Film className="w-8 h-8 sm:w-12 sm:h-12" />
                  </div>
                )}
              </div>
              <div className="mt-2 px-1">
                <h3 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary group-active:text-primary transition-colors duration-200">
                  {movie.title}
                </h3>
                {movie.release_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(movie.release_date).getFullYear()}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-yellow-600">★</span>
                  <span className="text-xs text-muted-foreground">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingSection;
