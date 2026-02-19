import { useState } from 'react';
import { toast } from 'sonner';

import { useMoveSaveSongMutation } from '@/queries/saveSongQuery';
import { useSaveMutation } from '@/queries/searchSongQuery';
import useAuthStore from '@/stores/useAuthStore';
import useFooterAnimateStore from '@/stores/useFooterAnimateStore';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';

type SaveModalType = '' | 'POST' | 'PATCH';
type SearchType = 'all' | 'title' | 'artist';

export default function useSaveSongModal(query: string, queryType: SearchType) {
  const { isAuthenticated } = useAuthStore();
  const { setFooterAnimateKey } = useFooterAnimateStore();

  const [saveModalType, setSaveModalType] = useState<SaveModalType>('');
  const [selectedSaveSong, setSelectedSaveSong] = useState<SearchSong | null>(null);

  const { mutate: postSong, isPending: isPostSongPending } = useSaveMutation();
  const { mutate: moveSong, isPending: isMoveSongPending } = useMoveSaveSongMutation();

  const handleToggleSave = async (song: SearchSong, method: Method) => {
    if (!isAuthenticated) {
      toast.error('로그인하고 곡을 저장해보세요!');
      return;
    }

    setSelectedSaveSong(song);
    setSaveModalType(method === 'POST' ? 'POST' : 'PATCH');
  };

  const postSaveSong = async (songId: string, folderName: string) => {
    if (isPostSongPending) {
      toast.error('요청 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setFooterAnimateKey('INFO');
    postSong({ songId, folderName, query, searchType: queryType });
  };

  const patchSaveSong = async (songId: string, folderId: string) => {
    if (isMoveSongPending) {
      toast.error('요청 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setFooterAnimateKey('INFO');
    moveSong({ songIdArray: [songId], folderId });
  };

  return {
    saveModalType,
    setSaveModalType,
    selectedSaveSong,
    handleToggleSave,
    postSaveSong,
    patchSaveSong,
  };
}
