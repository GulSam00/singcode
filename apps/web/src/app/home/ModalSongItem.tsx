import { Checkbox } from '@/components/ui/checkbox';
import { AddListModalSong } from '@/types/song';
import { cn } from '@/utils/cn';

// 노래 항목 컴포넌트
export default function ModalSongItem({
  song,
  isSelected,
  onToggleSelect,
}: {
  song: AddListModalSong;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'border-border flex items-center space-x-3 border-b py-2 last:border-0',
        song.isInToSingList && 'bg-muted/50 opacity-50',
      )}
    >
      <Checkbox
        id={`song-${song.song_id}`}
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(song.song_id)}
        disabled={song.isInToSingList}
      />
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium">{song.title}</h4>
        <p className="text-muted-foreground truncate text-xs">{song.artist}</p>
      </div>
    </div>
  );
}
