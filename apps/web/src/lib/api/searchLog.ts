import { ApiResponse } from '@/types/apiRoute';

import { instance } from './client';

interface SearchLogCount {
  text: string;
  count: number;
}

export async function getSearchLog() {
  const response = await instance.get<ApiResponse<SearchLogCount[]>>('/search/log');
  return response.data;
}

export async function postSearchLog(body: { text: string }) {
  const response = await instance.post<ApiResponse<void>>('/search/log', body);
  return response.data;
}
