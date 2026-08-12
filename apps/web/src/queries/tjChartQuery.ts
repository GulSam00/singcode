import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getTjChart } from '@/lib/api/tjChart';
import { StrType } from '@/types/tjChart';

export const useTjChartQuery = (month?: string, genre?: StrType) => {
  return useQuery({
    queryKey: ['tjChart', month, genre],
    queryFn: async () => {
      const response = await getTjChart(month, genre);

      if (!response.success) {
        return null;
      }
      return response.data;
    },
    // 월/장르를 바꿀 때 목록이 사라지지 않도록 이전 데이터를 유지한다.
    placeholderData: keepPreviousData,
  });
};
