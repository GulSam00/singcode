import { BADGE_DESCRIPTION, BADGE_LABEL, BRAND_SCOPED_BADGES, toVisibleBadges } from '@/types/song';
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
    <div className={cn('flex items-center gap-1', className)}>
      {visible.map(badge => (
        <span
          key={badge}
          title={BADGE_DESCRIPTION[badge]}
          className="border-muted-foreground/40 text-muted-foreground inline-flex items-center gap-0.5 rounded border px-1 text-[10px] leading-tight font-medium"
        >
          {/* 반주기 기종을 가리키는 뱃지에만 브랜드를 붙인다.
              번호 영역과 같은 brand-tj 색을 써서 같은 출처임을 드러낸다. */}
          {BRAND_SCOPED_BADGES.includes(badge) && (
            <span className="text-brand-tj font-bold">TJ</span>
          )}
          {BADGE_LABEL[badge]}
        </span>
      ))}
    </div>
  );
}
