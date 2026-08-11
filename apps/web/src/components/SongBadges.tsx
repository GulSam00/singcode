import { BADGE_DESCRIPTION, BADGE_LABEL, toVisibleBadges } from '@/types/song';
import { cn } from '@/utils/cn';

interface SongBadgesProps {
  badges?: string[] | null;
  className?: string;
}

/**
 * TJ 반주 버전 뱃지(MR / LIVE / 60↑).
 * 인기차트와 검색 결과가 같은 모양을 쓰도록 한곳에 둔다.
 */
export default function SongBadges({ badges, className }: SongBadgesProps) {
  const visible = toVisibleBadges(badges);
  if (visible.length === 0) return null;

  return (
    <div className={cn('flex gap-1', className)}>
      {visible.map(badge => (
        <span
          key={badge}
          title={BADGE_DESCRIPTION[badge]}
          className="border-muted-foreground/40 text-muted-foreground rounded border px-1 text-[10px] leading-tight font-medium"
        >
          {BADGE_LABEL[badge]}
        </span>
      ))}
    </div>
  );
}
