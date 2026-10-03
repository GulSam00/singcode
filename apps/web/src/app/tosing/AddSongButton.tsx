'use client';

import { ListPlus, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { type TabType } from '@/hooks/useAddSongList';
import useAuthStore from '@/stores/useAuthStore';

import AddListModal from './AddListModal';

export default function AddSongButton() {
  const [openModal, setOpenModal] = useState<TabType | null>(null);
  const { isAuthenticated } = useAuthStore();

  const handleOpenModal = (type: TabType) => {
    if (!isAuthenticated) {
      toast.error('로그인하고 저장한 노래에서 곡을 추가해보세요!');
      return;
    }
    setOpenModal(type);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="dark:hover:bg-primary dark:hover:text-primary-foreground flex items-center gap-1"
          onClick={() => handleOpenModal('like')}
        >
          <Star className="h-4 w-4" />
          <span>즐겨찾기</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="dark:hover:bg-primary dark:hover:text-primary-foreground flex items-center gap-1"
          onClick={() => handleOpenModal('save')}
        >
          <ListPlus className="h-4 w-4" />
          <span>재생목록</span>
        </Button>
      </div>

      {openModal && (
        <AddListModal type={openModal} isOpen={!!openModal} onClose={() => setOpenModal(null)} />
      )}
    </>
  );
}
