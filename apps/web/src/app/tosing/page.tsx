import { ScrollArea } from '@/components/ui/scroll-area';

import AddSongButton from './AddSongButton';
import SongList from './SongList';

export default function HomePage() {
  return (
    <div className="bg-background flex h-full flex-col">
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <h1 className="text-2xl font-bold">노래방 플레이리스트</h1>
        <AddSongButton />
      </div>
      <ScrollArea className="min-h-0 flex-1 py-4">
        <SongList />
      </ScrollArea>
    </div>
  );
}
