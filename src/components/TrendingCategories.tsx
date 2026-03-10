import { motion } from "framer-motion";
import { Cloud, Zap, TreePine, Monitor, Gamepad2 } from "lucide-react";

const categories = [
  { label: "Rain", icon: Cloud },
  { label: "Thunder", icon: Zap },
  { label: "Nature", icon: TreePine },
  { label: "UI Sounds", icon: Monitor },
  { label: "Game Effects", icon: Gamepad2 },
];

interface Props {
  onSelect: (category: string) => void;
}

export function TrendingCategories({ onSelect }: Props) {
  return (
    <section className="relative z-10 px-4 py-8 max-w-4xl mx-auto">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4 text-center">
        Trending
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(cat.label)}
            className="cursor-target glass rounded-xl px-5 py-2.5 flex items-center gap-2 text-sm font-medium text-foreground hover:glow-primary transition-shadow cursor-pointer"
          >
            <cat.icon className="w-4 h-4 text-primary" />
            {cat.label}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
