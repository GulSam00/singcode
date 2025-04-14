export async function postSingLog(songId: string) {
  const response = await fetch(`/api/songs/sing_logs`, {
    method: 'POST',
    body: JSON.stringify({ songId }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to post sing log');
  }
  return response.json();
}
