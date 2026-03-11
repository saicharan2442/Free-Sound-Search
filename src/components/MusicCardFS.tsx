import { motion } from "framer-motion";
import { Play, Pause, Download, Heart } from "lucide-react";
import { WaveformBars } from "./WaveformBars";
import ElectricBorder from "./ElectricBorder";
import type { MusicResult } from "@/lib/api";

interface Props {
  music: MusicResult;
  index: number;
  isPlaying: boolean;
  isCurrentMusic: boolean;
  isFavorite: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
}

export function MusicCardFS({ 
  music, 
  index, 
  isPlaying, 
  isCurrentMusic, 
  isFavorite, 
  onPlay, 
  onToggleFavorite,
  onDownload 
}: Props) {
  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <ElectricBorder
        color={isCurrentMusic ? "hsl(263, 70%, 66%)" : "hsl(230, 20%, 25%)"}
        speed={isCurrentMusic ? 1.5 : 0.5}
        chaos={isCurrentMusic ? 0.15 : 0.08}
        borderRadius={16}
      >
        <div className="glass rounded-2xl p-5 group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="text-foreground font-semibold text-sm truncate">{music.title}</h3>
              <p className="text-muted-foreground text-xs mt-0.5">{music.artist}</p>
            </div>
            {isCurrentMusic && <WaveformBars isPlaying={isPlaying} />}
          </div>

          {music.duration && (
            <span className="text-xs text-muted-foreground font-mono mb-3 block">
              {formatDuration(music.duration)}
            </span>
          )}

          <div className="flex items-center gap-3 mt-auto">
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              onClick={onPlay}
              className="cursor-target w-12 h-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white hover:shadow-lg hover:shadow-primary/50 transition-all duration-200"
            >
              {isCurrentMusic && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleFavorite}
              className="cursor-target w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center transition-colors hover:bg-destructive/20"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDownload}
              className="cursor-target w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-secondary hover:bg-secondary/20 transition-colors"
            >
              <Download className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </ElectricBorder>
    </motion.div>
  );
}
