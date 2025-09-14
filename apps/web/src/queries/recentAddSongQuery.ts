import { useQuery } from '@tanstack/react-query';

import { getRecentAddSong } from '@/lib/api/recentAddSong';

export const useRecentAddSongQuery = (year: number, month: number) => {
  return useQuery({
    queryKey: ['recentAddSong', year, month],
    queryFn: async () => {
      const response = await getRecentAddSong(year, month);
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};
