import { useQuery } from '@tanstack/react-query';

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
  });
};
