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
import { useSaveSongQuery } from '@/queries/saveSongQuery';
import { Method } from '@/types/common';
import { SearchSong } from '@/types/song';

interface IProps {
  isOpen: boolean;
  song: SearchSong;
  setIsSaveModal: (temp: boolean) => void;
  saveSong: (songId: string, folderName: string, method: Method) => void;
}

export default function PlaylistModal({ isOpen, song, setIsSaveModal, saveSong }: IProps) {
  const { data: saveSongFolder, isLoading } = useSaveSongQuery();

  const [selectedFolderIndex, setSelectedFolderIndex] = useState<number>(0);
  const [folderName, setFolderName] = useState<string>('');

  const [isExistingPlaylist, setIsExistingPlaylist] = useState(false);

  console.log('useSaveSongQuery data', saveSongFolder);
  const { id, title, artist } = song;

  const handlevalueChange = (folderName: string) => {
    if (!saveSongFolder) return;

    const index = saveSongFolder.findIndex(
      (folder: { folderName: string }) => folder.folderName === folderName,
    );
    setSelectedFolderIndex(index);
    setFolderName(folderName);
  };

  const resetModal = () => {
    setSelectedFolderIndex(0);
    setFolderName('');
    setIsExistingPlaylist(false);
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    resetModal();
    setIsSaveModal(false);
  };

  const handleSave = () => {
    saveSong(id, folderName, 'POST');
    setIsSaveModal(false);
  };

  // input 값이 변경될 때 기존 재생목록과 일치 여부 확인
  useEffect(() => {
    if (folderName.trim() === '' || !saveSongFolder) {
      setSelectedFolderIndex(-1);
      setIsExistingPlaylist(false);
      return;
    }

    const matched = saveSongFolder?.find(
      (folder: { folderName: string }) => folder.folderName === folderName,
    );
    if (matched) {
      setIsExistingPlaylist(true);
      setSelectedFolderIndex(saveSongFolder.indexOf(matched));
    } else {
      setIsExistingPlaylist(false);
      setSelectedFolderIndex(-1);
    }
  }, [folderName, saveSongFolder]);

  useEffect(() => {
    if (!saveSongFolder || saveSongFolder.length === 0) return;

    setSelectedFolderIndex(0);
    setFolderName(saveSongFolder[0].folderName || '');
  }, [saveSongFolder]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>재생목록에 저장</DialogTitle>
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
                {saveSongFolder &&
                  saveSongFolder.map((folder, index) => (
                    <SelectItem key={folder.folderName + index} value={folder.folderName}>
                      {folder.folderName} ({folder.songIdList.length}곡)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* 재생목록 이름 입력 */}
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
        </div>

        <DialogFooter className="flex space-x-2 pt-2">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button disabled={isLoading} onClick={handleSave} className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            {isExistingPlaylist ? '재생목록에 추가' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
