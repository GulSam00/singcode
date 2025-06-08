import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteLikeSongArray, getLikeSong } from '@/lib/api/likeSong';
import { postTotalStatArray } from '@/lib/api/totalStat';
import { PersonalSong } from '@/types/song';

// 🎵 좋아요 한 곡 리스트 가져오기
export function useLikeSongQuery() {
  return useQuery({
    queryKey: ['likeSong'],
    queryFn: async () => {
      const response = await getLikeSong();
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
}

// 🎵 곡 좋아요 추가 - useToggleLikeMutation만 사용
// export function usePostLikeSongMutation() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (songId: string) =>
//       Promise.all([
//         postLikeSong({ songId }),
//         postTotalStat({ songId, countType: 'like_count', isMinus: false }),
//       ]),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['likeSong'] });
//     },
//   });
// }

// 🎵 곡 좋아요 취소 - useDeleteLikeSongArrayMutation만 사용
// export function useDeleteLikeSongMutation() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (songId: string) =>
//       Promise.all([
//         deleteLikeSong({ songId }),
//         postTotalStat({ songId, countType: 'like_count', isMinus: true }),
//       ]),
//     onMutate: async (songId: string) => {
//       queryClient.cancelQueries({ queryKey: ['likeSong'] });
//       const prev = queryClient.getQueryData(['likeSong']);
//       queryClient.setQueryData(['likeSong'], (old: PersonalSong[]) =>
//         old.filter(song => song.song_id !== songId),
//       );
//       return { prev };
//     },
//     onError: (error, songId, context) => {
//       console.error('error', error);
//       alert(error.message ?? 'POST 실패');
//       queryClient.setQueryData(['likeSong'], context?.prev);
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ['likeSong'] });
//     },
//   });
// }

// 🎵 여러 곡 좋아요 취소
export function useDeleteLikeSongArrayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songIds: string[]) =>
      Promise.all([
        deleteLikeSongArray({ songIds }),
        postTotalStatArray({ songIds, countType: 'like_count', isMinus: true }),
      ]),

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
