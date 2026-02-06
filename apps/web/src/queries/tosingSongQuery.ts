import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteToSingSong,
  getToSingSong,
  getToSingSongGuest,
  patchToSingSong,
  postToSingSongArray,
} from '@/lib/api/tosing';
import { ToSingSong } from '@/types/song';

let invalidateTimeout: NodeJS.Timeout | null = null;

// 🎵 부를 노래 목록 가져오기
export function useToSingSongQuery(isAuthenticated: boolean, localToSingSongIds: string[]) {
  return useQuery({
    queryKey: ['toSingSong', localToSingSongIds],
    queryFn: async () => {
      let response;
      if (isAuthenticated) {
        response = await getToSingSong();
      } else {
        response = await getToSingSongGuest(localToSingSongIds);
      }
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
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
      queryClient.invalidateQueries({ queryKey: ['searchSong'] });
    },
    onError: error => {
      console.error('error', error);
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
      queryClient.invalidateQueries({ queryKey: ['searchSong'] });
    },
    onError: error => {
      console.error('error', error);
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
      console.error('error', error);
      alert(error.message ?? 'DELETE 실패');
      queryClient.setQueryData(['toSingSong'], context?.prev);
    },
    onSettled: () => {
      // 1초 이내에 함수가 여러 번 호출되면, 1초 뒤 트리거를 계속해서 갱신
      if (invalidateTimeout) {
        clearTimeout(invalidateTimeout);
      }
      invalidateTimeout = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['toSingSong'] });
        queryClient.invalidateQueries({ queryKey: ['likeSong'] });
        queryClient.invalidateQueries({ queryKey: ['saveSongFolder'] });
        queryClient.invalidateQueries({ queryKey: ['searchSong'] });
      }, 1000);
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
      console.error('error', error);
      alert(error.message ?? 'PATCH 실패');
      queryClient.setQueryData(['toSingSong'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['toSingSong'] });
    },
  });
}
