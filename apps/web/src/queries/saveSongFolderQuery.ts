import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteSaveFolderSong,
  getSaveFolderSong,
  patchSaveFolderSong,
  postSaveFolderSong,
} from '@/lib/api/saveSongFolder';

export function useSaveSongFolderQuery() {
  return useQuery({
    queryKey: ['saveSongFolderList'],
    queryFn: async () => {
      const response = await getSaveFolderSong();
      if (!response.success || !response.data) {
        return [];
      }

      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
}

export function usePostSaveSongFolderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderName }: { folderName: string }) => {
      const data = await postSaveFolderSong({ folderName });
      if (!data.success) {
        throw new Error(data.error);
      }
    },
    onError: error => {
      console.error('error', error);
      alert(error.message ?? 'POST 실패');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saveSongFolderList'] });
    },
  });
}

export function useRenameSaveSongFolderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId, folderName }: { folderId: string; folderName: string }) => {
      const data = await patchSaveFolderSong({ folderId, folderName });
      if (!data.success) {
        throw new Error(data.error);
      }
    },
    onError: error => {
      console.error('error', error);
      alert(error.message ?? 'POST 실패');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saveSongFolderList'] });
    },
  });
}

export function useDeleteSaveFolderSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId }: { folderId: string }) => {
      const data = await deleteSaveFolderSong({ folderId });
      if (!data.success) {
        throw new Error(data.error);
      }
    },
    onError: error => {
      console.error('error', error);
      alert(error.message ?? 'POST 실패');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saveSongFolderList'] });
      queryClient.invalidateQueries({ queryKey: ['searchSong'] });
    },
  });
}
