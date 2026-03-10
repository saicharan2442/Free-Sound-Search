export interface SoundResult {
  id: number;
  name: string;
  username: string;
  previews: {
    "preview-hq-mp3": string;
  };
  duration?: number;
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
