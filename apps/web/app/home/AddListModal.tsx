'use client';

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
import useSongStore from '@/stores/useSongStore';

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
    handleConfirm,
    totalSelectedCount,
  } = useAddListModal();

  const { likedSongs, recentSongs } = useSongStore();

  const handleClickConfirm = () => {
    handleConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
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
              <TabsList className="my-2 grid w-full grid-cols-2">
                <TabsTrigger value="liked">좋아요한 노래</TabsTrigger>
                <TabsTrigger value="recent">최근 부른 노래</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="liked" className="mt-0 h-full">
                <div className="h-full pr-2">
                  {likedSongs &&
                    likedSongs.map(song => (
                      <ModalSongItem
                        key={song.id}
                        song={song}
                        isSelected={songSelected.includes(song.id)}
                        onToggleSelect={handleToggleSelect}
                      />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="recent" className="mt-0 h-full">
                <div className="h-full pr-2">
                  {recentSongs &&
                    recentSongs.map(song => (
                      <ModalSongItem
                        key={song.id}
                        song={song}
                        isSelected={songSelected.includes(song.id)}
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
