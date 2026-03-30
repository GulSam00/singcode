import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteLikeSongArray, getLikeSong } from '@/lib/api/likeSong';
import { PersonalSong } from '@/types/song';

// 🎵 즐겨찾기 한 곡 리스트 가져오기
export function useLikeSongQuery(isAuthenticated: boolean) {
  return useQuery({
    queryKey: ['likeSong'],
    queryFn: async () => {
      const response = await getLikeSong();
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
    enabled: isAuthenticated,
  });
}

// 🎵 여러 곡 즐겨찾기 취소
export function useDeleteLikeSongArrayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songIds: string[]) => deleteLikeSongArray({ songIds }),

    onMutate: async (songIds: string[]) => {
      queryClient.cancelQueries({ queryKey: ['likeSong'] });
      const prev = queryClient.getQueryData(['likeSong']);
      queryClient.setQueryData(['likeSong'], (old: PersonalSong[]) =>
        old.filter(song => !songIds.includes(song.song_id)),
      );
      return { prev };
    },
    onError: (error, songIds, context) => {
      console.error('error', error);
      alert(error.message ?? 'POST 실패');
      queryClient.setQueryData(['likeSong'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['likeSong'] });
      queryClient.invalidateQueries({ queryKey: ['searchSong'] });
    },
  });
}
