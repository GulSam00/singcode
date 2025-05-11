import { useQuery } from '@tanstack/react-query';

import { getTotalStats } from '@/lib/api/totalStat';

export const useTotalStatQuery = (countType: string, periodType: string) => {
  return useQuery({
    queryKey: ['TotalStat', countType, periodType],
    queryFn: async () => {
      const response = await getTotalStats(countType, periodType);
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60,
  });
};
