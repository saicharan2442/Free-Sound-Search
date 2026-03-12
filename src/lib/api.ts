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

// Extract YouTube video ID from various URL formats
export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();

  // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
  let match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // YouTube short URL: https://youtu.be/VIDEO_ID
  match = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // YouTube music URL: https://music.youtube.com/watch?v=VIDEO_ID
  match = trimmed.match(/music\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Standalone video ID - must be EXACTLY 11 characters (YouTube standard)
  // This prevents search queries from being treated as video IDs
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

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

// Get music metadata from video ID
export async function getMusicInfo(videoId: string): Promise<Omit<MusicResult, "id">> {
  const response = await fetch(`${API_BASE_URL}/listen-music/music-info?videoId=${encodeURIComponent(videoId)}`);
  if (!response.ok) {
    throw new Error(`Failed to get music info: ${response.statusText}`);
  }
  return response.json();
}
