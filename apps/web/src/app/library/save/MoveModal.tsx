'use client';

import { FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMoveSaveSongMutation } from '@/queries/saveSongQuery';
import { SaveSongFolderList } from '@/types/song';

interface MoveModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  existingFolders: SaveSongFolderList[];
  songIdArray: string[];
  setSelectedSongs: (selectedSongs: Record<string, boolean>) => void;
}

export default function MoveModal({
  isOpen,
  isLoading,
  onClose,
  existingFolders,
  songIdArray,
  setSelectedSongs,
}: MoveModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const { mutate: moveSongs } = useMoveSaveSongMutation();

  // 모달 초기화
  const resetModal = () => {
    setSelectedFolderId('');
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // 폴더 이동 핸들러
  const handleMove = async () => {
    if (!selectedFolderId) {
      toast.error('이동할 폴더를 선택해주세요.');
      return;
    }

    console.log('selectedFolderId', selectedFolderId);
    console.log('songIdArray', songIdArray);

    try {
      moveSongs({ songIdArray, folderId: selectedFolderId });
      toast.success('폴더로 이동되었습니다.');
      handleClose();
      setSelectedSongs({});
    } catch (error) {
      console.error('폴더 이동 실패:', error);
      toast.error('폴더 이동에 실패했습니다.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            폴더로 이동
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedFolderId} onValueChange={setSelectedFolderId} disabled={isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="이동할 폴더를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {existingFolders.map(folder => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.folder_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            onClick={handleMove}
            disabled={isLoading || !selectedFolderId}
            className="flex items-center gap-2"
          >
            {isLoading ? '이동 중...' : '이동'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
