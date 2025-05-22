'use client';

import { CheckCircle, PlusCircle, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSaveSongFolderQuery } from '@/queries/saveSongFolderQuery';
import { SaveSongFolderList, SearchSong } from '@/types/song';

interface IProps {
  modalType: '' | 'POST' | 'PATCH';
  song: SearchSong;
  closeModal: () => void;
  postSaveSong: (songId: string, folderName: string) => void;
  patchSaveSong: (songId: string, folderId: string) => void;
}

export default function AddFolderModal({
  modalType,
  song,
  closeModal,
  postSaveSong,
  patchSaveSong,
}: IProps) {
  const { data: saveSongFolderList, isLoading } = useSaveSongFolderQuery();

  console.log('saveSongFolderList', saveSongFolderList);

  const [folderName, setFolderName] = useState<string>('');
  const [isExistingPlaylist, setIsExistingPlaylist] = useState(false);

  const { id: songId, title, artist } = song;

  const LOGIC_TEXT = modalType === 'POST' ? '저장' : '수정';

  const handlevalueChange = (folderName: string) => {
    if (!saveSongFolderList) return;
    setFolderName(folderName);
  };

  const resetModal = () => {
    setFolderName('');
    setIsExistingPlaylist(false);
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    resetModal();
    closeModal();
  };

  const handleSave = () => {
    if (modalType === 'POST') {
      postSaveSong(songId, folderName);
    } else {
      if (!saveSongFolderList) return;

      const folderId =
        saveSongFolderList.find((folder: SaveSongFolderList) => folder.folder_name === folderName)
          ?.id || '';

      patchSaveSong(songId, folderId);
    }
    closeModal();
  };

  // input 값이 변경될 때 기존 재생목록과 일치 여부 확인
  useEffect(() => {
    if (folderName.trim() === '' || !saveSongFolderList) {
      setIsExistingPlaylist(false);
      return;
    }

    const matched = saveSongFolderList?.find(
      (folder: SaveSongFolderList) => folder.folder_name === folderName,
    );
    if (matched) {
      setIsExistingPlaylist(true);
    } else {
      setIsExistingPlaylist(false);
    }
  }, [folderName, saveSongFolderList]);

  useEffect(() => {
    if (!saveSongFolderList || saveSongFolderList.length === 0) return;

    setFolderName(saveSongFolderList[0].folder_name || '');
  }, [saveSongFolderList]);

  return (
    <Dialog open={modalType !== ''} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>재생목록 {LOGIC_TEXT}</DialogTitle>
        </DialogHeader>

        {/* 곡 정보 */}
        <div className="bg-muted mb-4 rounded-md p-3">
          <h3 className="text-base font-medium">{title}</h3>
          <p className="text-muted-foreground text-sm">{artist}</p>
        </div>

        <div className="w-full space-y-4 py-2">
          {/* 재생목록 선택 */}
          <div>
            <Label htmlFor="playlist-select">재생목록 선택</Label>
            <Select value={folderName} onValueChange={handlevalueChange}>
              <SelectTrigger id="playlist-select" className="mt-1 w-full">
                <SelectValue placeholder="재생목록을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {saveSongFolderList &&
                  saveSongFolderList.map(folder => (
                    <SelectItem key={folder.id} value={folder.folder_name}>
                      {folder.folder_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* 재생목록 이름 입력 */}
          {modalType === 'POST' && (
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="playlist-name">재생목록 이름</Label>
                {isExistingPlaylist && (
                  <span className="text-primary flex items-center text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    기존 재생목록
                  </span>
                )}
                {!isExistingPlaylist && folderName.trim() !== '' && (
                  <span className="flex items-center text-xs text-orange-500">
                    <PlusCircle className="mr-1 h-3 w-3" />새 재생목록
                  </span>
                )}
              </div>
              <Input
                id="playlist-name"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                placeholder="재생목록 이름을 입력하거나 선택하세요"
                className={`mt-1 ${
                  isExistingPlaylist
                    ? 'border-primary'
                    : folderName.trim() !== ''
                      ? 'border-orange-500'
                      : ''
                }`}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {isExistingPlaylist
                  ? `'${folderName}'에 곡을 추가합니다.`
                  : folderName.trim() !== ''
                    ? `'${folderName}' 재생목록을 새로 만듭니다.`
                    : '기존 재생목록을 선택하거나 새 재생목록 이름을 입력하세요.'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-2 pt-2">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button disabled={isLoading} onClick={handleSave} className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            {isExistingPlaylist ? `재생목록 ${LOGIC_TEXT}` : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
