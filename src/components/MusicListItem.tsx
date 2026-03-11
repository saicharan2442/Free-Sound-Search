import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import type { MusicResult } from "@/lib/api";

interface Props {
  music: MusicResult;
  index: number;
  isPlaying: boolean;
  isCurrentMusic: boolean;
  onPlay: () => void;
}

export function MusicListItem({ music, index, isPlaying, isCurrentMusic, onPlay }: Props) {
  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="group"
    >
      <div className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium truncate ${
            isCurrentMusic ? "text-primary" : "text-foreground"
          }`}>
            {music.title}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {music.artist}
          </p>
        </div>

        {/* Duration */}
        <span className="text-xs text-muted-foreground font-mono shrink-0">
          {formatDuration(music.duration)}
        </span>

        {/* Play Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPlay}
          className="cursor-target w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
        >
          {isCurrentMusic && isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
