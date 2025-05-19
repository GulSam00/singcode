import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteSaveSong, getSaveSong, postSaveSong } from '@/lib/api/saveSong';
import { postTotalStat, postTotalStatArray } from '@/lib/api/totalStat';
import { SaveSong, SongFolder } from '@/types/song';

export function useSaveSongQuery() {
  return useQuery({
    queryKey: ['saveSong'],
    queryFn: async () => {
      const response = await getSaveSong();
      if (!response.success || !response.data) {
        return [];
      }

      const rawData: SaveSong[] = response.data;
      console.log('rawData', rawData);
      const folders: SongFolder[] = [];

      rawData.forEach(item => {
        // console.log('item', item);
        const existingFolder = folders.find(folder => folder.folderName === item.folder_name);

        if (existingFolder) {
          existingFolder.songList.push(item);
        } else {
          folders.push({
            folderName: item.folder_name,
            songList: [item],
          });
        }
      });

      return folders;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
}
