import { ScrollArea } from '@/components/ui/scroll-area';

import AddSongButton from './AddSongButton';
import SongList from './SongList';

export default function HomePage() {
  return (
    <div className="bg-background">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">노래방 플레이리스트</h1>
        <AddSongButton />
      </div>
      <ScrollArea className="h-[calc(100vh-16rem)] py-4">
        <SongList />
      </ScrollArea>
    </div>
  );
}
