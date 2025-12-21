type MusicCardProps = {
  title: string;
  artist: string;
  reason: string;
};

export function MusicCard({ title, artist, reason }: MusicCardProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-1 text-sm font-semibold text-gray-900">{title}</div>
      <div className="mb-2 text-xs text-gray-500">{artist}</div>
      <p className="text-sm text-gray-700">{reason}</p>
    </div>
  );
}
