import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteToSingSong,
  deleteToSingSongArray,
  getToSingSong,
  patchToSingSong,
  postToSingSongArray,
} from '@/lib/api/tosing';
import { ToSingSong } from '@/types/song';

// 🎵 부를 노래 목록 가져오기
export function useToSingSongQuery() {
  return useQuery({
    queryKey: ['toSingSong'],
    queryFn: async () => {
      const response = await getToSingSong();
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
    // DB의 값은 고정된 값이므로 캐시를 유지한다
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
}

// 🎵 부를 노래 추가
export function usePostToSingSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songIds: string[]) => postToSingSongArray({ songIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toSingSong'] });
      queryClient.invalidateQueries({ queryKey: ['likeSong'] });
      queryClient.invalidateQueries({ queryKey: ['saveSongFolder'] });
      queryClient.invalidateQueries({ queryKey: ['recentSong'] });
    },
    onError: error => {
      console.log('error', error);
      alert(error.message ?? 'POST 실패');
    },
  });
}

// 🎵 여러 곡 부를 노래 추가
export function usePostToSingSongArrayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songIds: string[]) => postToSingSongArray({ songIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toSingSong'] });
      queryClient.invalidateQueries({ queryKey: ['likeSong'] });
      queryClient.invalidateQueries({ queryKey: ['saveSongFolder'] });
      queryClient.invalidateQueries({ queryKey: ['recentSong'] });
    },
    onError: error => {
      console.log('error', error);
      alert(error.message ?? 'POST 실패');
    },
  });
}

// 🎵 부를 노래 삭제
export function useDeleteToSingSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => deleteToSingSong({ songId }),
    onMutate: async (songId: string) => {
      queryClient.cancelQueries({ queryKey: ['toSingSong'] });
      const prev = queryClient.getQueryData(['toSingSong']);
      queryClient.setQueryData(['toSingSong'], (old: ToSingSong[]) =>
        old.filter(song => song.songs.id !== songId),
      );
      return { prev };
    },
    onError: (error, variables, context) => {
      console.log('error', error);
      alert(error.message ?? 'DELETE 실패');
      queryClient.setQueryData(['toSingSong'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['toSingSong'] });
      queryClient.invalidateQueries({ queryKey: ['likeSong'] });
      queryClient.invalidateQueries({ queryKey: ['saveSongFolder'] });
      queryClient.invalidateQueries({ queryKey: ['recentSong'] });
    },
  });
}

// 🎵 여러 곡 부를 노래 삭제
export function useDeleteToSingSongArrayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songIds: string[]) => deleteToSingSongArray({ songIds }),
    onMutate: async (songIds: string[]) => {
      queryClient.cancelQueries({ queryKey: ['toSingSong'] });
      const prev = queryClient.getQueryData(['toSingSong']);
      queryClient.setQueryData(['toSingSong'], (old: ToSingSong[]) =>
        old.filter(song => !songIds.includes(song.songs.id)),
      );
      return { prev };
    },
    onError: (error, variables, context) => {
      console.log('error', error);
      alert(error.message ?? 'DELETE 실패');
      queryClient.setQueryData(['toSingSong'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['toSingSong'] });
      queryClient.invalidateQueries({ queryKey: ['likeSong'] });
      queryClient.invalidateQueries({ queryKey: ['saveSongFolder'] });
      queryClient.invalidateQueries({ queryKey: ['recentSong'] });
    },
  });
}

// 🎵 부를 노래 순서 변경
export function usePatchToSingSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      songId,
      newWeight,
    }: {
      songId: string;
      newWeight: number;
      newItems: ToSingSong[];
    }) => patchToSingSong({ songId, newWeight }),
    onMutate: async ({ newItems }) => {
      queryClient.cancelQueries({ queryKey: ['toSingSong'] });
      const prev = queryClient.getQueryData(['toSingSong']);
      // newItems으로 전체 쿼리 교체
      queryClient.setQueryData(['toSingSong'], newItems);
      return { prev };
    },
    onError: (error, variables, context) => {
      console.log('error', error);
      alert(error.message ?? 'PATCH 실패');
      queryClient.setQueryData(['toSingSong'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['toSingSong'] });
    },
  });
}
