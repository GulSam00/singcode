import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteToSingSong,
  deleteToSingSongArray,
  getToSingSong,
  patchToSingSong,
  postToSingSong,
  postToSingSongArray,
} from '@/lib/api/tosing';
import { ToSingSong } from '@/types/song';

// 🎵 부를 노래 목록 가져오기
export function useToSingSongQuery() {
  return useQuery({
    queryKey: ['toSingSongs'],
    queryFn: getToSingSong,
  });
}

// 🎵 부를 노래 추가
export function usePostToSingSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => postToSingSong({ songId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toSingSongs'] });
    },
  });
}

// 🎵 여러 곡 부를 노래 추가
export function usePostToSingSongArrayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songIds: string[]) => postToSingSongArray({ songIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toSingSongs'] });
    },
  });
}

// 🎵 부를 노래 삭제
export function useDeleteToSingSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => deleteToSingSong({ songId }),
    onMutate: async (songId: string) => {
      queryClient.cancelQueries({ queryKey: ['toSingSongs'] });
      const prev = queryClient.getQueryData(['toSingSongs']);
      queryClient.setQueryData(['toSingSongs'], (old: ToSingSong[]) =>
        old.filter(song => song.songs.id !== songId),
      );
      return { prev };
    },
    onError: (error, songId, context) => {
      queryClient.setQueryData(['toSingSongs'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['toSingSongs'] });
    },
  });
}

// 🎵 여러 곡 부를 노래 삭제
export function useDeleteToSingSongArrayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songIds: string[]) => deleteToSingSongArray({ songIds }),
    onMutate: async (songIds: string[]) => {
      queryClient.cancelQueries({ queryKey: ['toSingSongs'] });
      const prev = queryClient.getQueryData(['toSingSongs']);
      queryClient.setQueryData(['toSingSongs'], (old: ToSingSong[]) =>
        old.filter(song => !songIds.includes(song.songs.id)),
      );
      return { prev };
    },
    onError: (error, songIds, context) => {
      queryClient.setQueryData(['toSingSongs'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['toSingSongs'] });
    },
  });
}

// 🎵 부를 노래 순서 변경
export function usePatchToSingSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, newWeight }: { songId: string; newWeight: number }) =>
      patchToSingSong({ songId, newWeight }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toSingSongs'] });
    },
  });
}
