export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genres?: Genre[];
  runtime?: number;
  media_type?: 'movie' | 'tv';
}

export interface Genre {
  id: number;
  name: string;
}

export interface SearchResult {
  id: number;
  title: string;
  name?: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
}

export interface StreamSource {
  url: string;
  name: string;
  quality: string;
}

export interface StreamResponse {
  success: boolean;
  sources: StreamSource[];
  primary?: StreamSource;
  error?: string;
}
