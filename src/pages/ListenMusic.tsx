import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ParticleBackground } from "@/components/ParticleBackground";
import { MusicHeroSection } from "@/components/MusicHeroSection";
import { TrendingCategories } from "@/components/TrendingCategories";
import { RecentSearches } from "@/components/RecentSearches";
import { MusicCardFS } from "@/components/MusicCardFS";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Footer } from "@/components/Footer";
import { searchMusic, getAudioUrl, extractYouTubeVideoId, getMusicInfo } from "@/lib/api";
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
  const [urlError, setUrlError] = useState<string | null>(null);
  const [directPlayTrack, setDirectPlayTrack] = useState<any>(null);
  
  const player = useMusicAudioPlayer();
  const { isFavorite, toggle: toggleFavorite } = useMusicFavorites();
  const { searches: recentSearches, add: addRecentSearch } = useRecentSearches();

  const { data: results, isLoading, error } = useQuery({
    queryKey: ["music", searchQuery],
    queryFn: () => searchMusic(searchQuery),
    enabled: !!searchQuery && !extractYouTubeVideoId(searchQuery),
  });

  const handlePlay = useCallback(
    async (videoId: string, title: string, artist: string) => {
      // If clicking the same track, just toggle play/pause
      if (player.currentMusicId === videoId) {
        player.setIsPlaying(!player.isPlaying);
        return;
      }

      // Different track - fetch audio URL and play
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
    },
    [player]
  );

  const handleSearch = useCallback(
    async (query: string) => {
      setUrlError(null);
      const videoId = extractYouTubeVideoId(query);
      
      if (videoId) {
        // User provided a YouTube URL or video ID
        setIsLoadingAudio(true);
        try {
          // Get music info from video ID
          const musicInfo = await getMusicInfo(videoId);
          // Directly play the video
          await handlePlay(videoId, musicInfo.title, musicInfo.artist);
          // Store the track to display in cards
          setDirectPlayTrack({
            id: videoId,
            videoId: videoId,
            title: musicInfo.title,
            artist: musicInfo.artist,
            duration: musicInfo.duration,
          });
          setSearchQuery(""); // Clear search bar
          addRecentSearch(query);
        } catch (err) {
          console.error("Failed to load from URL:", err);
          setUrlError("Could not load the video. Please check the URL and try again.");
          setIsLoadingAudio(false);
        }
      } else {
        // Regular search
        setSearchQuery(query);
        setCurrentPage(1);
        setDirectPlayTrack(null); // Clear direct play track on new search
        addRecentSearch(query);
      }
    },
    [addRecentSearch, handlePlay]
  );

  const handleDownload = (music: any) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const filename = `${music.title}-${music.artist}.mp3`.replace(/[^a-zA-Z0-9._-]/g, "_");
    const downloadUrl = `${API_BASE_URL}/listen-music/download?videoId=${encodeURIComponent(music.videoId)}&filename=${encodeURIComponent(filename)}`;
    
    // Create and click download link
    const element = document.createElement("a");
    element.setAttribute("href", downloadUrl);
    element.setAttribute("download", filename);
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

        {urlError && <ErrorMessage message={urlError} />}

        {directPlayTrack && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">▶ Now Playing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="animate-fade-in-up">
                <MusicCardFS
                  music={directPlayTrack}
                  index={0}
                  isPlaying={player.isPlaying}
                  isCurrentMusic={player.currentMusicId === directPlayTrack.videoId}
                  isFavorite={isFavorite(directPlayTrack.videoId)}
                  onPlay={() => {
                    if (isLoadingAudio) return;
                    handlePlay(directPlayTrack.videoId, directPlayTrack.title, directPlayTrack.artist);
                  }}
                  onToggleFavorite={() => toggleFavorite(directPlayTrack.videoId)}
                  onDownload={() => handleDownload(directPlayTrack)}
                />
              </div>
            </div>
          </div>
        )}

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
        videoId={player.currentMusicId}
        isPlaying={player.isPlaying}
        onClose={player.stop}
        onPlayPauseChange={player.setIsPlaying}
      />
    </div>
  );
}
