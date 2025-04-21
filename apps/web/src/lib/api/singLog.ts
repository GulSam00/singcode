import { ApiResponse } from '@/types/apiRoute';

import { instance } from './client';

export async function postSingLog(songId: string) {
  const response = await instance.post<ApiResponse<void>>('/sing_logs', { songId });
  return response.data;
}
