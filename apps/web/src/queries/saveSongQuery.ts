import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteSaveSong, getSaveSong, patchSaveSong } from '@/lib/api/saveSong';
import {
  deleteSaveFolderSong,
  getSaveFolderSong,
  patchSaveFolderSong,
  postSaveFolderSong,
} from '@/lib/api/saveSongFolder';
import { postTotalStat, postTotalStatArray } from '@/lib/api/totalStat';
import { SaveSong, SaveSongFolder } from '@/types/song';

export function useSaveSongQuery() {
  return useQuery({
    queryKey: ['saveSongFolder'],
    queryFn: async () => {
      const response = await getSaveSong();
      if (!response.success || !response.data) {
        return [];
      }
      const rawData: SaveSong[] = response.data;
      const songFolders: SaveSongFolder[] = [];

      rawData.forEach(item => {
        const existingFolder = songFolders.find(folder => folder.folder_id === item.folder_id);

        if (existingFolder) {
          existingFolder.songList.push(item);
        } else {
          songFolders.push({
            folder_name: item.folder_name,
            folder_id: item.folder_id,
            songList: [item],
          });
        }
      });

      console.log('rawData', rawData);
      console.log('songFolders', songFolders);
      return songFolders;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
}

export function useUpdateSaveSongMutation() {
  const queryClient = useQueryClient();

  // 낙관적 업데이트 도입 복잡, 그냥 새로 가져오기로
  return useMutation({
    mutationFn: async ({
      songIdArray,
      folderName,
    }: {
      songIdArray: string[];
      folderName: string;
    }) => {
      const data = await patchSaveSong({ songIdArray, folderName });
      console.log('useUpdateSaveSongMutation', data);
      if (!data.success) {
        throw new Error(data.error);
      }
    },

    onError: error => {
      console.log('error', error);
      alert(error.message ?? 'POST 실패');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saveSongFolder'] });
    },
  });
}

export function useDeleteSaveSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, folderId }: { songId: string; folderId: string }) => {
      const data = await deleteSaveSong({ songId, folderId });
      console.log('useDeleteSaveSongMutation', data);
      if (!data.success) {
        throw new Error(data.error);
      }
    },
    onError: error => {
      console.log('error', error);
      alert(error.message ?? 'POST 실패');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saveSongFolder'] });
    },
  });
}

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
      console.log('usePostSaveSongFolderMutation', data);
      if (!data.success) {
        throw new Error(data.error);
      }
    },
    onError: error => {
      console.log('error', error);
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
      console.log('useRenameSaveSongFolderMutation', data);
      if (!data.success) {
        throw new Error(data.error);
      }
    },
    onError: error => {
      console.log('error', error);
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
      console.log('useDeleteSaveFolderSongMutation', data);
      if (!data.success) {
        throw new Error(data.error);
      }
    },
    onError: error => {
      console.log('error', error);
      alert(error.message ?? 'POST 실패');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saveSongFolderList'] });
    },
  });
}
