import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getSongThumbList, patchSongThumb } from '@/lib/api/thumbSong';

export const useSongThumbQuery = () => {
  return useQuery({
    queryKey: ['songThumb'],
    queryFn: async () => {
      const response = await getSongThumbList();

      if (!response.success) {
        return [];
      }
      return response.data;
    },
  });
};

export const useSongThumbMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { songId: string; point: number }) => patchSongThumb(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songThumb'] });
    },
    onError: error => {
      console.error('error', error);
      alert(error.message ?? 'PATCH 실패');
    },
  });
};
