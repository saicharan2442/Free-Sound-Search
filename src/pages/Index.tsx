import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ParticleBackground } from "@/components/ParticleBackground";
import { HeroSection } from "@/components/HeroSection";
import { TrendingCategories } from "@/components/TrendingCategories";
import { RecentSearches } from "@/components/RecentSearches";
import { SoundCard } from "@/components/SoundCard";
import { SoundCardSkeleton } from "@/components/SoundCardSkeleton";
import { MiniPlayer } from "@/components/MiniPlayer";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Footer } from "@/components/Footer";
import { searchSounds } from "@/lib/api";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentSearches } from "@/hooks/useRecentSearches";

const CARDS_PER_PAGE = 16;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const player = useAudioPlayer();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { searches: recentSearches, add: addRecentSearch } = useRecentSearches();

  const { data: results, isLoading, error } = useQuery({
    queryKey: ["sounds", searchQuery],
    queryFn: () => searchSounds(searchQuery),
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

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ParticleBackground />

      <HeroSection onSearch={handleSearch} />
      <TrendingCategories onSelect={handleSearch} />
      <RecentSearches searches={recentSearches} onSelect={handleSearch} />

      {/* Results */}
      <section className="relative z-10 px-4 py-8 max-w-7xl mx-auto">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <SoundCardSkeleton key={i} />
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
                  <p className="text-xs text-gray-400">Total Sounds</p>
                  <p className="text-lg font-bold text-white">{results.length} 🎵</p>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {results.slice((currentPage - 1) * CARDS_PER_PAGE, currentPage * CARDS_PER_PAGE).map((sound, i) => (
                <div key={sound.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <SoundCard
                    sound={sound}
                    index={i}
                    isPlaying={player.isPlaying}
                    isCurrentSound={player.currentSoundId === sound.id}
                    isFavorite={isFavorite(sound.id)}
                    onPlay={() =>
                      player.play(sound.id, sound.previews["preview-hq-mp3"], sound.name)
                    }
                    onToggleFavorite={() => toggleFavorite(sound.id)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {Math.ceil(results.length / CARDS_PER_PAGE) > 1 && (
              <div className="flex justify-center items-center gap-2 pb-8 animate-fade-in-up">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  ← Previous
                </button>

                <div className="flex gap-1 mx-2">
                  {Array.from({ length: Math.ceil(results.length / CARDS_PER_PAGE) }).map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrentPage = pageNum === currentPage;
                    const isNearby = Math.abs(pageNum - currentPage) <= 2;
                    
                    return isNearby ? (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 ${
                          isCurrentPage
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-110"
                            : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 hover:text-white hover:scale-105"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ) : pageNum === 2 && currentPage > 4 ? (
                      <span key="ellipsis-start" className="text-gray-500 px-2">...</span>
                    ) : pageNum === Math.ceil(results.length / CARDS_PER_PAGE) - 1 && currentPage < Math.ceil(results.length / CARDS_PER_PAGE) - 3 ? (
                      <span key="ellipsis-end" className="text-gray-500 px-2">...</span>
                    ) : null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(results.length / CARDS_PER_PAGE), prev + 1))}
                  disabled={currentPage === Math.ceil(results.length / CARDS_PER_PAGE)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {results && results.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No sounds found. Try a different search term.</p>
        )}
      </section>

      <Footer />

      <MiniPlayer
        soundName={player.currentSoundName}
        isPlaying={player.isPlaying}
        progress={player.progress}
        onPause={player.pause}
        onResume={player.resume}
        onStop={player.stop}
        visible={player.currentSoundId !== null}
      />
    </div>
  );
};

export default Index;
