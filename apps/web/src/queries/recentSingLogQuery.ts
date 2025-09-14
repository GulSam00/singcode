import { useQuery } from '@tanstack/react-query';

import { getRecentSingLog } from '@/lib/api/recentSingLog';

export const useRecentSingLogQuery = (year: number, month: number) => {
  return useQuery({
    queryKey: ['recentSingLog', year, month],
    queryFn: async () => {
      const response = await getRecentSingLog(year, month);
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};
