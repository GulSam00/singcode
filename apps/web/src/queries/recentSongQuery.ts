import { useQuery } from '@tanstack/react-query';

import { getRecentSong } from '@/lib/api/recentSong';

export const useRecentSongsQuery = () => {
  return useQuery({
    queryKey: ['recentSongs'],
    queryFn: getRecentSong,
  });
};
