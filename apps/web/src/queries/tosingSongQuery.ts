import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteToSingSong,
  getToSingSong,
  patchToSingSong,
  postToSingSongArray,
} from '@/lib/api/tosing';
import { ToSingSong } from '@/types/song';

// let invalidateTimeout: NodeJS.Timeout | null = null;

// 부를 노래 목록 가져오기
export function useToSingSongQuery(isAuthenticated: boolean, guestToSingSongs: ToSingSong[]) {
  return useQuery({
    queryKey: isAuthenticated
      ? ['toSingSong']
      : ['toSingSong', 'guest', guestToSingSongs.map(song => song.songs.id)],
    queryFn: async () => {
      if (isAuthenticated) {
        const response = await getToSingSong();
        if (!response.success) {
          return [];
        }
        return response.data || [];
      } else {
        // 게스트의 경우 로컬 스토리지 데이터 반환 (서버 요청 X)
        return guestToSingSongs;
      }
    },
  });
}

// 부를 노래 추가
export function usePostToSingSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songIds: string[]) => postToSingSongArray({ songIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toSingSong'] });
      queryClient.invalidateQueries({ queryKey: ['searchSong'] });
    },
    onError: error => {
      console.error('error', error);
      alert(error.message ?? 'POST 실패');
    },
  });
}

// 부를 노래 삭제
export function useDeleteToSingSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => deleteToSingSong({ songId }),
    onMutate: async (songId: string) => {
      queryClient.cancelQueries({ queryKey: ['toSingSong'] });
      const prev = queryClient.getQueryData(['toSingSong']);
      queryClient.setQueryData(['toSingSong'], (old: ToSingSong[]) => {
        old.filter(song => song.songs.id !== songId);
      });
      return { prev };
    },
    onError: (error, variables, context) => {
      console.error('error', error);
      alert(error.message ?? 'DELETE 실패');
      queryClient.setQueryData(['toSingSong'], context?.prev);
    },
    onSettled: () => {
      // 1초 이내에 함수가 여러 번 호출되면, 1초 뒤 트리거를 계속해서 갱신
      // if (invalidateTimeout) {
      //   clearTimeout(invalidateTimeout);
      // }
      // invalidateTimeout = setTimeout(() => {
      //   queryClient.invalidateQueries({ queryKey: ['toSingSong'] });
      // }, 1000);
      queryClient.invalidateQueries({ queryKey: ['searchSong'] });
      queryClient.invalidateQueries({ queryKey: ['toSingSong'] });
    },
  });
}

// 부를 노래 순서 변경
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
