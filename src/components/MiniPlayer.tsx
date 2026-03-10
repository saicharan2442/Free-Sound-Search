import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { WaveformBars } from "./WaveformBars";

interface Props {
  soundName: string;
  isPlaying: boolean;
  progress: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  visible: boolean;
}

export function MiniPlayer({ soundName, isPlaying, progress, onPause, onResume, onStop, visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="glass-strong border-t border-border/50 px-4 md:px-8 py-3">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <Volume2 className="w-4 h-4 text-primary shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">{soundName}</p>
              </div>

              <WaveformBars isPlaying={isPlaying} barCount={7} className="hidden sm:flex" />

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={isPlaying ? onPause : onResume}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onStop}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Square className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
