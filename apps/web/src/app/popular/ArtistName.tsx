'use client';

import { cn } from '@/utils/cn';

interface ArtistNameProps {
  name: string;
  artistKo: string | null;
  /** 바깥 래퍼(원어 표기 줄)에 얹을 스타일 */
  className?: string;
}

/**
 * 아티스트 원어 표기 + 그 아래 작은 한국어 표기.
 *
 * 곡 카드(SongSummary)가 제목·아티스트의 한국어 표기를 다루는 규칙을 그대로 따른다.
 * 한국어 표기가 원어 표기와 같으면(예: name과 name_ko가 모두 'IVE') 같은 글자가 두 번
 * 보일 뿐이라 감춘다. 버튼 안에서도 쓰이므로 래퍼는 div가 아닌 span이다.
 */
export default function ArtistName({ name, artistKo, className }: ArtistNameProps) {
  const hasKoName = !!artistKo && artistKo !== name;

  return (
    <span className={cn('flex min-w-0 flex-col', className)}>
      <span className="truncate">{name}</span>
      {hasKoName && (
        <span className="text-muted-foreground/70 truncate text-xs font-normal">{artistKo}</span>
      )}
    </span>
  );
}
