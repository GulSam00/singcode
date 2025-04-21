import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteLikeSong, postLikeSong } from '@/lib/api/likeSong';
import { getSearchSong } from '@/lib/api/searchSong';
import { deleteToSingSong, postToSingSong } from '@/lib/api/tosing';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';

export const useSearchSongSongQuery = (search: string, searchType: string) => {
  return useQuery<SearchSong[]>({
    queryKey: ['searchSong', search, searchType],
    queryFn: async () => {
      const response = await getSearchSong(search, searchType);
      if (!response.success) {
        return [];
      }
      return response.data || [];
    },
    enabled: !!search,
    // DB의 값은 고정된 값이므로 캐시를 유지한다
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};

export const useToggleLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 낙관적 업데이트 검증 코드
    // mutationFn: async ({ songId, method }: { songId: string; method: Method }) => {
    //   await new Promise(resolve => setTimeout(resolve, 2000));
    mutationFn: ({ songId, method }: { songId: string; method: Method }) => {
      if (method === 'POST') {
        return postLikeSong({ songId });
      } else {
        return deleteLikeSong({ songId });
      }
    },
    onMutate: async ({
      songId,
      method,
      query,
      searchType,
    }: {
      songId: string;
      method: Method;
      query: string;
      searchType: string;
    }) => {
      queryClient.cancelQueries({ queryKey: ['searchSong', query, searchType] });
      const prev = queryClient.getQueryData(['searchSong', query, searchType]);
      const isLiked = method === 'POST';
      queryClient.setQueryData(['searchSong', query, searchType], (old: SearchSong[] = []) =>
        old.map(song => (song.id === songId ? { ...song, isLiked } : song)),
      );

      return { prev, query, searchType };
    },
    onError: (error, songId, context) => {
      queryClient.setQueryData(['searchSong', context?.query, context?.searchType], context?.prev);
    },
    onSettled: (data, error, context) => {
      queryClient.invalidateQueries({
        queryKey: ['searchSong', context?.query, context?.searchType],
      });
    },
  });
};

export const useToggleToSingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ songId, method }: { songId: string; method: Method }) => {
      if (method === 'POST') {
        return postToSingSong({ songId });
      } else {
        return deleteToSingSong({ songId });
      }
    },
    onMutate: async ({
      songId,
      method,
      query,
      searchType,
    }: {
      songId: string;
      method: Method;
      query: string;
      searchType: string;
    }) => {
      queryClient.cancelQueries({ queryKey: ['searchSong', query, searchType] });
      const prev = queryClient.getQueryData(['searchSong', query, searchType]);
      const isToSing = method === 'POST';
      queryClient.setQueryData(['searchSong', query, searchType], (old: SearchSong[] = []) =>
        old.map(song => (song.id === songId ? { ...song, isToSing } : song)),
      );
      return { prev, query, searchType };
    },
    onError: (error, songId, context) => {
      queryClient.setQueryData(['searchSong', context?.query, context?.searchType], context?.prev);
    },
    onSettled: (data, error, context) => {
      queryClient.invalidateQueries({
        queryKey: ['searchSong', context?.query, context?.searchType],
      });
    },
  });
};
