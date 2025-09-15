'use client';

import { AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteSaveFolderSongMutation } from '@/queries/saveSongFolderQuery';

interface DeleteFolderModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  selectedFolderId: string;
  selectedFolderName: string;
}

export default function DeleteFolderModal({
  isOpen,
  isLoading,
  onClose,
  selectedFolderId,
  selectedFolderName,
}: DeleteFolderModalProps) {
  const { mutate: deleteFolder } = useDeleteSaveFolderSongMutation();
  // 모달 닫기 핸들러
  const handleClose = () => {
    onClose();
  };

  // 폴더 삭제 핸들러
  const handleDelete = async () => {
    if (!selectedFolderId) {
      toast.error('삭제할 폴더가 선택되지 않았습니다.');
      return;
    }
    try {
      deleteFolder({ folderId: selectedFolderId });
      toast.success('폴더가 삭제되었습니다.');
      handleClose();
    } catch (error) {
      console.error('폴더 삭제 실패:', error);
      toast.error('폴더 삭제에 실패했습니다.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            폴더 삭제
          </DialogTitle>
        </DialogHeader>
        <div className="text-destructive flex items-center gap-2 py-4 text-sm">
          <AlertCircle className="h-4 w-4" />
          정말로 {selectedFolderName} 폴더를 삭제하시겠습니까? <br />이 작업은 되돌릴 수 없습니다.
        </div>
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading || !selectedFolderId}
            className="flex items-center gap-2"
            variant="destructive"
          >
            {isLoading ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
