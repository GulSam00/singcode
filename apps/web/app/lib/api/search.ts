export async function getSearch(search: string, searchType: string) {
  const response = await fetch(`/api/search?q=${search}&type=${searchType}`);
  if (!response.ok) {
    throw new Error('Failed to search songs');
  }
  return response.json();
}
