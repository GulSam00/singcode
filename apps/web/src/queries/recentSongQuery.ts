import { useQuery } from '@tanstack/react-query';

import { getRecentSong } from '@/lib/api/recentSong';

export const useRecentSongQuery = () => {
  return useQuery({
    queryKey: ['recentSong'],
    queryFn: async () => {
      const response = await getRecentSong();
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};
