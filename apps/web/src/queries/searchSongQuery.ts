import { useQuery } from '@tanstack/react-query';

import { getSearchSong } from '@/lib/api/searchSong';

export const useSearchSongQuery = (search: string, searchType: string) => {
  return useQuery({
    queryKey: ['search', search, searchType],
    queryFn: () => getSearchSong(search, searchType),
    enabled: !!search,
  });
};
