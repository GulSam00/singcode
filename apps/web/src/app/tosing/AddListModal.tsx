'use client';

// import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAddListModal from '@/hooks/useAddSongList';
import { useLikeSongQuery } from '@/queries/likeSongQuery';
import { useRecentSingLogQuery } from '@/queries/recentSingLogQuery';
// import { useSaveSongFolderQuery } from '@/queries/saveSongFolderQuery';
import { useSaveSongQuery } from '@/queries/saveSongQuery';

import ModalSongItem from './ModalSongItem';

interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddListModal({ isOpen, onClose }: AddListModalProps) {
  const {
    activeTab,
    setActiveTab,
    songSelected,
    handleToggleSelect,
    handleConfirmAdd,
    totalSelectedCount,
  } = useAddListModal();

  const { data: likedSongs, isLoading: isLoadingLikedSongs } = useLikeSongQuery();
  const { data: recentSongs, isLoading: isLoadingRecentSongs } = useRecentSingLogQuery();

  const { data: saveSongFolders, isLoading: isLoadingSongFolders } = useSaveSongQuery();

  const isLoading = isLoadingLikedSongs || isLoadingRecentSongs || isLoadingSongFolders;

  const handleClickConfirm = () => {
    handleConfirmAdd();
    onClose();
  };

  return (
    <Dialog open={isOpen && !isLoading} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex h-[500px] flex-col gap-0 p-0 sm:max-w-[450px]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>플레이리스트에 추가할 노래 선택</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col overflow-hidden px-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex w-full flex-1 flex-col overflow-y-auto"
          >
            <div>
              <TabsList className="my-2 grid w-full grid-cols-3">
                <TabsTrigger value="like">좋아요</TabsTrigger>
                <TabsTrigger value="save">재생목록</TabsTrigger>
                <TabsTrigger value="recent">최근곡</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="like" className="mt-0 h-full">
                <div className="h-full pr-2">
                  {likedSongs &&
                    likedSongs.map((song, index) => (
                      <ModalSongItem
                        key={song.song_id + 'like' + index}
                        song={song}
                        isSelected={songSelected.includes(song.song_id)}
                        onToggleSelect={handleToggleSelect}
                      />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="save" className="mt-0 h-full">
                <div className="h-full pr-2">
                  {saveSongFolders &&
                    saveSongFolders.map((songFolder, index) => {
                      return (
                        <div key={songFolder.folder_id + index}>
                          <div className="flex justify-between border-b-1 text-lg font-bold">
                            <h3>{songFolder.folder_name}</h3>

                            <span className="text-muted-foreground text-sm">
                              {songFolder.songList.length}곡
                            </span>
                          </div>
                          {songFolder.songList.map((song, index) => (
                            <ModalSongItem
                              key={song.song_id + 'save' + index}
                              song={song}
                              isSelected={songSelected.includes(song.song_id)}
                              onToggleSelect={handleToggleSelect}
                            />
                          ))}
                        </div>
                      );
                    })}
                </div>
              </TabsContent>

              <TabsContent value="recent" className="mt-0 h-full">
                <div className="h-full pr-2">
                  {recentSongs &&
                    recentSongs.map((song, index) => (
                      <ModalSongItem
                        key={song.song_id + 'recent' + index}
                        song={song}
                        isSelected={songSelected.includes(song.song_id)}
                        onToggleSelect={handleToggleSelect}
                      />
                    ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="border-t p-6 pt-4">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleClickConfirm} disabled={totalSelectedCount === 0}>
            {`${totalSelectedCount}곡 추가하기`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
