import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postSingLog } from '@/lib/api/singLog';
import { postTotalStat } from '@/lib/api/totalStat';
import { postUserStat } from '@/lib/api/userStat';

let invalidateTimeout: NodeJS.Timeout | null = null;

export const usePostSingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => {
      return Promise.all([
        postSingLog(songId),
        postTotalStat({ songId, countType: 'sing_count', isMinus: false }),
        postUserStat(songId),
      ]);
    },
    onSuccess: () => {
      if (invalidateTimeout) {
        clearTimeout(invalidateTimeout);
      }
      invalidateTimeout = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['userStat'] });
        queryClient.invalidateQueries({ queryKey: ['totalStat'] });
        queryClient.invalidateQueries({ queryKey: ['searchSong'] });
        // queryClient.invalidateQueries({ queryKey: ['searchSong', title] });
        // queryClient.invalidateQueries({ queryKey: ['searchSong', artist] });
      }, 1000);
    },
  });
};
