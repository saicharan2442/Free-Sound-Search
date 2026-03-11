import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ParticleBackground } from "@/components/ParticleBackground";
import { MusicHeroSection } from "@/components/MusicHeroSection";
import { TrendingCategories } from "@/components/TrendingCategories";
import { RecentSearches } from "@/components/RecentSearches";
import { MusicCardFS } from "@/components/MusicCardFS";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Footer } from "@/components/Footer";
import { searchMusic, getAudioUrl } from "@/lib/api";
import { useMusicFavorites } from "@/hooks/useMusicFavorites";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useMusicAudioPlayer } from "@/hooks/useMusicAudioPlayer";

const CARDS_PER_PAGE = 16;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TRENDING_MUSIC_CATEGORIES = [
  "Popular",
  "Rock",
  "Pop",
  "Hip-Hop",
  "Jazz",
  "Classical",
  "Electronic",
  "Indie",
];

export default function ListenMusic() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  const player = useMusicAudioPlayer();
  const { isFavorite, toggle: toggleFavorite } = useMusicFavorites();
  const { searches: recentSearches, add: addRecentSearch } = useRecentSearches();

  const { data: results, isLoading, error } = useQuery({
    queryKey: ["music", searchQuery],
    queryFn: () => searchMusic(searchQuery),
    enabled: !!searchQuery,
  });

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      addRecentSearch(query);
    },
    [addRecentSearch]
  );

  const handlePlay = async (videoId: string, title: string, artist: string) => {
    if (player.currentMusicId === videoId && player.isPlaying) {
      player.setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      const urlResponse = await getAudioUrl(videoId);
      const proxyUrl = `${API_BASE_URL}/listen-music/stream?url=${encodeURIComponent(urlResponse)}`;
      player.play(videoId, title, artist, proxyUrl);
    } catch (err) {
      console.error("Failed to get audio URL:", err);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleDownload = (music: any) => {
    // Create a download link for the music
    const element = document.createElement("a");
    element.setAttribute("href", player.audioUrl || "");
    element.setAttribute("download", `${music.title}-${music.artist}.mp3`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const displayResults = results ? results.slice((currentPage - 1) * CARDS_PER_PAGE, currentPage * CARDS_PER_PAGE) : [];
  const totalPages = results ? Math.ceil(results.length / CARDS_PER_PAGE) : 0;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ParticleBackground />

      <MusicHeroSection onSearch={handleSearch} />
      <TrendingCategories onSelect={handleSearch} categories={TRENDING_MUSIC_CATEGORIES} />
      <RecentSearches searches={recentSearches} onSelect={handleSearch} />

      {/* Results */}
      <section className="relative z-10 px-4 py-6 max-w-7xl mx-auto">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-40 bg-muted/20 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {error && <ErrorMessage message={(error as Error).message} />}

        {results && results.length > 0 && (
          <>
            {/* Stats */}
            <div className="mb-6 flex items-center justify-end">
              <div className="animate-pulse">
                <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/30">
                  <p className="text-xs text-gray-400">Total Songs</p>
                  <p className="text-lg font-bold text-white">{results.length} 🎵</p>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
              {displayResults.map((music, i) => (
                <div key={music.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <MusicCardFS
                    music={music}
                    index={i}
                    isPlaying={player.isPlaying}
                    isCurrentMusic={player.currentMusicId === music.videoId}
                    isFavorite={isFavorite(music.videoId)}
                    onPlay={() => {
                      if (isLoadingAudio) return;
                      handlePlay(music.videoId, music.title, music.artist);
                    }}
                    onToggleFavorite={() => toggleFavorite(music.videoId)}
                    onDownload={() => handleDownload(music)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pb-12 animate-fade-in-up">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  ← Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {searchQuery && !isLoading && (!results || results.length === 0) && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No results found for "{searchQuery}"
            </p>
          </div>
        )}

        {!searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Start searching for your favorite music...
            </p>
          </div>
        )}
      </section>

      <Footer 
        audioUrl={player.audioUrl}
        title={player.currentTitle}
        artist={player.currentArtist}
        onClose={player.stop}
      />
    </div>
  );
}
