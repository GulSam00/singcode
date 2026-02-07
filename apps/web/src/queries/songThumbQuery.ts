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
    staleTime: 0, // 데이터를 받자마자 "상한 것(Stale)"으로 취급 -> 다시 조회할 명분 생성
    gcTime: 0, // (구 cacheTime) 언마운트 되는 즉시 메모리에서 삭제 -> 캐시가 없으니 무조건 새로 요청  });
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
