'use client';

import { AirplayIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import AddListModal from './AddListModal';

export default function AddSongButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => setIsModalOpen(true)}
      >
        <AirplayIcon className="h-4 w-4" />
        <span>곡 추가</span>
      </Button>

      {/* 모달도 여기서 렌더링 */}
      <AddListModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
