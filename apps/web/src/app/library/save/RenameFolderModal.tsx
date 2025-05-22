'use client';

import { AlertCircle, CheckCircle, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRenameSaveSongFolderMutation } from '@/queries/saveSongFolderQuery';
import { SaveSongFolderList } from '@/types/song';

interface RenameFolderModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  existingFolders: SaveSongFolderList[];
  folderId: string;
  folderName: string;
}

export default function RenameFolderModal({
  isOpen,
  isLoading,
  onClose,
  existingFolders,
  folderId,
}: RenameFolderModalProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);

  const { mutate: renameFolder } = useRenameSaveSongFolderMutation();

  // 입력값이 변경될 때마다 중복 확인 (자기 자신 이름은 허용)
  useEffect(() => {
    if (!newFolderName) {
      setIsDuplicate(false);
      return;
    }

    const nameExists = existingFolders.some(folder => folder.folder_name === newFolderName);
    setIsDuplicate(nameExists);
  }, [newFolderName, existingFolders, folderId]);

  // 모달 초기화
  const resetModal = () => {
    setNewFolderName('');
    setIsDuplicate(false);
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // 폴더 이름 변경 핸들러
  const handleRename = async () => {
    if (!newFolderName) {
      toast.error('폴더 이름을 입력해주세요.');
      return;
    }
    if (isDuplicate) {
      toast.error('이미 존재하는 폴더 이름입니다.');
      return;
    }

    try {
      renameFolder({ folderId, folderName: newFolderName });
      toast.success(`'${newFolderName}'(으)로 폴더 이름이 변경되었습니다.`);
      handleClose();
    } catch (error) {
      console.error('폴더 이름 변경 실패:', error);
      toast.error('폴더 이름 변경에 실패했습니다.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            폴더 이름 변경
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-rename" className="text-sm font-medium">
                새 폴더 이름
              </Label>
              <div className="mt-1">
                <Input
                  id="folder-rename"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  disabled={isLoading}
                  placeholder="폴더 이름을 입력하세요"
                  className={`${isDuplicate ? 'border-destructive focus-visible:ring-destructive' : ''} ${
                    newFolderName && !isDuplicate
                      ? 'border-green-500 focus-visible:ring-green-500'
                      : ''
                  }`}
                  autoFocus
                />
              </div>
            </div>
            {/* 중복 여부 메시지 */}
            {newFolderName && (
              <div
                className={`flex items-center gap-2 text-sm ${isDuplicate ? 'text-destructive' : 'text-green-500'}`}
              >
                {isDuplicate ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span>이미 존재하는 폴더 이름입니다.</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>사용 가능한 폴더 이름입니다.</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            onClick={handleRename}
            disabled={isLoading || isDuplicate || !newFolderName}
            className="flex items-center gap-2"
          >
            {isLoading ? '변경 중...' : '변경'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
