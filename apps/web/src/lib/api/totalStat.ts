import { ApiResponse } from '@/types/apiRoute';
import { SongStats } from '@/types/totalStat';

import { instance } from './client';

export async function getTotalStats(countType: string, periodType: string) {
  const response = await instance.get<ApiResponse<SongStats[]>>(
    `/total_stats?countType=${countType}&periodType=${periodType}`,
  );
  return response.data;
}

export async function postTotalStat(body: { songId: string; countType: string; isMinus: boolean }) {
  const response = await instance.post<ApiResponse<void>>('/total_stats', body);
  return response.data;
}
