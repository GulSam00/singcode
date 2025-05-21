'use client';

import { ArrowLeft, FolderInput, FolderPlus, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useDeleteSaveFolderSongMutation,
  useSaveSongFolderQuery,
} from '@/queries/saveSongFolderQuery';
import { useSaveSongQuery } from '@/queries/saveSongQuery';

import AddFolderModal from './AddFolderModal';
import PlaylistCard from './PlaylistCard';

type ModalType = null | 'move' | 'delete' | 'addFolder' | 'renameFolder' | 'deleteFolder';

export default function PlaylistsPage() {
  // 상태 관리
  const { data: saveSongFolders, isLoading: isLoadingSongFolders } = useSaveSongQuery();
  const { data: saveSongFolderList, isLoading: isLoadingSaveFolderList } = useSaveSongFolderQuery();
  const isLoading = isLoadingSongFolders || isLoadingSaveFolderList;

  const { mutate: deleteSaveFolderSong } = useDeleteSaveFolderSongMutation();
  console.log('useSaveSongQuery data', saveSongFolders);
  console.log('useSaveSongFolderQuery data', saveSongFolderList);

  const [expandedPlaylists, setExpandedPlaylists] = useState<Record<string, boolean>>({});
  const [selectedSongs, setSelectedSongs] = useState<Record<string, boolean>>({});
  const [modalType, setModalType] = useState<ModalType>(null);

  const router = useRouter();

  // 전체 선택된 곡 수 계산
  const totalSelectedSongs = Object.values(selectedSongs).filter(Boolean).length;

  // 재생목록 펼치기/접기
  const togglePlaylist = (dstFolderId: string) => {
    setExpandedPlaylists(prev => ({
      ...prev,
      [dstFolderId]: !prev[dstFolderId],
    }));
  };

  // 개별 곡 선택/해제
  const toggleSongSelection = (songId: string) => {
    setSelectedSongs(prev => ({
      ...prev,
      [songId]: !prev[songId],
    }));
  };

  // 재생목록 내 모든 곡 선택/해제
  const toggleAllSongsInPlaylist = (dstFolderId: string) => {
    if (!saveSongFolders) return;
    const playlist = saveSongFolders.find(p => p.folder_id === dstFolderId);
    if (!playlist) return;

    const allSongIds = playlist.songList.map(song => song.id);
    const areAllSelected = allSongIds.every(id => selectedSongs[id]);

    const newSelectedSongs = { ...selectedSongs };
    allSongIds.forEach(id => {
      newSelectedSongs[id] = !areAllSelected;
    });

    setSelectedSongs(newSelectedSongs);
  };

  // 모든 선택 해제
  const clearAllSelections = () => {
    setSelectedSongs({});
    toast.success('모든 선택이 해제되었습니다.');
  };

  // 재생목록 내 선택된 곡 수 계산
  const getSelectedSongCount = (dstFolderId: string) => {
    if (!saveSongFolders) return 0;

    const playlist = saveSongFolders.find(p => p.folder_id === dstFolderId);
    if (!playlist) return 0;

    return playlist.songList.filter(song => selectedSongs[song.id]).length;
  };

  // 재생목록 내 모든 곡이 선택되었는지 확인
  const areAllSongsSelected = (dstFolderId: string) => {
    if (!saveSongFolders) return false;

    const playlist = saveSongFolders.find(p => p.folder_id === dstFolderId);
    if (!playlist || playlist.songList.length === 0) return false;

    return playlist.songList.every(song => selectedSongs[song.id]);
  };

  // 선택된 곡 삭제
  const deleteSelectedSongs = () => {
    if (totalSelectedSongs === 0) {
      toast.error('선택된 곡이 없습니다.');
      return;
    }

    setSelectedSongs({});
    toast.success(`${totalSelectedSongs}곡이 삭제되었습니다.`);
  };

  // 선택된 곡 폴더 이동 (실제 구현에서는 이동 모달 열기)
  const moveSelectedSongs = () => {
    if (totalSelectedSongs === 0) {
      toast.error('선택된 곡이 없습니다.');
      return;
    }

    toast.info(`${totalSelectedSongs}곡을 다른 재생목록으로 이동합니다.`, {
      description: '폴더 이동 기능은 준비 중입니다.',
    });
  };

  // 재생목록 삭제
  const deletePlaylist = (dstFolderId: string) => {
    //임시로 테스트
    console.log('deletePlaylist', dstFolderId);
    deleteSaveFolderSong({ folderId: dstFolderId });
    setModalType('deleteFolder');
  };

  // 재생목록 편집 (실제 구현에서는 편집 모달 열기)
  const renamePlaylist = (dstFolderId: string) => {
    setModalType('renameFolder');
  };

  return (
    <div className="bg-background h-full">
      <div className="flex items-center px-2 py-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">재생목록 관리</h1>
      </div>

      <div className="my-4 flex h-10 items-center justify-between gap-2">
        {totalSelectedSongs > 0 ? (
          <>
            <div className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-sm">
              {totalSelectedSongs}곡 선택됨
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllSelections}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                해제
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalType('move')}
                className="flex items-center gap-1"
              >
                <FolderInput className="h-4 w-4" />
                이동
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setModalType('delete')}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                삭제
              </Button>
            </div>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalType('addFolder')}
            className="flex items-center gap-1"
          >
            <FolderPlus className="h-4 w-4" />
            새로운 재생목록 추가
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] px-2">
        <div className="space-y-4">
          {saveSongFolderList &&
            saveSongFolderList.map((folder, index) => (
              <PlaylistCard
                key={folder.id + index}
                {...{
                  playlist: {
                    folder_name: folder.folder_name,
                    folder_id: folder.id,
                    songList:
                      saveSongFolders?.find(item => item.folder_id === folder.id)?.songList ?? [],
                  },
                  selectedSongs,
                  expandedPlaylists,
                  areAllSongsSelected,
                  toggleAllSongsInPlaylist,
                  getSelectedSongCount,
                  toggleSongSelection,
                  renamePlaylist,
                  deletePlaylist,
                  togglePlaylist,
                }}
              />
            ))}

          {!saveSongFolders ||
            (saveSongFolders.length === 0 && (
              <div className="text-muted-foreground py-8 text-center">
                <p className="mb-2">재생목록이 없습니다.</p>
                <p>새 재생목록을 만들어보세요.</p>
              </div>
            ))}
        </div>
      </ScrollArea>

      <AddFolderModal
        isOpen={modalType === 'addFolder'}
        isLoading={isLoading}
        onClose={() => setModalType(null)}
        existingPlaylists={saveSongFolderList ?? []}
      />
    </div>
  );
}
