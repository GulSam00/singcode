type MusicCardProps = {
  title: string;
  artist: string;
  reason: string;
};

export function MusicCard({ title, artist, reason }: MusicCardProps) {
  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="text-card-foreground mb-1 text-sm font-semibold">{title}</div>
      <div className="text-muted-foreground mb-2 text-xs">{artist}</div>
      <p className="text-muted-foreground text-sm">{reason}</p>
    </div>
  );
}
