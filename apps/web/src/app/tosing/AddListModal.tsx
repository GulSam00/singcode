'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import useAddSongList, { type TabType } from '@/hooks/useAddSongList';
import { useLikeSongQuery } from '@/queries/likeSongQuery';
import { useSaveSongQuery } from '@/queries/saveSongQuery';
import useAuthStore from '@/stores/useAuthStore';

import ModalSongItem from './ModalSongItem';

interface AddListModalProps {
  type: TabType;
  isOpen: boolean;
  onClose: () => void;
}

const MODAL_TITLE: Record<TabType, string> = {
  like: '즐겨찾기에서 추가',
  save: '재생목록에서 추가',
};

export default function AddListModal({ type, isOpen, onClose }: AddListModalProps) {
  const { songSelected, handleToggleSelect, handleConfirmAdd, totalSelectedCount } =
    useAddSongList();

  const { isAuthenticated } = useAuthStore();

  const { data: likedSongs, isLoading: isLoadingLikedSongs } = useLikeSongQuery(
    isAuthenticated && type === 'like',
  );

  const { data: saveSongFolders, isLoading: isLoadingSongFolders } = useSaveSongQuery(
    isAuthenticated && type === 'save',
  );

  const isLoading = type === 'like' ? isLoadingLikedSongs : isLoadingSongFolders;

  const handleClickConfirm = () => {
    handleConfirmAdd();
    onClose();
  };

  return (
    <Dialog open={isOpen && !isLoading} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex h-[500px] flex-col gap-0 p-0 sm:max-w-[450px]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{MODAL_TITLE[type]}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {type === 'like' &&
            likedSongs &&
            likedSongs.map((song, index) => (
              <ModalSongItem
                key={song.song_id + 'like' + index}
                song={song}
                isSelected={songSelected.includes(song.song_id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}

          {type === 'save' &&
            saveSongFolders &&
            saveSongFolders.map((songFolder, index) => (
              <div key={songFolder.folder_id + index}>
                <div className="flex justify-between border-b text-lg font-bold">
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
            ))}
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
