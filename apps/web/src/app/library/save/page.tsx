'use client';

import { ArrowLeft, FolderInput, FolderPlus, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSaveSongFolderQuery } from '@/queries/saveSongFolderQuery';
import { useSaveSongQuery } from '@/queries/saveSongQuery';

import AddFolderModal from './AddFolderModal';
import DeleteFolderModal from './DeleteFolderModal';
import DeleteModal from './DeleteModal';
import FolderCard from './FolderCard';
import MoveModal from './MoveModal';
import RenameFolderModal from './RenameFolderModal';

type ModalType = null | 'move' | 'delete' | 'addFolder' | 'renameFolder' | 'deleteFolder';

export default function Page() {
  // 상태 관리
  const { data: saveSongFolders, isLoading: isLoadingSongFolders } = useSaveSongQuery();
  const { data: saveSongFolderList, isLoading: isLoadingSaveFolderList } = useSaveSongFolderQuery();
  const isLoading = isLoadingSongFolders || isLoadingSaveFolderList;

  console.log('useSaveSongQuery data', saveSongFolders);
  console.log('useSaveSongFolderQuery data', saveSongFolderList);

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  // song_id가 아닌 save_activities 테이블 요소의 id를 저장
  const [selectedSongs, setSelectedSongs] = useState<Record<string, boolean>>({});
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');

  const router = useRouter();

  // 전체 선택된 곡 수 계산
  const totalSelectedSongs = Object.values(selectedSongs).filter(Boolean).length;

  // 재생목록 펼치기/접기
  const toggleFolder = (dstFolderId: string) => {
    setExpandedFolders(prev => ({
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
  const toggleAllSongsInFolder = (dstFolderId: string) => {
    if (!saveSongFolders) return;
    const playlist = saveSongFolders.find(p => p.folder_id === dstFolderId);
    if (!playlist) return;

    const allSongIds = playlist.songList.map(song => song.song_id);
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

    return playlist.songList.filter(song => selectedSongs[song.song_id]).length;
  };

  // 재생목록 내 모든 곡이 선택되었는지 확인
  const areAllSongsSelected = (dstFolderId: string) => {
    if (!saveSongFolders) return false;

    const playlist = saveSongFolders.find(p => p.folder_id === dstFolderId);
    if (!playlist || playlist.songList.length === 0) return false;

    return playlist.songList.every(song => selectedSongs[song.song_id]);
  };

  const handleMoveSelectedSongs = () => {
    if (totalSelectedSongs === 0) {
      toast.error('선택된 곡이 없습니다.');
      return;
    }

    setModalType('move');
  };

  // 선택된 곡 삭제
  const handleDeleteSelectedSongs = () => {
    if (totalSelectedSongs === 0) {
      toast.error('선택된 곡이 없습니다.');
      return;
    }

    setModalType('delete');
  };

  const handleDeleteFolder = (dstFolderId: string, dstFolderName: string) => {
    setSelectedFolderId(dstFolderId);
    setSelectedFolderName(dstFolderName);

    setModalType('deleteFolder');
  };

  const handleRenameFolder = (dstFolderId: string, dstFolderName: string) => {
    setSelectedFolderId(dstFolderId);
    setSelectedFolderName(dstFolderName);
    setModalType('renameFolder');
  };

  const getSongIdArray = () => {
    return Object.keys(selectedSongs).filter(id => selectedSongs[id]);
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
                onClick={handleMoveSelectedSongs}
                className="flex items-center gap-1"
              >
                <FolderInput className="h-4 w-4" />
                이동
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelectedSongs}
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
              <FolderCard
                key={folder.id + index}
                {...{
                  folder: {
                    folder_name: folder.folder_name,
                    folder_id: folder.id,
                    songList:
                      saveSongFolders?.find(item => item.folder_id === folder.id)?.songList ?? [],
                  },
                  selectedSongs,
                  expandedFolders,
                  areAllSongsSelected,
                  toggleAllSongsInFolder,
                  getSelectedSongCount,
                  toggleSongSelection,
                  handleRenameFolder,
                  handleDeleteFolder,
                  toggleFolder,
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

      <MoveModal
        isOpen={modalType === 'move'}
        isLoading={isLoading}
        onClose={() => setModalType(null)}
        existingFolders={saveSongFolderList ?? []}
        songIdArray={getSongIdArray()}
        setSelectedSongs={setSelectedSongs}
      />

      <DeleteModal
        isOpen={modalType === 'delete'}
        isLoading={isLoading}
        onClose={() => setModalType(null)}
        songIdArray={getSongIdArray()}
        setSelectedSongs={setSelectedSongs}
      />

      <AddFolderModal
        isOpen={modalType === 'addFolder'}
        isLoading={isLoading}
        onClose={() => setModalType(null)}
        existingFolders={saveSongFolderList ?? []}
      />

      <RenameFolderModal
        isOpen={modalType === 'renameFolder'}
        isLoading={isLoading}
        onClose={() => setModalType(null)}
        existingFolders={saveSongFolderList ?? []}
        folderId={selectedFolderId}
        folderName={selectedFolderName}
      />

      <DeleteFolderModal
        isOpen={modalType === 'deleteFolder'}
        isLoading={isLoading}
        onClose={() => setModalType(null)}
        selectedFolderId={selectedFolderId}
        selectedFolderName={selectedFolderName}
      />
    </div>
  );
}
