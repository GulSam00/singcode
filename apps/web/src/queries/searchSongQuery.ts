import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteLikeSong, postLikeSong } from '@/lib/api/likeSong';
import { getSearchSong } from '@/lib/api/searchSong';
import { deleteToSingSong, postToSingSong } from '@/lib/api/tosing';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';

export const useSearchSongSongQuery = (search: string, searchType: string) => {
  return useQuery({
    queryKey: ['searchSong', search, searchType],
    queryFn: async () => {
      const response = await getSearchSong(search, searchType);
      return response;
    },
    enabled: !!search,
  });
};

export const useToggleLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, method }: { songId: string; method: Method }) => {
      if (method === 'POST') {
        return postLikeSong({ songId });
      } else {
        return deleteLikeSong({ songId });
      }
    },
    onMutate: async ({ songId, method }: { songId: string; method: Method }) => {
      queryClient.cancelQueries({ queryKey: ['searchSong'] });
      const prev = queryClient.getQueryData(['searchSong']);
      const isLiked = method === 'POST';
      queryClient.setQueryData(['searchSong'], (old: SearchSong[]) =>
        old.map(song => (song.id === songId ? { ...song, isLiked } : song)),
      );
      return { prev };
    },
    onError: (error, songId, context) => {
      queryClient.setQueryData(['searchSong'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['searchSong'] });
    },
  });
};

export const useToggleToSingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, method }: { songId: string; method: Method }) => {
      if (method === 'POST') {
        return postToSingSong({ songId });
      } else {
        return deleteToSingSong({ songId });
      }
    },
    onMutate: async ({ songId, method }: { songId: string; method: Method }) => {
      queryClient.cancelQueries({ queryKey: ['searchSong'] });
      const prev = queryClient.getQueryData(['searchSong']);
      const isToSing = method === 'POST';
      queryClient.setQueryData(['searchSong'], (old: SearchSong[]) =>
        old.map(song => (song.id === songId ? { ...song, isToSing } : song)),
      );
      return { prev };
    },
    onError: (error, songId, context) => {
      queryClient.setQueryData(['searchSong'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['searchSong'] });
    },
  });
};
