'use client';

import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Edit,
  FolderInput,
  Music,
  Trash2,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

// 곡 타입 정의
interface Song {
  id: string;
  title: string;
  artist: string;
  num_tj?: string;
  num_ky?: string;
}

// 재생목록 타입 정의
interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

// 샘플 데이터
const SAMPLE_PLAYLISTS: Playlist[] = [
  {
    id: '1',
    name: '내가 좋아하는 노래',
    songs: [
      { id: '101', title: '눈의 꽃', artist: '박효신', num_tj: '47251', num_ky: '62867' },
      { id: '102', title: '거리에서', artist: '성시경', num_tj: '84173', num_ky: '48506' },
      { id: '103', title: '벚꽃 엔딩', artist: '버스커 버스커', num_tj: '46079', num_ky: '30184' },
    ],
  },
  {
    id: '2',
    name: '신나는 노래',
    songs: [
      { id: '201', title: 'Dynamite', artist: 'BTS', num_tj: '95123', num_ky: '92456' },
      { id: '202', title: 'LOVE DIVE', artist: 'IVE', num_tj: '96701', num_ky: '84254' },
      {
        id: '203',
        title: 'That That',
        artist: '싸이 (Prod. & Feat. SUGA of BTS)',
        num_tj: '96612',
        num_ky: '84209',
      },
      { id: '204', title: 'TOMBOY', artist: '(여자)아이들', num_tj: '96578', num_ky: '84187' },
    ],
  },
  {
    id: '3',
    name: '슬픈 노래',
    songs: [
      { id: '301', title: '사랑했나봐', artist: '윤도현', num_tj: '41906', num_ky: '35184' },
      {
        id: '302',
        title: '너를 사랑하고 있어',
        artist: '백지영',
        num_tj: '38115',
        num_ky: '46009',
      },
    ],
  },
  {
    id: '4',
    name: '노래방 필수곡',
    songs: [
      { id: '401', title: '사랑은 늘 도망가', artist: '임영웅', num_tj: '97156', num_ky: '84441' },
      { id: '402', title: '모든 날, 모든 순간', artist: '폴킴', num_tj: '96842', num_ky: '84321' },
      {
        id: '403',
        title: '다시 만날 수 있을까',
        artist: '임영웅',
        num_tj: '96789',
        num_ky: '84298',
      },
      {
        id: '404',
        title: "That's Hilarious",
        artist: 'Charlie Puth',
        num_tj: '96745',
        num_ky: '84276',
      },
      { id: '405', title: '취중고백', artist: '김민석', num_tj: '96654', num_ky: '84231' },
    ],
  },
];

export default function PlaylistsPage() {
  // 상태 관리
  const [playlists, setPlaylists] = useState<Playlist[]>(SAMPLE_PLAYLISTS);
  const [expandedPlaylists, setExpandedPlaylists] = useState<Record<string, boolean>>({});
  const [selectedSongs, setSelectedSongs] = useState<Record<string, boolean>>({});

  const router = useRouter();

  // 전체 선택된 곡 수 계산
  const totalSelectedSongs = Object.values(selectedSongs).filter(Boolean).length;

  // 재생목록 펼치기/접기
  const togglePlaylist = (playlistId: string) => {
    setExpandedPlaylists(prev => ({
      ...prev,
      [playlistId]: !prev[playlistId],
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
  const toggleAllSongsInPlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const allSongIds = playlist.songs.map(song => song.id);
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
  const getSelectedSongCount = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return 0;

    return playlist.songs.filter(song => selectedSongs[song.id]).length;
  };

  // 재생목록 내 모든 곡이 선택되었는지 확인
  const areAllSongsSelected = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist || playlist.songs.length === 0) return false;

    return playlist.songs.every(song => selectedSongs[song.id]);
  };

  // 선택된 곡 삭제
  const deleteSelectedSongs = () => {
    if (totalSelectedSongs === 0) {
      toast.error('선택된 곡이 없습니다.');
      return;
    }

    // 실제 구현에서는 API 호출
    const newPlaylists = playlists.map(playlist => ({
      ...playlist,
      songs: playlist.songs.filter(song => !selectedSongs[song.id]),
    }));

    setPlaylists(newPlaylists);
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
  const deletePlaylist = (playlistId: string) => {
    // 실제 구현에서는 API 호출
    setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
    toast.success('재생목록이 삭제되었습니다.');
  };

  // 재생목록 편집 (실제 구현에서는 편집 모달 열기)
  const editPlaylist = (playlistId: string) => {
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
        {playlists.map(playlist => (
          <Card key={playlist.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`playlist-${playlist.id}`}
                    checked={areAllSongsSelected(playlist.id)}
                    onCheckedChange={() => toggleAllSongsInPlaylist(playlist.id)}
                  />
                  <CardTitle className="flex items-center gap-2 text-lg">{playlist.name}</CardTitle>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editPlaylist(playlist.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePlaylist(playlist.id)}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePlaylist(playlist.id)}
                    className="h-8 w-8 p-0"
                  >
                    {expandedPlaylists[playlist.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-normal">
                  {playlist.songs.length}곡
                </span>
                {getSelectedSongCount(playlist.id) > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-normal">
                    {getSelectedSongCount(playlist.id)}곡 선택됨
                  </span>
                )}
              </div>
            </CardHeader>

            {expandedPlaylists[playlist.id] && (
              <CardContent className="p-0">
                <Separator className="my-2" />
                <div className="p-4 pt-0">
                  {playlist.songs.length > 0 ? (
                    <div className="space-y-2">
                      {playlist.songs.map(song => (
                        <div
                          key={song.id}
                          className="flex items-center gap-3 border-b py-2 last:border-0"
                        >
                          <Checkbox
                            id={`song-${song.id}`}
                            checked={!!selectedSongs[song.id]}
                            onCheckedChange={() => toggleSongSelection(song.id)}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Music className="text-muted-foreground h-4 w-4 shrink-0" />
                              <div>
                                <p className="text-sm font-medium">{song.title}</p>
                                <p className="text-muted-foreground text-xs">{song.artist}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-4 text-center">
                      <p>재생목록이 비어 있습니다.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {playlists.length === 0 && (
          <div className="text-muted-foreground py-8 text-center">
            <p className="mb-2">재생목록이 없습니다.</p>
            <p>새 재생목록을 만들어보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
