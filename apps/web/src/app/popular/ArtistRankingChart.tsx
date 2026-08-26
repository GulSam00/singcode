'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ArtistRankingItem } from '@/types/artistVote';
import { formatVoteShare } from '@/utils/formatVoteShare';

// 1~10위를 각자 조각으로 두고, 11위 아래만 한 덩어리로 접는다.
// 조각이 열 개면 파이가 원래 잘하는 "한눈에 비중" 읽기는 포기하는 셈이라,
// 아래 범례가 순위·이름·득표를 다 적어 표 역할을 겸한다. 색은 조각을 세는 수단일 뿐이다.
const TOP_SLICE_COUNT = 10;

// 검증을 통과한 카테고리 팔레트(globals.css). 순위가 아니라 슬롯 순서대로 배정한다.
const HUES = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
];

/**
 * 아홉·열 번째 조각. 카테고리 색은 여덟 칸이 한계라 새 색을 만들지 않는다 —
 * 아홉 번째로 지어낸 색은 반드시 앞의 여덟 중 하나와 붙어 구분이 무너진다.
 * 대신 앞선 색을 빗금으로 다시 써서, 구분을 색이 아니라 색+질감이 지게 한다.
 * 각도는 45°와 그 거울인 135° 둘뿐이다. 각도를 더 쪼개면 그것도 결국 색과 같은 문제를 만난다.
 */
const HATCHES = [
  { id: 'artist-slice-hatch-a', hue: 'var(--chart-1)', angle: 45 },
  { id: 'artist-slice-hatch-b', hue: 'var(--chart-2)', angle: 135 },
];

/** 빗금 위에 얹는 그늘. 같은 색의 어두운 결로 보이도록 검정을 옅게 깐다. */
const HATCH_INK = 'rgb(0 0 0 / 0.38)';

// "그 외"는 카테고리가 아니라 나머지를 뭉친 덩어리라 색을 빼고 회색으로 둔다.
const REST_COLOR = 'var(--muted-foreground)';

interface Slice {
  /** 조각 식별자. 이름이 겹쳐도 되도록 순위를 섞어 만든다. */
  key: string;
  /** 툴팁·범례에 뜨는 이름 */
  name: string;
  /** 범례 앞에 붙는 순위. "그 외" 묶음은 순위가 없다. */
  rank: number | null;
  value: number;
  /** 파이 조각의 fill (색 또는 빗금 패턴) */
  fill: string;
  /** 범례 칩의 CSS background. 파이 조각과 같은 모양이어야 한다. */
  chip: string;
}

/** 순위(0부터)에 맞는 칠. 여덟 칸을 넘어가면 빗금으로 넘어간다. */
function getFill(index: number): Pick<Slice, 'fill' | 'chip'> {
  if (index < HUES.length) {
    return { fill: HUES[index], chip: HUES[index] };
  }

  const hatch = HATCHES[index - HUES.length];
  return {
    fill: `url(#${hatch.id})`,
    // 파이는 SVG 패턴, 범례는 CSS 그라데이션이라 방식이 다르다. 결과가 같아야 해서
    // 줄 간격(3px/6px)과 그늘 농도를 양쪽에 같은 값으로 적어 둔다.
    chip: `repeating-linear-gradient(${hatch.angle}deg, ${HATCH_INK} 0 3px, transparent 3px 6px), ${hatch.hue}`,
  };
}

/**
 * 빗금 패턴 정의.
 * recharts가 차트 안에 끼워 넣은 자식을 그대로 통과시키는지에 기대지 않으려고 별도 svg에 둔다.
 * 패턴은 id로 참조되므로 문서 어디에 있든 걸린다.
 */
function HatchDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        {HATCHES.map(hatch => (
          <pattern
            key={hatch.id}
            id={hatch.id}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${hatch.angle})`}
          >
            {/* fill 속성 대신 style인 이유: 프로젝트 색이 CSS 변수라 값이 확실히
                풀리는 자리에 둔다. 표현 속성에서의 var()는 브라우저별로 이력이 있다. */}
            <rect width="6" height="6" style={{ fill: hatch.hue }} />
            <rect width="3" height="6" style={{ fill: HATCH_INK }} />
          </pattern>
        ))}
      </defs>
    </svg>
  );
}

interface SliceLegendProps {
  slices: Slice[];
  total: number;
}

/**
 * 조각이 열한 개라 원 안에 이름을 넣을 자리가 없다. 색 단독으로 구분하지 않도록
 * 범례가 순위·이름·수치를 다 적어 표 역할까지 겸한다.
 * 조각은 12시부터 순위 순으로 도니, 범례 순서가 곧 조각 순서다.
 */
function SliceLegend({ slices, total }: SliceLegendProps) {
  return (
    <ul className="flex flex-col gap-1.5">
      {slices.map(slice => (
        <li key={slice.key} className="flex items-center gap-2 text-sm">
          <span
            aria-hidden
            className="size-3 shrink-0 rounded-sm"
            style={{ background: slice.chip }}
          />
          {/* "그 외" 줄도 자리는 비워 둔다 — 순위 칸이 사라지면 이름 줄이 혼자 밀린다. */}
          <span className="text-muted-foreground w-5 shrink-0 text-xs font-bold tabular-nums">
            {slice.rank ?? ''}
          </span>
          <span className="min-w-0 flex-1 truncate">{slice.name}</span>
          <span className="text-muted-foreground shrink-0 tabular-nums">
            {slice.value}P · {formatVoteShare(slice.value, total)}
          </span>
        </li>
      ))}
    </ul>
  );
}

interface ArtistRankingChartProps {
  items: ArtistRankingItem[];
}

export default function ArtistRankingChart({ items }: ArtistRankingChartProps) {
  const total = items.reduce((sum, item) => sum + item.totalVotes, 0);

  if (items.length === 0 || total === 0) {
    return <p className="text-muted-foreground py-16 text-center text-sm">표시할 득표가 없어요.</p>;
  }

  const top = items.slice(0, TOP_SLICE_COUNT);
  const rest = items.slice(TOP_SLICE_COUNT);
  const restTotal = rest.reduce((sum, item) => sum + item.totalVotes, 0);

  const slices: Slice[] = [
    ...top.map((item, index) => ({
      key: `${item.rank}-${item.artist}`,
      name: item.artistKo && item.artistKo !== item.artist ? item.artistKo : item.artist,
      rank: item.rank,
      value: item.totalVotes,
      ...getFill(index),
    })),
    ...(restTotal > 0
      ? [
          {
            key: 'rest',
            name: `그 외 ${rest.length}명`,
            rank: null,
            value: restTotal,
            fill: REST_COLOR,
            chip: REST_COLOR,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <HatchDefs />

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="88%"
              // 조각 사이를 표면 색으로 갈라 두 색이 맞닿아 섞여 보이지 않게 한다.
              // 색만으로는 구분이 아슬아슬한 조합이 섞여 있어, 이 틈이 있어야 열 조각이 버틴다.
              stroke="var(--background)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map(slice => (
                <Cell key={slice.key} fill={slice.fill} />
              ))}
            </Pie>
            <Tooltip
              // recharts 타입상 value/name이 넓게 잡혀 있어 좁혀서 쓴다.
              formatter={(value, name) => {
                const amount = Number(value);
                return [`${amount}P (${formatVoteShare(amount, total)})`, String(name)];
              }}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--popover-foreground)',
              }}
              itemStyle={{ color: 'var(--popover-foreground)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <SliceLegend slices={slices} total={total} />
    </div>
  );
}
