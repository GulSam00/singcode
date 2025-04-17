import { useQuery } from '@tanstack/react-query';

import { getSearch } from '@/lib/api/search';

export const useSearchQuery = (search: string, searchType: string) => {
  return useQuery({
    queryKey: ['search', search, searchType],
    queryFn: () => getSearch(search, searchType),
  });
};
