export async function getLikedSongs() {
  const response = await fetch('/api/songs/like');
  if (!response.ok) {
    throw new Error('Failed to fetch liked songs');
  }
  return response.json();
}
export async function postLikedSongs(body: { songId: string }) {
  const response = await fetch('/api/songs/like', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to post liked songs');
  }
  return response.json();
}

export async function deleteLikedSongs(body: { songId: string }) {
  const response = await fetch('/api/songs/like', {
    method: 'DELETE',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to delete liked songs');
  }
  return response.json();
}

export async function deleteLikedSongsArray(body: { songIds: string[] }) {
  const response = await fetch('/api/songs/like/array', {
    method: 'DELETE',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to delete liked songs array');
  }
  return response.json();
}
