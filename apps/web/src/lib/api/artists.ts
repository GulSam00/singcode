import { ApiResponse } from '@/types/apiRoute';
import { ArtistSearchResult } from '@/types/artist';

import { instance } from './client';

export async function getArtistSearch(query: string) {
  const response = await instance.get<ApiResponse<ArtistSearchResult[]>>('/artists/search', {
    params: { q: query },
  });
  return response.data;
}
