export async function getRecentSongs() {
  const response = await fetch('/api/songs/recent');
  if (!response.ok) {
    throw new Error('Failed to fetch recent songs');
  }
  return response.json();
}
