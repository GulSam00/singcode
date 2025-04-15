export async function getUserStats() {
  const response = await fetch(`/api/user_stats`);
  if (!response.ok) {
    throw new Error('Failed to get user stats');
  }
  return response.json();
}

export async function postUserStats(songId: string) {
  const response = await fetch(`/api/user_stats`, {
    method: 'POST',
    body: JSON.stringify({ songId }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to post user stats');
  }
  return response.json();
}
