import SongSummary from '@/components/SongSummary';
import { Separator } from '@/components/ui/separator';
import { Song } from '@/types/song';

export default function RecentSongCard({ song }: { song: Song }) {
  return (
    <div className="w-full">
      <SongSummary song={song} />
      <Separator className="my-4" />
    </div>
  );
}
