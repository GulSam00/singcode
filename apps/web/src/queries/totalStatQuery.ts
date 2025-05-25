import { useQuery } from '@tanstack/react-query';

import { getTotalStat } from '@/lib/api/totalStat';

export const useTotalStatQuery = (countType: string, periodType: string) => {
  return useQuery({
    queryKey: ['totalStat', countType, periodType],
    queryFn: async () => {
      const response = await getTotalStat(countType, periodType);

      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60,
  });
};
