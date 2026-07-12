import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteLikeSong, postLikeSong } from '@/lib/api/likeSong';
import { postSaveSong } from '@/lib/api/saveSong';
import { getInfiniteSearchSong } from '@/lib/api/searchSong';
import { deleteToSingSong, postToSingSong } from '@/lib/api/tosing';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';

let invalidateToSingTimeout: NodeJS.Timeout | null = null;
let invalidateLikeTimeout: NodeJS.Timeout | null = null;

interface PagesType {
  data: SearchSong[];
  hasNext: boolean;
}

interface NextPageParamType {
  pages: PagesType[];
  pageParam: number[];
}

interface SongProps {
  songId: string;
  method: Method;
}

interface FolderProps {
  songId: string;
  folderName: string;
  query: string;
  searchType: string;
  languageTag?: number;
}

export const useInfiniteSearchSongQuery = (
  search: string,
  searchType: string,
  isAuthenticated: boolean,
  languageTag?: number,
) => {
  return useInfiniteQuery({
    queryKey: ['searchSong', search, searchType, languageTag],
    queryFn: async ({ pageParam }) => {
      const response = await getInfiniteSearchSong(
        search,
        searchType,
        isAuthenticated,
        pageParam,
        languageTag,
      );

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

      if (!lastPage || lastPage.data.length === 0) return undefined;
      return lastPage.hasNext ? pages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!search,
  });
};

export const useToggleToSingMutation = (
  query: string,
  searchType: string,
  languageTag?: number,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    // 낙관적 업데이트 검증 코드
    // mutationFn: async ({ songId, method }: { songId: string; method: Method }) => {
    //   await new Promise(resolve => setTimeout(resolve, 2000));
    mutationFn: async ({ songId, method }: SongProps) => {
      if (method === 'POST') {
        return postToSingSong({ songId });
      } else {
        return deleteToSingSong({ songId });
      }
    },
    onMutate: async ({ songId, method }: SongProps) => {
      const queryKey = ['searchSong', query, searchType, languageTag];
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      const isToSing = method === 'POST';

      queryClient.setQueryData(queryKey, (old: NextPageParamType | undefined) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: { data: SearchSong[]; hasNext: boolean }) => ({
            ...page,
            data: page.data.map(song => (song.id === songId ? { ...song, isToSing } : song)),
          })),
        };
      });

      return { prev, query, searchType, languageTag };
    },
    onError: (error, variables, context) => {
      console.error('error', error);
      alert(error.message ?? 'POST 실패');
      queryClient.setQueryData(
        ['searchSong', context?.query, context?.searchType, context?.languageTag],
        context?.prev,
      );
    },
    onSettled: () => {
      if (invalidateToSingTimeout) {
        clearTimeout(invalidateToSingTimeout);
      }
      invalidateToSingTimeout = setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['searchSong', query, searchType, languageTag],
        });
        queryClient.invalidateQueries({ queryKey: ['toSingSong'] });
      }, 1000);
    },
  });
};

export const useToggleLikeMutation = (query: string, searchType: string, languageTag?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, method }: SongProps) => {
      if (method === 'POST') {
        return postLikeSong({ songId });
      } else {
        return deleteLikeSong({ songId });
      }
    },
    onMutate: async ({ songId, method }: SongProps) => {
      const queryKey = ['searchSong', query, searchType, languageTag];
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      const isLike = method === 'POST';
      queryClient.setQueryData(queryKey, (old: NextPageParamType | undefined) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: { data: SearchSong[]; hasNext: boolean }) => ({
            ...page,
            data: page.data.map(song => (song.id === songId ? { ...song, isLike } : song)),
          })),
        };
      });

      return { prev, query, searchType, languageTag };
    },
    onError: (error, variables, context) => {
      console.error('error', error);
      alert(error.message ?? 'POST 실패');
      queryClient.setQueryData(
        ['searchSong', context?.query, context?.searchType, context?.languageTag],
        context?.prev,
      );
    },
    onSettled: () => {
      if (invalidateLikeTimeout) {
        clearTimeout(invalidateLikeTimeout);
      }
      invalidateLikeTimeout = setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['searchSong', query, searchType, languageTag],
        });
        queryClient.invalidateQueries({ queryKey: ['likeSong'] });
      }, 1000);
    },
  });
};

export const useSaveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, folderName }: FolderProps) => {
      return postSaveSong({ songId, folderName });
    },
    onMutate: async ({ songId, query, searchType, languageTag }: FolderProps) => {
      const queryKey = ['searchSong', query, searchType, languageTag];
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: NextPageParamType | undefined) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: { data: SearchSong[]; hasNext: boolean }) => ({
            ...page,
            data: page.data.map(song => (song.id === songId ? { ...song, isSave: true } : song)),
          })),
        };
      });

      return { prev, query, searchType, languageTag };
    },
    onError: (error, variables, context) => {
      console.error('error', error);
      alert(error.message ?? 'POST 실패');
      queryClient.setQueryData(
        ['searchSong', context?.query, context?.searchType, context?.languageTag],
        context?.prev,
      );
    },
    onSettled: (data, error, context) => {
      queryClient.invalidateQueries({
        queryKey: ['searchSong', context?.query, context?.searchType, context?.languageTag],
      });
      queryClient.invalidateQueries({ queryKey: ['saveSongFolder'] });
      queryClient.invalidateQueries({ queryKey: ['saveSongFolderList'] });
    },
  });
};
