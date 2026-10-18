'use client';

import { cn } from '@/utils/cn';

/**
 * 액자 톤. 1위만 금이고 2·3위는 황동 하나를 똑같이 나눠 쓴다.
 *
 * 금과 같은 난색 계열을 쓰되 밝기가 아니라 **채도**로 갈라놓은 게 핵심이다.
 * 금보다 어둡기만 한 색(구리·청동)을 옆에 놓으면 다른 금속이 아니라 '바랜 금'으로 읽힌다.
 * 채도를 떨어뜨리면 같은 계열 안에서도 금은 보석, 황동은 기물로 분리돼 보인다.
 *
 * 2·3위가 완전히 같은 톤이라 둘 사이의 위계는 색이 아니라 순위 라벨과 카드 순서만 진다.
 * 은(회색)을 쓰지 않는 이유는 따로 있다 — 회색은 UI에서 이미 '비활성'을 뜻해서
 * 2위가 대접받는 게 아니라 꺼져 있는 것처럼 보인다.
 */
export type PortraitTone = 'gold' | 'brass' | 'plain';

/**
 * 액자 몰딩의 결. 한 방향 그라데이션에 밝은 면과 어두운 면을 번갈아 넣어야
 * 납작한 색 띠가 아니라 빛을 받는 금속·나무 테로 보인다.
 */
const FRAME_SURFACE: Record<PortraitTone, string> = {
  gold: 'linear-gradient(135deg, #f9e6a4 0%, #dcae3e 30%, #a8801f 55%, #f4dd93 78%, #c99b2c 100%)',
  // 금과 같은 각도·같은 명암 구조에 채도만 덜어낸 결. 값을 만질 땐 금 쪽과 나란히 놓고 봐야 한다.
  brass: 'linear-gradient(135deg, #e6d9bb 0%, #c0a97c 30%, #8a7550 55%, #dccfae 78%, #a38c64 100%)',
  plain: 'linear-gradient(135deg, #c29260 0%, #8a6440 30%, #6b4c30 55%, #a67c52 100%)',
};

/** 사진이 없을 때 그림 자리에 깔리는 색 */
const CANVAS_FALLBACK: Record<PortraitTone, string> = {
  gold: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  brass: 'bg-[#a38c64]/15 text-[#8a7450] dark:text-[#d3bf95]',
  plain: 'bg-muted text-muted-foreground',
};

/**
 * 몰딩 위를 지나가는 하이라이트 띠. 금속 결 위에 이 한 겹을 더 깔고 위치만 흘린다.
 * 각도(120deg)와 띠 폭은 React Bits의 ShinyText가 쓰는 값을 그대로 가져왔다.
 */
const FRAME_SHEEN =
  'linear-gradient(120deg, transparent 38%, rgb(255 255 255 / 0.75) 50%, transparent 62%)';

// 몰딩의 입체감: 바깥으로 드리우는 그림자 + 위쪽 하이라이트 + 아래쪽 음영.
const FRAME_SHADOW =
  '0 3px 8px rgb(0 0 0 / 0.28), inset 0 1px 0 rgb(255 255 255 / 0.6), inset 0 -1px 0 rgb(0 0 0 / 0.35)';
// 그림이 매트보다 안쪽으로 들어가 보이게 하는 그림자
const CANVAS_SHADOW = 'inset 0 2px 6px rgb(0 0 0 / 0.35)';

interface ArtistPortraitProps {
  name: string;
  imageUrl: string | null;
  /** 액자 바깥 한 변의 픽셀 크기 */
  size: number;
  tone?: PortraitTone;
  className?: string;
}

/**
 * 아티스트 사진 액자. 몰딩 → 매트(여백) → 그림 순으로 세 겹을 쌓아 실제 액자처럼 보이게 한다.
 * 안쪽 여백을 %로 잡아 size를 바꿔도 세 겹의 비율이 그대로 유지된다.
 *
 * artists.image_url은 이제 막 생긴 컬럼이라 당분간 대부분 비어 있다.
 * 빈 액자를 그리면 화면이 무너져 보여, 사진이 채워지기 전까지는 이니셜이 그 자리를 지킨다.
 */
export default function ArtistPortrait({
  name,
  imageUrl,
  size,
  tone = 'plain',
  className,
}: ArtistPortraitProps) {
  return (
    <div
      className={cn(
        // 몰딩 두께. size의 %라 액자가 커져도 테 비율이 그대로다.
        // 얇게 잡을수록 액자보다 사진이 주인공이 된다 — 96px 기준 한 변 1.5px 정도다.
        'shrink-0 rounded-[2px] p-[1.6%]',
        // 나무 액자는 광택이 나지 않으니 금속 톤에만 빛을 흘린다.
        tone !== 'plain' && 'animate-frame-sheen',
        className,
      )}
      style={{
        width: size,
        height: size,
        // 광택 띠가 위, 금속 결이 아래. 순서가 바뀌면 빛이 결에 가려 보이지 않는다.
        background:
          tone === 'plain' ? FRAME_SURFACE[tone] : `${FRAME_SHEEN}, ${FRAME_SURFACE[tone]}`,
        boxShadow: FRAME_SHADOW,
      }}
    >
      {/* 매트 — 몰딩과 그림 사이의 여백. 몰딩과 함께 얇아져야 테 전체가 얇아 보인다.
          몰딩만 줄이면 흰 여백이 남아 테두리 두께가 그대로인 것처럼 읽힌다. */}
      <div className="bg-background h-full w-full p-[1.6%]">
        <div
          className="relative h-full w-full overflow-hidden"
          style={{ boxShadow: CANVAS_SHADOW }}
        >
          {imageUrl ? (
            // next/image가 아닌 이유: image_url에 어떤 도메인이 들어올지 정해지지 않았는데
            // next.config.ts에 images.remotePatterns가 없어 외부 URL이면 런타임에 깨진다.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div
              className={cn(
                'flex h-full w-full items-center justify-center font-bold',
                CANVAS_FALLBACK[tone],
              )}
              // 액자 크기가 제각각이라 글자도 같은 비율로 따라가야 가운데가 비어 보이지 않는다.
              style={{ fontSize: Math.round(size * 0.34) }}
            >
              {name.slice(0, 1)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
