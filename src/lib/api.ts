export interface SoundResult {
  id: number;
  name: string;
  username: string;
  previews: {
    "preview-hq-mp3": string;
  };
  duration?: number;
}

export interface MusicResult {
  id: string;
  title: string;
  artist: string;
  duration: number;
  videoId: string;
}

// Configure your Flask backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function searchSounds(query: string): Promise<SoundResult[]> {
  const response = await fetch(`${API_BASE_URL}/?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : data.results || [];
}

export async function searchMusic(query: string): Promise<MusicResult[]> {
  const response = await fetch(`${API_BASE_URL}/listen-music/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`Music search failed: ${response.statusText}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getAudioUrl(videoId: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/listen-music/audio?videoId=${encodeURIComponent(videoId)}`);
  if (!response.ok) {
    throw new Error(`Failed to get audio URL: ${response.statusText}`);
  }
  const data = await response.json();
  return data.audioUrl;
}
