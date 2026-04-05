import MarqueeText from '@/components/MarqueeText';

type MusicCardProps = {
  title: string;
  artist: string;
  reason: string;
  onClick: (value: string) => void;
};

export function MusicCard({ title, artist, reason, onClick }: MusicCardProps) {
  return (
    <div className="bg-card flex flex-col rounded-lg border p-4">
      <button
        type="button"
        onClick={() => onClick(title)}
        className="hover:text-accent mb-1 w-full cursor-pointer text-left text-sm font-semibold transition-colors hover:underline"
      >
        <MarqueeText>{title}</MarqueeText>
      </button>
      <button
        type="button"
        onClick={() => onClick(artist)}
        className="text-muted-foreground hover:text-accent mb-2 w-full cursor-pointer text-left text-xs transition-colors hover:underline"
      >
        <MarqueeText>{artist}</MarqueeText>
      </button>
      <p className="text-muted-foreground text-sm">{reason}</p>
    </div>
  );
}
