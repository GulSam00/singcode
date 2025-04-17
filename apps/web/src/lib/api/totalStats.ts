import { ApiResponse } from '@/types/apiRoute';

import { instance } from './client';

export async function postTotalStats(body: {
  songId: string;
  countType: string;
  isMinus: boolean;
}) {
  const response = await instance.post<ApiResponse<void>>('/total_stats', body);
  return response.data;
}
