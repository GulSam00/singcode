import { useMutation } from '@tanstack/react-query';

import { postSingLog } from '@/lib/api/singLog';

export const useSingLogMutation = () => {
  return useMutation({
    mutationFn: (songId: string) => postSingLog(songId),
  });
};
