'use client';

import { AlertCircle, CheckCircle, FolderPlus } from 'lucide-react';
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
import { usePostSaveSongFolderMutation } from '@/queries/saveSongFolderQuery';
import { SaveSongFolderList } from '@/types/song';

interface CreateFolderModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  existingFolders: SaveSongFolderList[];
}

export default function AddFolderModal({
  isOpen,
  isLoading,
  onClose,
  existingFolders,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);

  const { mutate: createFolder } = usePostSaveSongFolderMutation();
  // 입력값이 변경될 때마다 중복 확인
  useEffect(() => {
    if (!folderName) {
      setIsDuplicate(false);
      return;
    }

    const nameExists = existingFolders.some(folder => folder.folder_name === folderName);

    setIsDuplicate(nameExists);
  }, [folderName, existingFolders]);

  // 모달 초기화
  const resetModal = () => {
    setFolderName('');
    setIsDuplicate(false);
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // 폴더 생성 핸들러
  const handleCreatePlaylist = async () => {
    if (!folderName) {
      toast.error('재생목록 이름을 입력해주세요.');
      return;
    }

    if (isDuplicate) {
      toast.error('이미 존재하는 재생목록 이름입니다.');
      return;
    }

    try {
      // 실제 구현에서는 API 호출
      createFolder({ folderName: folderName });
      toast.success(`'${folderName}' 재생목록이 생성되었습니다.`);
      handleClose();
    } catch (error) {
      console.error('재생목록 생성 실패:', error);
      toast.error('재생목록 생성에 실패했습니다.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />새 재생목록 만들기
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="playlist-name" className="text-sm font-medium">
                재생목록 이름
              </Label>
              <div className="mt-1">
                <Input
                  id="playlist-name"
                  value={folderName}
                  onChange={e => setFolderName(e.target.value)}
                  disabled={isLoading}
                  placeholder="재생목록 이름을 입력하세요"
                  className={`${isDuplicate ? 'border-destructive focus-visible:ring-destructive' : ''} ${
                    folderName && !isDuplicate
                      ? 'border-green-500 focus-visible:ring-green-500'
                      : ''
                  }`}
                  autoFocus
                />
              </div>
            </div>

            {/* 중복 여부 메시지 */}
            {folderName && (
              <div
                className={`flex items-center gap-2 text-sm ${isDuplicate ? 'text-destructive' : 'text-green-500'}`}
              >
                {isDuplicate ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span>이미 존재하는 재생목록 이름입니다.</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>사용 가능한 재생목록 이름입니다.</span>
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
            onClick={handleCreatePlaylist}
            disabled={isLoading || isDuplicate || !folderName}
            className="flex items-center gap-2"
          >
            {isLoading ? '생성 중...' : '생성'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
