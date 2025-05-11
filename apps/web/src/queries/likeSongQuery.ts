import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteLikeSong, deleteLikeSongArray, getLikeSong, postLikeSong } from '@/lib/api/likeSong';
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

// 🎵 곡 좋아요 추가
export function usePostLikedSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => postLikeSong({ songId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likeSong'] });
    },
  });
}

// 🎵 곡 좋아요 취소
export function useDeleteLikedSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => deleteLikeSong({ songId }),
    onMutate: async (songId: string) => {
      queryClient.cancelQueries({ queryKey: ['likeSong'] });
      const prev = queryClient.getQueryData(['likeSong']);
      queryClient.setQueryData(['likeSong'], (old: PersonalSong[]) =>
        old.filter(song => song.song_id !== songId),
      );
      return { prev };
    },
    onError: (error, songId, context) => {
      queryClient.setQueryData(['likeSong'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['likeSong'] });
    },
  });
}

// 🎵 여러 곡 좋아요 취소
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
      queryClient.setQueryData(['likeSong'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['likeSong'] });
    },
  });
}
