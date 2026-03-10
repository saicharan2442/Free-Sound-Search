import { motion } from "framer-motion";
import { Play, Pause, Download, Heart } from "lucide-react";
import { WaveformBars } from "./WaveformBars";
import ElectricBorder from "./ElectricBorder";
import type { SoundResult } from "@/lib/api";

interface Props {
  sound: SoundResult;
  index: number;
  isPlaying: boolean;
  isCurrentSound: boolean;
  isFavorite: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
}

export function SoundCard({ sound, index, isPlaying, isCurrentSound, isFavorite, onPlay, onToggleFavorite }: Props) {
  const previewUrl = sound.previews?.["preview-hq-mp3"];

  const handleDownload = () => {
    if (!previewUrl) return;
    const downloadUrl = `http://localhost:5000/download?url=${encodeURIComponent(previewUrl)}&name=${encodeURIComponent(sound.name)}`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${sound.name}.mp3`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <ElectricBorder
        color={isCurrentSound ? "hsl(263, 70%, 66%)" : "hsl(230, 20%, 25%)"}
        speed={isCurrentSound ? 1.5 : 0.5}
        chaos={isCurrentSound ? 0.15 : 0.08}
        borderRadius={16}
      >
        <div className="glass rounded-2xl p-5 group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="text-foreground font-semibold text-sm truncate">{sound.name}</h3>
              <p className="text-muted-foreground text-xs mt-0.5">by {sound.username}</p>
            </div>
            {isCurrentSound && <WaveformBars isPlaying={isPlaying} />}
          </div>

          {sound.duration && (
            <span className="text-xs text-muted-foreground font-mono mb-3 block">
              {Math.floor(sound.duration / 60)}:{String(Math.floor(sound.duration % 60)).padStart(2, "0")}
            </span>
          )}

          <div className="flex items-center gap-2 mt-auto">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onPlay}
              className="cursor-target w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {isCurrentSound && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleFavorite}
              className="cursor-target w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center transition-colors hover:bg-destructive/20"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className="cursor-target w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-secondary hover:bg-secondary/20 transition-colors"
            >
              <Download className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </ElectricBorder>
    </motion.div>
  );
}
