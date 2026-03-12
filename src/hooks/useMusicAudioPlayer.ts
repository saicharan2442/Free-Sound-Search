import { useState, useCallback } from "react";

export function useMusicAudioPlayer() {
  const [currentMusicId, setCurrentMusicId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentArtist, setCurrentArtist] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback((videoId: string, title: string, artist: string, audioUrl: string) => {
    // If it's the same song, toggle play/pause
    if (currentMusicId === videoId) {
      setIsPlaying(!isPlaying);
      return;
    }

    // Otherwise, play the new song
    setCurrentMusicId(videoId);
    setCurrentTitle(title);
    setCurrentArtist(artist);
    setAudioUrl(audioUrl);
    setIsPlaying(true);
  }, [currentMusicId, isPlaying]);

  const stop = useCallback(() => {
    setCurrentMusicId(null);
    setCurrentTitle("");
    setCurrentArtist("");
    setAudioUrl(null);
    setIsPlaying(false);
  }, []);

  return {
    currentMusicId,
    currentTitle,
    currentArtist,
    audioUrl,
    isPlaying,
    setIsPlaying,
    play,
    stop,
  };
}
