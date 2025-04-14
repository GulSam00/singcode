export async function postTotalStats(body: {
  songId: string;
  countType: string;
  isMinus: boolean;
}) {
  const response = await fetch(`/api/total_stats`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to post total stats');
  }
  return response.json();
}
