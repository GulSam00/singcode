import { useQuery } from '@tanstack/react-query';

import { getUserStat } from '@/lib/api/userStat';

export const useUserStatQuery = () => {
  return useQuery({
    queryKey: ['userStat'],
    queryFn: async () => {
      const response = await getUserStat();
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
  });
};
