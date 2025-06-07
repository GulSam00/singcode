import { ApiResponse } from '@/types/apiRoute';
import { SearchSong } from '@/types/song';

import { instance } from './client';

export async function getInfiniteSearchSong(
  search: string,
  searchType: string,
  isAuthenticated: boolean,
  page?: number,
) {
  const response = await instance.get<ApiResponse<SearchSong[]>>('/search', {
    params: { q: search, type: searchType, authenticated: isAuthenticated, page },
  });

  return response.data;
}

export async function getSearchSong(
  search: string,
  searchType: string,
  isAuthenticated: boolean,
  page?: number,
) {
  const response = await instance.get<ApiResponse<SearchSong[]>>('/search', {
    params: { q: search, type: searchType, authenticated: isAuthenticated, page },
  });

  return response.data;
}
