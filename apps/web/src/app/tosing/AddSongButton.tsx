'use client';

import { AirplayIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import useAuthStore from '@/stores/useAuthStore';

import AddListModal from './AddListModal';

export default function AddSongButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleAddSong = () => {
    if (!isAuthenticated) {
      toast.error('로그인하고 저장한 노래에서 곡을 추가해보세요!');
      return;
    }
    setIsModalOpen(true);
  };
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleAddSong}
      >
        <AirplayIcon className="h-4 w-4" />
        <span>곡 추가</span>
      </Button>

      {/* 모달도 여기서 렌더링 */}
      <AddListModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
