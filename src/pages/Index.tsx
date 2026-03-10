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

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
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
      <section className="relative z-10 px-4 py-8 max-w-6xl mx-auto">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SoundCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && <ErrorMessage message={(error as Error).message} />}

        {results && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((sound, i) => (
              <SoundCard
                key={sound.id}
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
            ))}
          </div>
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
