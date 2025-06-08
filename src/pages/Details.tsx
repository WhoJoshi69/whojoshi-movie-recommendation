import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Star, 
  Users, 
  Globe, 
  ExternalLink,
  Film,
  Tv,
  Play,
  Heart,
  Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { 
  getMovieDetails, 
  getTVShowDetails, 
  getSimilar, 
  getCredits,
  getWatchProviders,
  getTMDBImageUrl,
  TMDBMovie,
  TMDBTVShow,
  TMDBSearchResult
} from "@/lib/tmdb";

interface StreamingProvider {
  id: number;
  name: string;
  logo_path: string;
  link?: string;
}

interface WatchProviders {
  flatrate?: StreamingProvider[];
  rent?: StreamingProvider[];
  buy?: StreamingProvider[];
}

interface DetailsProps {}

const Details: React.FC<DetailsProps> = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [movieDetails, setMovieDetails] = useState<TMDBMovie | null>(null);
  const [tvDetails, setTVDetails] = useState<TMDBTVShow | null>(null);
  const [similar, setSimilar] = useState<TMDBSearchResult[]>([]);
  const [credits, setCredits] = useState<any>(null);
  const [watchProviders, setWatchProviders] = useState<WatchProviders | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tmdbId = parseInt(id || '0');
  const mediaType = type as 'movie' | 'tv';

  useEffect(() => {
    if (!tmdbId || !mediaType || (mediaType !== 'movie' && mediaType !== 'tv')) {
      setError('Invalid parameters');
      setIsLoading(false);
      return;
    }

    fetchDetails();
  }, [tmdbId, mediaType]);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch main details
      if (mediaType === 'movie') {
        const details = await getMovieDetails(tmdbId);
        setMovieDetails(details);
      } else {
        const details = await getTVShowDetails(tmdbId);
        setTVDetails(details);
      }

      // Fetch similar content, credits, and watch providers in parallel
      const [similarData, creditsData, watchProvidersData] = await Promise.all([
        getSimilar(tmdbId, mediaType),
        getCredits(tmdbId, mediaType),
        getWatchProviders(tmdbId, mediaType).catch(() => null) // Don't fail if watch providers aren't available
      ]);

      setSimilar(similarData.slice(0, 12)); // Limit to 12 similar items
      setCredits(creditsData);
      
      // Set watch providers for US region (you can change this to other regions)
      if (watchProvidersData?.results?.US) {
        setWatchProviders(watchProvidersData.results.US);
      }

    } catch (err) {
      console.error('Error fetching details:', err);
      setError('Failed to load details. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimilarClick = (item: TMDBSearchResult) => {
    navigate(`/details/${item.media_type}/${item.id}`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: mediaType === 'movie' ? movieDetails?.title : tvDetails?.name,
        text: mediaType === 'movie' ? movieDetails?.overview : tvDetails?.overview,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
    }
  };

  const handleWatchNow = (url: string) => {
    // Open in new tab with fullscreen-like experience
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      newWindow.focus();
    }
  };

  // Get default streaming platforms
  const getDefaultPlatforms = () => {
    return [
      {
        id: 999,
        name: "WhoJoshi server 1",
        logo_path: "",
        link: mediaType === 'movie' 
          ? `https://hexa.watch/watch/movie/${tmdbId}`
          : `https://hexa.watch/watch/tv/${tmdbId}`,
        isDefault: true,
        color: "from-purple-600 to-purple-700"
      },
      {
        id: 998,
        name: "WhoJoshi server 2",
        logo_path: "",
        link: mediaType === 'movie' 
          ? `https://moviebay.cc/view/movie/${tmdbId}`
          : `https://moviebay.cc/view/tv/${tmdbId}`,
        isDefault: true,
        color: "from-blue-600 to-blue-700"
      }
    ];
  };

  // Get all available streaming platforms
  const getAllPlatforms = () => {
    const defaultPlatforms = getDefaultPlatforms();
    const officialPlatforms = [];

    // Add official streaming platforms
    if (watchProviders?.flatrate) {
      officialPlatforms.push(...watchProviders.flatrate.map(provider => ({
        ...provider,
        isDefault: false,
        link: `https://www.themoviedb.org/${mediaType}/${tmdbId}/watch` // TMDB watch page
      })));
    }

    return [...defaultPlatforms, ...officialPlatforms];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="aspect-[2/3] bg-muted rounded-lg"></div>
              <div className="md:col-span-2 space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const details = mediaType === 'movie' ? movieDetails : tvDetails;
  if (!details) return null;

  const title = mediaType === 'movie' ? (movieDetails as TMDBMovie)?.title : (tvDetails as TMDBTVShow)?.name;
  const releaseDate = mediaType === 'movie' 
    ? (movieDetails as TMDBMovie)?.release_date 
    : (tvDetails as TMDBTVShow)?.first_air_date;
  const runtime = mediaType === 'movie' ? (movieDetails as TMDBMovie)?.runtime : null;
  const seasons = mediaType === 'tv' ? (tvDetails as TMDBTVShow)?.number_of_seasons : null;
  const episodes = mediaType === 'tv' ? (tvDetails as TMDBTVShow)?.number_of_episodes : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-[50vh] md:h-[60vh] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: details.backdrop_path 
            ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${getTMDBImageUrl(details.backdrop_path, 'w1280')})`
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Navigation */}
        <div className="relative z-10 p-4 md:p-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              {mediaType === 'movie' ? (
                <Film className="w-5 h-5 text-white" />
              ) : (
                <Tv className="w-5 h-5 text-white" />
              )}
              <span className="text-white/80 text-sm font-medium uppercase tracking-wide">
                {mediaType === 'movie' ? 'Movie' : 'TV Show'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {title}
            </h1>
            {details.tagline && (
              <p className="text-lg md:text-xl text-white/90 italic">
                {details.tagline}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden sticky top-8">
              <div className="aspect-[2/3] relative">
                <img
                  src={getTMDBImageUrl(details.poster_path, 'w780')}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Action Buttons */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => handleWatchNow(getDefaultPlatforms()[0].link)}
                  >
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Watch Now
                  </Button>
                  <Button size="sm" variant="outline" className="hover:bg-red-50 hover:border-red-200 transition-colors duration-200">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleShare} className="hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Rating and Meta Info */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-lg font-semibold">
                  {details.vote_average.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({details.vote_count.toLocaleString()} votes)
                </span>
              </div>
              
              {releaseDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(releaseDate).getFullYear()}</span>
                </div>
              )}
              
              {runtime && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{runtime} min</span>
                </div>
              )}
              
              {seasons && episodes && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tv className="w-4 h-4" />
                  <span>{seasons} seasons, {episodes} episodes</span>
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {details.genres.map((genre) => (
                <Badge key={genre.id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>

            {/* Overview */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                {details.overview || 'No overview available.'}
              </p>
            </div>

            {/* Cast */}
            {credits?.cast && credits.cast.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {credits.cast.slice(0, 6).map((person: any) => (
                    <div key={person.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
                        {person.profile_path ? (
                          <img
                            src={getTMDBImageUrl(person.profile_path, 'w185')}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{person.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {person.character}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Production */}
              {details.production_companies && details.production_companies.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Production</h3>
                  <div className="space-y-1">
                    {details.production_companies.slice(0, 3).map((company) => (
                      <p key={company.id} className="text-sm text-muted-foreground">
                        {company.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {details.spoken_languages && details.spoken_languages.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-1">
                    {details.spoken_languages.map((lang) => (
                      <Badge key={lang.iso_639_1} variant="outline" className="text-xs">
                        {lang.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
{/* Streaming Platforms Section */}
<div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-800">
  <div className="mb-4">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
      Where to watch
    </h3>
    <p className="text-sm text-slate-700 dark:text-slate-300">
      Choose your preferred streaming platform
    </p>
  </div>

  {/* Default (Full Card) Platforms */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
    {getAllPlatforms().filter(p => p.isDefault).map((platform: any) => (
      <Button
        key={platform.id}
        variant="outline"
        className={cn(
          "h-auto p-4 justify-start gap-3 transition-all duration-300 hover:scale-105 text-left w-full flex items-center",
          `bg-gradient-to-r ${platform.color} text-white border-none shadow-lg hover:shadow-xl`
        )}
        onClick={() => handleWatchNow(platform.link)}
      >
        <div className="flex items-center gap-3 w-full">
          {platform.logo_path ? (
            <img
              src={getTMDBImageUrl(platform.logo_path, 'w92')}
              alt={platform.name}
              className="w-8 h-8 rounded object-cover bg-white"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
              <Play className="w-4 h-4" />
            </div>
          )}
          <div className="flex-1">
            <div className="font-medium truncate">{platform.name}</div>
            <div className="text-xs opacity-90">Free streaming</div>
          </div>
          <ExternalLink className="w-4 h-4 opacity-60 shrink-0" />
        </div>
      </Button>
    ))}
  </div>

  {/* Non-default (Icons Only) Platforms */}
  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 justify-center">
    {getAllPlatforms().filter(p => !p.isDefault).map((platform: any) => (
      <button
        key={platform.id}
        onClick={() => handleWatchNow(platform.link)}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:scale-105 transition-all duration-300 flex items-center justify-center"
        title={platform.name}
        aria-label={`Watch on ${platform.name}`}
      >
        {platform.logo_path ? (
          <img
            src={getTMDBImageUrl(platform.logo_path, 'w92')}
            alt={platform.name}
            className="w-8 h-8 object-contain"
          />
        ) : (
          <Play className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        )}
      </button>
    ))}
  </div>

  {/* Rent or Buy */}
  {watchProviders && (watchProviders.rent || watchProviders.buy) && (
    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
        Also available for rent or purchase:
      </p>
      <div className="flex flex-wrap gap-2">
        {[...(watchProviders.rent || []), ...(watchProviders.buy || [])].map((provider) => (
          <Button
            key={`${provider.id}-rent-buy`}
            variant="outline"
            size="sm"
            className="h-auto p-2 gap-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            onClick={() => handleWatchNow(`https://www.themoviedb.org/${mediaType}/${tmdbId}/watch`)}
          >
            {provider.logo_path ? (
              <img
                src={getTMDBImageUrl(provider.logo_path, 'w92')}
                alt={provider.name}
                className="w-5 h-5 rounded object-cover bg-white"
              />
            ) : (
              <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <Play className="w-3 h-3" />
              </div>
            )}
            <span className="text-xs truncate">{provider.name}</span>
          </Button>
        ))}
      </div>
    </div>
  )}
</div>


            {/* External Links */}
            <div className="flex gap-2">
              {details.homepage && (
                <Button variant="outline" size="sm" asChild>
                  <a href={details.homepage} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Official Site
                  </a>
                </Button>
              )}
              {mediaType === 'movie' && (movieDetails as TMDBMovie)?.imdb_id && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://www.imdb.com/title/${(movieDetails as TMDBMovie).imdb_id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    IMDb
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Similar Content */}
        {similar.length > 0 && (
          <div className="mt-12">
            <Separator className="mb-8" />
            <h2 className="text-2xl font-bold mb-6">Similar {mediaType === 'movie' ? 'Movies' : 'TV Shows'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer transition-all duration-300 hover:scale-105"
                  onClick={() => handleSimilarClick(item)}
                >
                  <Card className="overflow-hidden">
                    <div className="aspect-[2/3] relative">
                      <img
                        src={getTMDBImageUrl(item.poster_path, 'w342')}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </Card>
                  <div className="mt-2 px-1">
                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {item.title || item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-muted-foreground">
                          {item.vote_average.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.release_date || item.first_air_date 
                          ? new Date(item.release_date || item.first_air_date || '').getFullYear()
                          : ''
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;