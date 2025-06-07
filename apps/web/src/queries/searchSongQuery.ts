import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteLikeSong, postLikeSong } from '@/lib/api/likeSong';
import { postSaveSong } from '@/lib/api/saveSong';
import { getInfiniteSearchSong, getSearchSong } from '@/lib/api/searchSong';
import { deleteToSingSong, postToSingSong } from '@/lib/api/tosing';
import { postTotalStat } from '@/lib/api/totalStat';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';

let invalidateToSingTimeout: NodeJS.Timeout | null = null;
let invalidateLikeTimeout: NodeJS.Timeout | null = null;

export const useInfiniteSearchSongQuery = (
  search: string,
  searchType: string,
  isAuthenticated: boolean,
) => {
  return useInfiniteQuery({
    queryKey: ['searchSong', search, searchType],
    queryFn: async ({ pageParam }) => {
      const response = await getInfiniteSearchSong(search, searchType, isAuthenticated, pageParam);

      // console.log('response', response);

      if (!response.success) {
        throw new Error('Search API failed');
      }
      return {
        data: response.data || [],
        hasNext: response.hasNext,
      };
    },

    getNextPageParam: (lastPage, pages) => {
      // lastPage : 직전 페이지의 데이터
      // pages : 현재까지 조회된 모든 데이터
      // console.log('lastPage', lastPage);
      // console.log('pages', pages);

      if (!lastPage || lastPage.data.length === 0) return undefined;
      return lastPage.hasNext ? pages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!search,
  });
};

export const useSearchSongQuery = (
  search: string,
  searchType: string,
  isAuthenticated: boolean,
) => {
  return useQuery<SearchSong[]>({
    queryKey: ['searchSong', search, searchType],
    queryFn: async () => {
      const response = await getSearchSong(search, searchType, isAuthenticated);
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

export const useToggleToSingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // 낙관적 업데이트 검증 코드
    // mutationFn: async ({ songId, method }: { songId: string; method: Method }) => {
    //   await new Promise(resolve => setTimeout(resolve, 2000));
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
    onError: (error, variables, context) => {
      console.error('error', error);
      alert(error.message ?? 'POST 실패');
      queryClient.setQueryData(['searchSong', context?.query, context?.searchType], context?.prev);
    },
    onSettled: (data, error, context) => {
      if (invalidateToSingTimeout) {
        clearTimeout(invalidateToSingTimeout);
      }
      invalidateToSingTimeout = setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['searchSong', context?.query, context?.searchType],
        });
        queryClient.invalidateQueries({ queryKey: ['toSingSong'] });
        queryClient.invalidateQueries({ queryKey: ['recentSong'] });
      }, 1000);
    },
  });
};

export const useToggleLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, method }: { songId: string; method: Method }) => {
      if (method === 'POST') {
        return Promise.all([
          postLikeSong({ songId }),
          postTotalStat({ songId, countType: 'like_count', isMinus: false }),
        ]);
      } else {
        return Promise.all([
          deleteLikeSong({ songId }),
          postTotalStat({ songId, countType: 'like_count', isMinus: true }),
        ]);
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
      const isLike = method === 'POST';
      queryClient.setQueryData(['searchSong', query, searchType], (old: SearchSong[] = []) =>
        old.map(song => (song.id === songId ? { ...song, isLike } : song)),
      );

      return { prev, query, searchType };
    },
    onError: (error, variables, context) => {
      console.error('error', error);
      alert(error.message ?? 'POST 실패');
      queryClient.setQueryData(['searchSong', context?.query, context?.searchType], context?.prev);
    },
    onSettled: (data, error, context) => {
      if (invalidateLikeTimeout) {
        clearTimeout(invalidateLikeTimeout);
      }
      invalidateLikeTimeout = setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['searchSong', context?.query, context?.searchType],
        });
        queryClient.invalidateQueries({ queryKey: ['likeSong'] });
        queryClient.invalidateQueries({ queryKey: ['recentSong'] });
      }, 1000);
    },
  });
};

export const useSaveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, folderName }: { songId: string; folderName: string }) => {
      return postSaveSong({ songId, folderName });
    },
    onMutate: async ({
      songId,
      query,
      searchType,
    }: {
      songId: string;
      folderName: string;
      query: string;
      searchType: string;
    }) => {
      queryClient.cancelQueries({ queryKey: ['searchSong', query, searchType] });
      const prev = queryClient.getQueryData(['searchSong', query, searchType]);
      queryClient.setQueryData(['searchSong', query, searchType], (old: SearchSong[] = []) =>
        old.map(song => (song.id === songId ? { ...song, isSave: true } : song)),
      );

      return { prev, query, searchType };
    },
    onError: (error, variables, context) => {
      console.error('error', error);
      alert(error.message ?? 'POST 실패');
      queryClient.setQueryData(['searchSong', context?.query, context?.searchType], context?.prev);
    },
    onSettled: (data, error, context) => {
      queryClient.invalidateQueries({
        queryKey: ['searchSong', context?.query, context?.searchType],
      });
      queryClient.invalidateQueries({ queryKey: ['saveSongFolder'] });
      queryClient.invalidateQueries({ queryKey: ['saveSongFolderList'] });
      queryClient.invalidateQueries({ queryKey: ['recentSong'] });
    },
  });
};
