import { useQuery } from '@tanstack/react-query';

import { getRecentSingLog } from '@/lib/api/recentSingLog';

export const useRecentSingLogQuery = () => {
  return useQuery({
    queryKey: ['recentSingLog'],
    queryFn: async () => {
      const response = await getRecentSingLog();
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};
