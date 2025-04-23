import { useQuery } from '@tanstack/react-query';

import { getUserStats } from '@/lib/api/userStat';

export const useUserStatQuery = () => {
  return useQuery({
    queryKey: ['userStat'],
    queryFn: async () => {
      const response = await getUserStats();
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
  });
};
