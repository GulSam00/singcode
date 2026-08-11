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
    <div className={cn('flex items-center gap-1', className)}>
      {/* 뱃지는 전부 TJ 등록 정보에서 나온다. 카드에 금영 번호가 함께 있어
          브랜드를 밝히지 않으면 금영에도 해당하는 것으로 읽힐 수 있다.
          번호 영역과 같은 brand-tj 색을 써서 같은 출처임을 드러낸다. */}
      <span className="text-brand-tj text-[10px] leading-tight font-bold">TJ</span>
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
