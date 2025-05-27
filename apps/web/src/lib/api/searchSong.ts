import { ApiResponse } from '@/types/apiRoute';
import { SearchSong } from '@/types/song';

import { instance } from './client';

export async function getSearchSong(search: string, searchType: string, isAuthenticated: boolean) {
  const response = await instance.get<ApiResponse<SearchSong[]>>('/search', {
    params: { q: search, type: searchType, authenticated: isAuthenticated },
  });

  console.log('response : ', response.data);

  return response.data;
}
