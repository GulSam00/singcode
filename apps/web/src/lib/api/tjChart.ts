import { ApiResponse } from '@/types/apiRoute';
import { StrType, TjChartResponse } from '@/types/tjChart';

import { instance } from './client';

export async function getTjChart(month?: string, genre?: StrType) {
  const response = await instance.get<ApiResponse<TjChartResponse>>('/tj-chart', {
    params: { month, genre },
  });

  return response.data;
}
