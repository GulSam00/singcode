'use client';

import { AirplayIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import AddListModal from './AddListModal';
import SongList from './SongList';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-background">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">노래방 플레이리스트</h1>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setIsModalOpen(true)}
        >
          <AirplayIcon className="h-4 w-4" />
          <span>곡 추가</span>
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <SongList />
      </ScrollArea>

      <AddListModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
