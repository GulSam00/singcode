'use client';

import StaticLoading from '@/components/StaticLoading';
import { useRecentAddSongQuery } from '@/queries/recentAddSongQuery';

import { PREVIEW_COUNT } from './PreviewSection';
import RecentSongCard from './recent/RecentSongCard';

export default function RecentPreview() {
  const today = new Date();
  const { data, isPending } = useRecentAddSongQuery(today.getFullYear(), today.getMonth());

  if (isPending) {
    return <StaticLoading />;
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        이번 달에 추가된 노래가 아직 없어요.
      </p>
    );
  }

  return data.slice(0, PREVIEW_COUNT).map(song => <RecentSongCard key={song.id} song={song} />);
}
