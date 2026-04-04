import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getSearchLog, postSearchLog } from '@/lib/api/searchLog';

export function useSearchLogQuery() {
  return useQuery({
    queryKey: ['searchLog'],
    queryFn: async () => {
      const response = await getSearchLog();
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
  });
}

export function usePostSearchLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => postSearchLog({ text }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['searchLog'] });
    },
  });
}
