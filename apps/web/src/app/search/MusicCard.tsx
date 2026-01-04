type MusicCardProps = {
  title: string;
  artist: string;
  reason: string;
  onClick: (value: string) => void;
};

export function MusicCard({ title, artist, reason, onClick }: MusicCardProps) {
  return (
    <div className="bg-card flex flex-col rounded-lg border p-4 shadow-sm">
      <button
        type="button"
        onClick={() => onClick(title)}
        className="mb-1 cursor-pointer text-left text-sm font-semibold transition-colors hover:text-blue-500 hover:underline"
      >
        {title}
      </button>
      <button
        type="button"
        onClick={() => onClick(artist)}
        className="text-muted-foreground mb-2 cursor-pointer text-left text-xs transition-colors hover:text-blue-500 hover:underline"
      >
        {artist}
      </button>
      <p className="text-muted-foreground text-sm">{reason}</p>
    </div>
  );
}
