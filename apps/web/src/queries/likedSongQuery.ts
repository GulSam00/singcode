import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteLikedSongs,
  deleteLikedSongsArray,
  getLikedSongs,
  postLikedSongs,
} from '@/lib/api/likeActivites';
import { PersonalSong } from '@/types/song';

// 🎵 좋아요 한 곡 리스트 가져오기
export function useLikedSongsQuery() {
  return useQuery({
    queryKey: ['likedSongs'],
    queryFn: getLikedSongs,
  });
}

// 🎵 곡 좋아요 추가
export function usePostLikedSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => postLikedSongs({ songId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likedSongs'] });
    },
  });
}

// 🎵 곡 좋아요 취소
export function useDeleteLikedSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => deleteLikedSongs({ songId }),
    onMutate: async (songId: string) => {
      queryClient.cancelQueries({ queryKey: ['likedSongs'] });
      const prev = queryClient.getQueryData(['likedSongs']);
      queryClient.setQueryData(['likedSongs'], (old: PersonalSong[]) =>
        old.filter(song => song.song_id !== songId),
      );
      return { prev };
    },
    onError: (error, songId, context) => {
      queryClient.setQueryData(['likedSongs'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['likedSongs'] });
    },
  });
}

// 🎵 여러 곡 좋아요 취소
export function useDeleteLikedSongsArrayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songIds: string[]) => deleteLikedSongsArray({ songIds }),
    onMutate: async (songIds: string[]) => {
      queryClient.cancelQueries({ queryKey: ['likedSongs'] });
      const prev = queryClient.getQueryData(['likedSongs']);
      queryClient.setQueryData(['likedSongs'], (old: PersonalSong[]) =>
        old.filter(song => !songIds.includes(song.song_id)),
      );
      return { prev };
    },
    onError: (error, songIds, context) => {
      queryClient.setQueryData(['likedSongs'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['likedSongs'] });
    },
  });
}
