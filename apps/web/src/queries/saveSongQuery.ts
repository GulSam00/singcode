import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteSaveSong, getSaveFolderSong, getSaveSong, postSaveSong } from '@/lib/api/saveSong';
import { postTotalStat, postTotalStatArray } from '@/lib/api/totalStat';
import { SaveSong, SongFolder } from '@/types/song';

export function useSaveSongQuery() {
  return useQuery({
    queryKey: ['saveSongFolder'],
    queryFn: async () => {
      const response = await getSaveSong();
      if (!response.success || !response.data) {
        return [];
      }
      const rawData: SaveSong[] = response.data;
      const songFolders: SongFolder[] = [];

      rawData.forEach(item => {
        const existingFolder = songFolders.find(folder => folder.folderName === item.folder_name);

        if (existingFolder) {
          existingFolder.songList.push(item);
        } else {
          songFolders.push({
            folderName: item.folder_name,
            songList: [item],
          });
        }
      });

      return songFolders;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
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
