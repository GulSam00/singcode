import { ApiResponse } from '@/types/apiRoute';
import { SongStat } from '@/types/totalStat';

import { instance } from './client';

export async function getTotalStat(countType: string, periodType: string) {
  const response = await instance.get<ApiResponse<SongStat[]>>(
    `/total_stats?countType=${countType}&periodType=${periodType}`,
  );
  return response.data;
}

export async function postTotalStat(body: { songId: string; countType: string; isMinus: boolean }) {
  const response = await instance.post<ApiResponse<void>>('/total_stats', body);
  return response.data;
}

export async function postTotalStatArray(body: {
  songIds: string[];
  countType: string;
  isMinus: boolean;
}) {
  const response = await instance.post<ApiResponse<void>>('/total_stats/array', body);
  return response.data;
}
