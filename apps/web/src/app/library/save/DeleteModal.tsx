'use client';

import { Trash2 } from 'lucide-react';
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
import { useDeleteSaveSongMutation } from '@/queries/saveSongQuery';

interface DeleteModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  songIdArray: string[];
  setSelectedSongs: (selectedSongs: Record<string, boolean>) => void;
}

export default function DeleteModal({
  isOpen,
  isLoading,
  onClose,
  songIdArray,
  setSelectedSongs,
}: DeleteModalProps) {
  const { mutate: deleteSongs } = useDeleteSaveSongMutation();

  // 모달 닫기 핸들러
  const handleClose = () => {
    onClose();
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    try {
      deleteSongs({ songIdArray });
      toast.success('선택한 노래가 삭제되었습니다.');
      handleClose();
      setSelectedSongs({});
    } catch (error) {
      console.error('노래 삭제 실패:', error);
      toast.error('노래 삭제에 실패했습니다.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            노래 삭제
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-gray-600">
            {songIdArray.length}개의 노래를 재생목록에서 삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
            className="flex items-center gap-2"
          >
            {isLoading ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
