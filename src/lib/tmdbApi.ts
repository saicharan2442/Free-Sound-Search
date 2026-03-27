import type { Movie, SearchResult, StreamSource } from "@/types/movie";

const API_KEY = "5622f45e2d9d193c13089eb30717371b";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/original";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

interface ApiResponse {
  results?: (Movie | Record<string, unknown>)[];
  error?: boolean;
  [key: string]: unknown;
}

// Fetch helper with error handling
async function fetch_data(
  endpoint: string,
  params: Record<string, unknown> = {}
): Promise<ApiResponse> {
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    ...params,
  });

  const url = `${BASE_URL}${endpoint}?${queryParams}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors || data.success === false) {
      return { results: [], error: true };
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { results: [], error: true };
  }
}

export const tmdbApi = {
  // Get trending movies for the week
  async getTrending(): Promise<Movie[]> {
    const data = await fetch_data("/trending/movie/week");
    return (data.results as Movie[]) || [];
  },

  // Get popular movies
  async getPopular(): Promise<Movie[]> {
    const data = await fetch_data("/movie/popular");
    return (data.results as Movie[]) || [];
  },

  // Get top rated movies
  async getTopRated(): Promise<Movie[]> {
    const data = await fetch_data("/movie/top_rated");
    return (data.results as Movie[]) || [];
  },

  // Get upcoming movies
  async getUpcoming(): Promise<Movie[]> {
    const data = await fetch_data("/movie/upcoming");
    return (data.results as Movie[]) || [];
  },

  // Get now playing movies
  async getNowPlaying(): Promise<Movie[]> {
    const data = await fetch_data("/movie/now_playing");
    return (data.results as Movie[]) || [];
  },

  // Fetch paginated results (for "View All" functionality)
  async getTrendingPaginated(): Promise<Movie[]> {
    const allMovies: Movie[] = [];
    for (let page = 1; page <= 5; page++) {
      const data = await fetch_data("/trending/movie/week", { page });
      const movies = (data.results as Movie[]) || [];
      allMovies.push(...movies);
      if (allMovies.length >= 100) break;
    }
    return allMovies.slice(0, 100);
  },

  async getPopularPaginated(): Promise<Movie[]> {
    const allMovies: Movie[] = [];
    for (let page = 1; page <= 5; page++) {
      const data = await fetch_data("/movie/popular", { page });
      const movies = (data.results as Movie[]) || [];
      allMovies.push(...movies);
      if (allMovies.length >= 100) break;
    }
    return allMovies.slice(0, 100);
  },

  async getTopRatedPaginated(): Promise<Movie[]> {
    const allMovies: Movie[] = [];
    for (let page = 1; page <= 5; page++) {
      const data = await fetch_data("/movie/top_rated", { page });
      const movies = (data.results as Movie[]) || [];
      allMovies.push(...movies);
      if (allMovies.length >= 100) break;
    }
    return allMovies.slice(0, 100);
  },

  async getUpcomingPaginated(): Promise<Movie[]> {
    const allMovies: Movie[] = [];
    for (let page = 1; page <= 5; page++) {
      const data = await fetch_data("/movie/upcoming", { page });
      const movies = (data.results as Movie[]) || [];
      allMovies.push(...movies);
      if (allMovies.length >= 100) break;
    }
    return allMovies.slice(0, 100);
  },

  // Get movie details
  async getMovieDetails(movieId: number): Promise<Movie | null> {
    const data = await fetch_data(`/movie/${movieId}`);
    return ((data as unknown as { id?: number }) || null) as Movie | null;
  },

  // Get movie videos/trailers
  async getMovieVideos(movieTitle: string): Promise<string | null> {
    try {
      // Call backend to search TMDB for movies
      const response = await fetch(
        `http://localhost:5000/streaming/search?q=${encodeURIComponent(movieTitle)}`
      );
      const data = await response.json();
      const movies = data as any[];
      
      if (movies && movies.length > 0) {
        // Return the movie ID of the first result
        return movies[0].id;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching movies from backend:", error);
      return null;
    }
  },

  // Get streaming providers for a movie from TMDB
  async getStreamingProviders(movieId: string | number): Promise<any> {
    try {
      const response = await fetch(
        `http://localhost:5000/streaming/providers?movieId=${movieId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching streaming providers:", error);
      return { providers: [], error: "Failed to fetch providers" };
    }
  },

  // Get trailer YouTube key for a given TMDB movie ID
  async getTrailerKey(movieId: number): Promise<string | null> {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
      );
      const data = await response.json();
      const videos = data.results || [];

      let trailer = videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
      if (!trailer) {
        trailer = videos.find((v: any) => v.site === "YouTube");
      }

      return trailer ? trailer.key : null;
    } catch (error) {
      console.error("Error fetching trailer key:", error);
      return null;
    }
  },

  // Get actual stream URL for a video (YouTube trailer as fallback)
  async getStreamUrl(videoId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `http://localhost:5000/streaming/video-url?videoId=${encodeURIComponent(videoId)}`
      );
      const data = await response.json();
      
      if (data.videoUrl) {
        return data.videoUrl;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching stream URL from backend:", error);
      return null;
    }
  },


  // Search for movies and tv shows
  async search(query: string): Promise<SearchResult[]> {
    const data = await fetch_data("/search/multi", { query });
    return (data.results as SearchResult[]) || [];
  },

  // Get image URL
  getImageUrl(
    path: string | null,
    type: "backdrop" | "poster" = "backdrop"
  ): string {
    if (!path) {
      return "https://via.placeholder.com/1920x1080?text=No+Image";
    }
    const baseUrl = type === "poster" ? POSTER_BASE : IMAGE_BASE;
    return `${baseUrl}${path}`;
  },
};
