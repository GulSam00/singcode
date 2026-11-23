import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

import type { InstaSong, PostKind } from './recentSongPosts';

const WIDTH = 1080;
const HEIGHT = 1350;
const PADDING_X = 72;

/**
 * 곡 한 줄의 높이. 곡 수와 상관없이 항상 같다.
 * 일본곡은 원어 줄까지 들어가므로 그 줄을 기준으로 잡았고, 5곡이 한 장에 꼭 맞는 값이다.
 * 바꾸면 한 장 최대 곡 수(MAX_SONGS_PER_SLIDE)도 함께 확인한다.
 */
const ROW_HEIGHT = 190;
const RULE = 3;
const NUMBER_COL_WIDTH = 300;

// 색은 라임 배경과 잉크(검정) 둘뿐이다.
const COLOR = {
  bg: '#C8F23A',
  ink: '#0E0E12',
  sub: '#3A4A10',
};

/** 이미지 한 벌은 TJ 번호 또는 KY 번호 중 하나만 보여준다. */
export type Edition = 'TJ' | 'KY';

type Style = Record<string, string | number>;
type Node = { type: string; props: { style?: Style; children?: Node[] | Node | string } };

const h = (style: Style, children?: Node[] | Node | string): Node => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});

const loadFonts = () => {
  // 한글과 가나·한자를 모두 담은 Pretendard JP 하나로 일본곡 원제까지 깨지지 않게 그린다.
  const require = createRequire(import.meta.url);
  const dir = join(require.resolve('pretendard-jp/package.json'), '..', 'dist', 'public', 'static');
  const read = (file: string) => readFileSync(join(dir, file));
  return [
    {
      name: 'Pretendard',
      data: read('PretendardJP-Bold.otf'),
      weight: 700 as const,
      style: 'normal' as const,
    },
    {
      name: 'Pretendard',
      data: read('PretendardJP-Regular.otf'),
      weight: 400 as const,
      style: 'normal' as const,
    },
  ];
};

const ellipsis: Style = {
  display: 'block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const getNumber = (song: InstaSong, edition: Edition) =>
  edition === 'TJ' ? song.num_tj : song.num_ky;

/**
 * 한국어 표기 한 줄과, 그 바로 아래의 원어 한 줄. 한국어로 바뀐 항목만 원문을 밑에 붙여서
 * 번역이 없는 항목(원문이 곧 표기인 경우)이 두 번 나오지 않게 한다.
 */
const textWithOriginal = (
  translated: string | null | undefined,
  original: string,
  style: Style,
): Node[] => [
  h({ ...ellipsis, ...style }, translated || original),
  ...(translated
    ? [h({ ...ellipsis, fontSize: 23, lineHeight: 1.3, color: COLOR.sub }, original)]
    : []),
];

/** 곡 한 줄. 위아래를 굵은 선으로 구분하는 목록표 모양이고, 상자나 모서리 둥글림은 쓰지 않는다. */
const songRow = (song: InstaSong, edition: Edition): Node => {
  const number = getNumber(song, edition);

  return h(
    {
      alignItems: 'center',
      gap: 24,
      height: ROW_HEIGHT,
      borderTop: `${RULE}px solid ${COLOR.ink}`,
    },
    [
      h({ flexDirection: 'column', flex: 1, minWidth: 0 }, [
        // 제목과 가수 각각의 한국어 바로 아래에 원어를 둔다.
        ...textWithOriginal(song.title_ko, song.title, {
          fontSize: 40,
          fontWeight: 700,
          lineHeight: 1.25,
        }),
        ...textWithOriginal(song.artist_ko, song.artist, {
          fontSize: 29,
          lineHeight: 1.3,
          marginTop: 4,
        }),
      ]),
      h(
        { width: NUMBER_COL_WIDTH, flexShrink: 0, justifyContent: 'flex-end' },
        h({ fontSize: 88, fontWeight: 700, lineHeight: 1 }, String(number ?? '–')),
      ),
    ],
  );
};

export interface RenderMeta {
  edition: Edition;
  kind: PostKind;
  /** 상단에 크게 쓰는 기간 문구. 예: 10.6–8 */
  periodLabel: string;
  /** 이 게시물 그룹의 전체 곡 수 */
  total: number;
  omittedCount: number;
  pageIndex: number;
  pageCount: number;
}

const buildTree = (songs: InstaSong[], meta: RenderMeta): Node => {
  const isLastPage = meta.pageIndex === meta.pageCount - 1;
  const summary =
    `${meta.kind === 'jpop' ? 'J-POP 신곡' : '노래방 신곡'} ${meta.total}곡` +
    (meta.pageCount > 1 ? ` · ${meta.pageIndex + 1}/${meta.pageCount}` : '');
  // 장 수 제한으로 못 넣은 곡은 하단 문구로 알린다. 목록 영역의 높이를 건드리지 않아 5곡이 항상 들어간다.
  const footerNote =
    isLastPage && meta.omittedCount > 0
      ? `외 ${meta.omittedCount}곡은 싱코드에서 확인하세요`
      : '노래방 번호 검색 · J-POP 한글 검색';

  return h(
    {
      flexDirection: 'column',
      width: WIDTH,
      height: HEIGHT,
      background: COLOR.bg,
      padding: `56px ${PADDING_X}px 48px`,
      boxSizing: 'border-box',
      fontFamily: 'Pretendard',
      color: COLOR.ink,
    },
    [
      // 기간을 크게 내세우고, 어느 번호(TJ·KY)인지 옆에 이니셜로 밝힌다.
      h({ alignItems: 'center', justifyContent: 'space-between' }, [
        h(
          {
            fontSize: meta.periodLabel.length > 6 ? 104 : 124,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -3,
          },
          meta.periodLabel,
        ),
        h({ padding: '2px 20px', background: COLOR.ink }, [
          h({ fontSize: 64, fontWeight: 700, color: COLOR.bg, letterSpacing: 2 }, meta.edition),
        ]),
      ]),
      h({ fontSize: 34, marginTop: 10, marginBottom: 22 }, summary),

      h({ flexDirection: 'column', flex: 1 }, [
        ...songs.map(song => songRow(song, meta.edition)),
        // 마지막 줄 아래에도 선을 그어 목록이 열린 채 끝나 보이지 않게 한다.
        h({ borderTop: `${RULE}px solid ${COLOR.ink}` }),
      ]),

      h({ justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 }, [
        h({ fontSize: 36, fontWeight: 700 }, 'singcode.kr'),
        h({ fontSize: 26, color: COLOR.sub }, footerNote),
      ]),
    ],
  );
};

let fontsCache: ReturnType<typeof loadFonts> | null = null;

/** 한 장을 1080x1350 JPEG로 렌더한다. 인스타그램 API는 JPEG만 받는다. */
export async function renderSlideJpeg(songs: InstaSong[], meta: RenderMeta): Promise<Buffer> {
  fontsCache ??= loadFonts();
  const svg = await satori(buildTree(songs, meta) as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: fontsCache,
  });
  return sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toBuffer();
}
