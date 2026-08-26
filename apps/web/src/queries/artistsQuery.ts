import { useQuery } from '@tanstack/react-query';

import { getArtistSearch } from '@/lib/api/artists';

export const useArtistSearchQuery = (query: string) => {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['artistSearch', trimmed],
    queryFn: async () => {
      const response = await getArtistSearch(trimmed);
      if (!response.success) return [];
      return response.data ?? [];
    },
    enabled: trimmed.length > 0,
    staleTime: 1000 * 60,
  });
};
