'use client';

import { useState } from 'react';

import { ArtistWin } from '@/types/artistVote';

import WinDetailDialog, { toFullLabel } from './WinDetailDialog';

/**
 * 낱개로 새길 별의 최대 개수. 넘어가는 만큼은 앞(오래된 쪽)에서 +N으로 접는다.
 * 축구 유니폼이 우승 열 번을 별 하나로 묶는 것과 같은 이유다 — 별이 한 줄을 넘어가기 시작하면
 * 개수를 세는 표식이 아니라 그냥 띠 하나로 읽힌다.
 */
const STAR_LIMIT = 12;

/** 꼭짓점 다섯 개짜리 별. viewBox 24×24 기준 */
const STAR_PATH =
  'M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.44l-5.81 3.06 1.11-6.47L2.6 9.45l6.5-.95z';

interface StarProps {
  win: ArtistWin;
  onClick: () => void;
}

/**
 * 별 하나 = 우승 한 번.
 *
 * 이모지(⭐) 대신 SVG인 이유는 트로피와 같다 — 폰트마다 모양과 색이 제각각이라
 * 카드에 새긴 표식이 아니라 본문에 끼어든 글자로 보인다.
 * 금색 면에 어두운 금 테를 두르는 건 카드 배경(1~3위는 메달색 틴트)이 무엇이든
 * 별의 윤곽이 살아남게 하기 위함이다.
 */
function Star({ win, onClick }: StarProps) {
  // 한 달에 우승은 한 팀뿐이라 월을 그대로 id로 써도 카드끼리 겹치지 않는다.
  const gradientId = `star-${win.month}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 transition-transform hover:scale-115"
      aria-label={`${toFullLabel(win.month)} 우승 상세 보기`}
      title={toFullLabel(win.month)}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
        <defs>
          {/* 위쪽 꼭짓점이 빛을 받고 아래로 내려갈수록 어두워지는, 뱃지에 박힌 금속 별의 명암 */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#fdf0b8" />
            <stop offset="45%" stopColor="#e3b53f" />
            <stop offset="100%" stopColor="#a8801f" />
          </linearGradient>
        </defs>
        <path
          d={STAR_PATH}
          fill={`url(#${gradientId})`}
          stroke="#7c5c12"
          strokeOpacity="0.55"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

interface WinStarsProps {
  artist: string;
  wins: ArtistWin[];
}

/**
 * 역대 우승을 카드 위쪽에 별로 새긴다. 프로 스포츠가 엠블럼 위에 우승 별을 다는 방식이다.
 *
 * 별 한 줄은 "몇 번"만 남기고 "언제"는 감춘다 — 그건 별을 눌러 다이얼로그로 본다.
 * 카드 한 장에 세로 공간을 거의 쓰지 않으면서 통산 우승을 한눈에 보여주는 게 목적이라,
 * 우승마다 년·월을 지면에 적는 표현으로 되돌리면 이 장점이 사라진다.
 */
export default function WinStars({ artist, wins }: WinStarsProps) {
  const [selected, setSelected] = useState<ArtistWin | null>(null);

  if (wins.length === 0) return null;

  // 오래된 순으로 들어오므로 뒤에서 자른다 — 접히는 건 언제나 옛 기록이고, 최근 우승은 남는다.
  const shown = wins.slice(-STAR_LIMIT);
  const folded = wins.length - shown.length;

  return (
    <div className="flex w-full items-center justify-center gap-1">
      {folded > 0 && (
        <span className="mr-0.5 text-[11px] font-bold text-amber-700 tabular-nums dark:text-amber-500">
          +{folded}
        </span>
      )}

      {shown.map(win => (
        <Star key={win.month} win={win} onClick={() => setSelected(win)} />
      ))}

      <WinDetailDialog
        artist={artist}
        wins={wins}
        selected={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
