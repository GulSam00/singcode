import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteSaveSong, getSaveSong, patchSaveSong } from '@/lib/api/saveSong';
import { SaveSong, SaveSongFolder } from '@/types/song';

export function useSaveSongQuery(isAuthenticated: boolean) {
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

      return songFolders;
    },
    enabled: isAuthenticated,
  });
}

export function useMoveSaveSongMutation() {
  const queryClient = useQueryClient();

  // 낙관적 업데이트 도입 복잡, 그냥 새로 가져오기로
  return useMutation({
    mutationFn: async ({ songIdArray, folderId }: { songIdArray: string[]; folderId: string }) => {
      const data = await patchSaveSong({ songIdArray, folderId });
      if (!data.success) {
        throw new Error(data.error);
      }
    },

    onError: error => {
      console.error('error', error);
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
    mutationFn: async ({ songIdArray }: { songIdArray: string[] }) => {
      const data = await deleteSaveSong({ songIdArray });

      if (!data.success) {
        throw new Error(data.error);
      }
    },
    onError: error => {
      console.error('error', error);
      alert(error.message ?? 'POST 실패');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saveSongFolder'] });
      queryClient.invalidateQueries({ queryKey: ['searchSong'] });
    },
  });
}
