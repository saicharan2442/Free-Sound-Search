import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Volume2 } from "lucide-react";
import { WaveformBars } from "./WaveformBars";

interface AudioPlayerProps {
  audioUrl: string | null;
  title: string | null;
  artist: string | null;
  onClose: () => void;
}

export function AudioPlayer({ audioUrl, title, artist, onClose }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    setError(null);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    audio.src = audioUrl;
    audio.load();

    const playAudio = async () => {
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      } catch (err: any) {
        console.error("Playback error:", err);
        setError(err.message || "Failed to play audio");
        setIsPlaying(false);
      }
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      playAudio();
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleError = (e: Event) => {
      const errorCode = (audio as any).error?.code;
      let errorMsg = "Failed to load audio";

      if (errorCode === 1) errorMsg = "Audio loading aborted";
      else if (errorCode === 2) errorMsg = "Network error";
      else if (errorCode === 3) errorMsg = "Audio format is not supported";
      else if (errorCode === 4) errorMsg = "Audio format not supported";

      console.error("Audio error:", errorCode);
      setError(errorMsg);
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    setError(null);
    onClose();
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (audioRef.current && duration) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (duration) {
      const rect = event.currentTarget.getBoundingClientRect();
      const hoverX = event.clientX - rect.left;
      const hoverTime = (hoverX / rect.width) * duration;
      setHoverTime(hoverTime);
    }
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  return (
    <AnimatePresence>
      {audioUrl && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-md border-t border-gray-700"
          style={{ height: "60px" }}
        >
          <audio
            ref={audioRef}
            crossOrigin="anonymous"
            preload="auto"
            controlsList="nodownload"
          />

          <div className="px-3 py-2 flex items-center justify-between gap-3 max-w-full">
            {/* Left: Title, Artist, Waveform */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="shrink-0 w-10 h-10 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 border border-purple-400 flex items-center justify-center">
                {isPlaying ? (
                  <WaveformBars isPlaying={isPlaying} />
                ) : (
                  <Volume2 className="w-4 h-4 text-purple-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {title}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {artist}
                </p>
              </div>
            </div>

            {/* Middle: Progress with time */}
            <div className="flex-1 flex items-center gap-2 mx-2">
              <span className="text-xs font-mono text-gray-400 shrink-0">
                {formatTime(currentTime)}
              </span>
              <div
                className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer group relative"
                onClick={handleSeek}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {hoverTime !== null && (
                  <div
                    className="absolute -top-6 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-md whitespace-nowrap"
                    style={{ left: `${Math.min(Math.max((hoverTime / duration) * 100, 0), 100)}%` }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all group-hover:h-1.5"
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
                />
              </div>
              <span className="text-xs font-mono text-gray-400 shrink-0">
                {formatTime(duration)}
              </span>
            </div>

            {/* Right: Play, Favorite, Download, Close */}
            <div className="flex items-center gap-3 shrink-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayPause}
                disabled={isLoading}
                className="cursor-target w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white hover:shadow-md hover:shadow-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="cursor-target w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div
              className="relative w-full h-full flex items-center justify-center"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs font-mono text-gray-400">
                  {hoverTime ? formatTime(hoverTime) : ""}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

