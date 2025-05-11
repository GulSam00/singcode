import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postSingLog } from '@/lib/api/singLog';
import { postTotalStat } from '@/lib/api/totalStat';
import { postUserStat } from '@/lib/api/userStat';

export const usePostSingLogMutation = () => {
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
      queryClient.invalidateQueries({ queryKey: ['recentSong'] });
      queryClient.invalidateQueries({ queryKey: ['userStat'] });
    },
  });
};
