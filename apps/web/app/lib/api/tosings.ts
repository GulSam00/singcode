export async function getToSingSongs() {
  const response = await fetch(`/api/songs/tosing`);
  if (!response.ok) {
    throw new Error('Failed to fetch tosing songs');
  }
  return response.json();
}

export async function patchToSingSongs(body: { songId: string; newWeight: number }) {
  const response = await fetch(`/api/songs/tosing`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to patch tosing songs');
  }
  return response.json();
}

export async function postToSingSongs(body: { songId: string }) {
  const response = await fetch(`/api/songs/tosing`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to post tosing songs');
  }
  return response.json();
}

export async function postToSingSongsArray(body: { songIds: string[] }) {
  const response = await fetch(`/api/songs/tosing/array`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to post tosing songs array');
  }
  return response.json();
}

export async function deleteToSingSongs(body: { songId: string }) {
  const response = await fetch(`/api/songs/tosing`, {
    method: 'DELETE',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to delete tosing songs');
  }
  return response.json();
}

export async function deleteToSingSongsArray(body: { songIds: string[] }) {
  const response = await fetch(`/api/songs/tosing/arr`, {
    method: 'DELETE',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to delete tosing songs array');
  }
  return response.json();
}
