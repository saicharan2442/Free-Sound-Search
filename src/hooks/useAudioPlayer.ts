import { useState, useRef, useCallback, useEffect } from "react";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSoundId, setCurrentSoundId] = useState<number | null>(null);
  const [currentSoundName, setCurrentSoundName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const animFrameRef = useRef<number>(0);

  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      setProgress(duration ? (currentTime / duration) * 100 : 0);
      setDuration(duration || 0);
      if (!audioRef.current.paused) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    }
  }, []);

  const play = useCallback(
    (id: number, url: string, name: string) => {
      if (currentSoundId === id && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        cancelAnimationFrame(animFrameRef.current);
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      setCurrentSoundId(id);
      setCurrentSoundName(name);
      setIsPlaying(true);
      setProgress(0);

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentSoundId(null);
      });

      audio.play();
      animFrameRef.current = requestAnimationFrame(updateProgress);
    },
    [currentSoundId, updateProgress]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      animFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [updateProgress]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentSoundId(null);
    setCurrentSoundName("");
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return { currentSoundId, currentSoundName, isPlaying, progress, duration, play, pause, resume, stop };
}
