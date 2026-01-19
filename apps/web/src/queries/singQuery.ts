import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postSingLog } from '@/lib/api/singLog';

let invalidateTimeout: NodeJS.Timeout | null = null;

export const usePostSingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => {
      return postSingLog(songId);
    },
    onSuccess: () => {
      if (invalidateTimeout) {
        clearTimeout(invalidateTimeout);
      }
      invalidateTimeout = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['totalStat'] });
        queryClient.invalidateQueries({ queryKey: ['searchSong'] });
        // queryClient.invalidateQueries({ queryKey: ['searchSong', title] });
        // queryClient.invalidateQueries({ queryKey: ['searchSong', artist] });
      }, 1000);
    },
  });
};
