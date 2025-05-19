'use client';

import { ArrowLeft, FolderInput, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useSaveSongQuery } from '@/queries/saveSongQuery';
import { SaveSong, Song, SongFolder } from '@/types/song';

import PlaylistCard from './PlaylistCard';

export default function PlaylistsPage() {
  // 상태 관리
  const { data: saveSongFolder, isLoading } = useSaveSongQuery();

  console.log('useSaveSongQuery data', saveSongFolder);

  const [expandedPlaylists, setExpandedPlaylists] = useState<Record<string, boolean>>({});
  const [selectedSongs, setSelectedSongs] = useState<Record<string, boolean>>({});

  const router = useRouter();

  // 전체 선택된 곡 수 계산
  const totalSelectedSongs = Object.values(selectedSongs).filter(Boolean).length;

  // 재생목록 펼치기/접기
  const togglePlaylist = (dstFolderName: string) => {
    setExpandedPlaylists(prev => ({
      ...prev,
      [dstFolderName]: !prev[dstFolderName],
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
  const toggleAllSongsInPlaylist = (dstFolderName: string) => {
    if (!saveSongFolder) return;
    const playlist = saveSongFolder.find(p => p.folderName === dstFolderName);
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
  const getSelectedSongCount = (dstFolderName: string) => {
    if (!saveSongFolder) return 0;

    const playlist = saveSongFolder.find(p => p.folderName === dstFolderName);
    if (!playlist) return 0;

    return playlist.songList.filter(song => selectedSongs[song.id]).length;
  };

  // 재생목록 내 모든 곡이 선택되었는지 확인
  const areAllSongsSelected = (dstFolderName: string) => {
    if (!saveSongFolder) return false;

    const playlist = saveSongFolder.find(p => p.folderName === dstFolderName);
    if (!playlist || playlist.songList.length === 0) return false;

    return playlist.songList.every(song => selectedSongs[song.id]);
  };

  // 선택된 곡 삭제
  const deleteSelectedSongs = () => {
    if (totalSelectedSongs === 0) {
      toast.error('선택된 곡이 없습니다.');
      return;
    }

    // 실제 구현에서는 API 호출
    const newPlaylists = saveSongFolder?.map(playlist => ({
      ...playlist,
      songs: playlist.songList.filter(song => !selectedSongs[song.id]),
    }));

    // setPlaylists(newPlaylists);
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
  const deletePlaylist = (dstFolderName: string) => {
    // 실제 구현에서는 API 호출
    // setPlaylists(prev => prev.filter(playlist => playlist.id !== dstFolderName));
    toast.success('재생목록이 삭제되었습니다.');
  };

  // 재생목록 편집 (실제 구현에서는 편집 모달 열기)
  const editPlaylist = (dstFolderName: string) => {
    toast.info('재생목록 편집 기능은 준비 중입니다.');
  };

  return (
    <div className="bg-background h-full">
      <div className="mb-6 flex items-center px-2 py-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">재생목록 관리</h1>
      </div>

      <div className="mb-6 flex items-center justify-between gap-2">
        {totalSelectedSongs > 0 && (
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
                onClick={moveSelectedSongs}
                className="flex items-center gap-1"
              >
                <FolderInput className="h-4 w-4" />
                이동
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelectedSongs}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                삭제
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        {saveSongFolder &&
          saveSongFolder.map((playlist, index) => (
            <PlaylistCard
              key={playlist.folderName + index}
              {...{
                playlist,
                selectedSongs,
                expandedPlaylists,
                areAllSongsSelected,
                toggleAllSongsInPlaylist,
                getSelectedSongCount,
                toggleSongSelection,
                editPlaylist,
                deletePlaylist,
                togglePlaylist,
              }}
            />
          ))}

        {!saveSongFolder ||
          (saveSongFolder.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              <p className="mb-2">재생목록이 없습니다.</p>
              <p>새 재생목록을 만들어보세요.</p>
            </div>
          ))}
      </div>
    </div>
  );
}
