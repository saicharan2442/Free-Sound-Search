import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ParticleBackground } from "@/components/ParticleBackground";
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
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const CARDS_PER_PAGE = 16;

const Dashboard = () => {
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

  const paginatedResults = results
    ? results.slice((currentPage - 1) * CARDS_PER_PAGE, currentPage * CARDS_PER_PAGE)
    : [];
  const totalPages = results ? Math.ceil(results.length / CARDS_PER_PAGE) : 0;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ParticleBackground />

      {/* Hero Search Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[50vh] px-4 pt-20 pb-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/15 blur-[100px] animate-float" style={{ animationDelay: "3s" }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-gradient">Search Sounds</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-md mx-auto">
            Find and download high-quality sounds instantly.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.querySelector("input") as HTMLInputElement;
            if (input?.value.trim()) {
              handleSearch(input.value.trim());
            }
          }}
          className="relative z-10 w-full max-w-2xl"
        >
          <div className="glass-strong rounded-2xl p-1.5 glow-primary transition-all focus-within:glow-secondary">
            <div className="flex items-center gap-2 bg-background/50 rounded-xl px-5 py-3">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search sounds..."
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base md:text-lg"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="cursor-target bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Search
              </motion.button>
            </div>
          </div>
        </motion.form>
      </section>

      <TrendingCategories onSelect={handleSearch} />
      <RecentSearches searches={recentSearches} onSelect={handleSearch} />

      {/* Results */}
      <section className="relative z-10 px-4 py-8 max-w-7xl mx-auto">
        {error && <ErrorMessage error={error.message} />}

        {searchQuery && (
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground mb-6"
          >
            Results for "{searchQuery}"
          </motion.h2>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: CARDS_PER_PAGE }).map((_, i) => (
              <SoundCardSkeleton key={i} />
            ))}
          </div>
        ) : paginatedResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {paginatedResults.map((sound, idx) => (
                <motion.div
                  key={sound.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <SoundCard
                    sound={sound}
                    onPlay={() => player.play(sound.previews["preview-hq-mp3"], sound.name)}
                    isFavorite={isFavorite(sound.id)}
                    onToggleFavorite={() => toggleFavorite(sound.id)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-primary/20 text-foreground disabled:opacity-50 hover:bg-primary/30 transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-primary/20 text-foreground disabled:opacity-50 hover:bg-primary/30 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : searchQuery ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">No sounds found. Try a different search.</p>
          </motion.div>
        ) : null}
      </section>

      <MiniPlayer {...player} />
      <Footer />
    </div>
  );
};

export default Dashboard;
