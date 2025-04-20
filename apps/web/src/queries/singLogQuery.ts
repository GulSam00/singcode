import { useMutation } from '@tanstack/react-query';

import { postSingLog } from '@/lib/api/singLog';

export const usePostSingLogMutation = () => {
  return useMutation({
    mutationFn: (songId: string) => postSingLog(songId),
  });
};
