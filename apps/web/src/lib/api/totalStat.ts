import { ApiResponse } from '@/types/apiRoute';
import { SongStat } from '@/types/totalStat';
import { CountType, PeriodType } from '@/types/totalStat';

import { instance } from './client';

export async function getTotalStat(countType: CountType, periodType: PeriodType) {
  const response = await instance.get<ApiResponse<SongStat[]>>(
    `/total-stats?countType=${countType}&periodType=${periodType}`,
  );
  return response.data;
}
