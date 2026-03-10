import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

const placeholders = [
  "Search sounds like rain, thunder, footsteps…",
  "Try: birds chirping at dawn",
  "Try: sci-fi laser beam",
  "Try: ocean waves crashing",
  "Try: city traffic ambience",
];

export function HeroSection({ onSearch }: HeroSectionProps) {
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[70vh] px-4 pt-20 pb-10">
      {/* Logo Header */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 left-6 z-20"
      >
        <img
          src="/fss-logo.png"
          alt="FSS Logo"
          className="h-20 w-auto object-contain"
        />
      </motion.div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/15 blur-[100px] animate-float" style={{ animationDelay: "3s" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
          <span className="text-gradient">FREE SOUND</span>
          <br />
          <span className="text-foreground">SEARCH</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-md mx-auto">
          Discover and download sounds instantly.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="glass-strong rounded-2xl p-1.5 glow-primary transition-all focus-within:glow-secondary">
          <div className="flex items-center gap-2 bg-background/50 rounded-xl px-5 py-3">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholders[placeholderIdx]}
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
  );
}
