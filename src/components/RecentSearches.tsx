import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface Props {
  searches: string[];
  onSelect: (query: string) => void;
}

export function RecentSearches({ searches, onSelect }: Props) {
  if (searches.length === 0) return null;

  return (
    <section className="relative z-10 px-4 py-6 max-w-4xl mx-auto">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5" />
        Recent Searches
      </h2>
      <div className="flex flex-wrap gap-2">
        {searches.map((s, i) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onSelect(s)}
            className="px-4 py-1.5 rounded-lg bg-muted/50 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {s}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
